from sqlalchemy.orm import Session
from ..DTOs.eventstate import EventState, EventImageCreate, ParticipantCreate
from .models import Event, EventImage, Participant
from sqlalchemy.exc import IntegrityError
import secrets
import string


def generate_event_code() -> str:
    """Generate a random 6-character uppercase event code."""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


def create_event(db: Session, event_data: EventState):
    # Generate event code for new events
    event_code = generate_event_code()
    
    db_event = Event(
        event_name=event_data.eventname,
        date=event_data.eventdate,
        time=event_data.eventtime,
        end_date=event_data.eventenddate,
        end_time=event_data.eventendtime,
        location=event_data.eventlocation,
        description=event_data.eventdescription,
        judging_type=event_data.eventjudgetype,
        audience_weight=event_data.eventaudienceweight,
        expert_weight=event_data.eventexpertweight,
        athlete_weight=event_data.eventathleteweight,
        event_code=event_code,
        status="DRAFT"  # Default status for new events
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_single_event(db: Session, id: int):
    return db.query(Event).filter(Event.id == id).first()


def get_all_events(db: Session):
    return db.query(Event).all()


def update_event(db: Session, event_data: EventState):
    db_event = get_single_event(db, event_data.eventid)
    if not db_event:
        raise AttributeError(f"Event with ID: {event_data.eventid} does not exist")
        return

    if event_data.eventname is not None:
        db_event.event_name = event_data.eventname
    if event_data.eventdate is not None:
        db_event.date = event_data.eventdate
    if event_data.eventtime is not None:
        db_event.time = event_data.eventtime
    if event_data.eventenddate is not None:
        db_event.end_date = event_data.eventenddate
    if event_data.eventendtime is not None:
        db_event.end_time = event_data.eventendtime
    if event_data.eventlocation is not None:
        db_event.location = event_data.eventlocation
    if event_data.eventdescription is not None:
        db_event.description = event_data.eventdescription
    if event_data.eventjudgetype is not None:
        db_event.judging_type = event_data.eventjudgetype
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

    try:
        db.commit()
        db.refresh(db_image)
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Cannot create image: event with ID: {image_data.event_id} does not exist")

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
        raise ValueError(f"Image with ID {id} does not exist")
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


# CRUD for Participants
def create_participant(db: Session, participant_data: ParticipantCreate):
    db_participant = Participant(
        event_id=participant_data.event_id,
        name=participant_data.name,
        email=participant_data.email
    )

    db.add(db_participant)
    try:
        db.commit()
        db.refresh(db_participant)
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Cannot create participant: event with ID: {db_participant.event_id} does not exist")
    return db_participant


def get_single_participant(db: Session, id: int):
    return db.query(Participant).filter(Participant.id == id).first()


def get_all_participants(db: Session):
    return db.query(Participant).all()


def get_participants_for_event(db: Session, event_id: int):
    return db.query(Participant).filter(Participant.event_id == event_id).all()


def update_participant(db: Session, id: int, participant_data: ParticipantCreate):
    db_participant = get_single_participant(db, id)
    if not db_participant:
        raise ValueError(f"Participant with ID: {id} does not exist")

    # Only update fields that were provided (not None)
    if participant_data.event_id is not None:
        db_participant.event_id = participant_data.event_id
    if participant_data.name is not None:
        db_participant.name = participant_data.name
    if participant_data.email is not None:
        db_participant.email = participant_data.email

    db.commit()
    db.refresh(db_participant)
    return db_participant


def delete_participant(db: Session, id: int):
    db_participant = get_single_participant(db, id)
    if not db_participant:
        raise AttributeError(f"Participant with ID: {id} does not exist")

    db.delete(db_participant)
    db.commit()

