
# Installation Guide

## Using the Setup and Run Scripts (Recommended)

The easiest way to get started with Auto Query Genius is to use the provided scripts:

### Windows
```bash
# First, run the setup script to install dependencies
setup.bat

# Then, run the application
run.bat
```

### Linux/Mac
```bash
# Make the scripts executable first
chmod +x setup.sh
chmod +x run.sh

# First, run the setup script to install dependencies
./setup.sh

# Then, run the application
./run.sh
```

These scripts will:
1. Create a Python virtual environment
2. Install all dependencies
3. Download the spaCy language model
4. Build the React frontend
5. Start the web server

The scripts also handle common errors and provide troubleshooting guidance.

## Script Options

The run scripts support optional flags:
```bash
# Enable AI-powered extraction
run.bat --use-ai

# Use a custom port (default is 8080)
run.bat --port 9000

# Enable mock mode for testing
run.bat --mock-mode
```

## Manual Installation

If you prefer to install the components manually:

```bash
# Clone the repository
git clone https://github.com/NullTamer/auto-query-genius-recruiter.git
cd auto-query-genius-recruiter

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download the required spaCy model
python -m spacy download en_core_web_sm

# If the above fails, try this alternative method:
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl

# For the full frontend application with React
npm install
npm run build

# Install the package in development mode (optional)
pip install -e .
```

## API Key Setup (Optional)

For enhanced extraction using Gemini AI:

1. Obtain a Gemini API key from Google AI Studio
2. Set your API key as an environment variable:

```bash
# Linux/Mac
export GEMINI_API_KEY="your-api-key-here"

# Windows
set GEMINI_API_KEY=your-api-key-here
```

## Troubleshooting

If you encounter issues during installation:

1. **spaCy Model Installation Fails**: Try the direct download method:
   ```
   pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
   ```

2. **Python Virtual Environment Issues**: Ensure you have the venv module installed:
   ```
   # Ubuntu/Debian
   sudo apt-get install python3-venv
   
   # Fedora
   sudo dnf install python3-venv
   ```

3. **Script Closes Too Quickly**: Run the scripts from a command prompt that you opened manually to see error messages.

For more troubleshooting help, refer to the [Troubleshooting Guide](./troubleshooting.md).
