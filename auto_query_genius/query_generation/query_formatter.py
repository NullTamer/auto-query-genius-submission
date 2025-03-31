
"""
Query formatter for boolean queries.

This module provides functionality to format keywords into boolean search
queries with proper operators and structure for candidate profile searching.
"""

from typing import List, Dict, Any, Set


class QueryFormatter:
    """
    A class to format keywords into boolean search queries optimized for candidate profiles.
    """
    
    @staticmethod
    def format_boolean_query(expanded_keywords: List[Dict[str, Any]], 
                             synonym_mappings: Dict[str, List[str]]) -> str:
        """
        Format expanded keywords into a Boolean search query optimized for candidate profiles.
        
        Args:
            expanded_keywords (List[Dict]): List of expanded keywords with scores
            synonym_mappings (Dict[str, List[str]]): Mappings of terms to related terms
            
        Returns:
            str: A formatted Boolean search query
        """
        if not expanded_keywords:
            return ""
        
        # Categorize keywords if possible
        skill_terms = []
        role_terms = []
        qualification_terms = []
        other_terms = []
        
        for kw in expanded_keywords:
            keyword = kw["keyword"]
            category = kw.get("category", "").lower()
            
            # Categorize based on available category information
            if category in ["skill", "technical skill"]:
                skill_terms.append(keyword)
            elif category in ["role", "position", "job title"]:
                role_terms.append(keyword)
            elif category in ["qualification", "education", "certification", "degree"]:
                qualification_terms.append(keyword)
            else:
                # Default categorization based on position in the list
                # (highest ranked keywords are more likely to be essential skills)
                other_terms.append(keyword)
        
        # If we don't have explicit categories, sort the terms based on their position
        if not skill_terms and not role_terms and not qualification_terms:
            # Top 3 are treated as essential skills (AND)
            skill_terms = other_terms[:3]
            # Rest are optional terms (OR)
            other_terms = other_terms[3:]
        
        # Build the query
        query_parts = []
        
        # Role terms (connected with OR)
        if role_terms:
            formatted_roles = [f'"{term}"' for term in role_terms]
            query_parts.append(f"({' OR '.join(formatted_roles)})")
        
        # Essential skill terms (connected with AND)
        if skill_terms:
            formatted_skills = [f'"{term}"' for term in skill_terms[:3]]
            query_parts.append(f"({' AND '.join(formatted_skills)})")
            
            # Optional skill terms (connected with OR)
            if len(skill_terms) > 3:
                optional_skills = [f'"{term}"' for term in skill_terms[3:]]
                query_parts.append(f"({' OR '.join(optional_skills)})")
        
        # Qualification terms (connected with OR)
        if qualification_terms:
            formatted_quals = [f'"{term}"' for term in qualification_terms]
            query_parts.append(f"({' OR '.join(formatted_quals)})")
            
        # Other terms (grouped by related terms)
        if other_terms:
            # Group related terms together
            grouped_terms = {}
            ungrouped_terms = []
            
            for term in other_terms:
                term_lower = term.lower()
                grouped = False
                
                # Try to find a group for this term
                for base_term, related_terms in synonym_mappings.items():
                    if term_lower == base_term or term_lower in related_terms:
                        if base_term not in grouped_terms:
                            grouped_terms[base_term] = []
                        if term not in grouped_terms[base_term]:
                            grouped_terms[base_term].append(term)
                        grouped = True
                        break
                
                # If no group found, add to ungrouped
                if not grouped:
                    ungrouped_terms.append(term)
            
            # Format grouped terms
            grouped_parts = []
            
            for group, terms in grouped_terms.items():
                if terms:
                    formatted_terms = [f'"{term}"' for term in terms]
                    grouped_parts.append(f"({' OR '.join(formatted_terms)})")
            
            # Add ungrouped terms
            for term in ungrouped_terms:
                grouped_parts.append(f'"{term}"')
            
            # Combine all other term groups with OR
            if grouped_parts:
                query_parts.append(f"({' OR '.join(grouped_parts)})")
        
        # Combine all parts with AND
        if len(query_parts) > 1:
            return " AND ".join(query_parts)
        elif query_parts:
            return query_parts[0]
        else:
            # Fallback if no query parts were created
            return ""
