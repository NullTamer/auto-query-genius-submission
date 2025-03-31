
/**
 * Utility for categorizing keywords based on their nature
 * Mimics the functionality in auto_query_genius/gui/tabs/process_tab/keyword_categorizer.py
 */

import { Keyword } from "@/hooks/useKeywords";

/**
 * Categorize keywords based on their nature (skill, role, etc.)
 */
export function categorizeKeywords(keywords: Keyword[]): Keyword[] {
  // Define category term sets
  const techSkills = new Set([
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
  ]);
  
  const roleTerms = new Set([
    'engineer', 'developer', 'manager', 'architect', 'analyst', 'scientist', 
    'specialist', 'consultant', 'administrator', 'director', 'cto', 'cio', 'ceo',
    'vp', 'lead', 'head', 'principal', 'senior', 'junior', 'associate', 'staff',
    'intern', 'trainee', 'coach', 'mentor', 'coordinator', 'designer', 'researcher',
    'professor', 'instructor', 'tutor', 'teacher', 'trainer', 'fellow', 'apprentice',
    'executive', 'manager', 'supervisor', 'officer', 'strategist', 'evangelist'
  ]);
  
  const qualificationTerms = new Set([
    'phd', 'doctorate', 'master', 'bachelor', 'bs', 'ba', 'ms', 'ma', 'mba', 'bsc',
    'msc', 'btech', 'mtech', 'degree', 'certification', 'certificate', 'diploma',
    'license', 'credential', 'certified', 'qualified', 'graduate', 'postgraduate',
    'undergraduate', 'education', 'training', 'coursework', 'major', 'minor',
    'specialization', 'fellowship', 'scholarship', 'awarded', 'honors', 'distinction'
  ]);
  
  const softSkillTerms = new Set([
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'creativity', 'time management', 'organization', 'negotiation', 'conflict resolution',
    'presentation', 'interpersonal', 'adaptability', 'flexibility', 'resilience',
    'collaboration', 'strategy', 'planning', 'analytical', 'detail oriented', 'motivated',
    'proactive', 'innovative', 'resourceful', 'accountability', 'integrity', 'ethics',
    'emotional intelligence', 'customer focus', 'client management', 'mentoring'
  ]);
  
  const synonymTerms = new Set([
    'related', 'similar', 'synonym', 'alternative', 'variant', 'equivalent'
  ]);
  
  const domainTerms = new Set([
    'finance', 'banking', 'healthcare', 'medical', 'insurance', 'retail', 'e-commerce',
    'media', 'telecom', 'education', 'government', 'manufacturing', 'logistics',
    'automotive', 'aerospace', 'defense', 'energy', 'oil', 'gas', 'pharmaceutical',
    'biotech', 'legal', 'consulting', 'marketing', 'advertising', 'hospitality',
    'travel', 'real estate', 'construction', 'agriculture', 'food', 'beverage',
    'entertainment', 'gaming', 'sports', 'fashion', 'luxury', 'non-profit', 'charity'
  ]);

  return keywords.map(keyword => {
    if (keyword.category) {
      // If already has a category, retain it
      return {...keyword};
    }

    const term = keyword.keyword.toLowerCase();
    let category = 'Other';

    if ('original_term' in keyword) {
      category = 'Related Term';
    } else if (Array.from(techSkills).some(tech => term.includes(tech))) {
      category = 'Technical Skill';
    } else if (Array.from(roleTerms).some(role => term.includes(role))) {
      category = 'Role';
    } else if (Array.from(qualificationTerms).some(qual => term.includes(qual))) {
      category = 'Qualification';
    } else if (Array.from(softSkillTerms).some(skill => term.includes(skill))) {
      category = 'Soft Skill';
    } else if (Array.from(domainTerms).some(domain => term.includes(domain))) {
      category = 'Domain';
    } else if (Array.from(synonymTerms).some(syn => term.includes(syn))) {
      category = 'Related Term';
    }

    // Handle special cases
    if (category === 'Other') {
      // Check for compound terms like "Senior Software Engineer"
      if (term.includes('senior')) {
        category = 'Role';
      }
      
      // Check for years of experience patterns
      if ((term.includes('years') && term.includes('experience')) || 
          term.includes('yoe') || term.includes('years of')) {
        category = 'Experience';
      }
    }

    return {...keyword, category};
  });
}
