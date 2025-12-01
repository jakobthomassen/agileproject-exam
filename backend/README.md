# FastAPI Gemini AI

A simple FastAPI project to demonstrate how to build an API server for an AI application using Gemini.

## Setting Up

**Create a virtual environment**

```bash
python -m venv venv
source venv/bin/activate
```

**Install dependencies**

```bash
pip install -r requirements.txt
```

**Set up API Key**

Set your Gemini API key as an environment variable in your terminal. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```bash
export GEMINI_API_KEY="your_gemini_api_key"
```

For Windows users:

```batch
:: In Command Prompt
set GEMINI_API_KEY="your_gemini_api_key"

:: In PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key"
```

The application will load this key from your environment.

## How To Run

To run the application, use the following command:

```bash
uvicorn src.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Making Requests

You can send a request to the chat API without an authentication token. These requests are subject to a global rate limit.

#### Unauthenticated Request

You can send a request to the chat API without an authentication token. These requests are subject to a global rate limit.

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Why is the sky blue?"}'
```

#### Authenticated Request

For a higher rate limit, you can authenticate by providing a JWT token. Make sure to replace `YOUR_GENERATED_TOKEN` with a valid token.

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_GENERATED_TOKEN" \
     -d '{"prompt": "Why is the sky blue?"}'
```

### Generating a Test Token

The `/chat` endpoint is protected and requires a JWT token for authentication. For testing purposes, you can generate a valid token using [jwt.io](https://jwt.io/):

**Algorithm**: Change the algorithm to `HS256`.

**Payload**: Use the following payload. The `sub` field will be used as the user identifier for rate limiting.

```json
{
  "sub": "testuser",
  "name": "John Doe",
  "iat": 1516239022
}
```

**Signature**: In the "Verify Signature" section, use the secret key `a-string-secret-at-least-256-bits-long`. This is the same secret key that is hardcoded in `src/auth/dependencies.py`.

You can now use the generated token to make authenticated requests.

### Via FastAPI Docs

You can also use the auto-generated FastAPI documentation to interact with the API.

Once the server is running, go to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

## Configuration

You can configure the system prompt by editing the `src/prompts/system_prompt.md` file.

### Rate Limiting

The API implements rate limiting to prevent abuse. You can modify these limits by changing the constants in `src/auth/throttling.py`:

```python
GLOBAL_RATE_LIMIT = 3
GLOBAL_TIME_WINDOW_SECONDS = 60
```

## Architecture

The project is structured to be modular, allowing for different AI platforms to be used.

- `src/main.py`: The main FastAPI application file.
- `src/ai/base.py`: Defines the `AIPlatform` interface.
- `src/ai/gemini.py`: The implementation of the `AIPlatform` interface for Gemini.
- `src/prompts/system_prompt.md`: The system prompt for the AI.
- `src/auth/dependencies.py`: Handles JWT decoding and user identification.
- `src/auth/throttling.py`: Provides a simple in-memory rate limiter with different limits for authenticated and unauthenticated users.

To use a different AI, you would create a new class that inherits from `AIPlatform` and implement the `chat` method. Then, you would update `src/main.py` to use your new AI class.
