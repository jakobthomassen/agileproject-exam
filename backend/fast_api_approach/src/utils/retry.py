"""
Retry function with exponential backoff.

To handle temporary Gemini API failures/overload.
"""
import time
import random


def retry_api_call(api_function, max_attempts: int = 5):
    """
    Retries an API call with exponential backoff.
    
    Args:
        api_function: The function to call (no arguments).
                      Use lambda if you need to pass arguments.
        max_attempts: Maximum number of retry attempts (default: 5)
    
    Returns:
        The result of the successful API call
        
    Raises:
        The last exception if all attempts fail
    
    Example usage:
        result = retry_api_call(
            lambda: client.models.generate_content(model="...", contents=[...]),
            max_attempts=5
        )
    """
    last_exception = None
    
    for attempt in range(max_attempts):
        try:
            return api_function()
        except Exception as e:
            last_exception = e
            
            if attempt == max_attempts - 1:
                break
            
            # 2^N + random jitter (0-1s) for exponential backoff
            delay = (2 ** attempt) + random.uniform(0, 1)
            print(f"Attempt {attempt + 1} failed, retrying in {delay:.1f} seconds...")
            print(f"  Error: {str(e)[:100]}")
            time.sleep(delay)
    
    print(f"All {max_attempts} attempts failed!")
    raise last_exception

