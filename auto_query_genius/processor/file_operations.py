
"""
Auto Query Genius - File Operations Module

This module contains file reading and writing operations.
"""

import os
import json

def read_text_from_file(file_path):
    """
    Read text from a file.
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        str: The text content of the file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            
        if not text.strip():
            raise ValueError(f"File '{file_path}' is empty.")
            
        return text
    except UnicodeDecodeError:
        raise UnicodeDecodeError(f"File '{file_path}' is not a valid text file or has an unsupported encoding.")
    except PermissionError:
        raise PermissionError(f"Permission denied when trying to read '{file_path}'.")

def save_results(output_path, keywords, query):
    """
    Save results to a JSON file.
    
    Args:
        output_path (str): Path to save the results
        keywords (list): Extracted keywords
        query (str): Generated query
        
    Returns:
        str: Path where results were saved
    """
    try:
        # Ensure the file has a .json extension
        if not output_path.lower().endswith('.json'):
            output_path += '.json'
        
        # Create the directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Prepare the data to save
        output_data = {
            "keywords": keywords,
            "query": query
        }
        
        # Write the data to the file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
        
        return output_path
    except PermissionError:
        raise PermissionError(f"Permission denied when trying to write to '{output_path}'.")
