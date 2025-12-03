from sqlalchemy.orm import Session
from ..DTOs.eventstate import EventState
from .models import Event


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




def get_all_events(db: Session):
    return db.query(Event).all()
