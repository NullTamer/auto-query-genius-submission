"""
Auto Query Genius - Main Application Class

This module provides the main application class for Auto Query Genius.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import webbrowser
from typing import Dict, List, Any, Optional

from auto_query_genius.query_generator import QueryGenerator
from auto_query_genius.gui.menu import create_application_menu
from auto_query_genius.gui.utils import center_window, set_icon

class AutoQueryGeniusGUI:
    """Main GUI application for Auto Query Genius."""
    
    def __init__(self, root):
        """Initialize the GUI application."""
        self.root = root
        self.root.title("Auto Query Genius")
        self.root.geometry("900x700")
        self.root.minsize(600, 500)
        
        # Set icon and center window
        set_icon(self.root)
        center_window(self.root, 900, 700)
        
        # Set theme and styles
        self.set_styles()
        
        # Initialize the query generator
        try:
            self.query_generator = QueryGenerator()
        except Exception as e:
            messagebox.showerror("Initialization Error", 
                                f"Error initializing the query generator: {str(e)}\n\n"
                                "Make sure you have installed the required dependencies and "
                                "downloaded the spaCy model with:\n"
                                "python -m spacy download en_core_web_sm")
            self.root.destroy()
            return
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # References to tab components
        self.tabs = {}
        
        # Initialize tabs - importing here to avoid circular imports
        from auto_query_genius.gui.tabs.process_tab import create_process_tab
        from auto_query_genius.gui.tabs.search_tab import create_search_tab
        from auto_query_genius.gui.tabs.evaluation_tab import create_evaluation_tab
        from auto_query_genius.gui.tabs.about_tab import create_about_tab
        
        # Create the main processing tab
        self.tabs['process'] = create_process_tab(self.notebook, self)
        
        # Create the search tab (moved to be second)
        self.tabs['search'] = create_search_tab(self.notebook, self)
        
        # Create the evaluation tab (moved to be third)
        self.tabs['evaluation'] = create_evaluation_tab(self.notebook, self)
        
        # Create the about tab
        create_about_tab(self.notebook)
        
        # Search history
        self.search_history = []
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        self.status_bar = ttk.Label(root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Add menu
        create_application_menu(self)
        
        # Add keyboard shortcuts
        self.bind_shortcuts()
        
        # Set up window close handler
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def set_styles(self):
        """Set theme and styles for the application."""
        style = ttk.Style()
        
        # Try to use a modern theme if available
        try:
            # Try different themes based on platform
            import platform
            system = platform.system()
            
            if system == "Windows":
                style.theme_use("vista")
            elif system == "Darwin":  # macOS
                style.theme_use("aqua")
            else:  # Linux and others
                style.theme_use("clam")
                
        except tk.TclError:
            try:
                style.theme_use("clam")  # More modern look on most platforms
            except tk.TclError:
                pass  # Use default if not available
        
        # Configure styles
        style.configure("TButton", padding=6, relief="flat", background="#4a69bd")
        style.configure("TNotebook", background="#f5f6fa")
        style.configure("TNotebook.Tab", padding=[12, 4], font=('Arial', 9))
        style.configure("TFrame", background="#f5f6fa")
        style.configure("TLabel", background="#f5f6fa", font=('Arial', 9))
        style.configure("TLabelframe", background="#f5f6fa")
        style.configure("TLabelframe.Label", font=('Arial', 9, 'bold'))
        style.map("TButton",
                 foreground=[('pressed', 'white'), ('active', 'white')],
                 background=[('pressed', '#1e3799'), ('active', '#546de5')])
    
    def bind_shortcuts(self):
        """Bind keyboard shortcuts."""
        self.root.bind("<Control-n>", lambda e: self.clear_all())
        self.root.bind("<Control-o>", lambda e: self.tabs['process'].input_section.load_from_file())
        self.root.bind("<Control-s>", lambda e: self.tabs['process'].output_section.save_results())
        self.root.bind("<Control-p>", lambda e: self.tabs['process'].on_process())
    
    def copy_selected_text(self):
        """Copy selected text from the current widget."""
        try:
            self.root.clipboard_clear()
            widget = self.root.focus_get()
            if hasattr(widget, "selection_get"):
                selected_text = widget.selection_get()
                self.root.clipboard_append(selected_text)
        except tk.TclError:
            pass  # No selection
    
    def paste_text(self):
        """Paste text into the current widget."""
        try:
            widget = self.root.focus_get()
            if hasattr(widget, "insert") and hasattr(widget, "index"):
                text = self.root.clipboard_get()
                widget.insert(widget.index(tk.INSERT), text)
        except tk.TclError:
            pass  # Nothing to paste
    
    def clear_all(self):
        """Clear all input fields and results."""
        self.tabs['process'].clear_all()
        self.status_var.set("Ready")
    
    def process_job_description(self, job_description, on_complete=None):
        """Process the job description and extract keywords."""
        if not job_description:
            messagebox.showwarning("Warning", "Please enter a job description.")
            return
        
        # Set status
        self.status_var.set("Processing job description...")
        
        # Process in a separate thread to keep UI responsive
        def process_thread():
            try:
                keywords, query = self.query_generator.process_job_description(job_description)
                
                # Add to search history
                from auto_query_genius.gui.tabs.search_tab import add_to_search_history
                try:
                    add_to_search_history(query, self.search_history, self.tabs['search'].history_list)
                except Exception as e:
                    # Gracefully handle any error with search history
                    print(f"Warning: Could not add to search history: {e}")
                
                self.status_var.set("Processing complete")
                
                # Call the completion callback if provided
                if on_complete:
                    self.root.after(0, lambda: on_complete(keywords, query))
                    
            except Exception as e:
                messagebox.showerror("Error", f"Failed to process job description: {str(e)}")
                self.status_var.set("Processing failed")
        
        # Start processing thread
        threading.Thread(target=process_thread, daemon=True).start()
    
    def on_close(self):
        """Handle window close event."""
        if messagebox.askyesno("Confirm Exit", "Are you sure you want to exit?"):
            self.root.destroy()
