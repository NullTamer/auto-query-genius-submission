
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { searchQuery, page = 1 } = await req.json()
    
    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log("Searching GitHub for:", searchQuery, "page:", page)
    
    // Get GitHub API token from environment
    const githubToken = Deno.env.get('GITHUB_API_TOKEN')
    if (!githubToken) {
      return new Response(
        JSON.stringify({ error: 'GitHub API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Limit the query to avoid hitting GitHub's 256 character limit
    // First, truncate the query if it's too long
    let truncatedQuery = searchQuery
    if (truncatedQuery.length > 240) {
      // Find a good place to cut (after an AND/OR operator)
      const andMatch = truncatedQuery.lastIndexOf(') AND (', 220)
      const orMatch = truncatedQuery.lastIndexOf(' OR ', 220)
      
      if (andMatch > 0) {
        truncatedQuery = truncatedQuery.substring(0, andMatch + 1) // Keep the closing parenthesis
      } else if (orMatch > 0) {
        truncatedQuery = truncatedQuery.substring(0, orMatch)
      } else {
        // Just truncate at 240 chars if no good break point
        truncatedQuery = truncatedQuery.substring(0, 240)
      }
      
      console.log("Query was too long, truncated to:", truncatedQuery)
    }
    
    // Simplify query for GitHub search by removing boolean operators and parentheses
    const simplifiedQuery = truncatedQuery
      .replace(/[()"]/g, ' ')
      .replace(/\s+AND\s+|\s+OR\s+/gi, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2) // Keep terms longer than 2 chars
      .slice(0, 5) // Take at most 5 terms
      .join(' ')
    
    // Encode query for URL
    const encodedQuery = encodeURIComponent(simplifiedQuery)
    
    console.log("Using simplified query for GitHub:", simplifiedQuery)
    
    // Increase per_page parameter to get more results (maximum allowed is 100)
    const maxResults = 30; // Max results per page
    
    // Make request to GitHub API using simplified search
    // Add page parameter to the query
    const response = await fetch(
      `https://api.github.com/search/users?q=${encodedQuery}+in:name+in:bio+in:login&per_page=${maxResults}&page=${page}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`
        }
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("GitHub API error:", errorData)
      
      // Try a fallback strategy if the main query fails
      if (response.status === 422 || response.status === 400) {
        console.log("Trying fallback search with simpler query")
        // Extract just keywords without boolean operators
        const simpleTerms = simplifiedQuery
          .split(/\s+/)
          .filter(term => term.length > 3)
          .slice(0, 3)
          .join(' ')
          
        const fallbackResponse = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(simpleTerms)}&per_page=${maxResults}&page=${page}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${githubToken}`
            }
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          return new Response(
            JSON.stringify({
              success: true,
              profiles: fallbackData.items,
              total_count: fallbackData.total_count,
              note: "Used simplified search query due to query complexity"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
      
      // If both approaches fail, try the most basic search possible
      const lastResortResponse = await fetch(
        `https://api.github.com/search/users?q=developer&per_page=${maxResults}&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${githubToken}`
          }
        }
      )
      
      if (lastResortResponse.ok) {
        const lastResortData = await lastResortResponse.json()
        return new Response(
          JSON.stringify({
            success: true,
            profiles: lastResortData.items,
            total_count: lastResortData.total_count,
            note: "Used fallback search due to API errors with original query"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch GitHub profiles',
          details: errorData 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const data = await response.json()
    console.log(`Found ${data.items?.length || 0} GitHub profiles out of ${data.total_count || 0} total matches for page ${page}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        profiles: data.items,
        total_count: data.total_count,
        page: page
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing GitHub search:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
