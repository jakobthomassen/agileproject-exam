# ----- SCRIPT TO SIMULATE RESPONSE FROM AI -----
from .DTOs.eventstate import EventState, EventImageCreate, ParticipantCreate
from .ai.event_handler import (save_ai_generated_event, debug_read_all_events, save_event_image,
                               debug_read_single_event, debug_update_event, debug_delete_event,
                               debug_read_event_image, debug_read_all_images, debug_delete_event_image,
                               debug_update_image, save_participant, debug_read_single_participant,
                               debug_read_all_participants, debug_read_participants_for_event,
                               debug_update_participant, debug_delete_participant)
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

    # Testing CRUD for Participants
    print("\n" + "="*50)
    print("Testing CRUD for Participants")
    print("="*50)

    # Create participants
    print("\nCreating participants...")
    fake_participant_1 = ParticipantCreate(
        event_id=1,
        name="John Doe",
        email="john@example.com"
    )
    fake_participant_2 = ParticipantCreate(
        event_id=1,
        name="Jane Smith",
        email="jane@example.com"
    )
    saved_participant_1 = save_participant(fake_participant_1)
    saved_participant_2 = save_participant(fake_participant_2)
    print("Saved participant 1:", saved_participant_1.to_dict())
    print("Saved participant 2:", saved_participant_2.to_dict())

    # Read all participants
    print("\nReading all participants from database...")
    all_participants = debug_read_all_participants()
    for participant in all_participants:
        print(participant.to_dict())

    # Read single participant
    participant_id = saved_participant_1.id
    print(f"\nReading participant with ID: {participant_id}")
    single_participant = debug_read_single_participant(participant_id)
    print(single_participant.to_dict())

    # Read participants for event
    print(f"\nReading participants for event_id=1...")
    event_participants = debug_read_participants_for_event(1)
    for participant in event_participants:
        print(participant.to_dict())

    # Update participant
    print(f"\nUpdating participant with ID: {participant_id}")
    update_participant_data = ParticipantCreate(
        event_id=None,
        name="John Updated",
        email=None
    )
    updated_participant = debug_update_participant(update_participant_data, participant_id)
    print(updated_participant.to_dict())

    # Delete participant
    print(f"\nDeleting participant with ID: {participant_id}")
    debug_delete_participant(participant_id)

    # Read all participants after delete
    print("\nReading all participants from database after delete...")
    all_participants = debug_read_all_participants()
    for participant in all_participants:
        print(participant.to_dict())


if __name__ == "__main__":
    simulate_ai_event()
