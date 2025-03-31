
"""
Auto Query Genius - UI Utilities

This module provides UI-related utility functions for the GUI.
"""

import os
import tkinter as tk
from tkinter import scrolledtext
import sys

def create_scrolled_text(parent, height=10, state=tk.NORMAL):
    """Create a ScrolledText widget with common settings."""
    text_widget = scrolledtext.ScrolledText(parent, wrap=tk.WORD, height=height)
    text_widget.config(state=state)
    
    # Improve readability by setting better fonts and colors
    if sys.platform == "win32":
        text_widget.config(font=("Consolas", 10))
    elif sys.platform == "darwin":
        text_widget.config(font=("Menlo", 11))
    else:
        text_widget.config(font=("DejaVu Sans Mono", 10))
    
    return text_widget

def center_window(window, width=None, height=None):
    """Center a window on the screen."""
    if width is None:
        width = window.winfo_width()
    if height is None:
        height = window.winfo_height()
    
    # Get screen width and height
    screen_width = window.winfo_screenwidth()
    screen_height = window.winfo_screenheight()
    
    # Calculate position
    x = (screen_width - width) // 2
    y = (screen_height - height) // 2
    
    # Set the position
    window.geometry(f"{width}x{height}+{x}+{y}")

def set_icon(window):
    """Set the application icon if available."""
    icon_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'assets', 'icon.ico')
    if os.path.exists(icon_path):
        try:
            window.iconbitmap(icon_path)
        except tk.TclError:
            pass  # Icon setting failed, continue without icon

def apply_theme(window, theme="dark"):
    """Apply a light or dark theme to the application."""
    if theme == "light":
        # Light theme colors
        bg_color = "#F3F4F6"
        fg_color = "#111827"
        entry_bg = "#FFFFFF"
        button_bg = "#2DD4BF"
        button_fg = "#FFFFFF"
        highlight_color = "#0F766E"
    else:
        # Dark theme colors (default)
        bg_color = "#1F2937"
        fg_color = "#F3F4F6"
        entry_bg = "#111927"
        button_bg = "#2DD4BF"
        button_fg = "#FFFFFF"
        highlight_color = "#2DD4BF"
    
    # Apply colors to the window and its children
    window.configure(bg=bg_color)
    
    # Configure ttk styles if needed
    style = tk.ttk.Style(window)
    style.configure("TFrame", background=bg_color)
    style.configure("TLabel", background=bg_color, foreground=fg_color)
    style.configure("TButton", background=button_bg, foreground=button_fg)
    style.configure("TEntry", background=entry_bg, foreground=fg_color)
    
    # Save theme preference in the window for later access
    window.theme = theme
    
    return style

def get_theme_from_settings():
    """Get theme preference from settings file."""
    # This is a placeholder - implementation should read from actual settings
    config_path = os.path.join(os.path.expanduser("~"), ".auto_query_genius", "settings.ini")
    if os.path.exists(config_path):
        try:
            import configparser
            config = configparser.ConfigParser()
            config.read(config_path)
            return config.get("UI", "theme", fallback="dark")
        except Exception:
            return "dark"
    return "dark"
