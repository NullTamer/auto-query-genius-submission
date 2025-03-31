
"""
Query Generator Base Module

This module defines the abstract base class for query generators used in
the Auto Query Genius application. All query generation implementations
must inherit from this base class and implement the required methods.

The QueryGenerator abstract base class provides a common interface for
different query generation algorithms, allowing them to be used interchangeably
throughout the application.

Currently, the application supports the following generator implementations:
- BooleanQueryGenerator: Generates Boolean search queries with AND/OR operators

Developers can create custom query generators by inheriting from QueryGenerator
and implementing the required methods.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple

class QueryGenerator(ABC):
    """
    Abstract base class for query generators.
    
    This class defines the interface that all query generators must implement.
    It provides a common API for generating search queries from keywords,
    regardless of the underlying algorithm or method used.
    
    Attributes:
        No required attributes for the base class.
        
    Methods:
        generate_query: Abstract method that must be implemented by subclasses.
    """
    
    @abstractmethod
    def generate_query(self, keywords: List[Dict[str, Any]]) -> str:
        """
        Generate a search query from keywords.
        
        This abstract method must be implemented by all subclasses to generate
        a search query from the provided keywords. The implementation details 
        (query format, operator usage, etc.) are determined by each subclass.
        
        Args:
            keywords (List[Dict[str, Any]]): List of keywords with their scores.
                Each dictionary should have at least the following keys:
                - keyword (str): The keyword or phrase
                - score (float): A relevance score from 0.0 to 1.0
            
        Returns:
            str: A search query string that can be used on job boards or search engines
            
        Raises:
            ValueError: If the keywords list is empty or invalid
            RuntimeError: If query generation fails due to processing errors
        """
        pass
