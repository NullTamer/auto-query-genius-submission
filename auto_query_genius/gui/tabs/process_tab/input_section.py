
"""
Auto Query Genius - Process Tab Input Section

This module provides the input section component for the process tab.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import os
import json
from pathlib import Path

from auto_query_genius.gui.utils import load_text_from_file

class InputSection:
    def __init__(self, parent, app, on_process_callback):
        self.parent = parent
        self.app = app
        self.on_process_callback = on_process_callback
        
        # Create the input frame
        self._create_input_frame()
    
    def _create_input_frame(self):
        """Create the input section of the process tab."""
        input_frame = ttk.LabelFrame(self.parent, text="Job Description Input")
        input_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Add text area for job description
        ttk.Label(input_frame, text="Enter job description:").pack(anchor=tk.W, padx=5, pady=2)
        self.job_text = scrolledtext.ScrolledText(input_frame, wrap=tk.WORD, height=10)
        self.job_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Add buttons for loading from file and processing
        button_frame = ttk.Frame(input_frame)
        button_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(button_frame, text="Load from File", command=self.load_from_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Process", command=self.on_process_callback).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear", command=lambda: self.job_text.delete(1.0, tk.END)).pack(side=tk.LEFT, padx=5)
        
        # File type label
        self.file_type_var = tk.StringVar(value="No file loaded")
        ttk.Label(button_frame, textvariable=self.file_type_var).pack(side=tk.RIGHT, padx=5)
    
    def load_from_file(self):
        """Load job description from a file."""
        try:
            content, file_path = load_text_from_file(title="Select Job Description File")
            
            if content and file_path:
                # Update file type
                file_ext = Path(file_path).suffix.lower()
                self.file_type_var.set(f"File type: {file_ext}")
                
                # Clear and insert new content
                self.job_text.delete(1.0, tk.END)
                self.job_text.insert(tk.END, content)
                
                self.app.status_var.set(f"Loaded file: {os.path.basename(file_path)}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load file: {str(e)}")
            self.app.status_var.set("File loading failed")
    
    def get_job_description(self):
        """Get the job description from the text area."""
        return self.job_text.get(1.0, tk.END).strip()
    
    def clear(self):
        """Clear the input section."""
        self.job_text.delete(1.0, tk.END)
        self.file_type_var.set("No file loaded")
