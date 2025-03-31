
"""
Dataset Loading Module

This module provides functionality to load and validate benchmark datasets
from different file formats.
"""

import json
import os
import sys
from typing import Dict, List, Any
from auto_query_genius.evaluation.csv_parser import parse_csv_dataset

def load_benchmark_dataset(dataset_path: str) -> List[Dict[str, Any]]:
    """
    Load and validate a benchmark dataset from a file.
    
    Args:
        dataset_path (str): Path to the benchmark dataset (JSON or CSV)
        
    Returns:
        List[Dict[str, Any]]: List of job items with text and keywords
        
    Raises:
        FileNotFoundError: If the dataset file doesn't exist
        ValueError: If the dataset is empty or has an invalid format
    """
    # Validate file existence
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file '{dataset_path}' not found")
    
    # Load benchmark dataset based on file extension
    file_ext = os.path.splitext(dataset_path.lower())[1]
    
    try:
        if file_ext == '.json':
            # Load JSON dataset
            with open(dataset_path, 'r', encoding='utf-8') as f:
                dataset = json.load(f)
        elif file_ext == '.csv':
            # Load CSV dataset
            with open(dataset_path, 'r', encoding='utf-8') as f:
                csv_content = f.read()
                dataset = parse_csv_dataset(csv_content)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}. Please use JSON or CSV.")
    except json.JSONDecodeError:
        raise ValueError(f"Dataset file '{dataset_path}' is not valid JSON")
    except UnicodeDecodeError:
        raise ValueError(f"Dataset file '{dataset_path}' has an unsupported text encoding")
    except Exception as e:
        raise ValueError(f"Error loading benchmark dataset: {str(e)}")
    
    # Validate dataset structure
    if not dataset:
        raise ValueError("Dataset is empty")
    
    if not isinstance(dataset, list):
        raise ValueError("Dataset must be a list of job descriptions")
        
    return dataset
