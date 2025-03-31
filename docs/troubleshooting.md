
# Troubleshooting

## Installation Issues

### Script Closes During Installation

**Issue**: The installation script closes unexpectedly during the installation process  
**Solution**: 
- Run the script from a command prompt/terminal that you opened manually
- Check for error messages before the window closes
- Try running individual installation steps manually:
  ```bash
  # Create and activate virtual environment
  python -m venv venv
  # On Windows:
  venv\Scripts\activate
  # On Linux/Mac:
  source venv/bin/activate
  
  # Install dependencies
  pip install -r requirements.txt
  
  # Download spaCy model
  python -m spacy download en_core_web_sm
  
  # Install Node.js dependencies
  npm install
  
  # Build frontend
  npm run build
  ```

### Node.js Dependency Issues

**Issue**: Errors during Node.js dependency installation  
**Solution**: 
- Ensure Node.js is updated to the latest LTS version
- Clear npm cache: `npm cache clean --force`
- Try running with verbose logging: `npm install --verbose`
- If specific packages are failing, try installing them individually

### Missing Dependencies

**Issue**: Import or module not found errors  
**Solution**: Run the full installation command:
```bash
pip install -r requirements.txt
```

### SpaCy Model Missing

**Issue**: "Can't find model 'en_core_web_sm'" error  
**Solution**: Download the required SpaCy model:
```bash
python -m spacy download en_core_web_sm
```

If the above fails, try the direct installation:
```bash
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
```

### API Key Errors

**Issue**: Gemini API authentication failures  
**Solution**: Set environment variable correctly:
```bash
# Linux/Mac
export GEMINI_API_KEY="your-key"

# Windows
set GEMINI_API_KEY=your-key
```

### Port Already in Use

**Issue**: "Address already in use" when starting web server  
**Solution**: Specify a different port:
```bash
python -m auto_query_genius.main --web --port 9000
```

### Import Errors

**Issue**: Import errors after installation  
**Solution**: Install the package in development mode:
```bash
pip install -e .
```

### Processing Errors

**Issue**: Errors when processing job descriptions  
**Solution**: Check console logs for detailed error messages, ensure input text is valid

### Evaluation Metrics All Zero

**Issue**: Evaluation results showing all zeros  
**Solution**: 
- Ensure your dataset format is correct
- Check that your API key is valid (if using --use-ai)
- Verify the expected_keywords field contains valid keywords

## Performance Considerations

Typical baseline performance values in evaluation:
- Precision: ~21%
- Recall: ~19%
- F1 Score: ~20%

AI-enhanced extraction typically shows 15-20% improvement.
