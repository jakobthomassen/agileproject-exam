# Getting Started

This project runs on both **macOS** and **Windows**.

## Prerequisites

- Install **Node.js**: https://nodejs.org/en/download
- Install **Python 3.10+**: https://www.python.org/downloads/

To verify run: 
``` bash
node -v
npm -v
python3 --version
```

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

### Easy setup for macOS

In the `agileproject-exam` folder:
```bash
./start.sh
```
Click the provided link in the terminal to open 

If this does not work proceed to the manual steps below

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

To open the Vite development server in the browser, press `o` and then `Enter` in the terminal running `npm run dev`.

**Note:** If an error appears in the browser, check the terminal running the backend server.
Missing **Python** libraries are the most common cause.

-----

## Stopping the Server

### Started from `./start.sh`
Press `Ctrl + C` once to shut down application and server, and again to quit `start.sh` program

### Started manually
Press `Ctrl + C` in both terminals to stop the frontend and backend servers separately.

-----




