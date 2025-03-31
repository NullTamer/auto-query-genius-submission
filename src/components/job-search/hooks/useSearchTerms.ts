
import { useState, useEffect, useCallback } from "react";
import { extractTermsFromQuery } from "../utils/queryHelpers";

interface UseSearchTermsProps {
  initialQuery: string;
  autoSelectTerms?: boolean; // Add this prop to control auto-selection behavior
}

export const useSearchTerms = ({ initialQuery, autoSelectTerms = false }: UseSearchTermsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);
  
  // Process initial query only once on component mount
  useEffect(() => {
    if (!initialQueryProcessed && initialQuery) {
      // Extract terms from initial query
      const terms = extractTermsFromQuery(initialQuery);
      
      // Only set selected terms if autoSelectTerms is true
      if (autoSelectTerms) {
        setSelectedTerms(terms);
      }
      
      // Explicitly do NOT set the search term from the initial query
      setSearchTerm("");
      setInitialQueryProcessed(true);
    }
  }, [initialQuery, initialQueryProcessed, autoSelectTerms]);

  // Handle toggling a term selection without affecting search term
  const handleTermToggle = useCallback((term: string) => {
    setSelectedTerms(prev => {
      // If term is already selected, remove it
      if (prev.includes(term)) {
        return prev.filter(t => t !== term);
      }
      // Otherwise add it
      return [...prev, term];
    });
  }, []);

  // Handle selecting all terms without affecting search term
  const handleSelectAll = useCallback((terms: string[]) => {
    setSelectedTerms(prev => {
      // Check if all terms are already selected
      const allSelected = terms.every(term => prev.includes(term));
      
      if (allSelected) {
        // Clear selected terms when deselecting all
        return [];
      }
      
      // Otherwise, select all the terms
      return [...terms];
    });
  }, []);

  // Handle selecting a combination of terms without affecting search term
  const handleSelectCombination = useCallback((terms: string[]) => {
    // Replace all currently selected terms with the new combination
    setSelectedTerms(terms);
  }, []);

  // Clear search term
  const clearSearchTerm = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Apply selected terms to the search field - this is explicitly called
  const applySelectedTermsToSearch = useCallback(() => {
    if (selectedTerms.length === 0) return "";
    
    const combinedTerms = selectedTerms.join(" ");
    setSearchTerm(combinedTerms);
    return combinedTerms;
  }, [selectedTerms]);

  // Extract terms from current query for display
  const extractedTerms = useCallback(() => {
    return extractTermsFromQuery(searchTerm || initialQuery);
  }, [searchTerm, initialQuery]);

  return {
    searchTerm,
    setSearchTerm,
    selectedTerms,
    setSelectedTerms,
    handleTermToggle,
    handleSelectAll,
    handleSelectCombination,
    clearSearchTerm,
    applySelectedTermsToSearch,
    extractedTerms
  };
};
