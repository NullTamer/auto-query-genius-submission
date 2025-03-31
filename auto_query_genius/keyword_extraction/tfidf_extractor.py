
"""
TF-IDF Based Keyword Extractor Module

This module implements a keyword extractor using Term Frequency-Inverse Document Frequency
(TF-IDF) statistical method combined with Named Entity Recognition (NER) for enhanced
keyword extraction from job descriptions.

The TF-IDF method measures how important a word is to a document in a collection of documents.
This implementation enhances standard TF-IDF with:
- Named Entity Recognition to identify organizations, products, locations, etc.
- Domain-specific entity detection for technical skills and job roles
- Lemmatization for improved matching of word variants
- Weighting schemes to prioritize important terms

This extractor is the default method used in Auto Query Genius when AI extraction
is not enabled or available.
"""

import spacy
import numpy as np
from collections import Counter
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer

from auto_query_genius.keyword_extraction.extractor import KeywordExtractor

class TfidfKeywordExtractor(KeywordExtractor):
    """
    A keyword extractor using TF-IDF and Named Entity Recognition.
    
    This class implements keyword extraction using the TF-IDF statistical method
    combined with Named Entity Recognition and domain-specific entity detection.
    It provides robust keyword extraction without requiring external API calls.
    
    Attributes:
        nlp (spacy.Language): The spaCy language model for text processing
        max_keywords (int): Maximum number of keywords to extract
        tfidf_vectorizer (TfidfVectorizer): Scikit-learn TF-IDF vectorizer
        domain_entities (Dict[str, List[str]]): Domain-specific entities by category
    """
    
    def __init__(self, model="en_core_web_sm", max_keywords=15):
        """
        Initialize the TF-IDF extractor with a spaCy model.
        
        Args:
            model (str): The spaCy model to use for text processing. 
                Default is "en_core_web_sm".
            max_keywords (int): Maximum number of keywords to extract.
                Default is 15.
                
        Raises:
            ImportError: If the specified spaCy model is not installed
        """
        try:
            self.nlp = spacy.load(model)
        except OSError:
            # If model isn't installed, inform the user and exit
            raise ImportError(
                f"The spaCy model '{model}' is not installed. "
                f"Please install it by running: python -m spacy download {model}"
            )
        
        self.max_keywords = max_keywords
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            lowercase=True,
            token_pattern=r'(?u)\b[a-zA-Z][a-zA-Z-]+[a-zA-Z]\b',  # Matches words with at least 3 chars
            max_features=100,  # Limit to most important features
            ngram_range=(1, 2)  # Extract both unigrams and bigrams
        )
        
        # Domain-specific entities to prioritize
        self.domain_entities = {
            'TECH': ['python', 'javascript', 'java', 'aws', 'react', 'node', 'docker', 'kubernetes', 
                    'tensorflow', 'pytorch', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql'],
            'ROLE': ['engineer', 'developer', 'manager', 'architect', 'analyst', 'scientist', 
                    'specialist', 'consultant', 'administrator', 'director'],
            'SKILL': ['agile', 'scrum', 'kanban', 'ci/cd', 'devops', 'frontend', 'backend', 'fullstack',
                     'machine learning', 'data science', 'artificial intelligence', 'cloud computing']
        }
    
    def extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from text using TF-IDF and Named Entity Recognition.
        
        This method extracts keywords using a combination of:
        - TF-IDF statistical analysis
        - Named Entity Recognition
        - Domain-specific entity detection
        - Custom weighting and scoring
        
        Args:
            text (str): The text to extract keywords from
            
        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing keywords and their scores.
                Each dictionary has the following keys:
                - keyword (str): The extracted keyword or phrase
                - score (float): A relevance score from 0.0 to 1.0
                
        Raises:
            ValueError: If the text is empty or invalid
        """
        # Handle empty or invalid text
        if not text or not isinstance(text, str):
            return []
        
        # Process text with spaCy for NER and preprocessing
        doc = self.nlp(text.lower())
        
        # Extract named entities (technical skills, job titles, etc.)
        entities = []
        for ent in doc.ents:
            # Keep only relevant entity types
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE', 'PERSON']:
                entities.append((ent.text.lower(), 1.5))  # Give higher weight to named entities
        
        # Domain-specific entity detection
        domain_matches = []
        doc_text = text.lower()
        
        # Check for each domain entity type
        for entity_type, entity_list in self.domain_entities.items():
            for entity in entity_list:
                # Simple pattern matching for domain-specific terms
                if entity in doc_text:
                    # Higher weight for technical skills and role names
                    weight = 2.0 if entity_type in ['TECH', 'ROLE'] else 1.8
                    domain_matches.append((entity, weight))
        
        # Extract clean text without stopwords, punctuation, or numbers for TF-IDF
        clean_tokens = [
            token.lemma_ for token in doc 
            if not token.is_stop and not token.is_punct and not token.is_digit
            and token.is_alpha and len(token.text) > 2
        ]
        
        # Handle case with no valid tokens
        if not clean_tokens:
            # Return entities if we have them, empty list otherwise
            named_entities = [{"keyword": ent[0], "score": float(ent[1])} for ent in entities + domain_matches]
            return sorted(named_entities, key=lambda x: x["score"], reverse=True)[:self.max_keywords]
        
        # Join tokens back to text for TF-IDF processing
        clean_text = " ".join(clean_tokens)
        
        # We need a corpus for TF-IDF. Since we only have one document,
        # we'll split it into sentences to create a small corpus
        sentences = [sent.text.lower() for sent in doc.sents]
        
        # If there are not enough sentences, duplicate the document
        if len(sentences) < 3:
            sentences.append(clean_text)
        
        # Calculate TF-IDF
        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(sentences + [clean_text])
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            
            # Get the TF-IDF scores for the full document (last item in the matrix)
            tfidf_scores = tfidf_matrix[-1].toarray()[0]
            
            # Create (keyword, score) pairs and sort by score
            keyword_scores = [(feature_names[i], tfidf_scores[i]) for i in range(len(feature_names))]
            keyword_scores = sorted(keyword_scores, key=lambda x: x[1], reverse=True)
            
            # Combine TF-IDF results with named entities and domain-specific terms
            combined_keywords = {}
            
            # Add TF-IDF keywords
            for kw, score in keyword_scores:
                if score > 0:
                    combined_keywords[kw] = score
            
            # Add named entities with boosted scores
            for ent, weight in entities + domain_matches:
                if ent in combined_keywords:
                    # Boost existing score
                    combined_keywords[ent] *= weight
                else:
                    # Add new entity with its weight
                    combined_keywords[ent] = weight
            
            # Convert to list and sort by score
            final_keywords = [
                {"keyword": kw, "score": float(score)}
                for kw, score in sorted(combined_keywords.items(), key=lambda x: x[1], reverse=True)
            ]
            
            # Return top keywords
            return final_keywords[:self.max_keywords]
            
        except ValueError as e:
            # Handle potential errors in TF-IDF calculation
            print(f"Error in TF-IDF calculation: {e}")
            
            # Fallback to simple frequency as a backup method
            token_freq = Counter(clean_tokens)
            
            # Combine with named entities and domain matches
            for ent, weight in entities + domain_matches:
                token_freq[ent] = token_freq.get(ent, 0) + (len(clean_tokens) * weight / 10)
            
            # Extract most common tokens as keywords
            keywords = [
                {"keyword": kw, "score": freq / len(clean_tokens)}
                for kw, freq in token_freq.most_common(self.max_keywords)
            ]
            
            return keywords
