
"""
Auto Query Genius - Menu Module

This module provides the menu for the Auto Query Genius application.
"""

import tkinter as tk
import webbrowser
from auto_query_genius.gui.utils import open_web_version, open_documentation

def create_application_menu(app):
    """Create the application menu.
    
    Args:
        app: The main application instance
    """
    menubar = tk.Menu(app.root)
    
    # File menu
    file_menu = tk.Menu(menubar, tearoff=0)
    file_menu.add_command(label="New", command=app.clear_all, accelerator="Ctrl+N")
    # Fix potential issue with process tab access
    file_menu.add_command(label="Open Job Description", 
                          command=lambda: app.tabs['process'].input_section.load_from_file(), 
                          accelerator="Ctrl+O")
    file_menu.add_command(label="Save Results", 
                          command=lambda: app.tabs['process'].output_section.save_results(), 
                          accelerator="Ctrl+S")
    file_menu.add_separator()
    file_menu.add_command(label="Exit", command=app.on_close, accelerator="Alt+F4")
    menubar.add_cascade(label="File", menu=file_menu)
    
    # Edit menu
    edit_menu = tk.Menu(menubar, tearoff=0)
    edit_menu.add_command(label="Copy", command=app.copy_selected_text, accelerator="Ctrl+C")
    edit_menu.add_command(label="Paste", command=app.paste_text, accelerator="Ctrl+V")
    edit_menu.add_separator()
    edit_menu.add_command(label="Process Job Description", 
                          command=lambda: app.tabs['process'].on_process(), 
                          accelerator="Ctrl+P")
    menubar.add_cascade(label="Edit", menu=edit_menu)
    
    # Tools menu
    tools_menu = tk.Menu(menubar, tearoff=0)
    tools_menu.add_command(label="Run Evaluation", command=lambda: app.notebook.select(1))
    tools_menu.add_command(label="Search Candidates", command=lambda: app.notebook.select(2))
    tools_menu.add_separator()
    tools_menu.add_command(label="Visit Web Version", command=open_web_version)
    menubar.add_cascade(label="Tools", menu=tools_menu)
    
    # Help menu
    help_menu = tk.Menu(menubar, tearoff=0)
    help_menu.add_command(label="About", command=lambda: app.notebook.select(3))
    help_menu.add_command(label="Documentation", command=open_documentation)
    help_menu.add_command(label="Report Issue", command=lambda: webbrowser.open("https://github.com/yourusername/auto-query-genius-python/issues"))
    menubar.add_cascade(label="Help", menu=help_menu)
    
    app.root.config(menu=menubar)
