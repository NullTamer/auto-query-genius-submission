
export async function searchGitHubProfiles(query: string, page: number = 1) {
  try {
    // Modified to include page parameter
    const response = await fetch('/api/github-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        searchQuery: query,
        page: page
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub search failed:', errorData);
      return { success: false, error: errorData.error || 'Failed to search GitHub' };
    }

    const data = await response.json();
    return {
      success: true,
      profiles: data.profiles || [],
      total_count: data.total_count || 0,
    };
  } catch (error) {
    console.error('Error searching GitHub:', error);
    return { success: false, error: 'Network error when searching GitHub' };
  }
}

// We need this function for display purposes
export function getProviderDisplayName(provider: string): string {
  const displayNames: Record<string, string> = {
    'github': 'GitHub',
    'linkedin': 'LinkedIn',
    'twitter': 'Twitter',
    'stackoverflow': 'Stack Overflow',
    'indeed': 'Indeed',
    'wellfound': 'Wellfound',
    'google': 'Google',
    'other': 'Other'
  };
  
  return displayNames[provider] || provider;
}

// Add missing getSearchUrl function
export function getSearchUrl(provider: string, query: string): string {
  switch (provider) {
    case 'github':
      return `https://github.com/search?q=${encodeURIComponent(query)}&type=users`;
    case 'linkedin':
      return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
    case 'twitter':
      return `https://twitter.com/search?q=${encodeURIComponent(query)}%20developer%20OR%20engineer&f=user`;
    case 'stackoverflow':
      return `https://stackoverflow.com/users?tab=reputation&filter=all&search=${encodeURIComponent(query)}`;
    case 'indeed':
      return `https://www.indeed.com/resumes?q=${encodeURIComponent(query)}`;
    case 'wellfound':
      return `https://wellfound.com/candidates?q=${encodeURIComponent(query)}`;
    case 'google':
      return `https://www.google.com/search?q=${encodeURIComponent(query)}+resume+OR+profile+OR+cv`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
}

// Add the jobBoardRegions object
export const jobBoardRegions: Record<string, string[]> = {
  "professional": ["linkedin", "indeed", "wellfound"],
  "technical": ["github", "stackoverflow"],
  "social": ["twitter"],
  "general": ["google"],
  "all": ["linkedin", "indeed", "wellfound", "github", "stackoverflow", "twitter", "google"]
};

// Add the getRegionDisplayName function
export function getRegionDisplayName(region: string): string {
  const regionNames: Record<string, string> = {
    'professional': 'Professional',
    'technical': 'Technical',
    'social': 'Social',
    'general': 'General',
    'all': 'All Sites'
  };
  
  return regionNames[region] || region;
}
