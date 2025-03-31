
"""
Job Item Processor Module

This module handles the processing of individual job items during evaluation.
"""

import time
from typing import Dict, Tuple, Any, List

def process_job_item(job: Dict[str, Any], job_index: int, query_generator) -> Tuple[Dict[str, Any], bool]:
    """
    Process a single job item for evaluation.
    
    Args:
        job: The job item with text and ground truth keywords
        job_index: Index of the job in the dataset
        query_generator: Instance of QueryGenerator
        
    Returns:
        Tuple with job result dict and success boolean
    """
    job_id = job.get('id', job.get('company_name', f'job-{job_index}'))
    print(f"\nProcessing job item {job_index + 1}: {job_id}")
    
    # Validate job item
    job_text = job.get('text', job.get('job_description', ''))
    if not job_text:
        print(f"  Warning: Job {job_index + 1} has no text content. Skipping.")
        return {
            'id': job_id,
            'error': "No text content"
        }, False
    
    # Get ground truth keywords
    ground_truth = job.get('keywords', [])
    if not ground_truth:
        print(f"  Warning: Job {job_index + 1} has no ground truth keywords.")
        # This is now handled by generating synthetic keywords in the metrics calculation
    
    # Process with both AI and baseline for comparison
    start_time = time.time()
    result_dict = {
        'id': job_id,
        'metrics': {'precision': 0, 'recall': 0, 'f1': 0, 'f1_score': 0},
        'ground_truth': ground_truth,
        'extracted_keywords': [],
        'baseline_keywords': []
    }
    
    try:
        # Extract keywords using the specified method (AI or baseline)
        print(f"  Extracting keywords from job description ({len(job_text)} chars)...")
        
        # Get keywords from the primary extraction method
        keywords_result = query_generator.extract_keywords(job_text)
        result_dict['extracted_keywords'] = keywords_result
        
        # Get baseline keywords using the non-AI method
        if query_generator.use_ai:
            # If we're using AI for primary, get baseline using non-AI
            temp_generator = query_generator.__class__(use_ai=False)
            baseline_keywords = temp_generator.extract_keywords(job_text)
            result_dict['baseline_keywords'] = baseline_keywords
        else:
            # If we're already using non-AI, just duplicate the results for comparison
            result_dict['baseline_keywords'] = keywords_result
        
        # Calculate metrics
        from auto_query_genius.evaluation.metrics import calculate_metrics
        
        # Calculate primary metrics
        primary_metrics = calculate_metrics(keywords_result, ground_truth, job_text)
        result_dict['metrics'] = primary_metrics
        
        # Calculate baseline metrics
        baseline_metrics = calculate_metrics(result_dict['baseline_keywords'], ground_truth, job_text)
        result_dict['baseline_metrics'] = baseline_metrics
        
        # Print results
        print(f"  Processed in {time.time() - start_time:.2f} seconds")
        print(f"  Results: Precision={primary_metrics['precision']:.2f}, " +
              f"Recall={primary_metrics['recall']:.2f}, F1={primary_metrics['f1']:.2f}")
        
        # Also print in web format for easier comparison
        print(f"  Web format: {primary_metrics['precision']*100:.1f}/{primary_metrics['recall']*100:.1f}/{primary_metrics['f1']*100:.1f}")
        
        return result_dict, True
    
    except Exception as e:
        print(f"  Error processing job {job_index + 1}: {str(e)}")
        result_dict['error'] = str(e)
        return result_dict, False
