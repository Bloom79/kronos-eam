"""
Utility functions for the application.
Provides common functionality used across modules.
"""

import re
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import json
import logging

logger = logging.getLogger(__name__)


def generate_unique_id(prefix: str = "") -> str:
    """Generate a unique identifier.
    
    Args:
        prefix: Optional prefix for the ID
        
    Returns:
        Unique identifier string
    """
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    random_part = secrets.token_hex(4)
    
    if prefix:
        return f"{prefix}_{timestamp}_{random_part}"
    return f"{timestamp}_{random_part}"


def snake_to_camel(snake_str: str) -> str:
    """Convert snake_case to camelCase.
    
    Args:
        snake_str: String in snake_case format
        
    Returns:
        String in camelCase format
    """
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def camel_to_snake(camel_str: str) -> str:
    """Convert camelCase to snake_case.
    
    Args:
        camel_str: String in camelCase format
        
    Returns:
        String in snake_case format
    """
    snake_str = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', snake_str).lower()


def sanitize_filename(filename: str) -> str:
    """Sanitize a filename to be safe for filesystem storage.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path separators and null bytes
    filename = filename.replace('/', '').replace('\\', '').replace('\0', '')
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    # Remove any character that isn't alphanumeric, underscore, hyphen, or dot
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    # Ensure it doesn't start with a dot (hidden file)
    if filename.startswith('.'):
        filename = '_' + filename[1:]
    
    # Limit length
    max_length = 255
    if len(filename) > max_length:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        if ext:
            name = name[:max_length - len(ext) - 1]
            filename = f"{name}.{ext}"
        else:
            filename = filename[:max_length]
    
    return filename or 'unnamed'


def calculate_file_hash(file_path: Union[str, Path], algorithm: str = "sha256") -> str:
    """Calculate hash of a file.
    
    Args:
        file_path: Path to the file
        algorithm: Hash algorithm to use (sha256, md5, etc.)
        
    Returns:
        Hex digest of the file hash
    """
    hash_func = getattr(hashlib, algorithm)()
    file_path = Path(file_path)
    
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_func.update(chunk)
    
    return hash_func.hexdigest()


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def parse_duration(duration_str: str) -> timedelta:
    """Parse duration string to timedelta.
    
    Args:
        duration_str: Duration string (e.g., "2d", "3h", "45m", "30s")
        
    Returns:
        timedelta object
        
    Raises:
        ValueError: If duration string is invalid
    """
    pattern = re.compile(r'(\d+)([dhms])')
    matches = pattern.findall(duration_str.lower())
    
    if not matches:
        raise ValueError(f"Invalid duration format: {duration_str}")
    
    duration = timedelta()
    for value, unit in matches:
        value = int(value)
        if unit == 'd':
            duration += timedelta(days=value)
        elif unit == 'h':
            duration += timedelta(hours=value)
        elif unit == 'm':
            duration += timedelta(minutes=value)
        elif unit == 's':
            duration += timedelta(seconds=value)
    
    return duration


def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely parse JSON string.
    
    Args:
        json_str: JSON string to parse
        default: Default value if parsing fails
        
    Returns:
        Parsed JSON or default value
    """
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError) as e:
        logger.warning(f"Failed to parse JSON: {e}")
        return default


def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate string to maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated string
    """
    if len(text) <= max_length:
        return text
    
    if max_length <= len(suffix):
        return text[:max_length]
    
    return text[:max_length - len(suffix)] + suffix


def deep_merge(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge two dictionaries.
    
    Args:
        dict1: Base dictionary
        dict2: Dictionary to merge into dict1
        
    Returns:
        Merged dictionary
    """
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    
    return result


def validate_email(email: str) -> bool:
    """Validate email address format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    pattern = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    return bool(pattern.match(email))


def validate_italian_fiscal_code(fiscal_code: str) -> bool:
    """Validate Italian fiscal code (codice fiscale).
    
    Args:
        fiscal_code: Fiscal code to validate
        
    Returns:
        True if valid format, False otherwise
    """
    # Basic format validation
    pattern = re.compile(r'^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$')
    return bool(pattern.match(fiscal_code.upper()))


def validate_italian_vat(vat_number: str) -> bool:
    """Validate Italian VAT number (partita IVA).
    
    Args:
        vat_number: VAT number to validate
        
    Returns:
        True if valid format, False otherwise
    """
    # Remove any spaces or dashes
    vat_number = re.sub(r'[\s-]', '', vat_number)
    
    # Check if it's 11 digits
    if not re.match(r'^\d{11}$', vat_number):
        return False
    
    # Luhn algorithm for Italian VAT
    total = 0
    for i, digit in enumerate(vat_number[:-1]):
        value = int(digit)
        if i % 2 == 0:
            value *= 1
        else:
            value *= 2
            if value > 9:
                value = value // 10 + value % 10
        total += value
    
    check_digit = (10 - (total % 10)) % 10
    return check_digit == int(vat_number[-1])


def format_italian_phone(phone: str) -> Optional[str]:
    """Format Italian phone number.
    
    Args:
        phone: Phone number to format
        
    Returns:
        Formatted phone number or None if invalid
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Handle Italian numbers
    if digits.startswith('39'):
        digits = digits[2:]
    elif digits.startswith('0039'):
        digits = digits[4:]
    
    # Validate length (Italian numbers are typically 9-10 digits)
    if len(digits) < 9 or len(digits) > 10:
        return None
    
    # Format based on type
    if digits.startswith('3'):  # Mobile
        return f"+39 {digits[:3]} {digits[3:6]} {digits[6:]}"
    else:  # Landline
        if len(digits) == 9:
            return f"+39 {digits[:2]} {digits[2:6]} {digits[6:]}"
        else:
            return f"+39 {digits[:3]} {digits[3:7]} {digits[7:]}"


def calculate_deadline_color(deadline: datetime) -> str:
    """Calculate color code based on deadline proximity.
    
    Args:
        deadline: Deadline datetime
        
    Returns:
        Color code (red, yellow, green)
    """
    if not deadline:
        return "gray"
    
    days_until = (deadline - datetime.utcnow()).days
    
    if days_until < 0:
        return "red"  # Overdue
    elif days_until <= 7:
        return "red"  # Critical
    elif days_until <= 30:
        return "yellow"  # Warning
    else:
        return "green"  # OK