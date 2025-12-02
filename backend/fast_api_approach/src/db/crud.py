from sqlalchemy.orm import Session
from .models import Event, EventStatus

# ----- READ OPERATIONS -----

def get_event(db: Session, event_id: int):
    """
    Get a single event by its ID
    Returns None if not found
    """
    return db.query(Event).filter(Event.id == event_id).first()

def get_all_events(db: Session):
    """
    Get all events from the database
    Returns a list of all events
    """
    return db.query(Event).all()

def get_events_by_customer(db: Session, customer_id: str):
    """
    Get all events for a specific customer
    Returns a list of events
    """
    return db.query(Event).filter(Event.customer_id == customer_id).all()

# ----- CREATE OPERATIONS -----

def create_event(db: Session, customer_id: str, title: str, description: str, date: str, location: str):
    """
    Create a new event in the database
    Note: ID is auto-generated, don't need to provide it
    """
    # Create a new Event object
    db_event = Event(
        customer_id=customer_id,
        title=title,
        description=description,
        date=date,
        location=location,
        status=EventStatus.PENDING.value  # New events start as PENDING
    )
    
    # Add it to the database
    db.add(db_event)
    
    # Save changes to the database
    db.commit()
    
    # Refresh to get the generated ID
    db.refresh(db_event)
    
    return db_event

def simulate_ai_response(db: Session, event_id: int, ai_response: str):
    """
    Simulate saving an AI response for an event
    For now, we'll just update the event status
    In the future, you can add a separate table for AI responses
    """
    event = get_event(db, event_id)
    if event:
        # For simulation, we'll mark the event as CONFIRMED
        # This shows the AI has processed it
        event.status = EventStatus.CONFIRMED.value
        db.commit()
        db.refresh(event)
        return {"event": event, "ai_response": ai_response}
    return None