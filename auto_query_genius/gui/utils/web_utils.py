
"""
Auto Query Genius - Web Utilities

This module provides web-related utility functions for the GUI.
"""

import webbrowser
import urllib.parse
import re

def open_web_version():
    """Open the web version of Auto Query Genius."""
    webbrowser.open("https://auto-query-genius.netlify.app/")

def open_documentation():
    """Open the documentation for Auto Query Genius."""
    webbrowser.open("https://github.com/yourusername/auto-query-genius-python/wiki")

def open_url(url):
    """Open a URL in the default web browser."""
    webbrowser.open(url)

def simplify_github_query(query):
    """
    Simplify a query for GitHub search to avoid issues with their limits.
    
    Args:
        query (str): The complex Boolean query
        
    Returns:
        str: A simplified query suitable for GitHub
    """
    # If query is empty, return a default value
    if not query or not query.strip():
        return "developer"
        
    # If query is too long, extract key terms without boolean operators
    if len(query) > 200:
        # Remove boolean operators and parentheses
        simplified = re.sub(r'\sAND\s|\sOR\s|\sNOT\s', ' ', query)
        simplified = re.sub(r'[()]', '', simplified)
        # Split into words, filter short words, take only the top 6
        terms = [w for w in simplified.split() if len(w) > 3][:6]
        return ' '.join(terms)
    
    # For shorter queries, just clean up any complex boolean syntax
    cleaned = query.replace('(', '').replace(')', '').replace(' AND ', ' ').replace(' OR ', ' ')
    
    # Ensure the query isn't too long for GitHub - they have strict limits
    if len(cleaned) > 100:
        words = cleaned.split()
        return ' '.join(words[:6])  # Take only first 6 words
        
    return cleaned

def open_query_in_job_board(query, provider="google"):
    """
    Open a candidate search query in the specified provider.
    
    Args:
        query (str): The search query to use
        provider (str): The profile provider (google, linkedin, indeed, etc.)
    """
    # Check if query is empty
    if not query or not query.strip():
        query = "developer"  # Default fallback search term
    
    # Clean up query
    clean_query = ' '.join(query.split())
    
    # For GitHub, simplify the query to avoid search issues
    if provider.lower() == "github":
        clean_query = simplify_github_query(clean_query)
        print(f"GitHub search query simplified to: {clean_query}")
    
    encoded_query = urllib.parse.quote(clean_query)
    
    # Construct the search URL based on the provider
    if provider == "google":
        # Google search for profiles
        url = f"https://www.google.com/search?q={encoded_query}+resume+OR+CV+OR+profile"
    elif provider == "linkedin":
        # LinkedIn People search
        url = f"https://www.linkedin.com/search/results/people/?keywords={encoded_query}"
    elif provider == "indeed":
        # Indeed resume search
        url = f"https://www.indeed.com/resume?q={encoded_query}"
    elif provider == "github":
        # GitHub users search with improved parameters
        url = f"https://github.com/search?q={encoded_query}&type=users"
    elif provider == "stackoverflow":
        # Stack Overflow users search
        url = f"https://stackoverflow.com/users?tab=reputation&filter=all&search={encoded_query}"
    elif provider == "twitter":
        # Twitter profiles search
        url = f"https://twitter.com/search?q={encoded_query}%20developer%20OR%20engineer&f=user"
    elif provider == "wellfound":
        # Wellfound (formerly AngelList) candidate search
        url = f"https://wellfound.com/candidates?q={encoded_query}"
    else:
        # Default to Google
        url = f"https://www.google.com/search?q={encoded_query}+profile+OR+CV+OR+resume"
    
    # Open the URL in the default web browser
    print(f"Opening URL: {url}")
    webbrowser.open(url)

def optimize_query_for_provider(query, provider):
    """
    Optimize a search query for a specific provider.
    
    Args:
        query (str): The search query to optimize
        provider (str): The provider to optimize for
    
    Returns:
        str: The optimized query
    """
    # Check if query is empty
    if not query or not query.strip():
        return "developer"  # Default fallback search term
        
    # Basic cleaning first - remove extra spaces
    clean_query = ' '.join(query.split())
    
    if provider == "github":
        # For GitHub, simplify the query to avoid search issues
        return simplify_github_query(clean_query)
    
    # For other providers, just return the cleaned query
    return clean_query
