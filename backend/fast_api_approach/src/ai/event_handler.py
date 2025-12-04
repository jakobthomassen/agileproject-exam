from ..DTOs.eventstate import EventState, EventImageCreate
from ..db.database import SessionLocal
from ..db.crud import (create_event, get_all_events, create_image, get_single_event, update_event,
                       delete_event, get_single_image, get_all_images, get_images_for_event, update_image,
                       delete_images)


# Saves output EventState object from AI to database
def save_ai_generated_event(event_state: EventState):
    db = SessionLocal()
    try:
        saved_event = create_event(db, event_state)
        return saved_event
    finally:
        db.close()


# Read all events from database
def debug_read_all_events():
    db = SessionLocal()
    try:
        all_events = get_all_events(db)
        return all_events
    finally:
        db.close()


def debug_read_single_event(id: int):
    db = SessionLocal()
    try:
        single_event = get_single_event(db, id)
        return single_event
    finally:
        db.close()


def debug_update_event(event_state: EventState, id: int):
    db = SessionLocal()
    try:
        event_to_update = update_event(db, id, event_state)
        return event_to_update
    finally:
        db.close()


def debug_delete_event(id: int):
    db = SessionLocal()
    try:
        delete_event(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# Save image DTO in DB
def save_event_image(image_data: EventImageCreate):
    db = SessionLocal()
    try:
        saved_event = create_image(db, image_data)
        return saved_event
    finally:
        db.close()


# READ (single)
def debug_read_event_image(id: int):
    db = SessionLocal()
    try:
        return get_single_image(db, id)
    finally:
        db.close()


# READ (all)
def debug_read_all_images():
    db = SessionLocal()
    try:
        return get_all_images(db)
    finally:
        db.close()


# UPDATE
def debug_update_image(image_data: EventImageCreate, id: int):
    db = SessionLocal()
    try:
        return update_image(db, id, image_data)
    finally:
        db.close()


#  DELETE
def debug_delete_event_image(id: int):
    db = SessionLocal()
    try:
        return delete_images(db, id) # returns True/False
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()