
/**
 * Gemini API Service for Job Description Processing
 * 
 * This module provides functionality to interact with the Google Gemini API
 * for extracting keywords from job descriptions. It handles API requests,
 * response parsing, and error handling with retry capabilities.
 * 
 * Features:
 * - Configurable retry mechanism with exponential backoff
 * - Structured response parsing with fallback mechanisms
 * - Error handling for API limits and network issues
 * - Response validation and normalization
 */

import { delay } from './utils.ts';

export class GeminiService {
  private apiKey: string;
  private maxRetries: number;

  /**
   * Creates a new GeminiService instance
   * 
   * @param apiKey - The Gemini API key for authentication
   * @param maxRetries - Maximum number of retry attempts (default: 2)
   */
  constructor(apiKey: string, maxRetries: number = 2) {
    this.apiKey = apiKey;
    this.maxRetries = maxRetries;
  }

  /**
   * Extracts keywords from a job description using the Gemini API
   * 
   * This method sends the job description to the Gemini API and retrieves
   * a list of keywords with their frequency scores. It includes retry logic
   * with exponential backoff and fallback parsing for different response formats.
   * 
   * @param jobDescription - The job description text to analyze
   * @returns A promise resolving to an array of keywords with frequency scores
   * @throws Error if extraction fails after maximum retries
   */
  async extractKeywords(jobDescription: string): Promise<Array<{keyword: string, frequency: number}>> {
    let retries = 0;
    let lastError = null;
    
    while (retries <= this.maxRetries) {
      try {
        // Add throttling to prevent rate limiting
        if (retries > 0) {
          // Exponential backoff: 2s, 4s, 8s...
          const waitTime = 2000 * Math.pow(2, retries - 1);
          console.log(`Retry ${retries}/${this.maxRetries}, waiting ${waitTime}ms...`);
          await delay(waitTime);
        } else {
          await delay(2000); // Base throttle
        }
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `
                  You are an expert recruiter and hiring manager with deep expertise in technical roles.
                  
                  Please extract the most important skills, technologies, and requirements from the job description below.
                  
                  Return ONLY a JSON array of objects with the format:
                  [{"keyword": "Skill or Technology Name", "frequency": number representing importance from 1-5}]
                  
                  Do not include any markdown, explanation, or other text, just the JSON array.
                  Sort them by frequency (importance) in descending order.
                  
                  JOB DESCRIPTION:
                  ${jobDescription}`
                }]
              }],
              generationConfig: {
                temperature: 0.1,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_NONE"
                }
              ]
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error('Gemini API error:', error);
          lastError = new Error(`Failed to process with Gemini: ${JSON.stringify(error)}`);
          retries++;
          continue;
        }

        const data = await response.json();
        console.log("Gemini response:", JSON.stringify(data).substring(0, 500) + "...");
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          lastError = new Error('Invalid response from Gemini API');
          retries++;
          continue;
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        // Clean up any markdown code formatting that might be in the response
        const cleanJson = textResponse.replace(/```json|```/g, '').trim();
        
        try {
          const keywords = JSON.parse(cleanJson);
          console.log(`Extracted ${keywords.length} keywords:`, keywords.slice(0, 5));
          
          // Validate and normalize keywords
          const validatedKeywords = keywords
            .filter(kw => kw && kw.keyword)
            .map(kw => ({
              keyword: (kw.keyword || '').toString().trim(),
              frequency: typeof kw.frequency === 'number' ? 
                Math.min(5, Math.max(1, Math.round(kw.frequency))) : 1
            }));
          
          return validatedKeywords;
        } catch (e) {
          console.error("Failed to parse Gemini response:", e);
          console.log("Raw response:", textResponse);
          
          // As a fallback, try to extract keywords as a simple list
          const lines = textResponse.toLowerCase()
            .split(/[\n,]/)
            .map(line => line.trim())
            .filter(line => line.length > 2 && !line.startsWith('[') && !line.startsWith(']'));
            
          if (lines.length > 0) {
            return lines.map((keyword, index) => ({
              keyword: keyword.replace(/['"{}[\]]/g, '').trim(),
              frequency: Math.max(1, 5 - Math.floor(index / 5)) // Assign descending frequency
            }));
          }
          
          lastError = new Error('Failed to parse response from Gemini');
          retries++;
          continue;
        }
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        retries++;
      }
    }
    
    throw lastError || new Error('Maximum retries exceeded when calling Gemini API');
  }
}
