# src/utils/import_participants.py
# Simple CSV/Excel parsing helpers for participant import
import csv
import io
from typing import List, Dict, Any

from openpyxl import load_workbook


def normalize_header(header: str) -> str:
    """
    Normalize a header name: strip whitespace and convert to lowercase.
    E.g. "  Name  " -> "name"
    """
    if header is None:
        return ""
    return str(header).strip().lower()


def parse_csv_participants(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Parse a CSV file and return a list of dicts (one per row).
    Uses the first row as headers.
    
    Args:
        file_content: Raw bytes of the CSV file
        
    Returns:
        List of dicts with normalized header keys
    """
    # Decode bytes to string (try utf-8, fallback to latin-1)
    try:
        text = file_content.decode("utf-8")
    except UnicodeDecodeError:
        text = file_content.decode("latin-1")
    
    # Use csv.DictReader to parse
    reader = csv.DictReader(io.StringIO(text))
    
    rows = []
    for row in reader:
        # Normalize all keys (headers) in each row
        normalized_row = {}
        for key, value in row.items():
            normalized_key = normalize_header(key)
            normalized_row[normalized_key] = value.strip() if value else ""
        rows.append(normalized_row)
    
    return rows


def parse_excel_participants(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Parse an Excel (XLSX) file and return a list of dicts (one per row).
    Reads the first sheet only.
    Uses the first row as headers.
    
    Args:
        file_content: Raw bytes of the Excel file
        
    Returns:
        List of dicts with normalized header keys
    """
    # Load workbook from bytes
    workbook = load_workbook(filename=io.BytesIO(file_content), read_only=True)
    
    # Get the first (active) sheet
    sheet = workbook.active
    
    rows = []
    headers = []
    
    for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
        if row_idx == 0:
            # First row = headers
            headers = [normalize_header(cell) for cell in row]
        else:
            # Data rows - build dict from headers
            row_dict = {}
            for col_idx, cell in enumerate(row):
                if col_idx < len(headers):
                    header = headers[col_idx]
                    # Convert cell to string, handle None
                    value = str(cell).strip() if cell is not None else ""
                    row_dict[header] = value
            rows.append(row_dict)
    
    workbook.close()
    return rows


def is_row_valid(row: Dict[str, Any]) -> tuple[bool, str]:
    """
    Check if a row has at least 'name' or 'email' filled in.
    
    Args:
        row: Dict with normalized keys (name, email, etc.)
        
    Returns:
        (is_valid, reason) - True if valid, otherwise False with a reason string
    """
    name = row.get("name", "").strip()
    email = row.get("email", "").strip()
    
    if not name and not email:
        return False, "Missing both name and email"
    
    return True, ""

