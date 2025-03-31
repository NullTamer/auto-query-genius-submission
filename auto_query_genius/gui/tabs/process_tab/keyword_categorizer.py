
"""
Auto Query Genius - Keyword Categorizer

This module provides utilities for categorizing keywords based on their nature.
"""

def categorize_keywords(keywords):
    """
    Categorize keywords based on their nature (skill, role, etc.)
    This enhances display by showing what type of term was extracted.
    
    Args:
        keywords (list): List of keyword dictionaries
        
    Returns:
        list: The same list with added category information
    """
    # Add category hints to keywords based on common patterns
    tech_skills = {
        'python', 'java', 'javascript', 'react', 'node', 'aws', 'docker', 'kubernetes', 
        'sql', 'nosql', 'mongodb', 'tensorflow', 'pytorch', 'c++', 'ruby', 'go', 'scala',
        'php', 'html', 'css', 'angular', 'vue', 'flutter', 'swift', 'kotlin', 'typescript',
        'django', 'flask', 'spring', 'hibernate', 'selenium', 'jenkins', 'git', 'azure',
        'gcp', 'cicd', 'ci/cd', 'machine learning', 'deep learning', 'nlp', 'computer vision',
        'ai', 'artificial intelligence', 'data science', 'big data', 'hadoop', 'spark',
        'redis', 'graphql', 'rest api', 'restful', 'microservices', 'frontend', 'backend',
        'full stack', 'cloud', 'devops', 'linux', 'unix', 'bash', 'shell', 'mobile',
        'database', 'networking', 'security', 'hacking', 'penetration testing', 'blockchain',
        'crypto', 'web3', 'data analytics', 'etl', 'tableau', 'power bi', 'qlik', 'looker'
    }
    
    role_terms = {
        'engineer', 'developer', 'manager', 'architect', 'analyst', 'scientist', 
        'specialist', 'consultant', 'administrator', 'director', 'cto', 'cio', 'ceo',
        'vp', 'lead', 'head', 'principal', 'senior', 'junior', 'associate', 'staff',
        'intern', 'trainee', 'coach', 'mentor', 'coordinator', 'designer', 'researcher',
        'professor', 'instructor', 'tutor', 'teacher', 'trainer', 'fellow', 'apprentice',
        'executive', 'manager', 'supervisor', 'officer', 'strategist', 'evangelist'
    }
    
    qualification_terms = {
        'phd', 'doctorate', 'master', 'bachelor', 'bs', 'ba', 'ms', 'ma', 'mba', 'bsc',
        'msc', 'btech', 'mtech', 'degree', 'certification', 'certificate', 'diploma',
        'license', 'credential', 'certified', 'qualified', 'graduate', 'postgraduate',
        'undergraduate', 'education', 'training', 'coursework', 'major', 'minor',
        'specialization', 'fellowship', 'scholarship', 'awarded', 'honors', 'distinction'
    }
    
    soft_skill_terms = {
        'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
        'creativity', 'time management', 'organization', 'negotiation', 'conflict resolution',
        'presentation', 'interpersonal', 'adaptability', 'flexibility', 'resilience',
        'collaboration', 'strategy', 'planning', 'analytical', 'detail oriented', 'motivated',
        'proactive', 'innovative', 'resourceful', 'accountability', 'integrity', 'ethics',
        'emotional intelligence', 'customer focus', 'client management', 'mentoring'
    }
    
    # Identify synonym terms
    synonym_terms = {'related', 'similar', 'synonym', 'alternative', 'variant', 'equivalent'}
    
    # Domain-specific terms
    domain_terms = {
        'finance', 'banking', 'healthcare', 'medical', 'insurance', 'retail', 'e-commerce',
        'media', 'telecom', 'education', 'government', 'manufacturing', 'logistics',
        'automotive', 'aerospace', 'defense', 'energy', 'oil', 'gas', 'pharmaceutical',
        'biotech', 'legal', 'consulting', 'marketing', 'advertising', 'hospitality',
        'travel', 'real estate', 'construction', 'agriculture', 'food', 'beverage',
        'entertainment', 'gaming', 'sports', 'fashion', 'luxury', 'non-profit', 'charity'
    }
    
    categorized = []
    
    for kw in keywords:
        keyword = kw.copy()  # Create a copy to avoid modifying the original
        term = keyword['keyword'].lower()
        
        # If already has a category, retain it
        if 'category' in keyword and keyword['category']:
            categorized.append(keyword)
            continue
            
        # Special category for synonyms/related terms (if they have lower scores)
        if 'original_term' in keyword:
            keyword['category'] = 'Related Term'
        # Assign category based on term matching
        elif any(tech in term for tech in tech_skills):
            keyword['category'] = 'Technical Skill'
        elif any(role in term for role in role_terms):
            keyword['category'] = 'Role'
        elif any(qual in term for qual in qualification_terms):
            keyword['category'] = 'Qualification'
        elif any(skill in term for skill in soft_skill_terms):
            keyword['category'] = 'Soft Skill'
        elif any(domain in term for domain in domain_terms):
            keyword['category'] = 'Domain'
        elif any(syn in term for syn in synonym_terms):
            keyword['category'] = 'Related Term'
        else:
            keyword['category'] = 'Other'
            
        categorized.append(keyword)
    
    # Post-processing to handle special cases
    for kw in categorized:
        # Check for compound terms like "Senior Software Engineer"
        if 'Senior' in kw['keyword'] and kw['category'] == 'Other':
            kw['category'] = 'Role'
        
        # Check for years of experience patterns
        if ('years' in kw['keyword'].lower() and 'experience' in kw['keyword'].lower()) or \
           any(yr_pattern in kw['keyword'].lower() for yr_pattern in ['yoe', 'years of']):
            kw['category'] = 'Experience'
        
    return categorized
