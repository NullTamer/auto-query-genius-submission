
"""
Auto Query Genius - Processor Package

This package contains modules for processing job descriptions, evaluations,
and web server functionality. It serves as the core processing engine for 
the Auto Query Genius application.

Modules:
- job_processor: Processes job descriptions to extract keywords and generate queries
- file_operations: Handles file reading and writing operations
- evaluation_processor: Runs evaluations on benchmark datasets
- web_processor: Launches and manages the web server interface

Each module can be used independently or through the main processor module.
"""

from auto_query_genius.processor.job_processor import process_job_description
from auto_query_genius.processor.file_operations import read_text_from_file, save_results
from auto_query_genius.processor.evaluation_processor import run_evaluation
from auto_query_genius.processor.web_processor import launch_web_server

__all__ = [
    'process_job_description',
    'read_text_from_file',
    'save_results',
    'run_evaluation',
    'launch_web_server'
]
