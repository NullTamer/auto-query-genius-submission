
"""
Auto Query Genius - Job Processor Module

This module contains the processing logic for job descriptions. It extracts
keywords using TF-IDF or AI-powered methods and generates Boolean search queries
that can be used on job boards and search engines.

The job processing functionality includes:
- Text preprocessing and cleaning
- Keyword extraction using TF-IDF statistical analysis
- Optional AI-powered keyword extraction (with Gemini API)
- Optional transformer-based keyword extraction
- Ranking and filtering of keywords by relevance
- Generation of optimized Boolean search queries

This module serves as the primary interface for processing job descriptions
in the Auto Query Genius application.
"""

from auto_query_genius.query_generator import QueryGenerator

def process_job_description(text, use_ai=False, use_transformer=False, gemini_api_key=None):
    """
    Process a job description to extract keywords and generate a query.
    
    This function takes a job description text, extracts relevant keywords,
    and generates an optimized Boolean search query. It supports multiple extraction
    methods: TF-IDF-based extraction (default), AI-powered extraction (optional),
    and transformer-based extraction (optional).
    
    Args:
        text (str): The job description text to process
        use_ai (bool): Whether to use AI-powered extraction (requires API key)
        use_transformer (bool): Whether to use transformer-based extraction
        gemini_api_key (str, optional): Gemini API key for AI-powered extraction
        
    Returns:
        tuple: A tuple containing:
            - keywords (list): List of dictionaries with extracted keywords and scores
            - query (str): Generated Boolean search query
            
    Example:
        >>> keywords, query = process_job_description("Python developer with 5+ years experience...")
        >>> print(keywords)
        [{'keyword': 'python', 'score': 0.85}, {'keyword': 'developer', 'score': 0.75}, ...]
        >>> print(query)
        '(python OR developer) AND (experience)'
        
    Raises:
        ValueError: If the text is empty or invalid
        RuntimeError: If extraction fails due to processing errors
    """
    # Initialize the query generator
    query_generator = QueryGenerator(
        use_ai=use_ai,
        use_transformer=use_transformer,
        gemini_api_key=gemini_api_key
    )
    
    # Process the job description
    keywords, query = query_generator.process_job_description(text)
    
    return keywords, query
