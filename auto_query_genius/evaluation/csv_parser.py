
"""
CSV Parser Module

This module provides functionality for parsing CSV benchmark datasets.
"""

import csv
import io
import json
from typing import List, Dict, Any, Optional


def parse_csv_dataset(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parse a CSV benchmark dataset.
    
    Args:
        csv_content (str): The CSV content to parse
        
    Returns:
        List[Dict[str, Any]]: A list of job description items with ground truth keywords
        
    Raises:
        ValueError: If the CSV is missing required columns or has invalid data
    """
    # Parse CSV
    reader = csv.DictReader(io.StringIO(csv_content))
    
    if not reader.fieldnames:
        raise ValueError("CSV file has no header row")
    
    # Debug header information
    print(f"CSV Headers found: {reader.fieldnames}")
    
    # Normalize header names to lowercase
    header_map = {name: name.lower().strip() for name in reader.fieldnames}
    
    # Check for required columns in various formats
    id_fields = ['id', 'job_id', 'company_name', 'position_id', 'index']
    description_fields = ['description', 'text', 'job_description', 'content', 'job posting']
    keyword_fields = [
        'keywords', 'ground_truth', 'groundtruth', 'model_response',
        'expected_keywords', 'manual_keywords', 'annotated_keywords',
        'skills', 'tags'  # Add more possible keyword fields
    ]
    
    # Validate that at least one description field is present
    has_description_field = any(field in header_map.values() for field in description_fields)
    
    if not has_description_field:
        print(f"Warning: CSV headers don't match expected format. Available headers: {list(header_map.values())}")
        # Try to guess which column might contain the job description
        text_column_candidates = [col for col in header_map.values() if 'text' in col or 'description' in col or 'content' in col or 'job' in col]
        if text_column_candidates:
            print(f"Using '{text_column_candidates[0]}' as the description field")
            description_fields.append(text_column_candidates[0])
        else:
            raise ValueError(f"CSV file must contain one of these description columns: {', '.join(description_fields)}")
    
    # Parse each row
    items = []
    for i, row in enumerate(reader):
        try:
            # Map row keys to lowercase for consistent access
            row_lower = {k.lower().strip(): v for k, v in row.items()}
            
            # Extract job ID from available fields or use row index
            job_id = None
            for field in id_fields:
                if field in row_lower and row_lower[field].strip():
                    job_id = row_lower[field].strip()
                    break
            
            if not job_id:
                job_id = f"job-{i+1}"
            
            # Extract description from available fields
            description = ""
            for field in description_fields:
                if field in row_lower and row_lower[field].strip():
                    description += row_lower[field].strip() + " "
            
            # Special handling for the Hugging Face dataset format
            if 'job posting' in row_lower and row_lower['job posting'].strip():
                description = row_lower['job posting'].strip()
            
            description = description.strip()
            if not description:
                continue  # Skip rows with empty descriptions
            
            # Add position title to description if available
            if 'position_title' in row_lower and row_lower['position_title'].strip():
                description = f"{row_lower['position_title'].strip()}: {description}"
            elif 'title' in row_lower and row_lower['title'].strip():
                description = f"{row_lower['title'].strip()}: {description}"
            elif 'job title' in row_lower and row_lower['job title'].strip():
                description = f"{row_lower['job title'].strip()}: {description}"
            
            # Generate synthetic keywords from the description if no keyword fields found
            # This is helpful for datasets like the Hugging Face one that doesn't have explicit keywords
            keywords = []
            
            # First try to parse from existing keyword fields
            keywords_found = False
            for field in keyword_fields:
                if field in row_lower and row_lower[field].strip():
                    try:
                        # Parse as JSON if possible
                        if row_lower[field].startswith('{') or row_lower[field].startswith('['):
                            keyword_data = json.loads(row_lower[field])
                            # Process JSON format
                            if isinstance(keyword_data, list):
                                for kw in keyword_data:
                                    if isinstance(kw, dict):
                                        keywords.append({
                                            'keyword': kw.get('keyword', '') or kw.get('term', ''),
                                            'frequency': kw.get('frequency', 1) or kw.get('count', 1)
                                        })
                                    elif isinstance(kw, str):
                                        keywords.append({
                                            'keyword': kw,
                                            'frequency': 1
                                        })
                            elif isinstance(keyword_data, dict):
                                for key, value in keyword_data.items():
                                    if key and key != 'N/A':
                                        frequency = 1
                                        if isinstance(value, (int, float)):
                                            frequency = value
                                        keywords.append({
                                            'keyword': key,
                                            'frequency': frequency
                                        })
                        else:
                            # Parse as comma-separated list
                            keyword_list = row_lower[field].split(',')
                            for kw_entry in keyword_list:
                                kw_entry = kw_entry.strip()
                                if kw_entry:
                                    if ':' in kw_entry:
                                        kw, freq = kw_entry.split(':', 1)
                                        try:
                                            freq = int(freq.strip())
                                        except ValueError:
                                            freq = 1
                                        keywords.append({
                                            'keyword': kw.strip(),
                                            'frequency': freq
                                        })
                                    else:
                                        keywords.append({
                                            'keyword': kw_entry,
                                            'frequency': 1
                                        })
                        keywords_found = True
                        break
                    except Exception as e:
                        print(f"Error parsing keywords for job {job_id} from field {field}: {e}")
                        continue
            
            # If no keywords were found, extract important terms from the description
            if not keywords_found:
                import re
                from collections import Counter
                
                # Extract potential keywords from the description
                # Remove common words and keep only potentially meaningful terms
                words = re.findall(r'\b[A-Za-z][A-Za-z0-9+#\.]{2,}\b', description.lower())
                stopwords = {'and', 'the', 'to', 'of', 'a', 'in', 'for', 'with', 'on', 'at', 'from', 'by', 'about', 
                             'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 
                             'without', 'before', 'under', 'around', 'among', 'our', 'we', 'us', 'you', 'they', 'them', 
                             'their', 'this', 'that', 'these', 'those', 'will', 'have', 'has', 'had', 'not', 'are', 
                             'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 
                             'should', 'would', 'may', 'might', 'must', 'shall', 'should'}
                
                filtered_words = [word for word in words if word not in stopwords and len(word) > 3]
                word_counts = Counter(filtered_words)
                
                # Get top 15 most common words as synthetic keywords
                for word, count in word_counts.most_common(15):
                    keywords.append({
                        'keyword': word,
                        'frequency': count
                    })
                
                # Also try to extract multi-word technical terms using regex patterns
                tech_terms = re.findall(r'\b[A-Za-z][A-Za-z0-9]*[\s\-\.][A-Za-z0-9]+\b', description)
                for term in tech_terms[:10]:  # Get up to 10 multi-word terms
                    clean_term = term.lower().strip()
                    if clean_term and len(clean_term) > 5 and all(w not in stopwords for w in clean_term.split()):
                        keywords.append({
                            'keyword': clean_term,
                            'frequency': 1
                        })
            
            # Only include job if it has description and keywords
            if description and keywords:
                items.append({
                    'id': job_id,
                    'text': description,
                    'keywords': keywords
                })
                
        except Exception as e:
            print(f"Error processing row {i}: {e}")
            continue
    
    print(f"Successfully parsed {len(items)} items from CSV")
    if items:
        print(f"Sample item: {items[0]['id']} with {len(items[0]['keywords'])} keywords")
        print(f"Sample keywords: {items[0]['keywords'][:3]}")
    
    return items
