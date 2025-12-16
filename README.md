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
python3.11 -m venv venv
source venv/bin/activate


# Windows (PowerShell)
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (CMD)
py -3.11 -m venv venv
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
-----

## Stopping the Server

Press `Ctrl + C` in both terminals to stop the frontend and backend servers.

-----



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

