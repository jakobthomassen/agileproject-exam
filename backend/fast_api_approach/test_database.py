"""
Simple test script for the database endpoints
Run this after starting the server to test if everything works

Make sure the server is running first:
    uvicorn src.main:app --reload

Then run this script:
    python test_database.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a nice section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_response(response):
    """Print the response in a nice format"""
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

# Test 1: Check if server is running
print_section("Test 1: Check if server is running")
try:
    response = requests.get(f"{BASE_URL}/")
    print_response(response)
    print("✅ Server is running!")
except Exception as e:
    print(f"❌ Server is not running. Error: {e}")
    print("Please start the server first: uvicorn src.main:app --reload")
    exit(1)

# Test 2: Create a new event
print_section("Test 2: Create a new event")
event_data = {
    "customer_id": "test_user_001",
    "title": "Annual Basketball Championship",
    "description": "A competitive basketball tournament with 50 participants",
    "date": "2024-12-25",
    "location": "City Sports Arena"
}

response = requests.post(f"{BASE_URL}/events", json=event_data)
print_response(response)

if response.status_code == 200:
    event_id = response.json()["id"]
    print(f"✅ Event created successfully! Event ID: {event_id}")
else:
    print("❌ Failed to create event")
    event_id = None

# Test 3: Create another event
print_section("Test 3: Create another event")
event_data_2 = {
    "customer_id": "test_user_002",
    "title": "Dance Competition",
    "description": "Annual dance showcase",
    "date": "2024-12-30",
    "location": "City Theater"
}

response = requests.post(f"{BASE_URL}/events", json=event_data_2)
print_response(response)

if response.status_code == 200:
    event_id_2 = response.json()["id"]
    print(f"✅ Second event created successfully! Event ID: {event_id_2}")
else:
    print("❌ Failed to create second event")
    event_id_2 = None

# Test 4: Get all events
print_section("Test 4: Get all events")
response = requests.get(f"{BASE_URL}/events")
print_response(response)

if response.status_code == 200:
    events = response.json()
    print(f"✅ Retrieved {len(events)} events")
else:
    print("❌ Failed to get events")

# Test 5: Get a specific event
if event_id:
    print_section(f"Test 5: Get event with ID {event_id}")
    response = requests.get(f"{BASE_URL}/events/{event_id}")
    print_response(response)
    
    if response.status_code == 200:
        print("✅ Successfully retrieved specific event")
    else:
        print("❌ Failed to retrieve specific event")

# Test 6: Get events by customer
print_section("Test 6: Get events by customer test_user_001")
response = requests.get(f"{BASE_URL}/events/customer/test_user_001")
print_response(response)

if response.status_code == 200:
    events = response.json()
    print(f"✅ Retrieved {len(events)} events for customer test_user_001")
else:
    print("❌ Failed to get events by customer")

# Test 7: Simulate AI response
if event_id:
    print_section(f"Test 7: Simulate AI response for event {event_id}")
    ai_data = {
        "event_id": event_id,
        "ai_response": "I've processed your event! The basketball championship looks great. Would you like me to help you set up categories and scoring?"
    }
    
    response = requests.post(f"{BASE_URL}/simulate-ai-response", json=ai_data)
    print_response(response)
    
    if response.status_code == 200:
        print("✅ AI response simulated successfully")
        print(f"Event status should now be: confirmed")
    else:
        print("❌ Failed to simulate AI response")

# Test 8: Verify status change
if event_id:
    print_section(f"Test 8: Verify event status changed to 'confirmed'")
    response = requests.get(f"{BASE_URL}/events/{event_id}")
    print_response(response)
    
    if response.status_code == 200:
        status = response.json().get("status")
        if status == "confirmed":
            print(f"✅ Status correctly updated to: {status}")
        else:
            print(f"⚠️  Status is: {status} (expected: confirmed)")
    else:
        print("❌ Failed to retrieve event")

# Summary
print_section("Test Summary")
print("All tests completed!")
print("\nYou can now:")
print("1. View the API docs at: http://localhost:8000/docs")
print("2. Check the database file: peers.db")
print("3. Try the endpoints with your frontend")

