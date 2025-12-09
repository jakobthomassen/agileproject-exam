# ----- SCRIPT TO SIMULATE RESPONSE FROM AI -----
from .DTOs.eventstate import EventState, EventImageCreate
from .ai.event_handler import (save_ai_generated_event, debug_read_all_events, save_event_image,
                               debug_read_single_event, debug_update_event, debug_delete_event,
                               debug_read_event_image, debug_read_all_images, debug_delete_event_image,
                               debug_update_image)
import os


def simulate_ai_event():
    fake_event = EventState(
        eventname="REDBULL CLIFF DIVING",
        evendescription="A cliff diving competition hosted by RedBull",
        eventdate="2025-12-08",
        eventtime="22:00",
        eventlocation="Oslo Opera House",
        eventjudgetype="Battle",
        eventaudienceweight=33,
        eventexpertweight=33,
        eventathleteweight=34
    )

    print("Simulating AI event creation...")

    # Save to db
    saved_event = save_ai_generated_event(fake_event)
    print("\nSaved event:", saved_event, sep="\n")

    # Read from db
    print("\nReading all event from DB:")
    all_events = debug_read_all_events()
    for event in all_events:
        print(event.to_dict())

    id = 1
    # Testing CRUD for Events

    print(f"\nPrinting event with ID = {id}")
    single_event = debug_read_single_event(id)

    print(single_event.to_dict())

    print(f"\nUpdating event with ID = {id}")
    update_fake_event = EventState(
        eventname="Moren din"
    )
    updated_event = debug_update_event(update_fake_event, id)
    print(updated_event.to_dict())

    print(f"\nDeleting event with ID = {id}")
    debug_delete_event(id)

    print("\nReading all event from DB:")
    all_events = debug_read_all_events()
    for event in all_events:
        print(event.to_dict())

    # Testing CRUD for Images
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(BASE_DIR, "test_image.jpeg")

    print("\nTrying to save test image...")
    print("Looking for:", image_path)

    with open(image_path, "rb") as test_image:
        image_bytes = test_image.read()

    fake_image = EventImageCreate(
        event_id=1,
        image_bytes=image_bytes
    )
    saved_image = save_event_image(fake_image)
    if saved_image:
        print("Saved")

    print(f"\nReading all images from database...")
    all_images = debug_read_all_images()
    for image in all_images:
        print(image.to_dict())

    print(f"\nReading image with ID: {id}")
    single_image = debug_read_event_image(id)
    if single_image:
        print(single_image.to_dict())

    print(f"\nUpdating image with ID: {id}")
    updated_fake_image = EventImageCreate(
        event_id=2
    )
    updated_image = debug_update_image(updated_fake_image, id)
    if updated_image:
        print(updated_image.to_dict())

    print(f"\nDeleting image with ID: {id}")
    debug_delete_event_image(id)

    print(f"\nReading all images from database...")
    all_images = debug_read_all_images()
    for image in all_images:
        print(image.to_dict())


if __name__ == "__main__":
    simulate_ai_event()
