import os
import json
from typing import List, Dict, Any
from openai import OpenAI


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY environment variable")
    return OpenAI(api_key=api_key)


async def extract_event_data(messages: List[Dict[str, str]], known_fields: Dict[str, Any]) -> dict:
    """
    The extractor sees:
    - A rolling window of chat messages
    - The current known fields from the frontend

    It returns a *full updated snapshot* of all fields.
    If a field is not mentioned by the user, it is kept as-is.
    If the user clarifies or changes a value, the snapshot updates.
    """

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    system_prompt = """
You are an event-understanding assistant. Your job is to reconstruct the current state of an event
based on the conversation and previously stored known_fields.

Your goals:
1. Understand what the user means, even if they speak casually.
2. Update values only when the user clearly provides new information or corrects earlier information.
3. Never erase information unless the user contradicts it.
4. Keep everything else exactly as it appears in known_fields.
5. Always return a COMPLETE snapshot of all fields.
6. If a user gives a short phrase in response to a "name" question, treat that as event_name.
7. If the user is just describing the event, do NOT guess a name.
8. Interpret dates, ranges, and times when possible.
9. scoring_mode rules:
   - Judges only = {"scoring_mode": "judges", "scoring_judge": 100, "scoring_audience": 0}
   - Audience only = "audience", audience 100, judge 0
   - Both = "mixed". If no percentages are given, leave both percentages null.

Creativity rule:
- You may use some variation in style internally, but your output MUST be pure JSON.

Output format (all keys included):

{
  "event_name": string or null,
  "event_type": string or null,
  "participant_count": integer or null,

  "scoring_mode": "judges" | "audience" | "mixed" | null,
  "scoring_audience": number or null,
  "scoring_judge": number or null,

  "venue": string or null,
  "start_date_time": string or null,
  "end_date_time": string or null,
  "sponsor": string or null,
  "rules": string or null,
  "audience_limit": integer or null
}
"""

    trimmed_messages = messages[-8:]

    completion = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        temperature=0.5,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": "Current known_fields:\n" + json.dumps(known_fields)},
            *trimmed_messages,
            {"role": "system", "content": "Update the snapshot based on the final user message."}
        ],
    )

    raw_json = completion.choices[0].message.content

    try:
        data = json.loads(raw_json)
    except Exception:
        data = {}

    # Ensure all fields exist
    defaults = {
        "event_name": None,
        "event_type": None,
        "participant_count": None,
        "scoring_mode": None,
        "scoring_audience": None,
        "scoring_judge": None,
        "venue": None,
        "start_date_time": None,
        "end_date_time": None,
        "sponsor": None,
        "rules": None,
        "audience_limit": None
    }

    full = {}
    for key, default in defaults.items():
        if key in data and data[key] is not None:
            full[key] = data[key]
        else:
            full[key] = known_fields.get(key, default)

    return full
