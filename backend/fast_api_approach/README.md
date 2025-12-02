# Peers Event Creation Backend

A simple FastAPI backend for the Peers event creation system. This is a proof-of-concept with student-level code that's easy to understand and maintain.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment
Create a `.env` file or set environment variable:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

Or on Windows:
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

### 3. Run the Server
```bash
cd backend/fast_api_approach
uvicorn src.main:app --reload
```

The server will start at `http://localhost:8000`

### 4. Test the Database
```bash
python test_database.py
```

### 5. View API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

### ✅ Completed
- **Database Setup**: SQLite with SQLAlchemy
- **Event Model**: Store event information
- **CRUD Operations**:
  - ✅ Create events
  - ✅ Read events (all, by ID, by customer)
- **AI Integration**: Gemini AI for event creation assistance
- **Simulation Endpoint**: Test AI responses without actual AI calls
- **Rate Limiting**: Basic throttling for API endpoints
- **Authentication**: User identification system

### 📋 Future Enhancements
- Update and Delete operations
- Additional tables (categories, participants, judges)
- Better error handling
- Data validation improvements
- Full user authentication

## Project Structure

```
backend/fast_api_approach/
├── src/
│   ├── db/                    # Database layer
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models.py          # Database models
│   │   ├── crud.py            # Create/Read operations
│   │   └── __init__.py        # Module exports
│   ├── DTOs/                  # Data Transfer Objects
│   │   └── eventstate.py      # Pydantic models
│   ├── ai/                    # AI integration
│   │   ├── gemini.py          # Gemini AI client
│   │   └── base.py            # Base AI interface
│   ├── auth/                  # Authentication
│   │   ├── dependencies.py    # Auth dependencies
│   │   └── throttling.py      # Rate limiting
│   ├── agent/                 # AI agent tools
│   │   ├── tools.py           # Agent tools
│   │   └── toolguide.py       # Tool documentation
│   ├── prompts/               # AI prompts
│   │   └── system_prompt.md   # System instructions
│   └── main.py                # FastAPI application
├── peers.db                   # SQLite database (created on first run)
├── requirements.txt           # Python dependencies
├── test_database.py           # Simple test script
├── DATABASE_GUIDE.md          # Detailed database documentation
└── README.md                  # This file
```

## API Endpoints

### Chat Endpoint
- `POST /chat` - Interact with AI agent

### Event Endpoints
- `POST /events` - Create a new event
- `GET /events` - Get all events
- `GET /events/{event_id}` - Get specific event
- `GET /events/customer/{customer_id}` - Get events by customer

### Testing Endpoints
- `POST /simulate-ai-response` - Simulate AI processing (for testing)
- `GET /` - Health check

## Database

**Technology**: SQLite + SQLAlchemy
**File**: `peers.db` (created automatically)

### Event Table Schema
```python
{
  "id": int,              # Auto-generated
  "customer_id": str,     # User who created the event
  "title": str,           # Event name
  "description": str,     # Event details
  "date": str,            # Event date
  "location": str,        # Event location
  "status": str           # pending/confirmed/cancelled/success
}
```

## Code Philosophy

This codebase follows these principles:
1. **Simple**: Student-level code, easy to read and understand
2. **Well-commented**: Clear explanations in the code
3. **Modular**: Separated concerns (DB, AI, API, Auth)
4. **Frontend-ready**: Easy to integrate with frontend
5. **Testable**: Includes test script and simulation endpoint

## Frontend Integration

To connect with the frontend:

1. **Base URL**: Use `http://localhost:8000` as the API base URL
2. **CORS**: Add CORS middleware if frontend is on different port
3. **Endpoints**: Use the documented endpoints above
4. **Error Handling**: All endpoints return standard HTTP status codes

Example frontend code:
```javascript
// Create an event
const response = await fetch('http://localhost:8000/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_id: 'user123',
    title: 'My Event',
    description: 'Event description',
    date: '2024-12-25',
    location: 'Event location'
  })
});
const event = await response.json();
```

## Development Tips

### Reset Database
```bash
rm peers.db
# Then restart the server - it will create a fresh database
```

### View Database
Use "DB Browser for SQLite" or similar tool to inspect `peers.db`

### Debug Mode
The `--reload` flag automatically restarts the server when you change code

### Environment Variables
- `GEMINI_API_KEY`: Required for AI functionality

## Documentation

- **DATABASE_GUIDE.md**: Comprehensive database documentation
- **Code Comments**: All files have detailed comments
- **API Docs**: Available at `/docs` when server is running

## Testing

### Automated Tests
```bash
python test_database.py
```

### Manual Testing
Use the Swagger UI at http://localhost:8000/docs

### Example curl Commands
See DATABASE_GUIDE.md for curl examples

## Troubleshooting

**Server won't start**:
- Check if GEMINI_API_KEY is set
- Check if port 8000 is available

**Database errors**:
- Delete peers.db and restart
- Check file permissions

**Import errors**:
- Make sure you're in the correct directory
- Run from `backend/fast_api_approach/`

**AI not working**:
- Verify GEMINI_API_KEY is correct
- Check internet connection

## Contact

This is a proof-of-concept for academic purposes. The code is intentionally simple and well-documented for learning.

