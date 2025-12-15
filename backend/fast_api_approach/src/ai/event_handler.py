from ..DTOs.eventstate import EventState, EventImageCreate, ParticipantCreate
from google.genai import types
import os
from pydantic import BaseModel
from typing import List
from ..db.database import SessionLocal
from ..db.crud import create_event, get_all_events, create_image, update_event
from ..db.models import Event, ConversationModel, Participant
from ..pages.ai_sidebar import SIDEBAR_CONFIG
from ..db.crud import (create_event, get_all_events, create_image, get_single_event, update_event,
                       delete_event as crud_delete_event, get_single_image, get_all_images, get_images_for_event, update_image,
                       delete_images, create_participant, get_single_participant, get_all_participants,
                       get_participants_for_event, update_participant, delete_participant)



# Saves output EventState object from AI to database

def b_save_ai_generated_event(event_state: EventState):
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
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


def save_ai_generated_event(event_state: EventState):
    db = SessionLocal()
    try:
        if event_state.eventid is None:
            # Create new event in database and update event_state with generated ID
            saved_event = create_event(db, event_state)
            event_state.eventid = saved_event.id
            return saved_event
        else:
            # Update existing event
            updated_event = update_event(db, event_state)
            return updated_event
    finally:
        db.close()


# In src/ai/event_handler.py
# 1. The Wrapper (Contract)
class SidebarItem(BaseModel):
    key: str
    label: str
    value: str | int | float  # Allowed value types for sidebar items
    component: str

# 2. The Endpoint Response Model
class SidebarResponse(BaseModel):
    items: List[SidebarItem]

# 3. The Function
def get_event_ui_payload(event_id: int) -> List[SidebarItem]:
    with SessionLocal() as db:
        event_row = db.query(Event).filter(Event.id == event_id).first()
        if not event_row: return []

        event_data = event_row.to_dict()
        
        # List to hold sidebar items after filtering
        clean_payload = [] 
        
        for field in SIDEBAR_CONFIG:
            key = field["key"]
            
            # --- EXCLUDE ID AND EVENT_CODE FROM SIDEBAR ---
            if key in ["id", "event_code"]:
                continue
            
            val = event_data.get(key)

            # Filter out empty or placeholder values
            if val is None or val == "":
                continue
            
            # Skip placeholder strings
            val_str = str(val).strip().lower()
            placeholder_values = ["not set", "none", "null", "n/a", "na", "-", "--", "???"]
            if val_str in placeholder_values or val_str == "":
                continue

            # Extract component string from Enum
            comp_type = field["component"]
            if hasattr(comp_type, "value"):
                comp_type = comp_type.value 

            # Create SidebarItem only if value is not None or empty
            item = SidebarItem(
                key=key,
                label=field["label"],
                value=val,
                component=comp_type
            )
            clean_payload.append(item)
            
        return clean_payload




def debug_read_single_event(id: int):
    db = SessionLocal()
    try:
        single_event = get_single_event(db, id)
        return single_event
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


def debug_update_event(event_state: EventState):
    db = SessionLocal()
    try:
        event_to_update = update_event(db, event_state)
        return event_to_update
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()



def delete_event(id: int):
    """
    Deletes an event by ID. Handles DB session.
    Returns True if successful, False otherwise.
    """
    db = SessionLocal()
    try:
        crud_delete_event(db, id)
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False
    finally:
        db.close()


# Save image DTO in DB
def save_event_image(image_data: EventImageCreate):
    db = SessionLocal()
    try:
        saved_event = create_image(db, image_data)
        return saved_event
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (single)
def debug_read_event_image(id: int):
    db = SessionLocal()
    try:
        return get_single_image(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (all)
def debug_read_all_images():
    db = SessionLocal()
    try:
        return get_all_images(db)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# UPDATE
def debug_update_image(image_data: EventImageCreate, id: int):
    db = SessionLocal()
    try:
        return update_image(db, id, image_data)
    except Exception as e:
        print(f"Error: {str(e)}")
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


# --- Participant wrapper functions ---

# CREATE
def save_participant(participant_data: ParticipantCreate):
    db = SessionLocal()
    try:
        saved_participant = create_participant(db, participant_data)
        return saved_participant
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (single)
def debug_read_single_participant(id: int):
    db = SessionLocal()
    try:
        return get_single_participant(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (all)
def debug_read_all_participants():
    db = SessionLocal()
    try:
        return get_all_participants(db)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# READ (for event)
def debug_read_participants_for_event(event_id: int):
    db = SessionLocal()
    try:
        return get_participants_for_event(db, event_id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# UPDATE
def debug_update_participant(participant_data: ParticipantCreate, id: int):
    db = SessionLocal()
    try:
        return update_participant(db, id, participant_data)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


# DELETE
def debug_delete_participant(id: int):
    db = SessionLocal()
    try:
        delete_participant(db, id)
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()





def get_event_context_data(event_id: int):
    print(f"--- TRACE: Starting Context Fetch for ID {event_id} ---")
    
    try:
        # 1. Open Session
        db = SessionLocal()
        print("--- TRACE: Database Session Opened")
        
        # 2. Query Event
        event = db.query(Event).filter(Event.id == event_id).first()
        
        if not event:
            print(f"--- TRACE: FAILURE - ID {event_id} returned None from query.")
            db.close()
            return None
        
        print(f"--- TRACE: SUCCESS - Found Event: {event.event_name}")

        # 3. Get Sidebar Data
        print("--- TRACE: Fetching UI Payload...")
        try:
            payload_list = get_event_ui_payload(event_id)
            print(f"--- TRACE: UI Payload retrieved ({len(payload_list)} items)")
        except Exception as e:
            print(f"--- TRACE: ERROR in UI Payload: {e}")
            payload_list = []

        # 4. Count participants from Participant table
        participant_count = db.query(Participant).filter(Participant.event_id == event.id).count()
        
        # 5. Get most recent image for event
        images = get_images_for_event(db, event_id)
        image_data = None
        if images and len(images) > 0:
            import base64
            latest_image = images[-1]
            image_base64 = base64.b64encode(latest_image.image).decode('utf-8')
            image_data = f"data:image/jpeg;base64,{image_base64}"
        
        # 6. Construct Response
        start_dt = f"{event.date}T{event.time}" if event.date and event.time else event.date
        end_dt = f"{event.end_date}T{event.end_time}" if event.end_date and event.end_time else (event.end_date if event.end_date else None)
        
        response = {
            "id": event.id,
            "eventCode": event.event_code,
            "eventName": event.event_name,       
            "venue": event.location,             
            "scoringMode": event.judging_type,   
            "rules": event.description,          
            "description": event.description,
            "startDateTime": start_dt,
            "endDateTime": end_dt,
            "participants": participant_count,
            "image": image_data,
            "audienceWeight": event.audience_weight,
            "expertWeight": event.expert_weight,
            "athleteWeight": event.athlete_weight,
            "ui_payload": payload_list
        }
        
        db.close()
        print("--- TRACE: Returning Data successfully")
        return response

    except Exception as e:
        print(f"--- TRACE: CRITICAL CRASH: {e}")
        return None

# In src/ai/event_handler.py

def list_all_events():
    """
    Fetches all events for the Dashboard list.
    """
    with SessionLocal() as db:
        events = db.query(Event).all()
        
        results = []
        for e in events:
            # Count participants from Participant table
            participant_count = db.query(Participant).filter(Participant.event_id == e.id).count()
            
            # Get most recent image for event
            images = get_images_for_event(db, e.id)
            image_data = None
            if images and len(images) > 0:
                import base64
                latest_image = images[-1]
                image_base64 = base64.b64encode(latest_image.image).decode('utf-8')
                image_data = f"data:image/jpeg;base64,{image_base64}"
            
            # Combine date and time for proper datetime display
            start_dt = f"{e.date}T{e.time}" if e.date and e.time else (e.date if e.date else None)
            
            # MAP DB COLUMNS -> DASHBOARD COLUMNS
            results.append({
                "id": str(e.id),
                "eventName": e.event_name,
                "sport": e.event_name,  # Using event_name as sport placeholder
                "format": e.judging_type or "Standard",
                "status": e.status or "DRAFT",   # Get from database
                "location": e.location or "",
                "startDate": start_dt,  # Combined date and time for proper parsing
                "athletes": participant_count,
                "eventCode": e.event_code or "???",
                "image": image_data
            })
            
        return results
    

def create_event_from_frontend(data: dict):
    """
    Creates a new event from frontend data (manual setup flow).
    """
    with SessionLocal() as db:
        # Parse date/time from startDateTime
        date_value = None
        time_value = None
        if "startDateTime" in data and data["startDateTime"]:
            try:
                if "T" in data["startDateTime"]:
                    parts = data["startDateTime"].split("T")
                    date_value = parts[0]
                    time_value = parts[1] if len(parts) > 1 else None
                else:
                    date_value = data["startDateTime"]
            except Exception as e:
                print(f"Warning: Failed to parse startDateTime: {e}")
        
        # Parse date/time from endDateTime
        end_date_value = None
        end_time_value = None
        if "endDateTime" in data and data["endDateTime"]:
            try:
                if "T" in data["endDateTime"]:
                    parts = data["endDateTime"].split("T")
                    end_date_value = parts[0]
                    end_time_value = parts[1] if len(parts) > 1 else None
                else:
                    end_date_value = data["endDateTime"]
            except Exception as e:
                print(f"Warning: Failed to parse endDateTime: {e}")
        
        # Create new event
        event = Event(
            event_name=data.get("eventName"),
            date=date_value,
            time=time_value,
            end_date=end_date_value,
            end_time=end_time_value,
            location=data.get("venue"),
            description=data.get("rules"),
            judging_type=data.get("scoringMode"),
            event_code=data.get("eventCode"),
            status="DRAFT"  # Default status for new events
        )
        
        try:
            db.add(event)
            db.commit()
            db.refresh(event)
            print(f"Successfully created event {event.id}")
            return event
        except Exception as e:
            print(f"Error creating event: {e}")
            db.rollback()
            return None


def update_event_in_db(event_id: int, data: dict):
    """
    Updates an existing event with new data from the dashboard.
    """
    with SessionLocal() as db:
        event = db.query(Event).filter(Event.id == event_id).first()
        
        if not event:
            return False
            
        # Map Frontend CamelCase -> Database Snake_Case
        if "eventName" in data: 
            event.event_name = data["eventName"]
        
        if "venue" in data: 
            event.location = data["venue"]
            
        if "scoringMode" in data: 
            event.judging_type = data["scoringMode"]
            
        if "rules" in data: 
            event.description = data["rules"]
        
        if "description" in data:
            event.description = data["description"]  # Description takes precedence over rules
        
        if "eventCode" in data:
            event.event_code = data["eventCode"]
        
        if "audienceWeight" in data:
            event.audience_weight = data["audienceWeight"]
        
        if "expertWeight" in data:
            event.expert_weight = data["expertWeight"]
        
        if "athleteWeight" in data:
            event.athlete_weight = data["athleteWeight"]
        
        # Status updates are handled separately via dashboard toggle endpoint
        
        # Handle Date & Time splitting for start
        if "startDate" in data and data["startDate"]:
            # Expecting "YYYY-MM-DDTHH:MM" from datetime-local input
            try:
                if "T" in data["startDate"]:
                    parts = data["startDate"].split("T")
                    event.date = parts[0]
                    event.time = parts[1]
                else:
                    event.date = data["startDate"]
            except Exception as e:
                print(f"Warning: Failed to parse startDate: {e}")
                pass  # Preserve existing date if parsing fails
        
        # Handle Date & Time splitting for end
        if "endDateTime" in data and data["endDateTime"]:
            try:
                if "T" in data["endDateTime"]:
                    parts = data["endDateTime"].split("T")
                    event.end_date = parts[0]
                    event.end_time = parts[1] if len(parts) > 1 else None
                else:
                    event.end_date = data["endDateTime"]
            except Exception as e:
                print(f"Warning: Failed to parse endDateTime: {e}")
                pass

        # Participants are stored in separate Participant table.
        # Count participants by querying Participant table filtered by event_id
        
        try:
            db.commit()
            print(f"Successfully updated event {event_id}")
            return True
        except Exception as e:
            print(f"Error committing update for event {event_id}: {e}")
            db.rollback()
            return False
    

def load_state_from_db(event_id: int) -> EventState:
    """
    Loads an EventState from the database given an event ID.
    """
    db = SessionLocal()
    try:
        db_event = get_single_event(db, event_id)
        if not db_event:
            raise AttributeError(f"Event with ID: {event_id} does not exist")
        
        event_state = EventState(
            eventid=db_event.id,
            eventname=db_event.event_name,
            eventdate=db_event.date,
            eventtime=db_event.time,
            eventenddate=db_event.end_date,
            eventendtime=db_event.end_time,
            eventlocation=db_event.location,
            eventdescription=db_event.description,
            eventjudgetype=db_event.judging_type,
            eventaudienceweight=db_event.audience_weight,
            eventexpertweight=db_event.expert_weight,
            eventathleteweight=db_event.athlete_weight
        )
        return event_state
    finally:
        db.close()

# In src/ai/event_handler.py
# Make sure to import ConversationModel

def get_event_chat_history(event_id: int):
    with SessionLocal() as db:
        # Fetch history ordered by time
        rows = db.query(ConversationModel).filter(ConversationModel.event_id == event_id).order_by(ConversationModel.timestamp).all()
        
        # Convert to the format React expects
        # React expects: { sender: "user" | "assistant", text: "..." }
        history = []
        for r in rows:
            # Map 'model' role to 'assistant' for frontend compatibility
            role = "assistant" if r.role == "model" else r.role
            history.append({"sender": role, "text": r.content})

    
            
        return history


def save_chat_message(event_id: int, role: str, content: str):
    """
    Saves a single message to the conversation history.
    """
    with SessionLocal() as db:
        msg = ConversationModel(event_id=event_id, role=role, content=content)
        db.add(msg)
        db.commit()

def update_event_field_from_sidebar(event_id: int, field_key: str, field_value: any):
    """
    Updates a single event field from sidebar edit and notifies AI subtly.
    Maps sidebar field keys to database columns.
    """
    # Normalize key (handle both "event_name" and "Event Name" formats)
    normalized_key = field_key.lower().replace(" ", "_").strip()
    
    # Prepare update data
    update_data = {}
    
    # Map sidebar keys to update_event_in_db format
    # Special handling for date/time - need to preserve the other part
    if normalized_key in ["date"]:
        # Load current event to get existing time
        with SessionLocal() as db:
            event = db.query(Event).filter(Event.id == event_id).first()
            if event:
                current_time = event.time or ""
                # field_value is date string (YYYY-MM-DD)
                if current_time:
                    update_data["startDate"] = f"{field_value}T{current_time}"
                else:
                    update_data["startDate"] = field_value
            else:
                return False
    elif normalized_key in ["time"]:
        # Load current event to get existing date
        with SessionLocal() as db:
            event = db.query(Event).filter(Event.id == event_id).first()
            if event:
                current_date = event.date or ""
                # field_value is time string (HH:MM)
                if current_date:
                    update_data["startDate"] = f"{current_date}T{field_value}"
                else:
                    update_data["startDate"] = f"2000-01-01T{field_value}"  # Default date
            else:
                return False
    elif normalized_key in ["event_name", "name", "eventname"]:
        update_data["eventName"] = str(field_value)
    elif normalized_key in ["location", "venue"]:
        update_data["venue"] = str(field_value)
    elif normalized_key in ["description", "rules"]:
        update_data["rules"] = str(field_value)
    elif normalized_key in ["judging_type", "judgingtype", "scoringmode"]:
        update_data["scoringMode"] = str(field_value)
    elif normalized_key in ["event_code", "eventcode", "code"]:
        # Prevent event_code updates (immutable after creation)
        print(f"Warning: Event code is not editable: {field_key}")
        return False
    elif normalized_key in ["audience_weight", "expert_weight", "athlete_weight"]:
        # Weight fields are not directly updatable via sidebar
        print(f"Warning: Weight fields not directly updatable via sidebar: {field_key}")
        return False
    elif normalized_key == "id":
        # Don't allow editing ID
        print(f"Warning: ID is not editable: {field_key}")
        return False
    else:
        print(f"Warning: Unknown sidebar field key: {field_key} (normalized: {normalized_key})")
        return False
    
    # Update in database
    success = update_event_in_db(event_id, update_data)
    
    if success:
        # Add system note to conversation history to inform AI of manual changes.
        # Brackets indicate system-generated message, not user input.
        note = f"[Manual edit: {field_key} set to '{field_value}']"
        save_chat_message(event_id, "user", note)
        print(f"✓ Updated {field_key} to {field_value} for event {event_id}")
    
    return success

#
def load_conversation_from_db(event_id: int):
    """
    Loads chat history and converts it to Gemini SDK format.
    """
    with SessionLocal() as db:
        # 1. Fetch from DB (Sorted by time)
        history = db.query(ConversationModel).filter(ConversationModel.event_id == event_id).order_by(ConversationModel.timestamp).all()
        
        formatted_history = []
        for msg in history:
            # 2. Map Roles: DB 'assistant' -> Gemini 'model'
            role = "model" if msg.role == "assistant" else "user"
            
            # 3. Create SDK Content Object
            formatted_history.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg.content)]
                )
            )
        return formatted_history