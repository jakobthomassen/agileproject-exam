import os

from email import message
from google import genai
from .base import AIPlatform
from ..agent.tools import tool_registry
from ..agent.toolguide import TOOLS_4_SDK
from google.genai import types
from ..DTOs.eventstate import EventState
from ..agent.dashboard import Dashboard
from ..ai.event_handler import save_ai_generated_event, load_state_from_db, save_chat_message, load_conversation_from_db
from.event_handler import get_event_ui_payload


def load_system_prompt():
    try:
        with open("src/prompts/system_prompt.md", "r") as f:
            return f.read()
    except FileNotFoundError:
        return None


system_prompt = load_system_prompt()
gemini_api_key = os.getenv("GEMINI_API_KEY")


if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")


class Gemini(AIPlatform):
    def __init__(
            self, api_key: str=gemini_api_key, 
            system_prompt: str = system_prompt,
            sdk_tools = TOOLS_4_SDK, 
            tools: dict = tool_registry,
            dashboard: Dashboard = None, 
            event_state: EventState = None,
            event_id: int = None
            ):
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash"
        self.system_prompt = system_prompt
        self.tools = sdk_tools
        self.tool_registry = tools
        
        # FIX: Handle mutable default arguments
        self.event_state = event_state if event_state is not None else EventState()
        self.dashboard = dashboard if dashboard is not None else Dashboard()
        self.conversation_history = []
        self.event_id = event_id

        if event_id:
            # Load existing event state from the database
            loaded_state = load_state_from_db(event_id)
            if loaded_state:
                self.event_state = loaded_state
                self.event_state.eventid = event_id
                # then load conversation history
                self.conversation_history = load_conversation_from_db(event_id)
            else:
                raise ValueError(f"Event with ID {event_id} not found in the database.")

    def generate_text(self, contents: list) -> str:
        """
        Generates AI response and handles tool calling.
        Updates conversation history and event state.
        """
        missing = self.event_state.missing_fields()
        state = self.event_state.is_complete
        dashboard_view = self.dashboard.render(self.event_state)  # render the dashboard view

        response = self.client.models.generate_content(
            model=self.model,
            contents=self.conversation_history + contents,
            config=types.GenerateContentConfig(
                system_instruction=self.system_prompt+dashboard_view,
                thinking_config=types.ThinkingConfig(include_thoughts=True),
                tools=self.tools,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=True),)  # Manual function calling to maintain state access
        )
        
        if not response.function_calls:
            print(f"DEBUG: AI did NOT call any tools. Response text: {response.text[:100]}")
        else:
            print(f"DEBUG: AI called {len(response.function_calls)} tool(s)")
        
        while response.function_calls:
            for tool_call in response.function_calls:
                fnargs = tool_call.args
                fn_name = tool_call.name
                print(f"DEBUG: Tool call - {fn_name} with args: {fnargs}")
                if fn_name in self.tool_registry:
                    try:
                        # Get tool function from registry
                        selected_tool = self.tool_registry[fn_name]
                        result = selected_tool(self.event_state, **fnargs)
                        print(f"DEBUG: Tool {fn_name} executed successfully. Event state updated.")
                    except Exception as e:
                        result = f"Error executing tool {fn_name}: {str(e)}"
                        print(f"DEBUG: ERROR executing tool {fn_name}: {e}")
                else:
                    result = f"Tool {fn_name} not found in registry."
                    print(f"DEBUG: Tool {fn_name} not found in registry")
                
                contents.append(
                    types.Content(
                        parts=[
                            types.Part.from_function_response(
                                name=fn_name,
                                response={"result": result}
                            )
                        ]
                    )
                )
            

            response = self.client.models.generate_content(
                model=self.model,
                contents=self.conversation_history + contents,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_prompt+dashboard_view,
                    tools=self.tools,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                )
            )
        
        self.conversation_history.extend(contents)
        self.conversation_history.append(
            types.Content(
                role="model", parts=[types.Part.from_text(text=response.text)]
            )
        )

        # ALWAYS save state to persist interaction data (even if incomplete)
        # This prevents "amnesia" where the AI forgets data if the event wasn't "complete" yet.
        # UPDATE: Only save if we have a name or it's an existing event
        try:
             # Check if we should save: Either it's an existing event (has ID) OR it satisfies requirements (has name)
             should_save = self.event_id is not None or (self.event_state.eventname and self.event_state.eventname.strip())
             
             if should_save:
                 save_ai_generated_event(self.event_state)
                 if not self.event_id:
                     self.event_id = self.event_state.eventid
                     print(f"DEBUG: Auto-saved event state with event_id={self.event_id}")
             else:
                 print("DEBUG: Event has no name yet. Skipping DB save.")
                 
        except Exception as e:
             print(f"DEBUG: Failed to auto-save partial state: {e}")
             
        
        # Use instance event_id. Handle case where event hasn't been saved yet.
        if self.event_id:
            ui_payload = get_event_ui_payload(self.event_id)
            print(f"DEBUG: event_id={self.event_id}, ui_payload length={len(ui_payload)}")
        else:
            ui_payload = []
            print(f"DEBUG: No event_id, returning empty payload")

        if self.event_id:
            # Save user message to conversation history
            user_text = contents[0].parts[0].text
            save_chat_message(self.event_id, "user", user_text)
            
            # Save AI response to conversation history
            save_chat_message(self.event_id, "model", response.text)

        response_data = {
            "type": "message",
            "message": response.text,
            "event_id": self.event_id,
            "ui_payload": ui_payload
        }
        
        print(f"DEBUG: Returning response with event_id={self.event_id}, ui_payload={len(ui_payload)} items")
        return response_data

    def chat(self, prompt: str) -> str:
        return self.generate_text(prompt)


def process_chat_request(message: str, event_id: int = None):
    """
    Stateless entry point. 
    1. Instantiates Agent (loading state if ID exists).
    2. runs generation.
    3. Returns result.
    """
    # Initialize Agent with the specific event ID
    agent = Gemini(event_id=event_id)

    # Create content list (User Message)
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=message)]
        )
    ]

    return agent.generate_text(contents)
