
# Auto Query Genius

## What is Auto Query Genius?

Auto Query Genius is a powerful tool that helps recruiters and hiring managers extract relevant keywords from job descriptions and create optimized search queries for finding suitable candidates. It uses natural language processing and optional AI-powered analysis to create effective Boolean search strategies.

## Live Web Application

For instant access without installation, visit the live web application at:
[https://auto-query-genius-recruiter.vercel.app/](https://auto-query-genius-recruiter.vercel.app/)

## Installation

### Prerequisites

- Python 3.8 or higher
- Internet connection (for AI-powered extraction)

### Quick Setup with Scripts

For a quick setup and launch, use the provided scripts:

#### Windows
```bash
# First, run the setup script to install dependencies
setup.bat

# Then run the application
run.bat
```

#### Linux/Mac
```bash
# Make the script executable first
chmod +x setup.sh
chmod +x run.sh

# First, run the setup script to install dependencies
./setup.sh

# Then run the application
./run.sh
```

These scripts will:
1. Create a Python virtual environment
2. Install all required dependencies
3. Download the required language model
4. Build the React frontend
5. Start the web server

### Script Options

Both scripts support the following options:
```bash
# Use AI-powered extraction
run.bat --use-ai

# Use a custom port
run.bat --port 9000

# Enable mock mode for testing
run.bat --mock-mode
```

### Installation from Source

```bash
# Clone the repository
git clone https://github.com/NullTamer/auto-query-genius-submission.git
cd auto-query-genius-recruiter

# Install dependencies
pip install -r requirements.txt

# Download required language model
python -m spacy download en_core_web_sm
```

## Using Auto Query Genius

Auto Query Genius offers three ways to use the application:

1. **Command-line interface** - Quick processing of job descriptions
2. **Desktop application** - User-friendly graphical interface
3. **Web application** - Access through a web browser

### Command-Line Interface

Process a job description and get keywords and Boolean queries:

```bash
# Process text directly
python -m auto_query_genius.main --text "Python developer with 5+ years experience"

# Process from a file
python -m auto_query_genius.main --file job_description.txt

# Save results from text directly
python -m auto_query_genius.main --text "Python developer with 5+ years experience" --save results.json

# Save results from a file
python -m auto_query_genius.main --file job_description.txt --save results.json
```

### Desktop GUI Application

The simplest way to run the GUI application:

```bash
# Launch the GUI application directly
python -m auto_query_genius.gui.main_app
```

For Windows users: If you get an error about Tkinter, it should be included with your Python installation. If it's missing, you may need to reinstall Python and select the "tcl/tk and IDLE" option during installation.

For Linux users: You may need to install Tkinter separately:
```bash
sudo apt-get install python3-tk  # Ubuntu/Debian
sudo dnf install python3-tkinter  # Fedora
```

The GUI provides:
- Process tab: Upload or paste job descriptions
- Search tab: Use generated queries to search job boards
- Evaluation tab: Test the system performance
- About tab: Information about the tool

### Web Application

Start the web server locally:

```bash
# Start the web server
python -m auto_query_genius.main --web

# Use a custom port (optional)
python -m auto_query_genius.main --web --port 9000
```

After starting the server, open a browser and navigate to http://localhost:8080 (or your specified port).

Alternatively, use the hosted version at: [https://auto-query-genius-recruiter.vercel.app/](https://auto-query-genius-recruiter.vercel.app/)

## AI-Powered Extraction (Optional)

For enhanced keyword extraction, set up Gemini API:

1. Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set it as an environment variable:

```bash
# Windows Command Prompt
set GEMINI_API_KEY=your-api-key-here

# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"

# Linux/Mac
export GEMINI_API_KEY="your-api-key-here"
```

3. Use the `--use-ai` flag with any command:

```bash
python -m auto_query_genius.main --file job_description.txt --use-ai
```

## Documentation

For more detailed information, please refer to the following documentation:

- [Installation Guide](./docs/installation.md) - Detailed installation instructions
- [File Format Support](./docs/file-formats.md) - Details about supported file formats
- [Command Line Reference](./docs/cli-reference.md) - Complete command line interface reference
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and their solutions

## Troubleshooting

### Common Issues

1. **Missing language model**: If you see an error about missing the spaCy model, run:
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **API key errors**: Verify your API key is correctly set in your current terminal session

3. **Port already in use**: Try a different port:
   ```bash
   python -m auto_query_genius.main --web --port 9000
   ```

4. **GUI won't start**: Verify Tkinter is installed correctly:
   ```bash
   python -c "import tkinter; print('Tkinter is installed')"
   ```

## Getting Help

If you encounter any issues or have questions, please visit:
- [GitHub Issues](https://github.com/NullTamer/auto-query-genius-recruiter/issues)
- [Documentation](https://github.com/NullTamer/auto-query-genius-recruiter/docs)
