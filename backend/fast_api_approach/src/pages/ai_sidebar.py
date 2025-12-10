from enum import Enum

# UI widget, how the component will be rendered
class ComponentType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    TIME = "time"
    LOCATION = "location"


# Sidebar config
# This is the blueprint for the sidebar form
# it maps column keys to the UI component type and label

SIDEBAR_CONFIG = [
    {
        "key": "eventname", # has to match the db column name
        "label": "Event", # The label to show in the UI
        "component": ComponentType.TEXT # The type of UI component to render
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
    }
]
    