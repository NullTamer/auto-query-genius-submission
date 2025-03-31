
/**
 * Repository for job posting related database operations
 */

import { SupabaseClient } from "./supabase-client.ts";

export class JobRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Create a new job posting
   * 
   * @param jobDescription - Job description text
   * @returns ID of the created job posting
   */
  async createNewJobPosting(jobDescription: string): Promise<string> {
    // Get or create a default job source
    const sources = await this.client.select('job_sources', '*', undefined, { limit: 1 });
    
    let sourceId;
    if (sources && sources.length) {
      sourceId = sources[0].id;
    } else {
      // Create new source if none exists
      const newSource = await this.client.insert(
        'job_sources',
        {
          source_name: 'default',
          is_public: true
        },
        { returnData: true }
      );
      
      sourceId = newSource[0].id;
    }
    
    // Create a new job posting
    const jobPosting = await this.client.insert(
      'job_postings',
      {
        source_id: sourceId,
        title: 'Extracted from Description',
        description: jobDescription,
        posting_url: 'direct-input',
        status: 'pending',
        is_public: true
      },
      { returnData: true }
    );
    
    return jobPosting[0].id;
  }

  /**
   * Save extracted keywords for a job posting
   * 
   * @param jobId - Job posting ID
   * @param keywords - Array of extracted keywords
   */
  async saveKeywords(
    jobId: string, 
    keywords: Array<{keyword: string, frequency: number}>
  ): Promise<void> {
    // Only proceed if we have keywords
    if (!keywords.length) return;
    
    // Format keywords for insertion
    const keywordInserts = keywords.map(k => ({
      job_posting_id: jobId,
      keyword: k.keyword,
      frequency: k.frequency,
      is_public: true
    }));
    
    await this.client.insert('extracted_keywords', keywordInserts);
  }

  /**
   * Update job posting status
   * 
   * @param jobId - Job posting ID
   * @param status - New status
   * @param processedAt - Optional processed timestamp
   */
  async updateJobStatus(
    jobId: string, 
    status: 'pending' | 'processed' | 'failed', 
    processedAt?: string
  ): Promise<void> {
    await this.client.update(
      'job_postings',
      {
        status,
        processed_at: processedAt || new Date().toISOString()
      },
      { id: jobId }
    );
  }
}
