
#!/usr/bin/env python3
"""
Auto Query Genius - Main GUI Application

This module provides the main GUI application for Auto Query Genius.
"""

import tkinter as tk
import sys
from auto_query_genius.gui.app import AutoQueryGeniusGUI

def launch_gui():
    """Launch the Auto Query Genius GUI application."""
    try:
        root = tk.Tk()
        app = AutoQueryGeniusGUI(root)
        root.mainloop()
        return 0
    except Exception as e:
        print(f"Error launching GUI: {e}")
        return 1

def main():
    """
    Main entry point function to match the console script entry point.
    Simply calls launch_gui() for compatibility.
    """
    return launch_gui()

if __name__ == "__main__":
    sys.exit(launch_gui())
