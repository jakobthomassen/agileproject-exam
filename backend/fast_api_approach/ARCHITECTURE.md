# 🏗️ Architecture Overview - Visual Guide

Simple visual explanation of how the backend is structured.

---

## 🌍 The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER / FRONTEND                          │
│                    (Your Partner's Work)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests (JSON)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
│                      (FastAPI - Port 8000)                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    src/main.py                          │  │
│  │              (API Endpoints Live Here)                  │  │
│  │                                                         │  │
│  │  • POST   /events          → Create new event          │  │
│  │  • GET    /events          → Get all events            │  │
│  │  • GET    /events/{id}     → Get specific event        │  │
│  │  • GET    /events/customer → Filter by customer        │  │
│  │  • POST   /simulate        → Test AI response          │  │
│  └────────────────┬────────────────────────────────────────┘  │
│                   │                                             │
│                   │ Calls CRUD functions                        │
│                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   src/db/crud.py                        │  │
│  │               (Database Operations)                     │  │
│  │                                                         │  │
│  │  • create_event()        → Add to database             │  │
│  │  • get_event()           → Find by ID                  │  │
│  │  • get_all_events()      → Get everything              │  │
│  │  • get_events_by_customer() → Filter results           │  │
│  └────────────────┬────────────────────────────────────────┘  │
│                   │                                             │
│                   │ Uses SQLAlchemy                            │
│                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  src/db/models.py                       │  │
│  │                (Database Structure)                     │  │
│  │                                                         │  │
│  │  Event Table Blueprint:                                │  │
│  │    • id (auto)                                         │  │
│  │    • customer_id                                       │  │
│  │    • title                                             │  │
│  │    • description                                       │  │
│  │    • date                                              │  │
│  │    • location                                          │  │
│  │    • status                                            │  │
│  └────────────────┬────────────────────────────────────────┘  │
│                   │                                             │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ SQLAlchemy ORM
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE FILE                              │
│                       peers.db                                  │
│                      (SQLite)                                   │
│                                                                 │
│  ┌─────┬─────────────┬────────┬─────────────┬──────┬────────┐ │
│  │ id  │ customer_id │ title  │ description │ date │ status │ │
│  ├─────┼─────────────┼────────┼─────────────┼──────┼────────┤ │
│  │  1  │   user123   │ Event1 │    ...      │ ...  │pending │ │
│  │  2  │   user456   │ Event2 │    ...      │ ...  │confirmed│ │
│  └─────┴─────────────┴────────┴─────────────┴──────┴────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure Explained

```
backend/fast_api_approach/
│
├── src/
│   │
│   ├── main.py                    🚪 ENTRY POINT
│   │   └─> Receives HTTP requests from frontend
│   │       Defines all API endpoints
│   │       Returns JSON responses
│   │
│   ├── db/                        💾 DATABASE LAYER
│   │   │
│   │   ├── database.py            🔌 Connection
│   │   │   └─> Connects to SQLite
│   │   │       Creates database sessions
│   │   │       Provides get_db() helper
│   │   │
│   │   ├── models.py              📋 Structure
│   │   │   └─> Defines Event table
│   │   │       Like a blueprint
│   │   │       Says what fields exist
│   │   │
│   │   └── crud.py                🛠️ Operations
│   │       └─> Create events
│   │           Read events
│   │           Simple Python functions
│   │
│   ├── DTOs/                      📦 DATA FORMATS
│   │   └── eventstate.py
│   │       └─> EventCreate (what frontend sends)
│   │           EventResponse (what backend returns)
│   │           Validates data
│   │
│   ├── ai/                        🤖 AI STUFF
│   │   └─> Gemini integration
│   │       (Not your concern for now)
│   │
│   └── auth/                      🔐 SECURITY
│       └─> Rate limiting
│           User identification
│           (Already handled)
│
├── peers.db                       💾 DATABASE FILE
│   └─> Actual data stored here
│       Created automatically
│       SQLite format
│
├── test_database.py               🧪 TESTING
│   └─> Tests all endpoints
│       Run this to verify everything works
│
└── Documentation/
    ├── PARTNER_HANDOFF.md         📋 Read this first!
    ├── QUICK_START_GUIDE.md       ⚡ Quick reference
    ├── DATABASE_GUIDE.md          📚 Deep dive
    └── ARCHITECTURE.md            🏗️ This file
```

---

## 🔄 Request Flow (Step by Step)

### Example: Creating an Event

```
Step 1: Frontend sends request
─────────────────────────────────
POST http://localhost:8000/events
{
  "customer_id": "user123",
  "title": "Basketball Game",
  "description": "Annual tournament",
  "date": "2024-12-25",
  "location": "Sports Arena"
}
                  │
                  ▼
Step 2: Reaches main.py endpoint
─────────────────────────────────
@app.post("/events", response_model=EventResponse)
async def create_new_event(event: EventCreate, db: Session = Depends(get_db)):
    ...
                  │
                  ▼
Step 3: Validates data
─────────────────────────────────
EventCreate model checks:
  ✓ All required fields present?
  ✓ Data types correct?
  ✓ Values make sense?
                  │
                  ▼
Step 4: Calls CRUD function
─────────────────────────────────
db_event = crud.create_event(
    db=db,
    customer_id=event.customer_id,
    title=event.title,
    ...
)
                  │
                  ▼
Step 5: CRUD creates Event object
─────────────────────────────────
db_event = Event(
    customer_id=customer_id,
    title=title,
    ...
)
db.add(db_event)
db.commit()
                  │
                  ▼
Step 6: SQLAlchemy converts to SQL
─────────────────────────────────
INSERT INTO events (customer_id, title, description, date, location, status)
VALUES ('user123', 'Basketball Game', 'Annual tournament', '2024-12-25', 'Sports Arena', 'pending');
                  │
                  ▼
Step 7: Saved to database file
─────────────────────────────────
peers.db now contains the new event
Auto-generated ID = 1
                  │
                  ▼
Step 8: Returns to frontend
─────────────────────────────────
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

---

## 🎨 Code Layers (Simplified)

```
┌─────────────────────────────────────────────────┐
│            PRESENTATION LAYER                   │  → main.py
│  • API endpoints                                │    (What frontend sees)
│  • HTTP request/response                        │
│  • Error handling                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            BUSINESS LOGIC LAYER                 │  → crud.py
│  • Create events                                │    (What happens)
│  • Read events                                  │
│  • Business rules                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            DATA ACCESS LAYER                    │  → models.py
│  • Table structure                              │    database.py
│  • Database connection                          │    (How it's stored)
│  • SQLAlchemy ORM                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            DATABASE                             │  → peers.db
│  • Actual data storage                          │    (Where it's stored)
│  • SQLite file                                  │
└─────────────────────────────────────────────────┘
```

**Why layers?**
- **Separation of concerns** - Each layer has one job
- **Easy to change** - Swap database without changing endpoints
- **Easy to test** - Test each layer independently
- **Easy to understand** - Clear responsibilities

---

## 🔍 How Components Talk to Each Other

```
┌─────────┐                                    ┌──────────┐
│         │  1. Import crud functions          │          │
│ main.py │ ──────────────────────────────────>│ crud.py  │
│         │                                    │          │
│         │  2. Call create_event()            │          │
│         │ ──────────────────────────────────>│          │
└─────────┘                                    └────┬─────┘
                                                    │
                                                    │ 3. Import Event model
                                                    │
┌──────────────┐                                   ▼
│  database.py │                            ┌──────────┐
│              │<───────────────────────────│models.py │
│  • engine    │  4. Use Base for models    │          │
│  • Base      │                            │  Event   │
│  • get_db()  │                            └──────────┘
└──────┬───────┘
       │
       │ 5. SQLAlchemy uses engine
       │    to talk to database
       ▼
┌──────────┐
│peers.db  │
│(SQLite)  │
└──────────┘
```

---

## 💡 Simple Analogy

Think of it like a restaurant:

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Customer)                                │
│  Orders food (makes API request)                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  main.py (Waiter)                                   │
│  Takes order, brings food                           │
│  Talks to customer and kitchen                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  crud.py (Chef)                                     │
│  Prepares the food (processes requests)             │
│  Knows the recipes (business logic)                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  models.py (Recipe Book)                            │
│  Defines what dishes are available                  │
│  What ingredients needed (table structure)          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  peers.db (Pantry/Storage)                          │
│  Where ingredients/food are actually stored         │
└─────────────────────────────────────────────────────┘
```

**Why this works:**
- Waiter doesn't cook (separation of concerns)
- Chef follows recipes (consistent structure)
- Pantry just stores things (simple storage)
- Each has clear role (maintainable)

---

## 🎯 What You Need to Know (Frontend Developer)

### You DON'T need to understand:
- ❌ How SQLAlchemy works
- ❌ How SQLite stores data
- ❌ Internal database operations
- ❌ ORM magic

### You DO need to know:
- ✅ API endpoints (POST /events, GET /events, etc.)
- ✅ Request format (what JSON to send)
- ✅ Response format (what JSON you get back)
- ✅ Status codes (200 = success, 404 = not found, etc.)

**Simple rule:** Treat backend as a black box!

```
You send this:                      You get this:
┌─────────────┐                    ┌─────────────┐
│   JSON      │  ──── API ────>   │   JSON      │
│  Request    │     [???]          │  Response   │
└─────────────┘                    └─────────────┘

You don't need to know what happens in [???]!
```

---

## 🚀 Getting Started Path

```
1. Read QUICK_START_GUIDE.md
   └─> Start server, run tests

2. Read PARTNER_HANDOFF.md
   └─> Understand API endpoints

3. Open http://localhost:8000/docs
   └─> Try endpoints interactively

4. Create simple frontend test
   └─> Make one API call

5. Check if it works
   └─> See data in database

6. Build full integration
   └─> Connect all features
```

---

## ✅ Architecture Benefits

**Simple:**
- Student-level code
- Clear structure
- Well-commented

**Maintainable:**
- Separated layers
- Each file has one job
- Easy to find things

**Testable:**
- Test endpoints independently
- Test database operations separately
- Test script included

**Scalable:**
- Easy to add endpoints
- Easy to add tables
- Easy to add features

**Frontend-friendly:**
- Clear API contract
- Standard JSON format
- Good error messages

---

## 📋 Architecture Checklist

Understanding check - you should be able to answer:

- [ ] What port does the server run on? (8000)
- [ ] What are the 5 main endpoints?
- [ ] What data does an Event have?
- [ ] Where is data actually stored? (peers.db)
- [ ] What's the difference between models.py and crud.py?
- [ ] How do you test the backend? (test_database.py)
- [ ] What format does the API use? (JSON)

If you can answer these, you understand the architecture! ✅

---

**Next:** Read PARTNER_HANDOFF.md for detailed integration guide!

