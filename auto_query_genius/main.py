
#!/usr/bin/env python3
"""
Auto Query Genius - Main CLI interface

This module provides the command-line interface for the Auto Query Genius package,
allowing users to process job descriptions and evaluate keyword extraction performance.
"""

import sys
import json

from auto_query_genius.cli import parse_arguments, validate_arguments
from auto_query_genius.processor import (
    process_job_description, 
    read_text_from_file, 
    save_results, 
    run_evaluation,
    launch_web_server
)

def main():
    """Main entry point for the CLI application."""
    try:
        # Parse command line arguments
        args = parse_arguments()
        
        # Handle web application launch
        if args.web:
            return launch_web_server(port=args.port)
        
        try:
            # Validate arguments
            validate_arguments(args)
        except (FileNotFoundError, ValueError) as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            return 1
        
        # Handle evaluation
        if args.evaluate:
            try:
                results = run_evaluation(args.evaluate, use_ai=args.use_ai, gemini_api_key=args.gemini_api_key)
                print("\n=== EVALUATION RESULTS ===")
                print(f"Precision: {results['precision']:.2f}")
                print(f"Recall: {results['recall']:.2f}")
                print(f"F1 Score: {results['f1_score']:.2f}")
                return 0
            except json.JSONDecodeError:
                print(f"Error: File '{args.evaluate}' is not valid JSON.", file=sys.stderr)
                return 1
            except Exception as e:
                print(f"Unexpected error during evaluation: {e}", file=sys.stderr)
                return 1
        
        # Get job description from either text or file
        job_description = ""
        if args.text:
            if not args.text.strip():
                print("Error: Job description text cannot be empty.", file=sys.stderr)
                return 1
            job_description = args.text
        else:  # args.file must be true since one is required
            try:
                job_description = read_text_from_file(args.file)
            except Exception as e:
                print(f"Error: {str(e)}", file=sys.stderr)
                return 1
        
        # Process the job description
        try:
            keywords, query = process_job_description(
                job_description, 
                use_ai=args.use_ai, 
                gemini_api_key=args.gemini_api_key
            )
            
            if not keywords:
                print("Warning: No keywords were extracted from the job description.", file=sys.stderr)
            
            # Print results
            print("\n=== EXTRACTED KEYWORDS ===")
            for i, kw in enumerate(keywords, 1):
                # Handle both 'frequency' and 'score' keys for backward compatibility
                value = kw.get('score', kw.get('frequency', 0))
                print(f"{i}. {kw['keyword']} (score: {value:.2f})")
            
            print("\n=== GENERATED BOOLEAN QUERY ===")
            print(query)
            
            # Save results to file if --save option is specified
            if args.save:
                try:
                    output_path = save_results(args.save, keywords, query)
                    print(f"\nResults saved to: {output_path}")
                except Exception as e:
                    print(f"Error saving results to file: {e}", file=sys.stderr)
                    return 1
            
            return 0
        except ImportError as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            print("Make sure to install required dependencies with: pip install -r requirements.txt", file=sys.stderr)
            print("And download the spaCy model with: python -m spacy download en_core_web_sm", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error processing job description: {e}", file=sys.stderr)
            return 1
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
