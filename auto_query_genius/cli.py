
#!/usr/bin/env python3
"""
Auto Query Genius - CLI argument parser

This module provides command-line interface argument parsing functionality
for the Auto Query Genius package.
"""

import argparse
import os

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Auto Query Genius: Extract keywords and generate Boolean queries from job descriptions"
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--text", 
        type=str,
        help="Job description text to process"
    )
    group.add_argument(
        "--file", 
        type=str,
        help="Path to file containing job description"
    )
    group.add_argument(
        "--evaluate", 
        type=str,
        help="Path to benchmark dataset for evaluation (JSON or CSV)"
    )
    group.add_argument(
        "--web",
        action="store_true",
        help="Launch the web application"
    )
    
    parser.add_argument(
        "--save",
        type=str,
        help="Save results to the specified JSON file"
    )

    parser.add_argument(
        "--use-ai",
        action="store_true",
        help="Use AI (Gemini API) for keyword extraction"
    )
    
    parser.add_argument(
        "--gemini-api-key",
        type=str,
        help="Gemini API key (if not provided, will use GEMINI_API_KEY environment variable)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8080,
        help="Port to run the web server on (default: 8080)"
    )
    
    args = parser.parse_args()
    
    # If --use-ai is set but no API key is provided through args, try to get it from env
    if args.use_ai and not args.gemini_api_key:
        # Try multiple possible environment variable names
        for env_var in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY", "GOOGLE_GEMINI_API_KEY"]:
            args.gemini_api_key = os.environ.get(env_var)
            if args.gemini_api_key:
                print(f"Using Gemini API key from environment variable: {env_var}")
                break
    
    return args

def validate_arguments(args):
    """Validate command line arguments."""
    if args.evaluate and not os.path.exists(args.evaluate):
        raise FileNotFoundError(f"Evaluation file '{args.evaluate}' not found.")
            
    if args.evaluate and os.path.splitext(args.evaluate.lower())[1] not in ['.json', '.csv']:
        raise ValueError(f"Evaluation file must be a JSON or CSV file. Got '{args.evaluate}'.")
    
    if args.file and not os.path.exists(args.file):
        raise FileNotFoundError(f"File '{args.file}' not found.")
    
    # If using AI, warn about missing API key but don't raise an error
    if getattr(args, 'use_ai', False) and not getattr(args, 'gemini_api_key', None):
        print("Warning: Using AI extraction but no Gemini API key found in arguments or environment variables.")
        print("AI extraction may fail. Set the GEMINI_API_KEY environment variable or use --gemini-api-key.")
    
    return True
