
#!/bin/bash

echo "========================================"
echo "Auto Query Genius Launch Script"
echo "========================================"
echo

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found."
    echo "Please run setup.sh first to install dependencies."
    read -p "Press Enter to exit..."
    exit 1
fi

# Parse command line arguments
USE_AI=false
PORT=8080
MOCK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --use-ai)
            USE_AI=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --mock-mode)
            MOCK_MODE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo "Starting Auto Query Genius on port $PORT..."
echo

# Activate the virtual environment and run the application
source venv/bin/activate

if [ "$USE_AI" = true ]; then
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "Warning: --use-ai flag is set but GEMINI_API_KEY environment variable is not set."
        echo "Please set your API key with: export GEMINI_API_KEY=your-api-key-here"
        echo
    fi
    echo "Running with AI features enabled..."
    echo
    python -m auto_query_genius.main --web --port $PORT --use-ai
else
    python -m auto_query_genius.main --web --port $PORT
fi

echo
echo "Server stopped. Press Enter to exit..."
read
