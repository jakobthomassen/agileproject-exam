# Getting Started

## Prerequisites

Install **Node.js**
https://nodejs.org/en/download

### Frontend setup

In a terminal, navigate to the `frontend` folder and run:
```bash
npm install
````

### Backend setup

Navigate to the project root and run:

```bash
pip install -r requirements.txt
```

-----

## Starting the Server

### Frontend

In the `frontend` folder:

```bash
npm run dev
```

### Backend

In the backend folder:

```bash
uvicorn app.main:app --reload
```

To open the Vite development server in the browser, press `o` and then Enter in the terminal running `npm run dev`.

**Note:** If an error appears in the browser, check the terminal running the backend server. Missing **Python** libraries are the most common cause. If you want to demonstrate file upload, you may create an empty `.txt` file. The content does not matter because no data is processed.

-----

## Stopping the Server

Press `Ctrl + C` in both terminals to stop the frontend and backend servers.

-----

# To-Do

## XL

  - [ ] Create dashboard

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
