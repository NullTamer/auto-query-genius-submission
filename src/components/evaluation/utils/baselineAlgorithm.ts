
import { KeywordItem } from "../types";

// Simple baseline algorithm: extract most frequent non-stopwords
export const extractBaselineKeywords = (text: string): KeywordItem[] => {
  try {
    // Common English stopwords
    const stopwords = new Set([
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", 
      "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during", 
      "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", 
      "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", 
      "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", 
      "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", 
      "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", 
      "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", 
      "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's", "where", "where's", 
      "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", "you're", "you've", 
      "your", "yours", "yourself", "yourselves"
    ]);

    // Handle invalid inputs gracefully
    if (!text) {
      console.warn("extractBaselineKeywords called with empty text");
      return [];
    }
    
    if (typeof text !== 'string') {
      console.warn("extractBaselineKeywords received non-string input:", text);
      try {
        // Try to convert to string if possible
        text = String(text);
      } catch (e) {
        return [];
      }
    }

    // Tokenize and clean text
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .split(/\s+/)              // Split on whitespace
      .filter(word => word.length > 2 && !stopwords.has(word));  // Remove stopwords and short words

    // Handle empty text after cleaning
    if (tokens.length === 0) {
      return [];
    }

    // Count word frequencies
    const wordCounts: Record<string, number> = {};
    tokens.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Convert to array and sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
    
    // Take top 15 or all if less than 15
    return sortedWords.slice(0, Math.min(sortedWords.length, 15));
  } catch (error) {
    console.error("Error in extractBaselineKeywords:", error);
    // Return empty array as fallback
    return [];
  }
};

// Add aliased export for backward compatibility
export const baselineExtraction = extractBaselineKeywords;
