
#!/bin/bash

echo "========================================"
echo "Auto Query Genius Setup Script"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8 or higher from python.org"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from nodejs.org"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Step 1: Creating Python virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Error: Failed to create virtual environment"
    echo "This could be due to missing Python venv module or permissions."
    echo "Try installing python3-venv package or use sudo if needed."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Step 2: Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Error: Failed to activate virtual environment"
    echo "Check if the venv directory was created properly."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Step 3: Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install Python dependencies"
    echo "This could be due to network issues or package conflicts."
    echo "Check your connection and try again."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Step 4: Downloading spaCy language model..."
echo "This step might take some time, please be patient..."
pip install spacy
python -m spacy download en_core_web_sm
if [ $? -ne 0 ]; then
    echo "Warning: Failed to download spaCy language model"
    echo "Attempting alternate installation method..."
    pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
    if [ $? -ne 0 ]; then
        echo "Error: All attempts to install spaCy model failed"
        echo "Please try manually with: python -m spacy download en_core_web_sm"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

echo "Step 5: Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo
    echo "========================================"
    echo "Error: Failed to install Node.js dependencies"
    echo "This may be due to network issues or package conflicts."
    echo "========================================"
    echo
    echo "Auto Query Genius can still run with limited functionality."
    echo "Press Enter to continue..."
    read
    SKIP_FRONTEND=true
else
    SKIP_FRONTEND=false
fi

if [ "$SKIP_FRONTEND" = false ]; then
    echo "Step 6: Building React frontend..."
    npm run build
    if [ $? -ne 0 ]; then
        echo
        echo "========================================"
        echo "Error: Failed to build React frontend"
        echo "This may be due to JavaScript errors in the codebase."
        echo "========================================"
        echo
        echo "Auto Query Genius can still run with limited functionality."
        echo "Press Enter to continue..."
        read
    fi
fi

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "You can now run Auto Query Genius using run.sh"
echo
read -p "Press Enter to exit..."
