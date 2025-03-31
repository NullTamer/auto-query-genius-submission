
"""
Boolean query generator for candidate profile search.
"""

from typing import List, Dict, Any, Tuple, Optional
from auto_query_genius.query_generation.generator import QueryGenerator
from auto_query_genius.query_generation.keyword_expander import KeywordExpander
from auto_query_genius.query_generation.query_formatter import QueryFormatter
from auto_query_genius.query_generation.synonym_mapper import SynonymMapper

class BooleanQueryGenerator(QueryGenerator):
    """
    A class to generate Boolean search queries for candidate profiles from keywords.
    """
    
    def __init__(self):
        """
        Initialize the BooleanQueryGenerator with necessary components.
        """
        # Initialize the keyword expander
        self.keyword_expander = KeywordExpander()
        
        # Get synonym mappings
        self.synonym_mappings = SynonymMapper.get_synonym_mappings()
    
    def generate_query(self, keywords: List[Dict[str, Any]]) -> str:
        """
        Generate a Boolean search query from keywords with synonym expansion,
        optimized for finding candidate profiles rather than jobs.
        
        Args:
            keywords (List[Dict]): List of keywords with their scores
            
        Returns:
            str: A Boolean search query optimized for candidate profile searching
        """
        if not keywords:
            return ""
        
        # Expand keywords with synonyms and related terms
        expanded_keywords = self.keyword_expander.expand_keywords_with_synonyms(keywords)
        
        # Categorize keywords if they don't already have categories
        for keyword in expanded_keywords:
            if "category" not in keyword:
                # Try to categorize based on keyword patterns
                term = keyword["keyword"].lower()
                
                # Common skills
                if any(skill in term for skill in ["python", "java", "javascript", "react", "node", 
                                                 "aws", "cloud", "docker", "kubernetes", "sql", 
                                                 "nosql", "mongodb", "tensorflow"]):
                    keyword["category"] = "skill"
                
                # Common roles
                elif any(role in term for role in ["engineer", "developer", "manager", "architect", 
                                                 "analyst", "scientist", "specialist", "consultant"]):
                    keyword["category"] = "role"
                
                # Common qualifications
                elif any(qual in term for qual in ["degree", "bachelor", "master", "phd", "certification", 
                                                 "certified", "license", "diploma"]):
                    keyword["category"] = "qualification"
        
        # Format the expanded keywords into a boolean query
        return QueryFormatter.format_boolean_query(expanded_keywords, self.synonym_mappings)
