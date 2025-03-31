
"""
Evaluation Report Generation Module

This module provides functionality to generate detailed evaluation reports 
for the Auto Query Genius application. It processes evaluation results and 
creates formatted reports with metrics, analysis, and visualizations.

The report generation process includes:
- Performance metrics calculation (precision, recall, F1 score)
- Comparative analysis between different extraction methods
- Statistical significance testing
- Visualization of performance metrics
- Keyword extraction quality assessment

Usage:
    from auto_query_genius.evaluation.report import create_evaluation_report
    
    report = create_evaluation_report(evaluation_results)
"""

from auto_query_genius.evaluation.report.generator import create_evaluation_report

__all__ = ['create_evaluation_report']
