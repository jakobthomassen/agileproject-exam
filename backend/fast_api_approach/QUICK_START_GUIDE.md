# 🚀 Quick Start Guide - Backend Database

**For:** Quick Reference  
**Read this first, then:** PARTNER_HANDOFF.md for details

---

## ⚡ 30-Second Summary

We built a **simple database backend** that stores events. You can:
- Create events
- Get events
- Filter by customer
- Test AI responses

**Technology:** Python + FastAPI + SQLite  
**Database File:** `peers.db`  
**Port:** http://localhost:8000

---

## 🎯 Start Server (3 Steps)

```bash
# 1. Go to backend folder
cd backend/fast_api_approach

# 2. Activate virtual environment
venv\Scripts\Activate.ps1

# 3. Start server
uvicorn src.main:app --reload
```

**Expected:** `✅ Database initialized!` and server running on port 8000

---

## 🧪 Test It (2 Steps)

```bash
# 1. Open NEW terminal (keep server running!)

# 2. Run tests
python test_database.py
```

**Expected:** All tests pass with ✅

---

## 📡 API Endpoints (Cheat Sheet)

```
POST   /events                          → Create event
GET    /events                          → Get all events
GET    /events/{id}                     → Get one event
GET    /events/customer/{customer_id}   → Get user's events
POST   /simulate-ai-response            → Test AI (for development)
```

**API Docs:** http://localhost:8000/docs (interactive!)

---

## 💻 Frontend Integration (Copy-Paste Ready)

### 1. Create Event
```javascript
const event = await fetch('http://localhost:8000/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_id: "user123",
    title: "My Event",
    description: "Event details",
    date: "2024-12-25",
    location: "City Arena"
  })
});

const result = await event.json();
console.log('Created:', result);
```

### 2. Get All Events
```javascript
const response = await fetch('http://localhost:8000/events');
const events = await response.json();
console.log('Events:', events);
```

### 3. Get One Event
```javascript
const response = await fetch('http://localhost:8000/events/1');
const event = await response.json();
console.log('Event:', event);
```

---

## 🗃️ Database Structure

**Event Object:**
```json
{
  "id": 1,                           // Auto-generated
  "customer_id": "user123",          // Who created it
  "title": "Event Name",             // Event title
  "description": "Details...",       // Event description
  "date": "2024-12-25",             // When
  "location": "City Arena",          // Where
  "status": "pending"                // pending/confirmed/cancelled/success
}
```

---

## 🎨 Visual Flow

```
Frontend                 Backend                 Database
   │                        │                        │
   │  POST /events          │                        │
   │──────────────────────> │                        │
   │                        │  Save event            │
   │                        │──────────────────────> │
   │                        │                        │
   │                        │  <────────────────────│
   │  Response with ID      │                        │
   │<────────────────────── │                        │
   │                        │                        │
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Check you're in `backend/fast_api_approach` and venv is activated |
| Connection refused | Make sure server is running on port 8000 |
| CORS error | Add CORS middleware (see PARTNER_HANDOFF.md) |
| Database locked | Stop server, delete `peers.db`, restart |
| 404 Not Found | Event doesn't exist - check ID |

---

## 📚 Full Documentation

- **PARTNER_HANDOFF.md** ← Start here! Detailed explanation
- **DATABASE_GUIDE.md** ← Database deep dive
- **README.md** ← Project overview
- **/docs** endpoint ← Interactive API testing

---

## ✅ Integration Checklist

Before connecting frontend:

- [ ] Server starts without errors
- [ ] `python test_database.py` passes
- [ ] Can access http://localhost:8000/docs
- [ ] CORS configured if needed
- [ ] Understand the 5 endpoints
- [ ] Tested creating an event

---

## 🎯 First Integration Task

**Goal:** Create an event from your frontend

**Steps:**
1. Start backend server ✓
2. Create a form in frontend
3. On submit, POST to `/events`
4. Display the returned event
5. Check database with `GET /events`

**Success:** Event appears in database! 🎉

---

**Need help?** Read PARTNER_HANDOFF.md for detailed explanations!

