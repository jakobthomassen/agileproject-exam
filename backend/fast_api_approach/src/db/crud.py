from sqlalchemy.orm import Session
from ..DTOs.eventstate import EventState, EventImageCreate
from .models import Event, EventImage


def create_event(db: Session, event_data: EventState):
    db_event = Event(
        event_name=event_data.eventname,
        date=event_data.eventdate,
        time=event_data.eventtime,
        location=event_data.eventlocation,
        description=event_data.eventdescription,
        judging_type=event_data.eventjudgetype,
        audience_weight=event_data.eventaudienceweight,
        expert_weight=event_data.eventexpertweight,
        athlete_weight=event_data.eventathleteweight
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

    # event_name = event_data.eventname,
    # date = event_data.eventdate,
    # time = event_data.eventtime,
    # location = event_data.eventlocation,
    # description = event_data.eventdescription,
    # judge_type = event_data.eventjudgetype,
    # audience_weight = event_data.eventaudienceweight,
    # expert_weight = event_data.eventexpertweight,
    # athlete_weight = event_data.eventathleteweight

    if event_data.eventname is not None:
        db_event.event_name = event_data.eventname
    if event_data.eventdate is not None:
        db_event.date = event_data.eventdate
    if event_data.eventtime is not None:
        db_event.time = event_data.eventtime
    if event_data.eventlocation is not None:
        db_event.location = event_data.eventlocation
    if event_data.eventdescription is not None:
        db_event.description = event_data.eventdescription
    if event_data.eventjudgetype is not None:
        db_event.judge_type = event_data.eventjudgetype
    if event_data.eventaudienceweight is not None:
        db_event.audience_weight = event_data.eventaudienceweight
    if event_data.eventexpertweight is not None:
        db_event.expert_weight = event_data.eventexpertweight
    if event_data.eventathleteweight is not None:
        db_event.athlete_weight = event_data.eventathleteweight

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


# CRUD For images
def create_image(db: Session, image_data: EventImageCreate):
    db_image = EventImage(
        event_id = image_data.event_id,
        image = image_data.image_bytes
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image


def get_single_image(db: Session, id: int):
    return db.query(EventImage).filter(EventImage.id == id).first()


def get_all_images(db: Session):
    return db.query(EventImage).all()


def get_images_for_event(db: Session, event_id: int):
    return db.query(EventImage).filter(EventImage.event_id == event_id).all()


def update_image(db: Session, id: int, image_data: EventImageCreate):
    db_image = get_single_image(db, id)
    if not db_image:
        return None

    # update only what is provided
    if image_data.event_id is not None:
        db_image.event_id = image_data.event_id

    if image_data.image_bytes is not None:
        db_image.image = image_data.image_bytes

    db.commit()
    db.refresh(db_image)
    return db_image


def delete_images(db: Session, id: int):
    db_image = get_single_image(db, id)
    if not db_image:
        raise AttributeError(f"Image with ID: {id} does not exist")
        return

    db.delete(db_image)
    db.commit()

