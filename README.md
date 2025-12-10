# Getting Started

This project runs on both **macOS** and **Windows**.

## Prerequisites

- Install **Node.js**: https://nodejs.org/en/download
- Install **Python 3.10+**: https://www.python.org/downloads/

-----

## Setup

### Frontend setup

In a terminal, navigate to the `frontend` folder and run:

```bash
npm install
```

### Backend setup

Navigate to the `backend/fast_api_approach` folder:

**1. Create a virtual environment:**

```bash
# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (CMD)
python -m venv venv
venv\Scripts\activate.bat
```

**2. Install dependencies:**

```bash
pip install -r requirements.txt
```

**3. Set the Gemini API key:**

```bash
# Mac/Linux
export GEMINI_API_KEY="your-api-key-here"

# Windows (PowerShell)
$env:GEMINI_API_KEY="your-api-key-here"

# Windows (CMD)
set GEMINI_API_KEY=your-api-key-here
```

-----

## Starting the Server

### Frontend

In the `frontend` folder:

```bash
npm run dev
```

### Backend

In the `backend/fast_api_approach` folder (with venv activated):

```bash
uvicorn src.main:app --reload
```

The backend will run on http://127.0.0.1:8000

To open the Vite development server in the browser, press `o` and then Enter in the terminal running `npm run dev`.

**Note:** If an error appears in the browser, check the terminal running the backend server. Missing **Python** libraries are the most common cause.

-----

## API Endpoints

### Participant Import (CSV/Excel)

Import participants from a CSV or Excel file:

```
POST /events/{event_id}/participants/import
```

**Example using curl:**

```bash
curl -X POST "http://127.0.0.1:8000/events/1/participants/import" \
     -F "file=@participants.csv"
```

**Expected CSV/Excel format:**
- Headers (case-insensitive): `name`, `email`, `phone` (optional)
- Example:
  ```
  name,email,phone
  John Doe,john@example.com,+1234567890
  Jane Smith,jane@example.com,
  ```

**Response:**
```json
{
  "event_id": 1,
  "total_rows": 2,
  "created": 2,
  "skipped": 0,
  "errors": []
}
```

-----

## Stopping the Server

Press `Ctrl + C` in both terminals to stop the frontend and backend servers.

-----

# To-Do

## XL

  - [ ] Create dashboard
  - [ ] Standardize frontend formatting with shared css styles

## L

  - [ ] AI assistant on manual setup
  - [ ] Edit button in summary list on AI setup page
  - [ ] Ability to change scoring type in SetupAI and SetupManual (and dashboard)
  - [ ] Adjust scoring weights in setup based on selected scoring type

## M

  - [ ] Sponsor image upload for public card showcase and event image (also in `SetupMethod.tsx` and `SetupSummary`)
  - [x] Clean up event summary
  - [x] Information pop-ups on SetupTemplates

## S

  - [x] Optional field for audience members allowed
  - [x] Scoring type display on Method page
  - [x] Change Date and Time to a range with automatic access cut-off
  - [ ] Decide later button logic separated from continue button
  - [ ] Remove backend/requirements.txt

<!-- end list -->
