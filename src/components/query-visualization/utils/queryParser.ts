
/**
 * Parse a Boolean query to extract its structure and relationships
 */
export function parseBooleanQuery(query: string) {
  // Initialize result objects
  const terms: string[] = [];
  const requiredTerms: string[] = [];
  const optionalTerms: string[] = [];
  const exclusions: string[] = [];
  const expansions: Array<[string, string[]]> = [];
  
  if (!query) {
    return { terms, requiredTerms, optionalTerms, exclusions, expansions };
  }
  
  try {
    // Remove extra spaces and standardize
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
    
    // Extract all terms in quotes
    const quotedTermsRegex = /"([^"]+)"/g;
    let match;
    while ((match = quotedTermsRegex.exec(cleanQuery)) !== null) {
      const term = match[1].trim();
      if (term) terms.push(term);
    }
    
    // Extract required terms (connected with AND)
    const andGroups = cleanQuery.split(/\bAND\b/i);
    andGroups.forEach(group => {
      // Skip groups that are part of OR statements for now
      if (!group.includes("OR")) {
        const termMatch = group.match(/"([^"]+)"/);
        if (termMatch && termMatch[1]) {
          requiredTerms.push(termMatch[1].trim());
        }
      }
    });
    
    // Extract optional terms (connected with OR)
    const orRegex = /\(([^)]+)\)/g;
    let orMatch;
    while ((orMatch = orRegex.exec(cleanQuery)) !== null) {
      const orGroup = orMatch[1];
      if (orGroup.includes("OR")) {
        const orTerms = orGroup.split(/\bOR\b/i);
        const baseTerm = orTerms[0].match(/"([^"]+)"/)?.[1]?.trim();
        
        if (baseTerm) {
          // Add the base term to optional terms
          optionalTerms.push(baseTerm);
          
          // Extract expansions (all terms after the first in OR group)
          const expandedTerms = orTerms.slice(1).map(term => {
            const match = term.match(/"([^"]+)"/);
            return match ? match[1].trim() : "";
          }).filter(Boolean);
          
          if (expandedTerms.length > 0) {
            expansions.push([baseTerm, expandedTerms]);
          }
        }
      }
    }
    
    // Extract exclusions (terms after NOT)
    const notRegex = /NOT\s+"([^"]+)"/gi;
    let notMatch;
    while ((notMatch = notRegex.exec(cleanQuery)) !== null) {
      if (notMatch[1]) {
        exclusions.push(notMatch[1].trim());
      }
    }
    
    // If no required terms were found but there are terms, they might be in a different format
    // Try alternative parsing for more complex queries
    if (requiredTerms.length === 0 && terms.length > 0) {
      const simpleTerms = terms.filter(term => 
        !optionalTerms.includes(term) && 
        !exclusions.includes(term) &&
        !expansions.some(([_, expanded]) => expanded.includes(term))
      );
      requiredTerms.push(...simpleTerms);
    }
    
    return { terms, requiredTerms, optionalTerms, exclusions, expansions };
  } catch (error) {
    console.error("Error parsing Boolean query:", error);
    return { terms, requiredTerms, optionalTerms, exclusions, expansions };
  }
}
