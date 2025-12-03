from sqlalchemy.orm import Session
from ..DTOs.eventstate import EventState, EventImageCreate
from .models import Event, EventImage


def create_event(db: Session, event_data: EventState):
    db_event = Event(
        eventname = event_data.eventname,
        date = event_data.eventdate,
        time = event_data.eventtime,
        location = event_data.eventlocation,
        participants = event_data.participants
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_single_event(db: Session, id: int):
    return db.query(Event).filter(Event.id == id).first()

def get_all_events(db: Session):
    return db.query(Event).all()


def update_event(db: Session, id: int, event_data: EventState):
    db_event = get_single_event(db, id)
    if not db_event:
        return None

    # Only update fields that were provided (not None)
    if event_data.eventname is not None:
        db_event.eventname = event_data.eventname
    if event_data.date is not None:
        db_event.date = event_data.date
    if event_data.time is not None:
        db_event.time = event_data.time
    if event_data.location is not None:
        db_event.location = event_data.location
    if event_data.participants is not None:
        db_event.participants = event_data.participants

    db.commit()
    db.refresh(db_event)
    return db_event

def delete_event(db: Session, id: int):
    db_event = get_single_event(db, id)
    if not db_event:
        raise AttributeError(f"Event with ID: {id} does not exist")
        return

    db.delete(db_event)
    db.commit()
    db.refresh()

def create_image(db: Session, image_data: EventImageCreate):
    db_image = EventImage(
        event_id = image_data.event_id,
        image = image_data.image_bytes
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image
