from ..DTOs.eventstate import EventState

# All tool functions must have input and output parameters for Gemini tool calling compatibility


def participant_notifier(state: EventState, reason: str="event creation") -> str:
    """
    Mock function for participant notifications.
    """
    """
    Notifies all participants about important updates or events.
    Returns a success message.

    Args:
        reason (str): The reason for notification. Defaults to "event creation".
    """
    return "Participants notified successfully"


def update_event_details(state: EventState, 
                         event_name: str = None, 
                         event_date: str = None,
                         event_time: str = None,
                         event_location: str = None, 
                         event_description: str = None, 
                         judging_type: str = None, 
                         audience_weight: float = None, 
                         expert_weight: float = None, 
                         athlete_weight: float = None) -> dict:
    """
    Updates the event details.

    Args:
        event_name (str, optional): The new event name. Defaults to None,
        event_date (str, optional): The new event date. Defaults to None.
        event_time (str, optional): The new event time. Defaults to None.
        event_location (str, optional): The new event location. Defaults to None.
        event_description (str, optional): The new event description. Defaults to None.
        judging_type (str, optional): The new judging type. Defaults to None.
        audience_weight (float, optional): The new audience weight. Defaults to None.
        expert_weight (float, optional): The new expert weight. Defaults to None.
        athlete_weight (float, optional): The new athlete weight. Defaults to None.
        
        
    """
    if event_name: state.eventname = event_name
    if event_date: state.eventdate = event_date
    if event_time: state.eventtime = event_time
    if event_location: state.eventlocation = event_location
    if event_description: state.eventdescription = event_description
    if judging_type: state.eventjudgetype = judging_type
    if audience_weight: state.eventaudienceweight = audience_weight
    if expert_weight: state.eventexpertweight = expert_weight
    if athlete_weight: state.eventathleteweight = athlete_weight
    return f"updated sucessfully status: success", f"updated: {state.model_dump()}"


def event_state_resetter(state: EventState) -> str:
    """
    Resets the event state to its initial empty state.

    Args:
        event_state (EventState): The current event state to be reset (creates new event)

    Returns:
        str: A message indicating the reset status.
    """
    state.eventid = None
    state.eventname = None
    state.eventdate = None
    state.eventtime = None
    state.eventlocation = None
    state.eventdescription = None
    state.eventjudgetype = None
    state.eventaudienceweight = None
    state.eventexpertweight = None
    state.eventathleteweight = None
    return "new event started."


tool_registry = {
            "update_event_details": update_event_details,
            "event_state_resetter": event_state_resetter,
            # "participant_notifier": participant_notifier
        }


