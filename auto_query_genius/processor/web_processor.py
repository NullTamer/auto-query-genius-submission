
"""
Auto Query Genius - Web Processor Module

This module contains the web server functionality.
"""

import sys
import signal
import threading
import time
from auto_query_genius.web_server import start_web_server

# Add a global flag to track if server is running
_server_running = False
_server_thread = None

def _signal_handler(sig, frame):
    """Handle interrupt signals to gracefully stop the server."""
    global _server_running
    print("\nServer stopping...")
    _server_running = False
    sys.exit(0)

def launch_web_server(port=8080):
    """
    Launch the web application.
    
    Args:
        port (int): Port to run the web server on
        
    Returns:
        int: Exit code
    """
    global _server_running, _server_thread
    
    # Clean up any existing server thread
    if _server_thread and _server_thread.is_alive():
        print("Stopping existing server thread...")
        _server_running = False
        _server_thread.join(timeout=2.0)  # Wait for thread to finish with timeout
    
    try:
        print(f"Starting Auto Query Genius web application on port {port}...")
        print("Press Ctrl+C to stop the server.")
        print(f"Navigate to http://localhost:{port} in your browser to use Auto Query Genius.")
        
        # Set up signal handling
        signal.signal(signal.SIGINT, _signal_handler)
        
        # Set flag to indicate server is running
        _server_running = True
        
        # Start the web server directly in the main thread
        # This simplifies the process since we're now running in a dedicated script
        start_web_server(port=port)
        
        return 0
    except KeyboardInterrupt:
        print("\nServer stopping due to keyboard interrupt...")
        return 0
    except Exception as e:
        print(f"Error starting web server: {e}", file=sys.stderr)
        return 1
