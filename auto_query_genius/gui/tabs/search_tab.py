"""
Auto Query Genius - Search Tab

This module provides the candidate search tab for the GUI.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import webbrowser
import datetime
import urllib.parse
from auto_query_genius.gui.utils import open_query_in_job_board

def create_search_tab(notebook, app):
    """Create a tab for candidate search functionality."""
    search_tab = ttk.Frame(notebook)
    notebook.add(search_tab, text="Candidate Search")
    
    # Create component instance
    component = SearchTab(search_tab, app)
    
    return component

class SearchTab:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        
        # Create query input section
        self._create_query_section()
        
        # Create search history section
        self._create_history_section()
    
    def _create_query_section(self):
        """Create the query input section of the tab."""
        query_frame = ttk.LabelFrame(self.parent, text="Search Query")
        query_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(query_frame, text="Boolean Search Query:").pack(anchor=tk.W, padx=5, pady=2)
        self.search_query_text = scrolledtext.ScrolledText(query_frame, wrap=tk.WORD, height=5)
        self.search_query_text.pack(fill=tk.X, padx=5, pady=5)
        
        # Search provider selection
        provider_frame = ttk.Frame(query_frame)
        provider_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(provider_frame, text="Search Provider:").pack(side=tk.LEFT, padx=5)
        self.provider_var = tk.StringVar(value="google")
        providers = {"Google People": "google", "LinkedIn Profiles": "linkedin", "Indeed Resumes": "indeed", 
                     "GitHub Developers": "github", "Stack Overflow": "stackoverflow", "Twitter": "twitter"}
        provider_combobox = ttk.Combobox(provider_frame, textvariable=self.provider_var, values=list(providers.keys()))
        provider_combobox.pack(side=tk.LEFT, padx=5)
        
        # Region selection
        region_frame = ttk.Frame(query_frame)
        region_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(region_frame, text="Region:").pack(side=tk.LEFT, padx=5)
        self.region_var = tk.StringVar(value="Worldwide")
        regions = ["Worldwide", "United States", "United Kingdom", "Canada", "Europe", "Remote"]
        region_combobox = ttk.Combobox(region_frame, textvariable=self.region_var, values=regions)
        region_combobox.pack(side=tk.LEFT, padx=5)
        
        # Search button
        search_button_frame = ttk.Frame(query_frame)
        search_button_frame.pack(fill=tk.X, padx=5, pady=5)
        ttk.Button(search_button_frame, text="Search Candidates Online", command=self.search_jobs).pack(side=tk.LEFT, padx=5)
        ttk.Button(search_button_frame, text="Use Current Query", command=self.use_current_query).pack(side=tk.LEFT, padx=5)
        ttk.Button(search_button_frame, text="Clear Query", command=lambda: self.search_query_text.delete(1.0, tk.END)).pack(side=tk.LEFT, padx=5)
    
    def _create_history_section(self):
        """Create the search history section of the tab."""
        history_frame = ttk.LabelFrame(self.parent, text="Search History")
        history_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        self.history_list = tk.Listbox(history_frame, height=10)
        self.history_list.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.history_list.bind("<Double-1>", self.load_history_item)
        
        # History buttons
        button_frame = ttk.Frame(history_frame)
        button_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(button_frame, text="Load Selected", command=self.load_selected_history).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear History", command=self.clear_history).pack(side=tk.RIGHT, padx=5)
    
    def search_jobs(self):
        """Open a web browser with the search query for candidates."""
        query = self.search_query_text.get(1.0, tk.END).strip()
        
        if not query:
            messagebox.showwarning("Warning", "Please enter a search query.")
            return
        
        provider = self.provider_var.get()
        region = self.region_var.get().lower().replace(" ", "")
        
        # Use the utility function to open the query in a profile search
        open_query_in_job_board(query, provider)
        
        # Add to search history
        self.add_to_history(query)
    
    def use_current_query(self):
        """Use the currently generated query for search."""
        # Check if process tab is properly initialized
        if not hasattr(self.app, 'tabs') or 'process' not in self.app.tabs:
            messagebox.showwarning("Warning", "Process tab not properly initialized.")
            return
            
        # Check if the process tab has the query_text attribute
        if not hasattr(self.app.tabs['process'].output_section, 'query_text'):
            messagebox.showwarning("Warning", "Process tab not properly initialized.")
            return
            
        query = self.app.tabs['process'].output_section.query_text.get(1.0, tk.END).strip()
        
        if not query:
            messagebox.showwarning("Warning", "No query has been generated yet.")
            return
        
        # Set the query in the search tab
        self.search_query_text.delete(1.0, tk.END)
        self.search_query_text.insert(tk.END, query)
    
    def load_history_item(self, event):
        """Load a history item when double-clicked."""
        selected_index = self.history_list.curselection()
        if not selected_index:
            return
        
        # Get the corresponding history item
        history_index = selected_index[0]
        if history_index < len(self.app.search_history):
            history_item = self.app.search_history[history_index]
            
            # Set the query text
            self.search_query_text.delete(1.0, tk.END)
            self.search_query_text.insert(tk.END, history_item["query"])
    
    def load_selected_history(self):
        """Load a selected history item."""
        selected_index = self.history_list.curselection()
        if not selected_index:
            messagebox.showinfo("Information", "Please select a history item first.")
            return
        
        # Get the corresponding history item
        history_index = selected_index[0]
        if history_index < len(self.app.search_history):
            history_item = self.app.search_history[history_index]
            
            # Set the query text
            self.search_query_text.delete(1.0, tk.END)
            self.search_query_text.insert(tk.END, history_item["query"])
    
    def clear_history(self):
        """Clear the search history."""
        if messagebox.askyesno("Confirm", "Are you sure you want to clear the search history?"):
            self.app.search_history = []
            self.history_list.delete(0, tk.END)

    def add_to_history(self, query):
        """Add a query to the search history."""
        if not query or not query.strip():
            return
        
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        history_item = f"{timestamp}: {query[:50]}{'...' if len(query) > 50 else ''}"
        
        # Add to internal history list
        self.app.search_history.insert(0, {"timestamp": timestamp, "query": query})
        
        # Update UI
        self.history_list.insert(0, history_item)

def add_to_search_history(query, history_list, list_widget):
    """Add a query to the search history."""
    if not query or not query.strip():
        return
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    history_item = f"{timestamp}: {query[:50]}{'...' if len(query) > 50 else ''}"
    
    # Add to internal history list
    history_list.insert(0, {"timestamp": timestamp, "query": query})
    
    # Update UI
    list_widget.insert(0, history_item)
