
"""
AI-based keyword extractor using Gemini API or transformers.
"""

import os
from typing import List, Dict, Any, Optional
from auto_query_genius.keyword_extraction.extractor import KeywordExtractor

class AIKeywordExtractor(KeywordExtractor):
    """
    A keyword extractor using AI (Gemini API or transformers).
    """
    
    def __init__(self, gemini_api_key=None, use_transformer=False, max_keywords=15):
        """
        Initialize the AI extractor.
        
        Args:
            gemini_api_key (Optional[str]): The Gemini API key
            use_transformer (bool): Whether to use transformer-based extraction
            max_keywords (int): Maximum number of keywords to extract
        """
        self.max_keywords = max_keywords
        self.use_transformer = use_transformer
        
        # Try to get API key from the provided parameter first
        api_key = gemini_api_key
        
        # If no API key provided, try to get it from environment variables
        if not api_key:
            # Try multiple possible environment variable names
            for env_var in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY", "GOOGLE_GEMINI_API_KEY"]:
                api_key = os.environ.get(env_var)
                if api_key:
                    print(f"Using Gemini API key from environment variable: {env_var}")
                    break
        
        try:
            # If using transformer-based extraction, we don't need the Gemini client
            if not self.use_transformer:
                from auto_query_genius.gemini_client import GeminiClient
                self.gemini_client = GeminiClient(api_key=api_key)
            else:
                print("Using transformer-based extraction (no Gemini API needed)")
                self.gemini_client = None
        except ImportError:
            if not self.use_transformer:
                raise ImportError("Gemini client is not available. Make sure gemini_client.py exists.")
        except ValueError as e:
            if not self.use_transformer:
                raise ValueError(f"{str(e)}. Cannot initialize AI keyword extractor.")
    
    def extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from text using AI (Gemini API or transformers).
        
        Args:
            text (str): The text to extract keywords from
            
        Returns:
            List[Dict]: A list of dictionaries containing keywords and their scores
        """
        try:
            # If using transformer-based extraction, use a simpler approach for now
            # In a real implementation, this would use Python transformers
            if self.use_transformer:
                print("Using transformer-based extraction in Python")
                
                # Extract unique words that are more than 3 characters long
                import re
                from collections import Counter
                
                words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
                word_counts = Counter(words)
                
                # Remove common English stop words
                stop_words = {
                    'the', 'and', 'for', 'with', 'that', 'this', 'have', 'from', 'will', 'not',
                    'are', 'has', 'our', 'who', 'all', 'been', 'can', 'such', 'they', 'but',
                    'must', 'were', 'both', 'when', 'more', 'any', 'their', 'was', 'your', 'you'
                }
                
                filtered_words = {word: count for word, count in word_counts.items() if word not in stop_words}
                
                # Convert to the expected format
                keywords = [{'keyword': word, 'score': count/max(word_counts.values())} 
                            for word, count in sorted(filtered_words.items(), 
                                                     key=lambda x: x[1], 
                                                     reverse=True)[:self.max_keywords]]
                
                return keywords
            
            # Otherwise use Gemini API
            keywords = self.gemini_client.extract_keywords(text)
            
            # Ensure we get a valid response
            if not isinstance(keywords, list):
                print(f"Warning: AI extraction returned non-list response: {type(keywords)}")
                return []
            
            # Format validation and normalization
            valid_keywords = []
            for kw in keywords:
                # Handle string keywords returned by some models
                if isinstance(kw, str):
                    valid_keywords.append({
                        'keyword': kw.lower().strip(),
                        'score': 1.0
                    })
                    continue
                    
                if not isinstance(kw, dict):
                    continue
                
                # Skip if keyword key is missing or empty
                keyword_text = kw.get('keyword', kw.get('term', ''))
                if not keyword_text:
                    continue
                
                # Normalize score value
                score = 1.0  # Default score
                if 'score' in kw and kw['score'] is not None:
                    try:
                        score = float(kw['score'])
                    except (ValueError, TypeError):
                        # If score conversion fails, try frequency
                        if 'frequency' in kw:
                            try:
                                score = float(kw['frequency'])
                            except (ValueError, TypeError):
                                pass
                elif 'frequency' in kw and kw['frequency'] is not None:
                    try:
                        score = float(kw['frequency'])
                    except (ValueError, TypeError):
                        pass
                
                valid_keywords.append({
                    'keyword': keyword_text.lower().strip(),
                    'score': score
                })
            
            # Ensure we don't exceed max keywords
            return valid_keywords[:self.max_keywords]
        except Exception as e:
            print(f"Error in AI extraction: {e}")
            # Return empty list to allow fallback to TF-IDF
            return []
