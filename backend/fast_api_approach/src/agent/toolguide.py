

def update_event_details(event_name: str = None, event_date: str = None, event_time: str = None, event_location: str = None):
    """
    Saves ANY provided event details to the eventstate. 
    Call this tool immediately when the user provides you think might be relevant.
    
    Args:
        event_name: The official title of the event (e.g., "Birthday Party").
        event_date: The date of the event. Prefer absolute dates (e.g. "2023-12-01") if possible.
        event_time: The start time of the event.
        event_location: The physical address or place name.
    """
    pass # The SDK never actually runs this! It just reads the signature.

def participant_notifier(reason: str = "update"):
    """
    Notifies participants about the event.
    """
    pass


# ==========================================
# 3. THE EXPORTS
# ==========================================

# A. The List to send to Gemini Config (What the AI sees)
TOOLS_4_SDK = [update_event_details, participant_notifier]
