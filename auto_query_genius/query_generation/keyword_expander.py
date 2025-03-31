
"""
Keyword expander for query generation.

This module provides functionality to expand keywords with related terms
and synonyms to enhance search query results.
"""

from typing import List, Dict, Any, Set
from auto_query_genius.query_generation.synonym_mapper import SynonymMapper


class KeywordExpander:
    """
    A class to expand keywords with related terms and synonyms.
    """
    
    def __init__(self):
        """
        Initialize the KeywordExpander with synonym mappings.
        """
        self.synonym_mappings = SynonymMapper.get_synonym_mappings()
    
    def expand_keywords_with_synonyms(self, keywords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Expand keywords with related terms and synonyms based on word embeddings concept.
        
        Args:
            keywords (List[Dict]): List of extracted keywords with their scores
            
        Returns:
            List[Dict]: Original keywords plus their related terms with adjusted scores
        """
        if not keywords:
            return []
        
        expanded_keywords = []
        added_terms = set()  # Track already added terms to avoid duplicates
        
        # Process each keyword to find synonyms and related terms
        for keyword_entry in keywords:
            keyword = keyword_entry["keyword"].lower()
            score = keyword_entry["score"]
            
            # Add the original keyword first
            if keyword not in added_terms:
                expanded_keywords.append(keyword_entry)
                added_terms.add(keyword)
            
            # Look for exact matches in our synonym mappings
            if keyword in self.synonym_mappings:
                related_terms = self.synonym_mappings[keyword]
                
                # Add related terms with reduced scores
                for term in related_terms:
                    if term not in added_terms:
                        # Use lower score for related terms (70% of original)
                        related_score = score * 0.7
                        expanded_keywords.append({"keyword": term, "score": float(related_score)})
                        added_terms.add(term)
            
            # Look for partial matches (e.g., if "python developer" contains "python")
            for base_term, related_terms in self.synonym_mappings.items():
                if base_term in keyword and base_term != keyword:
                    # Add related terms with further reduced scores
                    for term in related_terms:
                        if term not in added_terms:
                            # Use even lower score for partial matches (50% of original)
                            related_score = score * 0.5
                            expanded_keywords.append({"keyword": term, "score": float(related_score)})
                            added_terms.add(term)
        
        # Sort expanded keywords by score in descending order
        expanded_keywords.sort(key=lambda x: x["score"], reverse=True)
        
        # Limit to a reasonable number (original max + 10 more for related terms)
        max_keywords = len(keywords) + 10
        return expanded_keywords[:max_keywords]

