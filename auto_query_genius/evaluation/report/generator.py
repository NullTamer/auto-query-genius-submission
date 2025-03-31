
"""
Report Generator

This module provides the main functionality to generate evaluation reports.
"""

import datetime
import os
from typing import Dict, List, Any

from auto_query_genius.evaluation.report.sections import (
    write_report_header,
    write_summary,
    write_job_results,
    write_performance_graphs,
    write_comparative_analysis
)

def create_evaluation_report(results: List[Dict], dataset_path: str = None, dataset_size: int = 0, 
                           output_format: str = "text", output_dir: str = ".") -> str:
    """
    Create a comprehensive evaluation report file.
    
    Args:
        results: List of result dictionaries for each job
        dataset_path: Path to the dataset
        dataset_size: Number of items in the dataset
        output_format: Format of the report ('text', 'md', 'html')
        output_dir: Directory to save the report
        
    Returns:
        Path to the created report file
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Determine file extension based on format
    file_ext = {
        "text": "txt",
        "md": "md",
        "html": "html"
    }.get(output_format, "txt")
    
    # Create report filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = os.path.join(output_dir, f"evaluation_report_{timestamp}.{file_ext}")
    
    with open(report_filename, 'w', encoding='utf-8') as report_file:
        # Write report header
        timestamp_readable = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        write_report_header(report_file, timestamp_readable, dataset_path, dataset_size, output_format)
        
        # Process valid results
        valid_items = 0
        all_precision = []
        all_recall = []
        all_f1 = []
        all_true_positives = []
        all_false_positives = []
        all_false_negatives = []
        
        # Process each evaluation result
        for result in results:
            # Skip results with errors
            if 'error' in result:
                error_header = "ERROR" if output_format == "text" else "### ERROR"
                report_file.write(f"{error_header}: Job ID '{result.get('id', 'unknown')}' - {result['error']}\n\n")
                continue
                
            # Skip results with missing metrics
            if 'metrics' not in result:
                skipped_header = "SKIPPED" if output_format == "text" else "### SKIPPED"
                report_file.write(f"{skipped_header}: Job ID '{result.get('id', 'unknown')}' - missing metrics\n\n")
                continue
            
            # Write job results to report
            write_job_results(
                report_file, 
                result['id'], 
                result['metrics'], 
                result.get('extracted_keywords', []), 
                result.get('ground_truth', []),
                output_format
            )
            
            # Collect metrics for summary
            metrics = result['metrics']
            all_precision.append(metrics['precision'])
            all_recall.append(metrics['recall'])
            all_f1.append(metrics['f1'])
            
            # Collect additional metrics for detailed analysis if available
            if 'true_positives' in metrics:
                all_true_positives.append(len(metrics['true_positives']))
            if 'extracted' in metrics and 'truth' in metrics:
                extracted_set = set(metrics['extracted'])
                truth_set = set(metrics['truth'])
                all_false_positives.append(len(extracted_set - truth_set))
                all_false_negatives.append(len(truth_set - extracted_set))
            
            valid_items += 1
        
        # Write summary section
        write_summary(report_file, all_precision, all_recall, all_f1, dataset_size, valid_items, output_format)
        
        # Add performance graphs for visual representation (markdown or HTML)
        if output_format in ["md", "html"] and valid_items > 0:
            write_performance_graphs(
                report_file,
                all_precision, 
                all_recall, 
                all_f1,
                all_true_positives if all_true_positives else None,
                all_false_positives if all_false_positives else None,
                all_false_negatives if all_false_negatives else None,
                output_format
            )
            
        # Add comparative analysis if we have multiple items
        if output_format in ["md", "html"] and valid_items > 1:
            write_comparative_analysis(report_file, output_format)
    
    return report_filename
