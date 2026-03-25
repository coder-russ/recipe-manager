"""Shared utilities."""

import re


def parse_cook_time_minutes(time_str: str | None) -> int | None:
    """
    Parse a human-readable cook time string to total minutes.

    Handles formats like:
    - "45 minutes", "45 min", "45m"
    - "1 hour", "1 hr", "1h"
    - "1 hour 30 minutes", "1h 30m"
    - "90 minutes"
    - "2 hours"

    Returns None if unparseable.
    """
    if not time_str:
        return None

    time_str = time_str.strip().lower()
    total = 0
    found = False

    # Match hours
    h_match = re.search(r'(\d+)\s*(?:hours?|hrs?|h)', time_str)
    if h_match:
        total += int(h_match.group(1)) * 60
        found = True

    # Match minutes
    m_match = re.search(r'(\d+)\s*(?:minutes?|mins?|m(?!\w))', time_str)
    if m_match:
        total += int(m_match.group(1))
        found = True

    # If just a bare number, treat as minutes
    if not found:
        bare_match = re.match(r'^(\d+)$', time_str)
        if bare_match:
            return int(bare_match.group(1))

    return total if found else None
