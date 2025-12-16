from enum import Enum
from typing import List, Dict, Any

# UI component types for sidebar fields
class ComponentType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    TIME = "time"
    LOCATION = "location"


# Sidebar configuration mapping database columns to UI components and labels
SIDEBAR_CONFIG = [
    {
        "key": "id",
        "label": "id",
        "component": ComponentType.NUMBER
    },
    {
        "key": "event_name",
        "label": "Event",
        "component": ComponentType.TEXT
    } ,
    {
        "key": "date",
        "label": "Date",
        "component": ComponentType.DATE
    },
    {
        "key": "time",
        "label": "Time",
        "component": ComponentType.TIME
    },
    {
        "key": "location",
        "label": "Location",
        "component": ComponentType.LOCATION
    },
    {
        "key": "description",
        "label": "Description",
        "component": ComponentType.TEXT
    },
    {
        "key": "judging_type",
        "label": "Judging Type",
        "component": ComponentType.TEXT
    },
    {
        "key": "audience_weight",
        "label": "Audience Weight",
        "component": ComponentType.NUMBER
    },
    {
        "key": "expert_weight",
        "label": "Expert Weight",
        "component": ComponentType.NUMBER
    },
    {
        "key": "athlete_weight",
        "label": "Athlete Weight",
        "component": ComponentType.NUMBER
    }
]

def build_ui_payload_from_dict(data: dict) -> List[Dict[str, Any]]:
    """
    Converts event data dictionary into sidebar UI payload.
    Filters out empty and placeholder values.
    """
    clean_payload = []
    print(f"DEBUG: AI State Keys: {list(data.keys())}")
    
    for field in SIDEBAR_CONFIG:
        key = field["key"]
        val = data.get(key)

        # Filter out empty and placeholder values
        if val is None or val == "":
            continue
        
        # Skip placeholder strings like "Not set", "None", etc.
        val_str = str(val).strip().lower()
        placeholder_values = ["not set", "none", "null", "n/a", "na", "-", "--", "???"]
        if val_str in placeholder_values or val_str == "":
            continue

        # Convert Enum component types to string values
        comp_type = field["component"]
        if hasattr(comp_type, "value"):
            comp_type = comp_type.value 

        # Build sidebar item dictionary for API response
        item = {
            "key": key,
            "label": field["label"],
            "value": val,
            "component": comp_type
        }
        clean_payload.append(item)
        
    return clean_payload
