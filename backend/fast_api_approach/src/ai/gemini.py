from google import genai
from .base import AIPlatform
from ..agent.tools import TOOLS, tool_registry
from ..agent.toolguide import TOOLS_4_SDK
from google.genai import types
from ..DTOs.eventstate import EventState



class Gemini(AIPlatform):
    def __init__(self, api_key: str, system_prompt: str = None,sdk_tools = TOOLS_4_SDK, tools: dict = tool_registry, event_state: EventState = EventState()):
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash-lite"
        self.system_prompt = system_prompt
        self.tools = sdk_tools
        self.tool_registry = tool_registry
        self.event_state = event_state

    # generate text method implementation, contents will store the conversation history
    def generate_text(self, contents: list, ) -> str:
        missing =self.event_state.missing_fields() # checks for missing fields in the event state
        allmissing =""
        state = self.event_state.is_complete # check if all required fields are present

        for field in missing:
            allmissing += f"\n- {field}"

            
        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config= types.GenerateContentConfig
            (
                system_instruction=self.system_prompt+allmissing, #System prompt if any
                tools=self.tools, #List of tools
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=True)) # Disable automatic function calling for scope access, we handle it manually which means no function isolation.
        )
        
        while response.function_calls: # While the ai still to call functions 
            for tool_call in response.function_calls:
                fnargs = eval(tool_call.arguments)
                fn_name = tool_call.name
                if fn_name in self.tool_registry:# if the tool exists in our arsenal
                    try:
                        #select the tool from the registry
                        selected_tool = self.tool_registry[fn_name]

                        result = selected_tool(**fnargs)
                    except Exception as e:
                        result = f"Error executing tool {fn_name}: {str(e)}"
                else:
                    result = f"Tool {fn_name} not found in registry."

            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_prompt+allmissing+result,
                    tools=self.tools,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                )
            )

        return response.text

    def chat(self, prompt: str) -> str:
        return self.generate_text(prompt)
