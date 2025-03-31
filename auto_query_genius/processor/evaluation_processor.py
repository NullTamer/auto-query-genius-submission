
"""
Auto Query Genius - Evaluation Processor Module

This module contains the evaluation processing logic for the Auto Query Genius application.
It provides functionality to run evaluations on benchmark datasets using different 
keyword extraction methods (baseline and AI-powered).

The evaluation process includes:
- Loading and parsing benchmark datasets
- Extracting keywords using specified methods
- Calculating performance metrics (precision, recall, F1 score)
- Generating comprehensive evaluation reports

This module serves as an interface to the evaluation package, simplifying the
process of running evaluations and obtaining results.
"""

from auto_query_genius.evaluation import evaluate_extraction
import time

def run_evaluation(file_path, use_ai=False, gemini_api_key=None):
    """
    Run evaluation on a benchmark dataset.
    
    This function processes a benchmark dataset and evaluates the performance of
    the keyword extraction algorithms against ground truth data. It supports both
    the baseline algorithm and AI-powered extraction methods.
    
    Args:
        file_path (str): Path to the benchmark dataset file (JSON or CSV format)
        use_ai (bool): Whether to use AI-powered extraction (requires API key)
        gemini_api_key (str, optional): Gemini API key for AI-powered extraction
        
    Returns:
        dict: Evaluation results containing the following:
            - overall_metrics: Dict with precision, recall, F1 score
            - per_item_metrics: List of metrics for each item
            - comparison: Comparison with baseline algorithm
            - charts_data: Data for visualization
            - extraction_time: Performance timing information
            
    Raises:
        FileNotFoundError: If the benchmark dataset file does not exist
        ValueError: If the file format is invalid or the file is empty
        RuntimeError: If evaluation fails due to extraction errors
    """
    print(f"Starting evaluation on file: {file_path}")
    print(f"Using AI-powered extraction: {use_ai}")
    
    if use_ai and not gemini_api_key:
        print("Warning: AI extraction requested but no API key provided")
    
    start_time = time.time()
    
    # Run the actual evaluation
    results = evaluate_extraction(
        file_path, 
        use_ai=use_ai, 
        gemini_api_key=gemini_api_key
    )
    
    # Calculate final timing
    total_time = time.time() - start_time
    mins = int(total_time // 60)
    secs = int(total_time % 60)
    print(f"Evaluation completed successfully in {mins:02d}:{secs:02d}")
    
    # Add extraction method to results
    results["extraction_method"] = "ai" if use_ai else "baseline"
    
    return results

