
"""
Auto Query Genius - Web Server Module

This module provides functionality to serve the React web application and handle API requests.
It implements a custom HTTP server that serves static files for the web application
and processes API requests for job description analysis.

The web server provides the following endpoints:
- GET /: Serves the main application page
- POST /api/process: Processes a job description and returns extracted keywords and a query

Features:
- Automatic port selection if the specified port is in use
- CORS support for cross-origin requests
- JSON response formatting
- Error handling for API requests
- Automatic browser opening on server start

Usage:
    from auto_query_genius.web_server import start_web_server
    
    start_web_server(port=8080)
"""

import os
import sys
import http.server
import socketserver
import json
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import subprocess
import shutil

# Import the query generator to process API requests
from auto_query_genius.query_generator import QueryGenerator

# Get the path to the web application directory
SCRIPT_DIR = Path(__file__).parent.absolute()
WEB_DIR = SCRIPT_DIR.parent / "dist"
INDEX_HTML = SCRIPT_DIR.parent / "index.html"
PUBLIC_DIR = SCRIPT_DIR.parent / "public"

# Default standalone HTML template that doesn't require building the React app
STANDALONE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Query Genius</title>
    <style>
        :root {
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --background: #ffffff;
            --text: #333333;
            --border: #e5e7eb;
            --card-bg: #f9fafb;
        }
        
        @media (prefers-color-scheme: dark) {
            :root {
                --primary: #3b82f6;
                --primary-hover: #60a5fa;
                --background: #1f2937;
                --text: #f3f4f6;
                --border: #374151;
                --card-bg: #111827;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background);
            color: var(--text);
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        
        h1, h2, h3 {
            color: var(--primary);
        }
        
        header {
            margin-bottom: 40px;
            text-align: center;
        }
        
        textarea {
            width: 100%;
            height: 200px;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid var(--border);
            border-radius: 6px;
            background-color: var(--background);
            color: var(--text);
            font-family: inherit;
            resize: vertical;
        }
        
        button {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: var(--primary-hover);
        }
        
        button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }
        
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .keyword-list {
            list-style-type: none;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .keyword-item {
            background-color: var(--primary);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
        }
        
        .query-box {
            background-color: var(--card-bg);
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            white-space: pre-wrap;
            word-break: break-word;
            border: 1px solid var(--border);
        }
        
        .ai-toggle {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .ai-toggle input {
            margin-right: 10px;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .copy-btn {
            background-color: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
            padding: 5px 10px;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .error {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #f87171;
        }
        
        @media (max-width: 640px) {
            body {
                padding: 10px;
            }
            
            .container {
                gap: 15px;
            }
            
            textarea {
                height: 150px;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Auto Query Genius</h1>
        <p>Extract keywords and generate optimized boolean search queries from job descriptions.</p>
    </header>
    
    <div class="container">
        <div class="card">
            <h2>Job Description</h2>
            <textarea id="jobDescription" placeholder="Paste your job description here..."></textarea>
            <div class="ai-toggle">
                <label>
                    <input type="checkbox" id="useAI"> Use AI for advanced extraction
                </label>
            </div>
            <button id="processButton">Extract Keywords</button>
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
        
        <div id="results" style="display: none;">
            <div class="card">
                <h2>Extracted Keywords</h2>
                <ul id="keywordsList" class="keyword-list"></ul>
            </div>
            
            <div class="card">
                <h2>Boolean Search Query</h2>
                <div id="queryText" class="query-box"></div>
                <button id="copyQuery" class="copy-btn">Copy Query</button>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('processButton').addEventListener('click', function() {
            const jobDescription = document.getElementById('jobDescription').value;
            const useAI = document.getElementById('useAI').checked;
            const errorElement = document.getElementById('error');
            
            errorElement.style.display = 'none';
            
            if (!jobDescription.trim()) {
                errorElement.textContent = 'Please enter a job description';
                errorElement.style.display = 'block';
                return;
            }
            
            // Show loading state
            this.innerHTML = 'Processing... <span class="loading"></span>';
            this.disabled = true;
            
            fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jobDescription: jobDescription,
                    useAI: useAI
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display keywords
                    const keywordsList = document.getElementById('keywordsList');
                    keywordsList.innerHTML = '';
                    
                    data.keywords.forEach((kw, index) => {
                        const score = kw.score || kw.frequency || 0;
                        const li = document.createElement('li');
                        li.className = 'keyword-item';
                        li.innerHTML = `${kw.keyword} <small>(${score.toFixed(2)})</small>`;
                        keywordsList.appendChild(li);
                    });
                    
                    // Display query
                    document.getElementById('queryText').innerText = data.query;
                    
                    // Show results
                    document.getElementById('results').style.display = 'block';
                } else {
                    errorElement.textContent = 'Error: ' + (data.error || 'Unknown error occurred');
                    errorElement.style.display = 'block';
                }
            })
            .catch(error => {
                errorElement.textContent = 'Error processing job description: ' + error;
                errorElement.style.display = 'block';
            })
            .finally(() => {
                // Reset button
                this.innerHTML = 'Extract Keywords';
                this.disabled = false;
            });
        });
        
        document.getElementById('copyQuery').addEventListener('click', function() {
            const queryText = document.getElementById('queryText').innerText;
            navigator.clipboard.writeText(queryText)
                .then(() => {
                    const originalText = this.innerText;
                    this.innerText = 'Copied!';
                    setTimeout(() => {
                        this.innerText = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        });
    </script>
</body>
</html>
"""

class AutoQueryGeniusRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom request handler for serving the web application and processing API requests.
    
    This handler serves static files from the web application directory and
    processes API requests at the /api/* endpoints. It supports CORS for cross-origin
    requests and provides JSON responses for API endpoints.
    """
    
    def __init__(self, *args, **kwargs):
        # Initialize the query generator
        self.query_generator = QueryGenerator()
        
        # Check if web directory exists, if not use standalone mode
        self.standalone_mode = not WEB_DIR.exists() or not (WEB_DIR / "index.html").exists()
        
        if self.standalone_mode:
            print(f"Warning: Could not find web assets directory. Using {SCRIPT_DIR.parent}")
            # No need to set a specific directory for standalone mode
            super().__init__(*args, **kwargs)
        else:
            # Use the web directory for serving files
            super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        """
        Handle GET requests, serving either static files or the standalone HTML template.
        """
        if self.standalone_mode and self.path == '/':
            # In standalone mode, serve our embedded HTML directly
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(STANDALONE_HTML.encode('utf-8'))
            return
        elif self.standalone_mode and self.path == '/favicon.ico':
            # Try to serve favicon from public directory if it exists
            favicon_path = PUBLIC_DIR / "favicon.ico"
            if favicon_path.exists():
                self.send_response(200)
                self.send_header('Content-Type', 'image/x-icon')
                self.end_headers()
                with open(favicon_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404)
                return
        elif self.standalone_mode:
            # In standalone mode, return 404 for any other path
            self.send_error(404)
            return
        
        # In non-standalone mode, use default file serving
        return super().do_GET()

    def do_POST(self):
        """
        Handle POST requests for API endpoints.
        
        Supported endpoints:
        - /api/process: Process a job description and return extracted keywords and a query
        
        Request format for /api/process:
        {
            "jobDescription": "...",
            "useAI": true|false
        }
        
        Response format:
        {
            "success": true|false,
            "keywords": [...],
            "query": "...",
            "error": "..." (only if success is false)
        }
        """
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        # Process the API request
        if self.path == '/api/process':
            try:
                data = json.loads(post_data)
                job_description = data.get('jobDescription', '')
                use_ai = data.get('useAI', False)
                
                # Process the job description
                keywords, query = self.query_generator.process_job_description(
                    job_description,
                    use_ai=use_ai
                )
                
                # Prepare the response
                response = {
                    'success': True,
                    'keywords': keywords,
                    'query': query
                }
                
                # Send the response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
                
            except Exception as e:
                # Send error response
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': str(e)
                }).encode('utf-8'))
                return
        
        # Handle unknown endpoints
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': False,
            'error': 'Unknown endpoint'
        }).encode('utf-8'))

    def do_OPTIONS(self):
        """
        Handle OPTIONS requests for CORS preflight.
        
        This method enables CORS by responding to preflight requests with appropriate headers.
        It allows all origins, methods, and headers to facilitate development and testing.
        """
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        """
        Add CORS headers to all responses.
        
        This method overrides the base method to ensure CORS headers are added to all responses,
        not just OPTIONS requests. This enables cross-origin requests from web clients.
        """
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        """
        Override to provide cleaner logging.
        
        This method filters out favicon.ico requests to reduce log noise and provides
        a cleaner format for log messages.
        """
        if self.path != '/favicon.ico':
            sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))

def start_web_server(port=8080, bind="", open_browser=True):
    """
    Start the web server to serve the React application.
    
    This function starts an HTTP server to serve the React application and handle API requests.
    It automatically finds an available port if the specified one is in use and optionally
    opens a web browser to the application URL.
    
    Args:
        port (int): The port to run the server on. Defaults to 8080.
        bind (str): The address to bind the server to. Defaults to "" (all interfaces).
        open_browser (bool): Whether to open a web browser. Defaults to True.
        
    Returns:
        None
        
    Raises:
        SystemExit: If no available port can be found.
    """
    handler = AutoQueryGeniusRequestHandler
    
    # Find an available port if the specified one is in use
    max_port_attempts = 5
    current_port = port
    server = None
    
    for _ in range(max_port_attempts):
        try:
            server = socketserver.TCPServer((bind, current_port), handler)
            break
        except OSError as e:
            if e.errno == 98 or e.errno == 10048:  # Address already in use (Linux/Windows)
                print(f"Port {current_port} is already in use, trying {current_port + 1}...")
                current_port += 1
            else:
                raise
    
    if server is None:
        print(f"Error: Could not find an available port after {max_port_attempts} attempts.", file=sys.stderr)
        sys.exit(1)
    
    url = f"http://localhost:{current_port}"
    print(f"Serving Auto Query Genius web application at {url}")
    
    try:
        if open_browser:
            # Open the web browser
            webbrowser.open(url)
        
        # Start the server
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    finally:
        if server:
            server.server_close()
