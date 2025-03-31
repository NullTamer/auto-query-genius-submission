
"""
Auto Query Genius - About Tab Module

This module provides the About tab for the GUI, displaying information about the application,
its features, and links to external resources. The About tab serves as a central
place for users to learn about the application's capabilities and access additional
documentation and resources.

The About tab includes:
- Application title and version
- Description of the application and its purpose
- List of key features
- Links to the web version and documentation
"""

import tkinter as tk
from tkinter import ttk, scrolledtext
from auto_query_genius.gui.utils import open_web_version, open_documentation

def create_about_tab(notebook):
    """
    Create an About tab with information about the application.
    
    This function creates and configures the About tab in the GUI notebook.
    It includes application information, descriptions, features list, and
    hyperlinks to external resources.
    
    Args:
        notebook (ttk.Notebook): The notebook widget to add the tab to
        
    Returns:
        ttk.Frame: The created About tab frame
        
    Note:
        The returned frame is already added to the notebook and does not need
        to be packed or placed by the caller.
    """
    about_tab = ttk.Frame(notebook)
    notebook.add(about_tab, text="About")
    
    # Application title
    title_label = ttk.Label(about_tab, text="Auto Query Genius", font=("Arial", 16, "bold"))
    title_label.pack(pady=20)
    
    # Version information
    version_label = ttk.Label(about_tab, text="Version 0.1.0")
    version_label.pack()
    
    # Description
    description_frame = ttk.LabelFrame(about_tab, text="Description")
    description_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
    
    description_text = scrolledtext.ScrolledText(description_frame, wrap=tk.WORD, height=10)
    description_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    description_text.insert(tk.END, 
        "Auto Query Genius is a tool for extracting keywords from job descriptions and "
        "generating Boolean search queries that can be used on job boards and search engines.\n\n"
        "The application uses natural language processing techniques to identify the most "
        "relevant keywords in a job description, which can help job seekers find opportunities "
        "that match their skills and experience.\n\n"
        "This desktop application complements the web version, providing offline access to "
        "the core functionality."
    )
    description_text.config(state=tk.DISABLED)
    
    # Features
    features_frame = ttk.LabelFrame(about_tab, text="Features")
    features_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
    
    features_text = scrolledtext.ScrolledText(features_frame, wrap=tk.WORD, height=8)
    features_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    features_text.insert(tk.END, 
        "- Extract keywords from job descriptions using TF-IDF\n"
        "- Generate Boolean search queries for job hunting\n"
        "- Evaluate keyword extraction performance with benchmark datasets\n"
        "- Search for jobs directly using popular job search engines\n"
        "- Save and manage search history\n"
        "- Export results in various formats\n"
    )
    features_text.config(state=tk.DISABLED)
    
    # Web version link
    link_frame = ttk.Frame(about_tab)
    link_frame.pack(fill=tk.X, padx=20, pady=10)
    ttk.Label(link_frame, text="Try the web version at:").pack(side=tk.LEFT, padx=5)
    link_label = ttk.Label(link_frame, text="auto-query-genius.web.app", foreground="blue", cursor="hand2")
    link_label.pack(side=tk.LEFT)
    link_label.bind("<Button-1>", lambda e: open_web_version())
    
    # Documentation link
    doc_frame = ttk.Frame(about_tab)
    doc_frame.pack(fill=tk.X, padx=20, pady=5)
    ttk.Label(doc_frame, text="Documentation:").pack(side=tk.LEFT, padx=5)
    doc_label = ttk.Label(doc_frame, text="GitHub Repository", foreground="blue", cursor="hand2")
    doc_label.pack(side=tk.LEFT)
    doc_label.bind("<Button-1>", lambda e: open_documentation())
    
    return about_tab
