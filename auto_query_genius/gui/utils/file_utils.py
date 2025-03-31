
"""
Auto Query Genius - File Utilities

This module provides file-related utility functions for the GUI.
"""

import os
import tkinter as tk
from tkinter import filedialog, messagebox
import json
import importlib.util

def load_text_from_file(event=None, file_path=None, text_widget=None, title="Select File"):
    """
    Load text from a file into a text widget.
    
    Args:
        event: The event object, if called from an event handler.
        file_path: Optional path to the file. If None, a file dialog will open.
        text_widget: The text widget to load the text into.
        title: Title for the file dialog window.
        
    Returns:
        tuple: (loaded_text, file_path) or ("", "") if loading failed.
    """
    if file_path is None:
        file_path = filedialog.askopenfilename(
            title=title,
            filetypes=[
                ("Text files", "*.txt"),
                ("PDF files", "*.pdf"),
                ("Word documents", "*.docx"),
                ("All files", "*.*")
            ]
        )
    
    if not file_path:
        return "", ""
    
    try:
        # Handle different file types
        file_ext = os.path.splitext(file_path.lower())[1]
        
        if file_ext == '.pdf':
            # Check if PyPDF2 is installed
            if not importlib.util.find_spec("PyPDF2"):
                messagebox.showerror(
                    "Missing Dependency", 
                    "PyPDF2 package is required to read PDF files.\n\n"
                    "Install it with: pip install PyPDF2\n\n"
                    "Or install all optional dependencies with:\n"
                    "pip install -e .[pdf]"
                )
                return "", ""
                
            try:
                import PyPDF2
                
                text = ""
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page_num in range(len(pdf_reader.pages)):
                        text += pdf_reader.pages[page_num].extract_text() + "\n"
                
                if not text.strip():
                    messagebox.showwarning("Warning", "No text could be extracted from the PDF file.")
                    return "", ""
                
                return text, file_path
            except Exception as e:
                messagebox.showerror("Error", f"Error processing PDF file: {str(e)}")
                return "", ""
        
        elif file_ext == '.docx':
            # Check if python-docx is installed
            if not importlib.util.find_spec("docx"):
                messagebox.showerror(
                    "Missing Dependency", 
                    "python-docx package is required to read DOCX files.\n\n"
                    "Install it with: pip install python-docx\n\n"
                    "Or install all optional dependencies with:\n"
                    "pip install -e .[docx]"
                )
                return "", ""
                
            try:
                import docx
                
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
                
                if not text.strip():
                    messagebox.showwarning("Warning", "No text could be extracted from the Word document.")
                    return "", ""
                
                return text, file_path
            except Exception as e:
                messagebox.showerror("Error", f"Error processing Word document: {str(e)}")
                return "", ""
        
        else:  # Default to text file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            if not text.strip():
                messagebox.showwarning("Warning", "The file is empty.")
                return "", ""
            
            return text, file_path
    
    except Exception as e:
        messagebox.showerror("Error", f"Error loading file: {str(e)}")
        return "", ""
    
    finally:
        # If a text widget was provided, update it with the loaded text
        if text_widget is not None and 'text' in locals() and text:
            text_widget.delete(1.0, tk.END)
            text_widget.insert(tk.END, text)

def save_text_to_file(text, default_filename="results.json", file_types=None):
    """
    Save text to a file selected by the user.
    
    Args:
        text (str): The text to save.
        default_filename (str): Default filename suggestion.
        file_types (list): List of file type tuples for the file dialog.
        
    Returns:
        str: Path where the file was saved, or empty string if cancelled.
    """
    if file_types is None:
        file_types = [("JSON files", "*.json"), ("Text files", "*.txt"), ("All files", "*.*")]
    
    file_path = filedialog.asksaveasfilename(
        defaultextension=os.path.splitext(default_filename)[1],
        initialfile=default_filename,
        filetypes=file_types
    )
    
    if not file_path:
        return ""
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)
        return file_path
    except Exception as e:
        messagebox.showerror("Error", f"Error saving file: {str(e)}")
        return ""

def save_json_to_file(data, default_filename="results.json"):
    """
    Save Python dictionary or list to a JSON file.
    
    Args:
        data (dict or list): The data to save.
        default_filename (str): Default filename suggestion.
        
    Returns:
        str: Path where the file was saved, or empty string if cancelled.
    """
    file_path = filedialog.asksaveasfilename(
        defaultextension=".json",
        initialfile=default_filename,
        filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
    )
    
    if not file_path:
        return ""
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return file_path
    except Exception as e:
        messagebox.showerror("Error", f"Error saving JSON file: {str(e)}")
        return ""
