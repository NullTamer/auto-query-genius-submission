
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders, retryWithBackoff } from "./utils.ts"
import { GeminiService } from "./gemini-service.ts"
import { JobRepository } from "./job-repository.ts"
import { SupabaseClient } from "./supabase-client.ts"

// Main serve function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Parse request body
    const requestData = await req.json()
    const { jobDescription, jobPostingId } = requestData
    
    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Job description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log("Processing job posting:", jobPostingId ? `ID: ${jobPostingId}` : "New job")
    console.log("Job description length:", jobDescription.length)
    
    // Get API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Gemini service
    const geminiService = new GeminiService(apiKey)
    
    // Extract keywords using Gemini API
    const keywords = await retryWithBackoff(async () => {
      return await geminiService.extractKeywords(jobDescription)
    })
    
    console.log(`Extracted ${keywords.length} keywords:`, keywords)
    
    // Create database clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey)
    const jobRepo = new JobRepository(supabaseClient)
    
    let finalJobId = jobPostingId
    
    // If no job posting ID was provided, create a new job posting
    if (!finalJobId) {
      finalJobId = await jobRepo.createNewJobPosting(jobDescription)
    }
    
    // Insert extracted keywords into the database
    await jobRepo.saveKeywords(finalJobId, keywords)
    
    // Update job status to processed
    await jobRepo.updateJobStatus(finalJobId, 'processed')
    
    return new Response(
      JSON.stringify({
        success: true,
        jobId: finalJobId,
        keywords: keywords,
        message: 'Job posting processed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error processing job posting:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
