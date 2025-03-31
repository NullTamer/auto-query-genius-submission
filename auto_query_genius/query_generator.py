
"""
Query Generator Module

This module provides the main QueryGenerator class that integrates keyword extraction 
and query generation components.
"""

import re
from typing import List, Dict, Tuple, Any, Union, Optional

from auto_query_genius.keyword_extraction import TfidfKeywordExtractor, AIKeywordExtractor
from auto_query_genius.query_generation import BooleanQueryGenerator


class QueryGenerator:
    """
    A class to extract keywords from job descriptions and generate Boolean search queries.
    
    This class integrates different keyword extraction methods (TF-IDF or AI-based)
    with Boolean query generation.
    """
    
    def __init__(self, model="en_core_web_sm", max_keywords=15, use_ai=False, gemini_api_key=None):
        """
        Initialize the QueryGenerator.
        
        Args:
            model (str): The spaCy model to use for text processing
            max_keywords (int): Maximum number of keywords to extract
            use_ai (bool): Whether to use AI (Gemini API) for keyword extraction
            gemini_api_key (Optional[str]): The Gemini API key
        """
        self.max_keywords = max_keywords
        self.use_ai = use_ai
        
        # Initialize the TF-IDF extractor
        self.tfidf_extractor = TfidfKeywordExtractor(model, max_keywords)
        
        # Initialize the AI extractor if enabled
        self.ai_extractor = None
        if use_ai:
            try:
                self.ai_extractor = AIKeywordExtractor(gemini_api_key, max_keywords)
            except (ImportError, ValueError) as e:
                print(f"Warning: {str(e)} Falling back to TF-IDF extraction.")
                self.use_ai = False
        
        # Initialize the query generator
        self.query_generator = BooleanQueryGenerator()
    
    def process_job_description(self, text: str) -> Tuple[List[Dict[str, Any]], str]:
        """
        Process a job description to extract keywords and generate a query.
        
        Args:
            text (str): The job description text
            
        Returns:
            Tuple[List[Dict], str]: A tuple containing a list of keywords with their 
                                   scores and the generated Boolean query
        """
        # Extract keywords
        keywords = self.extract_keywords(text)
        
        # Generate Boolean query
        query = self.generate_boolean_query(keywords)
        
        return keywords, query
    
    def extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from text using TF-IDF or AI methods.
        
        Args:
            text (str): The text to extract keywords from
            
        Returns:
            List[Dict]: A list of dictionaries containing keywords and their scores
        """
        # Try AI extraction first if enabled
        if self.use_ai and self.ai_extractor:
            try:
                keywords = self.ai_extractor.extract_keywords(text)
                # Check if we got a valid response
                if isinstance(keywords, list) and keywords:
                    return keywords
                print("AI extraction returned empty or invalid result. Falling back to TF-IDF.")
            except Exception as e:
                print(f"AI extraction failed: {e}. Falling back to TF-IDF.")
        
        # Fall back to TF-IDF extraction
        return self.tfidf_extractor.extract_keywords(text)
    
    def generate_boolean_query(self, keywords: List[Dict[str, Any]]) -> str:
        """
        Generate a Boolean search query from keywords.
        
        Args:
            keywords (List[Dict]): List of keywords with their scores
            
        Returns:
            str: A Boolean search query
        """
        return self.query_generator.generate_query(keywords)
