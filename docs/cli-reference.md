
# Command Line Reference

## Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `--text TEXT` | Job description text to process | `--text "Python developer"` |
| `--file PATH` | Path to file containing job description | `--file job.txt` |
| `--evaluate PATH` | Path to benchmark dataset for evaluation | `--evaluate dataset.csv` |
| `--web` | Launch the web application | `--web` |
| `--port PORT` | Port for web server (default: 8080) | `--web --port 9000` |
| `--save PATH` | Save results to JSON file | `--save results.json` |
| `--use-ai` | Use AI for keyword extraction | `--use-ai` |
| `--gemini-api-key KEY` | Gemini API key | `--gemini-api-key "key"` |

## Common Commands

### Process job description directly:
```bash
python -m auto_query_genius.main --text "Python developer with 5+ years of experience"
```

### Process job description from file:
```bash
python -m auto_query_genius.main --file path/to/job_description.txt
```

### Run evaluation on benchmark dataset:
```bash
python -m auto_query_genius.main --evaluate dataset.json
```

### Launch web application:
```bash
python -m auto_query_genius.main --web --port 9000
```

### Use AI-powered extraction:
```bash
python -m auto_query_genius.main --text "Data Engineer" --use-ai --gemini-api-key "your-key"
```

### Save extraction results:
```bash
python -m auto_query_genius.main --file job.txt --save results.json
```
