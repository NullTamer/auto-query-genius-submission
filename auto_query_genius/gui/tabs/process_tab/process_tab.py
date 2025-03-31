
"""
Auto Query Genius - Process Tab

This module provides the main process tab for the GUI.
"""

import tkinter as tk
from tkinter import ttk

from auto_query_genius.gui.tabs.process_tab.input_section import InputSection
from auto_query_genius.gui.tabs.process_tab.output_section import OutputSection
from auto_query_genius.gui.tabs.process_tab.keyword_categorizer import categorize_keywords

def create_process_tab(notebook, app):
    """Create the tab for processing job descriptions."""
    process_tab = ttk.Frame(notebook)
    notebook.add(process_tab, text="Process Job Description")
    
    # Create the component instance
    component = ProcessTab(process_tab, app)
    
    return component

class ProcessTab:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        
        # Create the input frame
        self.input_section = InputSection(parent, app, self.on_process)
        
        # Create the output frame
        self.output_section = OutputSection(parent, app)
    
    def on_process(self):
        """Process the job description from the input section."""
        job_description = self.input_section.get_job_description()
        self.app.process_job_description(job_description, self.display_results)
    
    def display_results(self, keywords, query):
        """Display the processing results in the UI."""
        # Process the keywords to add category information from NER
        categorized_keywords = categorize_keywords(keywords)
        self.output_section.display_results(categorized_keywords, query)
    
    def clear_all(self):
        """Clear all input fields and results."""
        self.input_section.clear()
        self.output_section.clear()
