
"""
Keyword Extractor Base Module

This module defines the abstract base class for keyword extractors used in 
the Auto Query Genius application. All keyword extraction implementations 
must inherit from this base class and implement the required methods.

The KeywordExtractor abstract base class provides a common interface for
different keyword extraction algorithms, allowing them to be used interchangeably
throughout the application.

Currently, the application supports the following extractor implementations:
- TfidfKeywordExtractor: Uses TF-IDF statistical method for keyword extraction
- AIKeywordExtractor: Uses AI (Gemini API) for advanced keyword extraction

Developers can create custom extractors by inheriting from KeywordExtractor
and implementing the required methods.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any

class KeywordExtractor(ABC):
    """
    Abstract base class for keyword extractors.
    
    This class defines the interface that all keyword extractors must implement.
    It provides a common API for extracting keywords from text, regardless of
    the underlying algorithm or method used.
    
    Attributes:
        No required attributes for the base class.
        
    Methods:
        extract_keywords: Abstract method that must be implemented by subclasses.
    """
    
    @abstractmethod
    def extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from text.
        
        This abstract method must be implemented by all subclasses to extract
        keywords from the provided text. The implementation details (algorithm,
        scoring method, etc.) are determined by each subclass.
        
        Args:
            text (str): The text to extract keywords from
            
        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing keywords and their scores.
                Each dictionary should have at least the following keys:
                - keyword (str): The extracted keyword or phrase
                - score (float): A relevance score from 0.0 to 1.0
                
        Raises:
            ValueError: If the text is empty or invalid
            RuntimeError: If extraction fails due to processing errors
        """
        pass
