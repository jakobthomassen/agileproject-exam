

def update_event_details(name: str = None, date: str = None, participant: str = None):
    """
    Updates the event details in the system.
    Args:
        name: The name/title of the event
        date: The date of the event
        participant: A person to add
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
