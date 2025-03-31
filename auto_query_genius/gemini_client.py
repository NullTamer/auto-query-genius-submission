"""
Gemini API Client Module

This module provides a client for Google's Gemini API to extract keywords from job descriptions.
"""

import os
import json
import time
import requests
from typing import List, Dict, Any, Optional, Union

class GeminiClient:
    """
    A client for the Google Gemini API to extract keywords from job descriptions.
    
    This client implements functionality similar to the web version's GeminiService.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini API client.
        
        Args:
            api_key (Optional[str]): The Gemini API key. If not provided, it will try to get it from environment variables.
        """
        # First check the passed API key parameter
        self.api_key = api_key
        
        # If no API key provided, try to get it from environment variables with multiple possible names
        if not self.api_key:
            # Try multiple possible environment variable names
            for env_var in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY", "GOOGLE_GEMINI_API_KEY"]:
                self.api_key = os.environ.get(env_var)
                if self.api_key:
                    print(f"Using Gemini API key from environment variable: {env_var}")
                    break
        
        # If still no API key found, raise an error
        if not self.api_key:
            raise ValueError(
                "Gemini API key is required. Please provide it as an argument or set the GEMINI_API_KEY environment variable."
            )
        
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    
    def extract_keywords(self, job_description: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from a job description using the Gemini API.
        
        Args:
            job_description (str): The job description text
            
        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing keywords and their scores
        """
        # Add delay to prevent API rate limiting
        time.sleep(2)
        
        # Prepare the prompt
        prompt = f"""
        You are an expert recruiter and hiring manager with deep expertise in technical roles.
        
        Please extract the most important skills, technologies, and requirements from the job description below.
        
        Return ONLY a JSON array of objects with the format:
        [{{"keyword": "Skill or Technology Name", "frequency": number representing importance from 1-5}}]
        
        Do not include any markdown, explanation, or other text, just the JSON array.
        Sort them by frequency (importance) in descending order.
        
        JOB DESCRIPTION:
        {job_description}
        """
        
        # Prepare the API request
        url = f"{self.endpoint}?key={self.api_key}"
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "topK": 32,
                "topP": 1,
                "maxOutputTokens": 1024,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json",
        }
        
        # Make the API request
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            ai_response = response.json()
            
            if not ai_response.get("candidates") or not ai_response["candidates"][0].get("content") or not ai_response["candidates"][0]["content"].get("parts"):
                print("Invalid response structure from Gemini API")
                # Return empty list as fallback instead of raising error
                return []
            
            # Extract the text from the response
            response_text = ai_response["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up any markdown code formatting that might be in the response
            clean_json = response_text.replace("```json", "").replace("```", "").strip()
            
            try:
                # Parse the JSON array from the response
                keywords_data = json.loads(clean_json)
                
                # Convert to the format our application expects
                keywords = []
                for item in keywords_data:
                    if not isinstance(item, dict):
                        continue
                    keywords.append({
                        "keyword": item.get("keyword", "").lower(),
                        "score": float(item.get("frequency", 1))
                    })
                
                return keywords
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON from Gemini API: {e}")
                print(f"Raw response: {response_text}")
                # Fallback: try to extract keywords from non-JSON response
                lines = response_text.lower().split("\n")
                keywords = []
                for i, line in enumerate(lines):
                    line = line.strip()
                    if line and not line.startswith("[") and not line.startswith("]"):
                        keywords.append({
                            "keyword": line.replace(",", "").strip(),
                            "score": max(1, 5 - (i // 3))  # Decreasing importance
                        })
                return keywords[:20]  # Limit to 20 keywords
            
        except requests.exceptions.RequestException as e:
            print(f"Error making request to Gemini API: {e}")
            # Return empty list instead of raising error - allows fallback to TF-IDF
            return []
        except (ValueError, KeyError) as e:
            print(f"Error processing response from Gemini API: {e}")
            # Return empty list instead of raising error
            return []
