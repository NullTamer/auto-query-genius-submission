
import { SearchProvider } from "../types";

export function validateSearchTerm(searchTerm: string, selectedTerms: string[]): { isValid: boolean; message?: string } {
  if (!searchTerm.trim() && selectedTerms.length === 0) {
    return { isValid: false, message: 'Please enter a search term or select keywords' };
  }
  
  if (searchTerm.length > 500) {
    return { isValid: false, message: 'Search term is too long. Please use a shorter query.' };
  }
  
  // Check for unbalanced parentheses
  const openParens = (searchTerm.match(/\(/g) || []).length;
  const closeParens = (searchTerm.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    return { isValid: false, message: 'Unbalanced parentheses in search term' };
  }
  
  return { isValid: true };
}

export function formatBooleanForProvider(query: string, provider: SearchProvider): string {
  // Different providers may have different syntax for boolean operators
  switch (provider) {
    case 'github':
      // GitHub uses standard AND/OR operators
      return query;
    case 'linkedin':
      // LinkedIn might use a different format
      return query.replace(/\bAND\b/g, '&').replace(/\bOR\b/g, '|');
    default:
      return query;
  }
}

export function generateSearchPayload(
  query: string,
  provider: string,
  selectedBoards: Record<string, boolean>,
  filters?: {
    page?: number;
    experienceLevel?: string;
    location?: string;
    availability?: string;
  }
): string {
  // This is a sample implementation - the actual one might be different
  const page = filters?.page || 1;
  const selectedBoardsList = Object.entries(selectedBoards)
    .filter(([_, selected]) => selected)
    .map(([board]) => board)
    .join(',');
    
  const additionalFilters = [];
  if (filters?.experienceLevel) additionalFilters.push(`level:${filters.experienceLevel}`);
  if (filters?.location) additionalFilters.push(`location:${filters.location}`);
  if (filters?.availability) additionalFilters.push(`availability:${filters.availability}`);
  
  return `${query}|${provider}|${selectedBoardsList}|page:${page}|${additionalFilters.join('|')}`;
}

export function parseSearchQuery(query: string): { terms: string[]; operators: string[] } {
  // This is a simplified parser for search queries
  // It extracts individual terms and operators (AND, OR)
  
  // Replace parentheses with spaces
  const withoutParens = query.replace(/[()]/g, ' ');
  
  // Split by spaces
  const parts = withoutParens.split(/\s+/).filter(Boolean);
  
  const terms: string[] = [];
  const operators: string[] = [];
  
  parts.forEach(part => {
    if (part.toUpperCase() === 'AND' || part.toUpperCase() === 'OR') {
      operators.push(part.toUpperCase());
    } else {
      terms.push(part);
    }
  });
  
  return { terms, operators };
}

export function simplifyQuery(query: string, maxTerms: number = 5): string {
  return query
    .replace(/[()"]/g, ' ')
    .replace(/\s+AND\s+|\s+OR\s+/gi, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2) // Keep terms longer than 2 chars
    .slice(0, maxTerms) // Take at most maxTerms terms
    .join(' ');
}

export function extractKeywords(query: string): string[] {
  // Extract potential keywords from a search query
  const { terms } = parseSearchQuery(query);
  
  // Filter out common words and short terms
  return terms
    .filter(term => term.length > 3)
    .filter(term => !['the', 'and', 'that', 'have', 'this', 'from', 'with'].includes(term.toLowerCase()));
}

// Add the missing extractTermsFromQuery function
export function extractTermsFromQuery(query: string): string[] {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  // Remove special characters and extra spaces
  const cleanedQuery = query
    .replace(/[()""]/g, ' ')
    .replace(/\s+AND\s+|\s+OR\s+/gi, ' ')
    .trim();
  
  // Split and filter
  return cleanedQuery
    .split(/\s+/)
    .filter(term => term.length > 2) // Only keep terms with more than 2 characters
    .filter(term => !/^(and|or|the|for|with|from|this|that)$/i.test(term)); // Remove common words
}
