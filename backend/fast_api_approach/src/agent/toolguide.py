
def update_event_details(event_name: str = None, 
                         event_date: str = None, 
                         event_time: str = None, 
                         event_location: str = None, 
                         event_description: str = None, 
                         judging_type: str = None, 
                         audience_weight: float = None, 
                         expert_weight: float = None, 
                         athlete_weight: float = None):
    """
    Saves or updates partial event details. Call this tool IMMEDIATELY upon capturing new information.
    
    CRITICAL INSTRUCTION:
    - Do not wait for all fields. If you get just the Date, save the Date.
    - If the user implies a value (e.g., "It's a birthday party"), INFER it as the event_name.
    - Always present what you need and what has been saved in the dashboard in a readable format for the user.
    
    Args:
        event_name: The title/name of the event. If ambiguous, infer the most likely title from context (e.g. "Strategy Meeting").
        event_date: The date in 'YYYY-MM-DD' format. you will ask for clarification if the format is different.
        event_time: The start time (e.g., "14:00" or "2:00 PM").
        event_location: The venue, address, or room name.
        event_description: Additional details about the event.
        judging_type: The method or criteria for judging the event.
        audience_weight: The weight or importance given to audience opinions.
        expert_weight: The weight or importance given to expert opinions.
        athlete_weight: The weight or importance given to athlete opinions.
        
    """
    pass # The SDK never actually runs this! It just reads the signature.

def participant_notifier(reason: str = "update"):
    """
    Notifies participants about the event.
    """
    pass

def event_state_resetter():
    """
    Resets the event state to start a new event planning session.
    """
    pass



# A. The List to send to Gemini Config (What the AI sees)
TOOLS_4_SDK = [update_event_details, event_state_resetter]#, participant_notifier]
