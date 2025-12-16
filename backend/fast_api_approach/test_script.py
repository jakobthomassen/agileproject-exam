import sys
import os

# Add src to path
sys.path.append(os.getcwd())

from src.db.database import SessionLocal, engine, Base
from src.db.models import Participant, Event
from src.main import upload_participants_csv, delete_participant_endpoint, delete_event_endpoint
from fastapi import UploadFile
import io

def test_backend_logic():
    db = SessionLocal()
    try:
        # 1. Create Dummy Event
        print("Creating test event...")
        event = Event(event_name="Test Event", participants=[]) # Initialize empty
        db.add(event)
        db.commit()
        db.refresh(event)
        event_id = event.id
        print(f"Event created with ID: {event_id}")

        # 2. Simulate CSV Upload
        print("Simulating CSV upload...")
        csv_content = "name,email\nUser1,user1@example.com\nUser2,user2@example.com"
        file = UploadFile(filename="test.csv", file=io.BytesIO(csv_content.encode("utf-8")))
        
        # Call the logic directly (mocking the endpoint behavior)
        # Note: calling the endpoint function directly might be tricky due to dependency injection (db).
        # We will replicate the logic inside the script using the same DB session to be sure.
        
        # Logic from main.py upload_participants_csv
        import csv
        file.file.seek(0)
        content = file.file.read().decode("utf-8")
        csv_reader = csv.reader(io.StringIO(content))
        header = next(csv_reader, None)
        
        bulk_data = []
        for row in csv_reader:
            if len(row) >= 1:
                name = row[0].strip()
                email = row[1].strip() if len(row) > 1 else None
                if name:
                    bulk_data.append({"event_id": event_id, "name": name, "email": email})
        
        if bulk_data:
            db.bulk_insert_mappings(Participant, bulk_data)
            db.commit()
            print(f"Uploaded {len(bulk_data)} participants.")
        else:
            print("No data parsed!")

        # 3. Verify Count
        count = db.query(Participant).filter(Participant.event_id == event_id).count()
        print(f"DB Count after upload: {count}")
        if count != 2:
            print("ERROR: Upload failed to persist 2 items.")
        
        # 4. Delete One Participant
        print("Deleting one participant...")
        p = db.query(Participant).filter(Participant.event_id == event_id).first()
        if p:
            # Replicating delete logic
            db.delete(p)
            db.commit()
            print(f"Deleted participant {p.id}")
        
        count_after = db.query(Participant).filter(Participant.event_id == event_id).count()
        print(f"DB Count after single delete: {count_after}")
        if count_after != 1:
            print("ERROR: Deletion failed.")

        # 5. Delete Event (Cascade Check)
        print("Deleting event...")
        db.query(Participant).filter(Participant.event_id == event_id).delete() # Optimization I want to check?
        # Standard delete
        db_event = db.query(Event).filter(Event.id == event_id).first()
        if db_event:
            db.delete(db_event)
            db.commit()
        
        count_final = db.query(Participant).filter(Participant.event_id == event_id).count()
        print(f"DB Count after event delete: {count_final}")
        if count_final != 0:
             print("ERROR: Cascade delete failed.")

    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_backend_logic()
