import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

/**
 * This edge function fetches candidate profiles instead of job listings
 * based on the given search parameters.
 */
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Get request body
    const body = await req.json()
    
    // Extract search parameters
    const { searchTerm, provider, providers, experienceLevel, location, availability, limit = 20 } = body
    
    if (!searchTerm) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Search term is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Log request details
    console.log(`Received search request for "${searchTerm}" on ${provider || (providers ? providers.join(', ') : 'unknown')}`)
    
    // Initialize results array
    let results = []
    
    // Determine which providers to search
    const providersToSearch = providers || (provider ? [provider] : ['linkedin'])
    
    // Process each provider
    for (const currentProvider of providersToSearch) {
      console.log(`Searching on ${currentProvider}`)
      
      // Get candidate profiles based on the provider
      const candidateResults = await fetchCandidatesFromProvider(
        currentProvider, 
        searchTerm, 
        { experienceLevel, location, availability, limit },
        supabase
      )
      
      // Add results to the combined array
      results = [...results, ...candidateResults]
    }
    
    console.log(`Returning ${results.length} results`)
    
    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        results,
        totalCount: results.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error in fetch-candidates function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/**
 * Fetch candidate profiles from a specific provider
 */
async function fetchCandidatesFromProvider(
  provider: string, 
  searchTerm: string, 
  filters: { 
    experienceLevel?: string, 
    location?: string, 
    availability?: string,
    limit?: number
  },
  supabase: any
): Promise<any[]> {
  const { experienceLevel, location, availability, limit = 20 } = filters
  
  try {
    // Special handling for GitHub - use the authenticated API approach
    if (provider === 'github') {
      console.log('Using GitHub API for search')
      return await fetchGitHubProfilesUsingAPI(searchTerm, supabase, limit)
    }
    
    // First try to use API credentials if available for other providers
    try {
      const { data: credentials, error } = await supabase
        .from('job_api_credentials')
        .select('api_key, api_secret, access_token')
        .eq('service', provider)
        .maybeSingle()
      
      if (error) {
        console.error(`Error fetching API credentials for ${provider}:`, error)
        throw new Error('No valid credentials')
      }
      
      if (credentials) {
        console.log(`Using API credentials for ${provider}`)
        return await fetchCandidatesUsingAPI(provider, searchTerm, credentials, { ...filters, limit })
      }
    } catch (e) {
      console.log(`No valid credentials for ${provider}, using scraping`)
    }
    
    // Fallback to scraping if no API credentials for non-GitHub providers
    return await scrapeCandidateProfiles(provider, searchTerm, { ...filters, limit })
  } catch (error) {
    console.error(`Error fetching candidates from ${provider}:`, error)
    return []
  }
}

/**
 * Fetch GitHub profiles using the GitHub API
 */
async function fetchGitHubProfilesUsingAPI(searchTerm: string, supabase: any, limit = 30): Promise<any[]> {
  try {
    // Using the github-search edge function instead of direct API calls for better error handling
    const { data, error } = await supabase.functions.invoke('github-search', {
      body: { searchQuery: searchTerm }
    })
    
    if (error) {
      console.error('Error calling GitHub search function:', error)
      throw new Error(error.message || 'Failed to search GitHub profiles')
    }
    
    if (!data || !data.success || !data.profiles) {
      console.error('Invalid response from GitHub search function:', data)
      throw new Error('Invalid response from GitHub search')
    }
    
    const profiles = data.profiles.slice(0, limit)
    console.log(`Found ${profiles.length} GitHub profiles via API (from total ${data.total_count})`)
    
    return profiles.map((item: any) => {
      // Extract skills from the search term
      const skills = extractSkillsFromSnippet(searchTerm, searchTerm)
      
      return {
        title: item.login,
        company: '',
        location: item.location || '',
        url: item.html_url,
        source: 'github',
        avatar_url: item.avatar_url,
        html_url: item.html_url,
        profile_url: item.html_url,
        skills: skills,
        experienceLevel: 'mid', // Default to mid-level since we can't determine from basic API data
        lastActive: new Date().toISOString().split('T')[0]
      }
    })
  } catch (error) {
    console.error('Error fetching GitHub profiles:', error)
    
    // Fall back to direct API call if edge function fails
    console.log('Trying direct GitHub API call as fallback')
    
    // Get GitHub API token from environment
    const githubToken = Deno.env.get('GITHUB_API_TOKEN')
    if (!githubToken) {
      console.error('GitHub API token not configured')
      throw new Error('GitHub API token not configured')
    }
    
    // Prepare the query
    let simplifiedQuery = searchTerm
      .replace(/[()"]/g, ' ')
      .replace(/\s+AND\s+|\s+OR\s+/gi, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .slice(0, 5)
      .join(' ')
    
    console.log(`Using GitHub API with query: ${simplifiedQuery}`)
    
    // Make request to GitHub API
    const response = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(simplifiedQuery)}+in:name+in:bio+in:login&per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`
        }
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('GitHub API error:', errorData)
      
      if (response.status === 422 || response.status === 400) {
        // Try a simpler query if complex query fails
        const simpleTerms = simplifiedQuery
          .split(/\s+/)
          .filter(term => term.length > 3)
          .slice(0, 3)
          .join(' ')
          
        const fallbackResponse = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(simpleTerms)}&per_page=${limit}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${githubToken}`
            }
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          return processGitHubApiResults(fallbackData, searchTerm)
        }
      }
      
      throw new Error(`GitHub API error: ${errorData.message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    return processGitHubApiResults(data, searchTerm)
  }
}

/**
 * Process GitHub API results into the expected format
 */
function processGitHubApiResults(data: any, searchTerm: string): any[] {
  if (!data.items || !Array.isArray(data.items)) {
    console.error('Invalid GitHub API response format')
    return []
  }
  
  console.log(`Found ${data.items.length} GitHub profiles via API`)
  
  return data.items.map((item: any) => {
    // Extract username from the HTML URL (format: https://github.com/username)
    const username = item.html_url.split('/').pop()
    
    return {
      title: item.login,
      company: '',
      location: '',
      url: item.html_url,
      source: 'github',
      avatar_url: item.avatar_url,
      html_url: item.html_url,
      profile_url: item.html_url,
      skills: extractSkillsFromSnippet(searchTerm, searchTerm),
      experienceLevel: 'mid', // Default to mid-level since we can't determine from basic API data
      lastActive: new Date().toISOString().split('T')[0]
    }
  })
}

/**
 * Fetch candidates using provider API
 */
async function fetchCandidatesUsingAPI(
  provider: string, 
  searchTerm: string, 
  credentials: any,
  filters: any
): Promise<any[]> {
  // Implementation would depend on the specific provider API
  // This is a placeholder that would be implemented for each provider
  console.log(`API search for ${provider} not implemented yet, using scraping fallback`)
  return await scrapeCandidateProfiles(provider, searchTerm, filters)
}

/**
 * Scrape candidate profiles from provider websites
 */
async function scrapeCandidateProfiles(
  provider: string, 
  searchTerm: string,
  filters: { 
    experienceLevel?: string, 
    location?: string, 
    availability?: string 
  }
): Promise<any[]> {
  const { experienceLevel, location, availability } = filters
  const results = []
  
  try {
    // Build search URL with filters
    let searchUrl = ''
    let filterParams = ''
    
    if (location) {
      filterParams += `&location=${encodeURIComponent(location)}`
    }
    
    switch (provider) {
      case 'linkedin':
        // Add experience level filter for LinkedIn
        if (experienceLevel) {
          filterParams += `&experience=${encodeURIComponent(experienceLevel)}`
        }
        
        searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchTerm)}${filterParams}`
        break
        
      case 'github':
        searchUrl = `https://github.com/search?q=${encodeURIComponent(searchTerm)}&type=users${filterParams}`
        break
        
      case 'stackoverflow':
        searchUrl = `https://stackoverflow.com/users?q=${encodeURIComponent(searchTerm)}${filterParams}`
        break
        
      case 'twitter':
        searchUrl = `https://twitter.com/search?q=${encodeURIComponent(searchTerm)}%20${filterParams}&f=user`
        break
        
      case 'indeed':
        // Add experience level filter for Indeed
        if (experienceLevel) {
          filterParams += `&exp=${encodeURIComponent(experienceLevel)}`
        }
        
        searchUrl = `https://www.indeed.com/resumes?q=${encodeURIComponent(searchTerm)}${filterParams}`
        break
        
      default:
        // Default to Google People search
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}+resume+OR+CV+OR+profile${filterParams}`
    }
    
    console.log(`Scraping URL: ${searchUrl}`)
    
    // Fetch and parse HTML (would use a headless browser in production)
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    console.log(`${provider} HTML size: ${html.length} bytes`)
    
    // Parse HTML to extract candidate profiles
    // This is a simplified example - real implementation would be more robust
    const candidates = parseCandidateProfiles(provider, html, searchTerm)
    console.log(`Found ${candidates.length} ${provider} candidate profiles`)
    
    return candidates.map(candidate => ({
      ...candidate,
      source: provider
    }))
    
  } catch (error) {
    console.error(`Error scraping ${provider}:`, error)
    return []
  }
}

/**
 * Parse HTML to extract candidate profiles
 * This is a simplified implementation
 */
function parseCandidateProfiles(provider: string, html: string, searchTerm: string): any[] {
  const candidates = []
  
  try {
    switch (provider) {
      case 'linkedin':
        // Extract LinkedIn profiles
        const linkedinRegex = /<div class="entity-result__item">(.+?)<\/div>/gs
        const linkedinMatches = html.match(linkedinRegex) || []
        
        for (const match of linkedinMatches) {
          // Extract profile data
          const nameMatch = match.match(/<span class="entity-result__title-text.+?>(.+?)<\/span>/s)
          const titleMatch = match.match(/<div class="entity-result__primary-subtitle.+?>(.+?)<\/div>/s)
          const locationMatch = match.match(/<div class="entity-result__secondary-subtitle.+?>(.+?)<\/div>/s)
          const urlMatch = match.match(/href="(https:\/\/www\.linkedin\.com\/in\/[^"]+)"/s)
          
          if (nameMatch && urlMatch) {
            candidates.push({
              title: nameMatch[1].replace(/<[^>]+>/g, '').trim(),
              company: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '',
              location: locationMatch ? locationMatch[1].replace(/<[^>]+>/g, '').trim() : '',
              url: urlMatch[1],
              source: 'linkedin',
              skills: extractSkillsFromProfile(match, searchTerm),
              experienceLevel: extractExperienceLevel(match),
              lastActive: extractLastActive(match),
              connections: extractConnections(match),
              profileCompleteness: calculateProfileCompleteness(match)
            })
          }
        }
        break
        
      case 'github':
        // Updated GitHub profile extraction regexes for different possible HTML structures
        const userCardRegex = /<div class="mr-1">[\s\S]*?<a[^>]*?href="\/([^"]+)"[^>]*?>([^<]+)<\/a>[\s\S]*?<p class="color-fg-muted text-small mb-0">([^<]*)<\/p>/g
        const alternativeUserRegex = /<a class="[^"]*" href="\/([^"\/]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<p class="[^"]*">([\s\S]*?)<\/p>/g
        const basicUserRegex = /<a[^>]*href="\/([^"\/]+)"[^>]*>\s*<img[^>]*>\s*<\/a>\s*<div[^>]*>\s*<div[^>]*>\s*<a[^>]*href="\/([^"\/]+)"[^>]*>([^<]+)<\/a>/g
        
        // Use different regex patterns and check for matches
        let match;
        let matchFound = false;
        
        // Try first pattern: modern GitHub user cards
        while ((match = userCardRegex.exec(html)) !== null) {
          matchFound = true;
          const username = match[1];
          const displayName = match[2].trim();
          const bio = match[3].trim();
          
          candidates.push({
            title: displayName || username,
            company: '',
            location: '',
            url: `https://github.com/${username}`,
            snippet: bio,
            source: 'github',
            skills: extractSkillsFromGithub(html.substring(match.index, match.index + match[0].length), searchTerm),
            experienceLevel: estimateExperienceLevel(bio),
            lastActive: extractGithubLastActive('')
          });
        }
        
        // If first pattern didn't work, try second pattern
        if (!matchFound) {
          while ((match = alternativeUserRegex.exec(html)) !== null) {
            matchFound = true;
            const username = match[1];
            const displayName = match[2].trim();
            const bio = match[3].replace(/<[^>]+>/g, '').trim();
            
            candidates.push({
              title: displayName || username,
              company: '',
              location: '',
              url: `https://github.com/${username}`,
              snippet: bio,
              source: 'github',
              skills: extractSkillsFromGithub(match[0], searchTerm),
              experienceLevel: estimateExperienceLevel(bio),
              lastActive: extractGithubLastActive('')
            });
          }
        }
        
        // If still no matches, try another pattern for user links
        if (!matchFound) {
          // Regex for finding user links with avatar images
          while ((match = basicUserRegex.exec(html)) !== null) {
            matchFound = true;
            const username = match[1] || match[2]; // Use whichever is found
            const displayName = match[3] ? match[3].trim() : username;
            
            // Skip non-user links and already captured users
            if (username.includes('/') || 
                ['search', 'orgs', 'topics', 'pulls', 'issues', 'marketplace', 'explore', 'codespaces', 'sponsors', 'settings', 'repo'].includes(username)) {
              continue;
            }
            
            candidates.push({
              title: displayName,
              company: '',
              location: '',
              url: `https://github.com/${username}`,
              snippet: '',
              source: 'github',
              skills: extractSkillsFromSnippet(searchTerm, searchTerm),
              experienceLevel: 'mid',
              lastActive: new Date().toISOString().split('T')[0]
            });
          }
        }
        
        // If still no matches, use a last resort approach
        if (!matchFound) {
          // Simple regex to just find username links
          const simpleUserRegex = /href="\/([^"\/]+)"[^>]*?>([^<]+)<\/a>/g;
          const usernames = new Set();
          
          while ((match = simpleUserRegex.exec(html)) !== null) {
            const username = match[1];
            const displayName = match[2].trim();
            
            // Skip non-user links and already captured users
            if (username.includes('/') || 
                ['search', 'orgs', 'topics', 'pulls', 'issues', 'marketplace', 'explore', 'codespaces', 'sponsors', 'settings', 'repo'].includes(username) ||
                usernames.has(username)) {
              continue;
            }
            
            usernames.add(username);
            
            candidates.push({
              title: displayName || username,
              company: '',
              location: '',
              url: `https://github.com/${username}`,
              snippet: '',
              source: 'github',
              skills: extractSkillsFromSnippet(searchTerm, searchTerm),
              experienceLevel: 'mid',
              lastActive: new Date().toISOString().split('T')[0]
            });
            
            // Limit to top 10 results for performance
            if (usernames.size >= 10) break;
          }
        }
        break
        
      case 'stackoverflow':
        // Extract Stack Overflow profiles
        const soRegex = /<div class="user-details".+?>(.+?)<\/div>/gs
        const soMatches = html.match(soRegex) || []
        
        for (const match of soMatches) {
          const nameMatch = match.match(/<a href="\/users\/\d+\/([^"]+)">(.+?)<\/a>/s)
          const reputationMatch = match.match(/<span class="reputation-score".+?>(.+?)<\/span>/s)
          
          if (nameMatch) {
            candidates.push({
              title: nameMatch[2].replace(/<[^>]+>/g, '').trim(),
              company: '',
              location: '',
              url: `https://stackoverflow.com/users/${nameMatch[1]}`,
              source: 'stackoverflow',
              skills: extractSkillsFromStackOverflow(match, searchTerm),
              experienceLevel: calculateExperienceLevelFromReputation(reputationMatch ? reputationMatch[1] : '0')
            })
          }
        }
        break
        
      default:
        // Extract Google results as fallback
        const googleRegex = /<div class="g">(.+?)<\/div>\s*<\/div>/gs
        const googleMatches = html.match(googleRegex) || []
        
        for (const match of googleMatches) {
          const titleMatch = match.match(/<h3 class="[^"]+">(.+?)<\/h3>/s)
          const snippetMatch = match.match(/<div class="[^"]*VwiC3b[^"]*">(.+?)<\/div>/s)
          const urlMatch = match.match(/href="([^"]+)"/s)
          
          if (titleMatch && urlMatch) {
            candidates.push({
              title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
              company: '',
              location: '',
              url: urlMatch[1],
              snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '',
              source: 'google',
              skills: extractSkillsFromSnippet(snippetMatch ? snippetMatch[1] : '', searchTerm)
            })
          }
        }
        break
    }
    
    console.log(`Found ${candidates.length} ${provider} candidate cards with pattern`)
  } catch (error) {
    console.error(`Error parsing ${provider} candidate profiles:`, error)
  }
  
  return candidates
}

/**
 * Estimate experience level based on bio content
 */
function estimateExperienceLevel(bio: string): string {
  const bioLower = bio.toLowerCase();
  
  if (bioLower.includes('senior') || 
      bioLower.includes('lead') || 
      bioLower.includes('principal') || 
      bioLower.includes('staff') || 
      bioLower.includes('10+ years')) {
    return 'senior';
  } else if (bioLower.includes('junior') || 
            bioLower.includes('entry') || 
            bioLower.includes('intern') || 
            bioLower.includes('student')) {
    return 'junior';
  } else {
    return 'mid';
  }
}

/**
 * Extract skills from profile HTML based on search term
 */
function extractSkillsFromProfile(profileHtml: string, searchTerm: string): string[] {
  const skills = []
  
  // Get main skills from search term
  const searchSkills = searchTerm.split(/\s+/)
    .filter(term => term.length > 3)
    .map(term => term.replace(/[^\w\s]/gi, ''))
  
  // Add search skills that appear in the profile
  for (const skill of searchSkills) {
    if (profileHtml.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill)
    }
  }
  
  // Look for common technical skills in the profile
  const commonSkills = ['javascript', 'python', 'java', 'typescript', 'react', 'node', 'aws', 'sql', 'css', 'html']
  
  for (const skill of commonSkills) {
    if (profileHtml.toLowerCase().includes(skill.toLowerCase()) && !skills.includes(skill)) {
      skills.push(skill)
    }
  }
  
  return skills
}

/**
 * Extract skills from GitHub profile
 */
function extractSkillsFromGithub(profileHtml: string, searchTerm: string): string[] {
  // Similar implementation to extractSkillsFromProfile
  return extractSkillsFromProfile(profileHtml, searchTerm)
}

/**
 * Extract skills from Stack Overflow profile
 */
function extractSkillsFromStackOverflow(profileHtml: string, searchTerm: string): string[] {
  // Similar implementation to extractSkillsFromProfile
  return extractSkillsFromProfile(profileHtml, searchTerm)
}

/**
 * Extract skills from result snippet
 */
function extractSkillsFromSnippet(snippet: string, searchTerm: string): string[] {
  // Similar implementation to extractSkillsFromProfile
  return extractSkillsFromProfile(snippet, searchTerm)
}

/**
 * Extract experience level from profile
 */
function extractExperienceLevel(profileHtml: string): string {
  // Check for experience indicators
  if (profileHtml.toLowerCase().includes('senior') || 
      profileHtml.toLowerCase().includes('lead') ||
      profileHtml.toLowerCase().includes('principal')) {
    return 'senior'
  } else if (profileHtml.toLowerCase().includes('junior') || 
            profileHtml.toLowerCase().includes('entry')) {
    return 'junior'
  } else {
    return 'mid'
  }
}

/**
 * Calculate experience level from reputation
 */
function calculateExperienceLevelFromReputation(reputation: string): string {
  const repValue = parseInt(reputation.replace(/,/g, ''), 10)
  
  if (repValue > 10000) {
    return 'senior'
  } else if (repValue > 1000) {
    return 'mid'
  } else {
    return 'junior'
  }
}

/**
 * Extract last active timestamp
 */
function extractLastActive(profileHtml: string): string {
  // Placeholder implementation
  return new Date().toISOString().split('T')[0]
}

/**
 * Extract GitHub last active date
 */
function extractGithubLastActive(profileHtml: string): string {
  // Placeholder implementation
  return new Date().toISOString().split('T')[0]
}

/**
 * Extract connections count
 */
function extractConnections(profileHtml: string): number {
  // Placeholder implementation
  return Math.floor(Math.random() * 500) + 100
}

/**
 * Calculate profile completeness score
 */
function calculateProfileCompleteness(profileHtml: string): number {
  // Placeholder implementation
  return Math.floor(Math.random() * 40) + 60
}
