
"""
Auto Query Genius - GUI Utilities

This module provides utility functions for the GUI.
"""

from .file_utils import load_text_from_file, save_text_to_file, save_json_to_file
from .web_utils import open_web_version, open_documentation, open_url, open_query_in_job_board
from .ui_utils import create_scrolled_text, center_window, set_icon

__all__ = [
    'load_text_from_file',
    'save_text_to_file',
    'save_json_to_file',
    'open_web_version',
    'open_documentation',
    'open_url',
    'open_query_in_job_board',
    'create_scrolled_text',
    'center_window',
    'set_icon'
]
