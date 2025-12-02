 # All functions must have an input and output, even if empty failure to do so will cause errors in Gemini tool calling


def participant_notifier(state, reason: str="event creation") -> str: # A mock function to simulate notifying participants
    """
    Notifies all participants about important updates or events.
    Returns a success message.

    Args:
        reason (str): The reason for notification. Defaults to "event creation".
    """
    return "Participants notified successfully"

# src/agent/tools.py

def update_event_details(state, name=None, date=None, participant=None)-> dict:
    """
    Updates the event details.

    Args:
        name (str, optional): The new event name. Defaults to None.
        date (str, optional): The new event date. Defaults to None.
        participant (str, optional): The new participant to add. Defaults to None.
    """
    if name: state.event_name = name
    if date: state.event_date = date
    if participant: state.participants.append(participant)
    return {"status": "success", "updated": state.model_dump()}




TOOLS = [participant_notifier]

tool_registry = {
            "update_event_details": update_event_details,
            "participant_notifier": participant_notifier
        }


