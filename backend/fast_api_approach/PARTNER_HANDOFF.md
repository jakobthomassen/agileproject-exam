# 🎯 Backend Database - Partner Handoff Document

**For:** Frontend Developer / Project Partner  
**From:** Backend Team  
**Date:** December 2, 2025  
**Status:** ✅ Database Setup Complete & Working

---

## 📋 Table of Contents
1. [What We Built](#what-we-built)
2. [How It Works - Simple Explanation](#how-it-works)
3. [The Database](#the-database)
4. [API Endpoints You Can Use](#api-endpoints)
5. [How to Start the Server](#how-to-start)
6. [Testing the Backend](#testing)
7. [Connecting Frontend to Backend](#frontend-integration)
8. [Code Structure](#code-structure)
9. [Common Issues & Solutions](#troubleshooting)

---

## 🎯 What We Built

We created a **simple database system** for the Peers event creation platform. Think of it as a storage box where we can:
- ✅ Save new events
- ✅ Get all events
- ✅ Get a specific event
- ✅ Filter events by customer
- ✅ Simulate AI responses (for testing)

### Technology Stack
```
Database:  SQLite (a simple file-based database)
ORM:       SQLAlchemy (makes database easy to use)
API:       FastAPI (creates web endpoints)
Language:  Python 3.11
```

**Why these choices?**
- **SQLite**: No complex setup, just a file (`peers.db`)
- **SQLAlchemy**: We write Python, it handles SQL
- **FastAPI**: Fast, modern, auto-generates documentation
- All are student-friendly and well-documented!

---

## 🧠 How It Works - Simple Explanation

### The Big Picture

```
┌─────────────┐      HTTP Request      ┌──────────────┐      SQL Query      ┌──────────┐
│   Frontend  │ ──────────────────────> │   FastAPI    │ ──────────────────> │ Database │
│  (Your Part)│                         │   Backend    │                     │ peers.db │
│             │ <────────────────────── │  (Our Part)  │ <────────────────── │          │
└─────────────┘      JSON Response      └──────────────┘      Data           └──────────┘
```

### Step-by-Step Flow

**Example: Creating an Event**

1. **Frontend sends request:**
   ```javascript
   fetch('http://localhost:8000/events', {
     method: 'POST',
     body: JSON.stringify({
       customer_id: "user123",
       title: "Basketball Game",
       description: "Annual tournament",
       date: "2024-12-25",
       location: "Sports Arena"
     })
   })
   ```

2. **Backend receives it:**
   - FastAPI receives the HTTP request
   - Validates the data (checks if all fields are present)

3. **Backend saves to database:**
   - CRUD function `create_event()` is called
   - SQLAlchemy converts it to SQL
   - Data is saved to `peers.db`

4. **Backend responds:**
   ```json
   {
     "id": 1,
     "customer_id": "user123",
     "title": "Basketball Game",
     "description": "Annual tournament",
     "date": "2024-12-25",
     "location": "Sports Arena",
     "status": "pending"
   }
   ```

5. **Frontend gets the response:**
   - Now you know the event was created!
   - You have the event ID (1) for future use

---

## 💾 The Database

### What's Stored?

We have **one table** called `events`:

| Field        | Type    | Description                                    |
|--------------|---------|------------------------------------------------|
| id           | Integer | Auto-generated unique number (1, 2, 3...)      |
| customer_id  | String  | Who created the event (e.g., "user123")       |
| title        | String  | Event name (e.g., "Basketball Championship")   |
| description  | String  | Event details                                  |
| date         | String  | When it happens (e.g., "2024-12-25")          |
| location     | String  | Where it happens (e.g., "Sports Arena")       |
| status       | String  | Current state: pending/confirmed/cancelled/success |

### Example Data in Database

```
┌────┬─────────────┬─────────────────────────┬─────────────────────┬────────────┬───────────────┬───────────┐
│ id │ customer_id │ title                   │ description         │ date       │ location      │ status    │
├────┼─────────────┼─────────────────────────┼─────────────────────┼────────────┼───────────────┼───────────┤
│ 1  │ user123     │ Basketball Championship │ Annual tournament   │ 2024-12-25 │ Sports Arena  │ pending   │
│ 2  │ user456     │ Dance Competition       │ Dance showcase      │ 2024-12-30 │ City Theater  │ confirmed │
│ 3  │ user123     │ Soccer League           │ Youth soccer        │ 2025-01-15 │ Soccer Field  │ pending   │
└────┴─────────────┴─────────────────────────┴─────────────────────┴────────────┴───────────────┴───────────┘
```

### Event Status Explained

- **pending**: Just created, waiting for setup
- **confirmed**: AI has processed it, ready to go
- **cancelled**: Event was cancelled
- **success**: Event completed successfully

---

## 🔌 API Endpoints You Can Use

### Base URL
```
http://localhost:8000
```

### 1. Create an Event
**Endpoint:** `POST /events`

**What it does:** Saves a new event to the database

**Request Body:**
```json
{
  "customer_id": "user123",
  "title": "My Event",
  "description": "Event description here",
  "date": "2024-12-25",
  "location": "Event location"
}
```

**Response:**
```json
{
  "id": 1,
  "customer_id": "user123",
  "title": "My Event",
  "description": "Event description here",
  "date": "2024-12-25",
  "location": "Event location",
  "status": "pending"
}
```

**Frontend Example:**
```javascript
async function createEvent(eventData) {
  const response = await fetch('http://localhost:8000/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  
  if (response.ok) {
    const event = await response.json();
    console.log('Event created!', event);
    return event;
  } else {
    console.error('Failed to create event');
  }
}
```

---

### 2. Get All Events
**Endpoint:** `GET /events`

**What it does:** Returns a list of ALL events in the database

**Request:** Just a simple GET, no body needed

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": "user123",
    "title": "Event 1",
    "description": "Description 1",
    "date": "2024-12-25",
    "location": "Location 1",
    "status": "pending"
  },
  {
    "id": 2,
    "customer_id": "user456",
    "title": "Event 2",
    "description": "Description 2",
    "date": "2024-12-30",
    "location": "Location 2",
    "status": "confirmed"
  }
]
```

**Frontend Example:**
```javascript
async function getAllEvents() {
  const response = await fetch('http://localhost:8000/events');
  const events = await response.json();
  console.log('All events:', events);
  return events;
}
```

---

### 3. Get a Specific Event
**Endpoint:** `GET /events/{event_id}`

**What it does:** Returns ONE specific event by its ID

**Example:** `GET /events/1` returns the event with ID 1

**Response:**
```json
{
  "id": 1,
  "customer_id": "user123",
  "title": "My Event",
  "description": "Event description",
  "date": "2024-12-25",
  "location": "Event location",
  "status": "pending"
}
```

**Error Response (if not found):**
```json
{
  "detail": "Event not found"
}
```

**Frontend Example:**
```javascript
async function getEvent(eventId) {
  const response = await fetch(`http://localhost:8000/events/${eventId}`);
  
  if (response.ok) {
    const event = await response.json();
    console.log('Found event:', event);
    return event;
  } else if (response.status === 404) {
    console.log('Event not found');
    return null;
  }
}
```

---

### 4. Get Events by Customer
**Endpoint:** `GET /events/customer/{customer_id}`

**What it does:** Returns ALL events created by a specific customer

**Example:** `GET /events/customer/user123` returns all events by user123

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": "user123",
    "title": "Event 1",
    ...
  },
  {
    "id": 3,
    "customer_id": "user123",
    "title": "Event 3",
    ...
  }
]
```

**Frontend Example:**
```javascript
async function getUserEvents(customerId) {
  const response = await fetch(`http://localhost:8000/events/customer/${customerId}`);
  const events = await response.json();
  console.log(`Events for ${customerId}:`, events);
  return events;
}
```

---

### 5. Simulate AI Response (Testing Only)
**Endpoint:** `POST /simulate-ai-response`

**What it does:** Simulates the AI processing an event (for testing without actual AI)

**Request Body:**
```json
{
  "event_id": 1,
  "ai_response": "I've processed your event! Looks great!"
}
```

**What happens:**
- Changes the event status to "confirmed"
- Returns the updated event

**Frontend Example:**
```javascript
async function testAIResponse(eventId, message) {
  const response = await fetch('http://localhost:8000/simulate-ai-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      ai_response: message
    })
  });
  
  const result = await response.json();
  console.log('AI simulation result:', result);
  return result;
}
```

---

## 🚀 How to Start the Server

### Prerequisites
1. Python 3.11 installed
2. Virtual environment activated
3. Dependencies installed

### Step-by-Step

**1. Open Terminal**
```bash
cd "C:\Users\shefa\Documents\Software Design\agileproject-exam\backend\fast_api_approach"
```

**2. Activate Virtual Environment**
```bash
venv\Scripts\Activate.ps1
```

You should see `(venv)` in your terminal prompt.

**3. Install Dependencies (first time only)**
```bash
pip install -r requirements.txt
```

**4. Set API Key**
```bash
$env:GEMINI_API_KEY="your_api_key_here"
```
Or create a `.env` file with the key.

**5. Start the Server**
```bash
uvicorn src.main:app --reload
```

**Expected Output:**
```
✅ Database initialized!
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO: Application startup complete.
```

**6. Verify It's Working**
Open browser: http://localhost:8000/docs  
You should see the interactive API documentation!

---

## 🧪 Testing the Backend

### Method 1: Using the Test Script (Easiest)

**1. Keep server running in Terminal 1**

**2. Open new Terminal 2:**
```bash
cd "C:\Users\shefa\Documents\Software Design\agileproject-exam\backend\fast_api_approach"
venv\Scripts\Activate.ps1
python test_database.py
```

**What it tests:**
- ✅ Server is running
- ✅ Create events
- ✅ Get all events
- ✅ Get specific event
- ✅ Get events by customer
- ✅ Simulate AI response
- ✅ Verify status changes

**Expected Output:**
```
============================================================
  Test 1: Check if server is running
============================================================
Status Code: 200
Response: {"message": "API is running"}
✅ Server is running!

============================================================
  Test 2: Create a new event
============================================================
Status Code: 200
Response: {...}
✅ Event created successfully! Event ID: 1

... (more tests)

============================================================
  Test Summary
============================================================
All tests completed!
```

---

### Method 2: Using Swagger UI (Interactive)

**1. Start the server**

**2. Open browser:**
```
http://localhost:8000/docs
```

**3. Try an endpoint:**
- Click on `POST /events`
- Click "Try it out"
- Fill in the example data
- Click "Execute"
- See the response!

**This is great for:**
- Testing endpoints manually
- Seeing what data looks like
- Understanding how the API works

---

### Method 3: Using curl (Command Line)

```bash
# Create an event
curl -X POST "http://localhost:8000/events" ^
  -H "Content-Type: application/json" ^
  -d "{\"customer_id\": \"test\", \"title\": \"Test Event\", \"description\": \"Test\", \"date\": \"2024-12-25\", \"location\": \"Test Location\"}"

# Get all events
curl "http://localhost:8000/events"

# Get specific event
curl "http://localhost:8000/events/1"
```

---

## 🌐 Connecting Frontend to Backend

### Setup in Frontend

**1. Base URL Configuration**

Create a config file:
```javascript
// frontend/src/config/api.js
export const API_BASE_URL = 'http://localhost:8000';
```

**2. API Service Layer**

Create an API service:
```javascript
// frontend/src/services/eventService.js
import { API_BASE_URL } from '../config/api';

export const eventService = {
  // Create a new event
  async createEvent(eventData) {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    
    return await response.json();
  },

  // Get all events
  async getAllEvents() {
    const response = await fetch(`${API_BASE_URL}/events`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return await response.json();
  },

  // Get a specific event
  async getEvent(eventId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch event');
    }
    
    return await response.json();
  },

  // Get events by customer
  async getCustomerEvents(customerId) {
    const response = await fetch(`${API_BASE_URL}/events/customer/${customerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer events');
    }
    
    return await response.json();
  }
};
```

**3. Using in Components**

Example React component:
```javascript
// frontend/src/components/CreateEvent.jsx
import React, { useState } from 'react';
import { eventService } from '../services/eventService';

function CreateEvent() {
  const [formData, setFormData] = useState({
    customer_id: 'user123',
    title: '',
    description: '',
    date: '',
    location: ''
  });
  
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const event = await eventService.createEvent(formData);
      setMessage(`✅ Event created! ID: ${event.id}`);
      console.log('Created event:', event);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
      />
      <button type="submit">Create Event</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CreateEvent;
```

### CORS (Important!)

If frontend is on different port (e.g., localhost:3000), you'll need CORS.

**Add to `src/main.py`:**
```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📁 Code Structure

```
backend/fast_api_approach/
│
├── src/
│   ├── db/                          # 💾 DATABASE LAYER
│   │   ├── database.py              # Database connection setup
│   │   ├── models.py                # Event table structure (blueprint)
│   │   ├── crud.py                  # Create & Read functions
│   │   └── __init__.py              # Makes imports easier
│   │
│   ├── DTOs/                        # 📦 DATA MODELS
│   │   └── eventstate.py            # Request/response formats
│   │
│   ├── ai/                          # 🤖 AI INTEGRATION
│   │   ├── gemini.py                # Gemini AI client
│   │   └── base.py                  # Base AI interface
│   │
│   ├── auth/                        # 🔐 AUTHENTICATION
│   │   ├── dependencies.py          # Auth helpers
│   │   └── throttling.py            # Rate limiting
│   │
│   ├── agent/                       # 🛠️ AI TOOLS
│   │   ├── tools.py                 # Tools for AI agent
│   │   └── toolguide.py             # Tool documentation
│   │
│   ├── prompts/                     # 📝 AI PROMPTS
│   │   └── system_prompt.md         # Instructions for AI
│   │
│   └── main.py                      # 🚀 MAIN APP (API endpoints)
│
├── peers.db                         # 💾 DATABASE FILE (auto-created)
├── requirements.txt                 # 📦 Dependencies
├── test_database.py                 # 🧪 Test script
├── README.md                        # 📖 Overview
├── DATABASE_GUIDE.md                # 📚 Detailed docs
└── PARTNER_HANDOFF.md               # 📋 This file!
```

### What Each File Does

**Database Layer (`src/db/`)**
- `database.py`: Connects to SQLite, provides database sessions
- `models.py`: Defines what an Event looks like in database
- `crud.py`: Functions to Create and Read events
- Simple Python functions that handle database operations

**Main App (`src/main.py`)**
- Defines all API endpoints
- Connects HTTP requests to database operations
- Handles errors and returns responses
- This is where frontend requests arrive!

**DTOs (`src/DTOs/eventstate.py`)**
- Defines data formats (Pydantic models)
- `EventCreate`: What you send to create an event
- `EventResponse`: What you get back from the API
- Ensures data is valid

---

## 🐛 Common Issues & Solutions

### Issue 1: Server Won't Start

**Error:** `ImportError` or `ModuleNotFoundError`

**Solution:**
```bash
# Make sure you're in the right directory
cd backend/fast_api_approach

# Activate virtual environment
venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

---

### Issue 2: "Connection Refused" from Frontend

**Problem:** Frontend can't reach backend

**Solution:**
1. Check server is running: `http://localhost:8000`
2. Add CORS to `main.py` (see Frontend Integration section)
3. Check firewall isn't blocking port 8000

---

### Issue 3: Database File Locked

**Error:** `database is locked`

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Delete the database file
rm peers.db
# Restart server - it will create a fresh database
uvicorn src.main:app --reload
```

---

### Issue 4: "Event Not Found" (404)

**Problem:** Trying to get an event that doesn't exist

**Solution:**
- Check the event ID is correct
- Run `GET /events` to see all events and their IDs
- Remember: IDs start at 1, not 0

---

### Issue 5: Can't Create Event (Validation Error)

**Problem:** Missing required fields

**Solution:**
Make sure ALL fields are included:
```json
{
  "customer_id": "required",
  "title": "required",
  "description": "required",
  "date": "required",
  "location": "required"
}
```

---

## 📊 Quick Reference

### HTTP Status Codes

| Code | Meaning | When You See It |
|------|---------|-----------------|
| 200 | Success | Everything worked! |
| 404 | Not Found | Event doesn't exist |
| 422 | Validation Error | Missing or invalid data |
| 500 | Server Error | Something broke on backend |

### Response Format

**Success:**
```json
{
  "id": 1,
  "customer_id": "user123",
  "title": "Event Title",
  "description": "Event description",
  "date": "2024-12-25",
  "location": "Location",
  "status": "pending"
}
```

**Error:**
```json
{
  "detail": "Error message here"
}
```

---

## 🎯 Next Steps for Integration

### For You (Frontend Developer)

**1. Test the Backend First**
```bash
# Terminal 1
uvicorn src.main:app --reload

# Terminal 2
python test_database.py
```
Make sure everything works!

**2. Add CORS to Backend**
So frontend can make requests (see CORS section above)

**3. Create API Service Layer**
Centralize all API calls in one place (see Frontend Integration section)

**4. Build Components**
Start with simple components:
- Create event form
- Event list display
- Event details view

**5. Test Integration**
- Start backend server
- Start frontend dev server
- Try creating an event from frontend
- Check if it appears in database

---

## 💡 Tips for Success

**1. Keep Backend Running**
- Always test with backend server running
- Use separate terminals for backend and frontend

**2. Use Browser DevTools**
- Network tab shows API requests/responses
- Console shows errors
- Very helpful for debugging!

**3. Check Swagger Docs**
- http://localhost:8000/docs
- Interactive, shows all endpoints
- Great for understanding API

**4. Start Simple**
- Get one endpoint working first
- Then add more features
- Don't try to do everything at once

**5. Console.log Everything**
```javascript
console.log('Sending request:', data);
const response = await fetch(...);
console.log('Got response:', response);
const result = await response.json();
console.log('Parsed result:', result);
```

---

## 📞 Questions?

**Check these files:**
- `README.md` - Quick start guide
- `DATABASE_GUIDE.md` - Detailed database docs
- `IMPLEMENTATION_SUMMARY.md` - What we built
- Code comments - All files have detailed comments

**Common questions:**

**Q: Where is the database file?**
A: `backend/fast_api_approach/peers.db` (created automatically)

**Q: How do I reset the database?**
A: Delete `peers.db` and restart server

**Q: Can I see the data in the database?**
A: Yes! Use "DB Browser for SQLite" (free tool)

**Q: What port does it run on?**
A: Port 8000 (http://localhost:8000)

**Q: Do I need to restart server after code changes?**
A: No! `--reload` flag auto-restarts

---

## ✅ Checklist for Your First Integration

- [ ] Backend server starts successfully
- [ ] Test script passes all tests
- [ ] Can access Swagger docs at /docs
- [ ] CORS is configured for your frontend port
- [ ] API service layer created in frontend
- [ ] Can create event from frontend
- [ ] Can retrieve events from frontend
- [ ] Errors are handled gracefully
- [ ] Console logs help with debugging

---

## 🎉 You're Ready!

The backend is **fully functional** and **ready to connect** to your frontend!

- ✅ Database works
- ✅ All endpoints tested
- ✅ Documentation complete
- ✅ Simple, student-level code
- ✅ Easy to understand and modify

**Start building your frontend and connect it to these endpoints!**

Good luck! 🚀

---

**Last Updated:** December 2, 2025  
**Backend Status:** ✅ Complete & Tested  
**Ready for:** Frontend Integration

