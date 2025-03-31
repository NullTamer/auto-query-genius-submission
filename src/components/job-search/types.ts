
import { z } from "zod";

// Search providers
export type SearchProvider = 
  | "google" 
  | "linkedin" 
  | "indeed" 
  | "github" 
  | "stackoverflow" 
  | "twitter" 
  | "wellfound";

// Job board selection - update to extend Record<string, boolean>
export interface JobBoardSelection extends Record<string, boolean> {
  google: boolean;
  linkedin: boolean;
  indeed: boolean;
  github: boolean;
  stackoverflow: boolean;
  twitter: boolean;
  wellfound: boolean;
}

// Search result schema
export const searchResultSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  url: z.string(),
  snippet: z.string().optional(),
  source: z.string(),
  skills: z.array(z.string()).optional(),
  profileImage: z.string().optional(),
  score: z.number().optional(),
  // Candidate-specific fields
  education: z.string().optional(),
  experienceLevel: z.string().optional(),
  lastActive: z.string().optional(),
  connections: z.number().optional(),
  profileCompleteness: z.number().optional(),
  // Keep these fields for backward compatibility
  date: z.string().optional(),
  salary: z.string().optional(),
  jobType: z.string().optional(),
  avatar_url: z.string().optional() // Added this field for GitHub profiles
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// Search term
export interface SearchTerm {
  id: string;
  text: string;
  type: "keyword" | "title" | "skill" | "experience" | "location";
  isRequired?: boolean;
  isExcluded?: boolean;
}

// Search results response
export interface SearchResultsResponse {
  results: SearchResult[];
  totalCount?: number;
  nextPage?: string | null;
}
