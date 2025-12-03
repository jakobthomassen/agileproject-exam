# ----- SCRIPT TO SIMULATE RESPONSE FROM AI -----
from .DTOs.eventstate import EventState
from .ai.event_handler import save_ai_generated_event, debug_read_all_events


def simulate_ai_event():
    fake_event = EventState(
        eventname="Board Game Night",
        date="2020-12-02",
        time="18:00",
        location="Oslo City Center",
        participants=["amund", "shefat", "hansim"]
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

if __name__ == "__main__":
    simulate_ai_event()
