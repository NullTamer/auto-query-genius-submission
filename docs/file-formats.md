
# File Format Support

Auto Query Genius supports the following file formats:

## Input Formats

- **Text (.txt)**: Plain text job descriptions
- **PDF (.pdf)**: Scanned or digital PDF documents
- **Word (.docx)**: Microsoft Word documents

## Data Formats

- **JSON (.json)**: For benchmark datasets and saved results
- **CSV (.csv)**: For datasets like those from HuggingFace

## JSON Format Example

Example of a benchmark dataset in JSON format:

```json
[
  {
    "job_description": "Software Engineer with 5+ years of experience in Python...",
    "expected_keywords": ["Software Engineer", "Python", "5+ years"]
  },
  {
    "job_description": "Data Scientist proficient in machine learning algorithms...",
    "expected_keywords": ["Data Scientist", "machine learning"]
  }
]
```

## CSV Format Example

Example of a benchmark dataset in CSV format:

```csv
job_description,expected_keywords
"Software Engineer with 5+ years of experience in Python...","Software Engineer,Python,5+ years"
"Data Scientist proficient in machine learning algorithms...","Data Scientist,machine learning"
```
