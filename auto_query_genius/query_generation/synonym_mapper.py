
"""
Synonym mapper for query expansion.

This module provides functionality to map terms to their synonyms and related terms,
which can be used for query expansion in search applications.
"""

from typing import Dict, List


class SynonymMapper:
    """
    A class to manage mappings between terms and their synonyms or related terms.
    
    This provides a knowledge base for term expansion when generating Boolean queries.
    """
    
    @staticmethod
    def get_synonym_mappings() -> Dict[str, List[str]]:
        """
        Initialize mappings of terms to their related terms/synonyms.
        
        Returns:
            Dict[str, List[str]]: Dictionary mapping terms to lists of related terms
        """
        # Technical skills and their related terms
        tech_synonyms = {
            'python': ['python3', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch', 'tensorflow'],
            'javascript': ['js', 'typescript', 'node.js', 'react', 'angular', 'vue', 'express'],
            'java': ['spring', 'spring boot', 'hibernate', 'j2ee', 'jakarta ee', 'jvm'],
            'c#': ['dotnet', '.net', 'asp.net', 'entity framework', 'xamarin'],
            'c++': ['c plus plus', 'stl', 'boost', 'qt', 'unreal engine'],
            'react': ['reactjs', 'react.js', 'redux', 'react native', 'react hooks'],
            'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'dynamodb', 'cloudformation'],
            'azure': ['microsoft azure', 'azure devops', 'azure functions', 'cosmos db'],
            'gcp': ['google cloud', 'google cloud platform', 'bigquery', 'cloud functions'],
            'docker': ['containerization', 'kubernetes', 'container', 'docker-compose'],
            'kubernetes': ['k8s', 'container orchestration', 'helm', 'kubectl'],
            'machine learning': ['ml', 'deep learning', 'neural networks', 'nlp', 'ai'],
            'data science': ['analytics', 'data mining', 'statistics', 'predictive modeling', 'business intelligence'],
            'database': ['sql', 'nosql', 'rdbms', 'mongodb', 'mysql', 'postgresql', 'oracle'],
            'devops': ['ci/cd', 'continuous integration', 'continuous deployment', 'jenkins', 'github actions'],
            'frontend': ['front-end', 'ui', 'user interface', 'html', 'css', 'javascript'],
            'backend': ['back-end', 'server-side', 'api', 'database', 'middleware'],
            'fullstack': ['full-stack', 'full stack', 'frontend', 'backend', 'web development'],
        }
        
        # Roles and their related terms
        role_synonyms = {
            'software engineer': ['developer', 'programmer', 'coder', 'software developer', 'application developer'],
            'data scientist': ['data analyst', 'machine learning engineer', 'ml engineer', 'statistician'],
            'devops engineer': ['platform engineer', 'sre', 'site reliability engineer', 'infrastructure engineer'],
            'product manager': ['product owner', 'pm', 'technical product manager', 'program manager'],
            'frontend developer': ['ui developer', 'web developer', 'front end engineer', 'ui engineer'],
            'backend developer': ['back end engineer', 'api developer', 'server-side developer'],
            'fullstack developer': ['full stack engineer', 'web developer', 'software engineer'],
            'cloud engineer': ['cloud architect', 'cloud developer', 'infrastructure engineer', 'aws engineer'],
            'data engineer': ['big data engineer', 'etl developer', 'data pipeline engineer'],
            'security engineer': ['cybersecurity engineer', 'infosec engineer', 'security analyst'],
        }
        
        # Soft skills and their related terms
        skill_synonyms = {
            'agile': ['scrum', 'kanban', 'sprint', 'agile methodologies', 'jira'],
            'communication': ['verbal communication', 'written communication', 'presentation skills', 'interpersonal'],
            'leadership': ['team lead', 'management', 'mentoring', 'strategic thinking'],
            'problem solving': ['analytical thinking', 'critical thinking', 'troubleshooting', 'debugging'],
            'teamwork': ['collaboration', 'cooperative', 'team player', 'cross-functional'],
        }
        
        # Combine all mappings
        combined_mappings = {}
        combined_mappings.update(tech_synonyms)
        combined_mappings.update(role_synonyms)
        combined_mappings.update(skill_synonyms)
        
        return combined_mappings

