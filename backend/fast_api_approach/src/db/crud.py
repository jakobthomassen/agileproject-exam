from sqlalchemy.orm import Session
from models import Event, EventStatus

def get_event(db: Session, event_id: int):
    return db.query(Event).filter(Event.id == event_id).first()

def create_event(db: Session, id: int, customer_id: str, title: str, description: str, date, location: str):
    db_event = Event(
        id=id,
        customer_id=customer_id,
        title=title,
        description=description,
        date=date,
        location=location,
        status=EventStatus.PENDING
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event