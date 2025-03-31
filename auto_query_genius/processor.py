
#!/usr/bin/env python3
"""
Auto Query Genius - Processor Module

This module is the main entry point for the processor package. It re-exports 
functionality from the processor submodules for backward compatibility.

The processor package provides the following functionality:
- Processing job descriptions to extract keywords and generate Boolean queries
- Reading text from files and saving results to files
- Running evaluations on benchmark datasets
- Launching the web server interface
"""

# Re-export functionality from the processor submodules
from auto_query_genius.processor.job_processor import process_job_description
from auto_query_genius.processor.file_operations import read_text_from_file, save_results
from auto_query_genius.processor.evaluation_processor import run_evaluation
from auto_query_genius.processor.web_processor import launch_web_server

# For backwards compatibility
__all__ = [
    'process_job_description',
    'read_text_from_file',
    'save_results',
    'run_evaluation',
    'launch_web_server'
]
