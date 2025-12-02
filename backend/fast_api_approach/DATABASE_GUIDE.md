# Database Setup and Usage Guide

## Overview
This guide explains how to use the database system for the Peers Event Creation backend.

## Technology
- **Database**: SQLite (stored in `peers.db` file)
- **ORM**: SQLAlchemy (makes working with database easier)
- **API**: FastAPI (web framework)

## Database Structure

### Event Table
The main table stores event information:
- `id`: Unique number for each event (auto-generated)
- `customer_id`: Who created the event
- `title`: Event name
- `description`: Event details
- `date`: When the event happens
- `location`: Where the event happens
- `status`: Current status (pending, confirmed, cancelled, success)

## How to Start

### 1. Install Requirements
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
cd backend/fast_api_approach
uvicorn src.main:app --reload
```

The server will start on `http://localhost:8000`

### 3. View API Documentation
Once the server is running, go to:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### 1. Create an Event
**Endpoint**: `POST /events`

**Example Request**:
```json
{
  "customer_id": "user123",
  "title": "Basketball Championship",
  "description": "Annual basketball tournament",
  "date": "2024-12-15",
  "location": "Sports Arena"
}
```

**Example Response**:
```json
{
  "id": 1,
  "customer_id": "user123",
  "title": "Basketball Championship",
  "description": "Annual basketball tournament",
  "date": "2024-12-15",
  "location": "Sports Arena",
  "status": "pending"
}
```

### 2. Get All Events
**Endpoint**: `GET /events`

Returns a list of all events in the database.

### 3. Get a Specific Event
**Endpoint**: `GET /events/{event_id}`

Example: `GET /events/1` returns the event with ID 1.

### 4. Get Events by Customer
**Endpoint**: `GET /events/customer/{customer_id}`

Example: `GET /events/customer/user123` returns all events created by user123.

### 5. Simulate AI Response (Testing)
**Endpoint**: `POST /simulate-ai-response`

This is for testing - it simulates the AI processing an event.

**Example Request**:
```json
{
  "event_id": 1,
  "ai_response": "Event created successfully! I'll help set up the categories."
}
```

## Testing with curl

### Create an Event
```bash
curl -X POST "http://localhost:8000/events" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "test_user",
    "title": "Test Event",
    "description": "This is a test",
    "date": "2024-12-20",
    "location": "Test Location"
  }'
```

### Get All Events
```bash
curl "http://localhost:8000/events"
```

### Get Specific Event
```bash
curl "http://localhost:8000/events/1"
```

### Simulate AI Response
```bash
curl -X POST "http://localhost:8000/simulate-ai-response" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "ai_response": "AI processed this event!"
  }'
```

## Code Structure

```
backend/fast_api_approach/src/
├── db/
│   ├── database.py    # Database connection setup
│   ├── models.py      # Event table structure
│   ├── crud.py        # Create and Read operations
│   └── __init__.py    # Makes imports easier
├── DTOs/
│   └── eventstate.py  # Data models for API requests/responses
└── main.py            # API endpoints
```

## How It Works

1. **Database Setup** (`database.py`):
   - Creates connection to SQLite database
   - Provides helper functions to get database sessions

2. **Models** (`models.py`):
   - Defines what an Event looks like in the database
   - Like a blueprint for the Event table

3. **CRUD Operations** (`crud.py`):
   - **Create**: `create_event()` - adds new events
   - **Read**: `get_event()`, `get_all_events()`, `get_events_by_customer()`
   - Simple functions to interact with database

4. **API Endpoints** (`main.py`):
   - Connects HTTP requests to database operations
   - Handles errors and returns responses

## Frontend Integration

When you're ready to connect the frontend, you can:

1. Use the `/events` endpoints to save events
2. Use the `/chat` endpoint for AI interactions
3. The AI can create events automatically using the CRUD operations

Example flow:
```
User → Frontend → POST /chat → AI processes → Creates event via CRUD → Returns to user
```

## Tips for Development

1. **View Database**: You can use a SQLite viewer like "DB Browser for SQLite" to see the data
2. **Reset Database**: Delete `peers.db` file and restart server to start fresh
3. **Testing**: Use the Swagger UI at `/docs` - it's interactive and easy to use
4. **Debugging**: Check the terminal where the server is running for error messages

## Next Steps

Future improvements you might want to add:
- Update and Delete operations
- More tables (categories, participants, judges)
- Better error handling
- Data validation
- User authentication integration

