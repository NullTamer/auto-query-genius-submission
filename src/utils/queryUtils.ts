
import { getTermRelationships } from "./transformerExtraction";

/**
 * Generate a Boolean query from a list of keywords
 */
export const generateBooleanQuery = async (keywords: Array<{ keyword: string; category?: string; frequency: number }>) => {
  if (keywords.length === 0) return "";

  // Sort keywords by frequency, highest first
  const sortedKeywords = [...keywords].sort((a, b) => b.frequency - a.frequency);
  
  // Get semantic relationships between terms if possible
  let termRelationships: {
    connections: Array<{source: string, target: string, strength: number}>;
    clusters: Record<string, string[]>;
  } = { connections: [], clusters: {} };
  
  try {
    // Only consider top keywords for relationship analysis to improve performance
    const topKeywords = sortedKeywords.slice(0, 15);
    termRelationships = await getTermRelationships(topKeywords);
  } catch (error) {
    console.error("Error getting term relationships:", error);
    // Continue with basic query generation if relationship analysis fails
  }
  
  // Group keywords by category if available
  const hasCategories = sortedKeywords.some(k => k.category !== undefined);
  
  if (hasCategories) {
    // Create category-based groupings for candidate profile search
    const skills = sortedKeywords.filter(k => 
      k.category === 'skill' || 
      k.category === 'Technical Skill' || 
      k.category === 'Skill'
    ).map(k => k.keyword);
    
    const roles = sortedKeywords.filter(k => 
      k.category === 'role' || 
      k.category === 'Role'
    ).map(k => k.keyword);
    
    const qualifications = sortedKeywords.filter(k => 
      k.category === 'qualification' || 
      k.category === 'education' || 
      k.category === 'certification'
    ).map(k => k.keyword);
    
    // Build query parts with semantic expansion
    const queryParts = [];
    
    // Process roles - find semantically similar roles and include them
    if (roles.length > 0) {
      const roleClauses = [];
      
      for (const role of roles) {
        // Find semantically related roles
        const relatedRoles = termRelationships.connections
          .filter(c => 
            (c.source === role || c.target === role) && 
            c.strength > 0.7 && // High confidence threshold for roles
            ((c.source === role && roles.includes(c.target)) || 
             (c.target === role && roles.includes(c.source)))
          )
          .map(c => c.source === role ? c.target : c.source);
        
        // Add the role and its related terms in a subgroup
        if (relatedRoles.length > 0) {
          const roleWithRelated = [`"${role}"`, ...relatedRoles.map(r => `"${r}"`)].join(" OR ");
          roleClauses.push(`(${roleWithRelated})`);
        } else {
          roleClauses.push(`"${role}"`);
        }
      }
      
      if (roleClauses.length > 0) {
        // If we have multiple role clauses, join them with OR
        const roleClause = roleClauses.join(" OR ");
        queryParts.push(`(${roleClause})`);
      }
    }
    
    // Essential skills (top 3) connected with AND
    if (skills.length > 0) {
      const essentialSkills = skills.slice(0, 3);
      const essentialSkillClauses = essentialSkills.map(skill => {
        // Find semantically related skills
        const relatedSkills = termRelationships.connections
          .filter(c => 
            (c.source === skill || c.target === skill) && 
            c.strength > 0.65
          )
          .map(c => c.source === skill ? c.target : c.source)
          .filter(s => !essentialSkills.includes(s)); // Don't include skills already in essentials
        
        if (relatedSkills.length > 0) {
          return `("${skill}" OR ${relatedSkills.map(s => `"${s}"`).join(" OR ")})`;
        }
        return `"${skill}"`;
      });
      
      if (essentialSkillClauses.length > 0) {
        queryParts.push(`(${essentialSkillClauses.join(" AND ")})`);
      }
      
      // Optional skills (remaining) connected with OR
      const optionalSkills = skills.slice(3);
      if (optionalSkills.length > 0) {
        // Group optional skills by clusters if available
        if (Object.keys(termRelationships.clusters).length > 0) {
          const skillClusters: string[][] = [];
          const processedSkills = new Set<string>();
          
          // First, process skills that are in clusters
          Object.values(termRelationships.clusters).forEach(clusterTerms => {
            const skillsInCluster = clusterTerms.filter(term => 
              optionalSkills.includes(term) && !processedSkills.has(term)
            );
            
            if (skillsInCluster.length > 0) {
              skillClusters.push(skillsInCluster);
              skillsInCluster.forEach(skill => processedSkills.add(skill));
            }
          });
          
          // Add remaining skills not in any cluster
          const remainingSkills = optionalSkills.filter(skill => !processedSkills.has(skill));
          if (remainingSkills.length > 0) {
            skillClusters.push(remainingSkills);
          }
          
          // Create OR clauses for each cluster
          const clusterClauses = skillClusters.map(cluster => {
            if (cluster.length === 1) return `"${cluster[0]}"`;
            return `(${cluster.map(skill => `"${skill}"`).join(" OR ")})`;
          });
          
          if (clusterClauses.length > 0) {
            queryParts.push(`(${clusterClauses.join(" OR ")})`);
          }
        } else {
          // Simple OR for optional skills if no clusters
          const optionalSkillClause = optionalSkills.map(skill => `"${skill}"`).join(" OR ");
          if (optionalSkillClause) queryParts.push(`(${optionalSkillClause})`);
        }
      }
    }
    
    // Add qualifications if available
    if (qualifications.length > 0) {
      const qualClauses = qualifications.map(qual => {
        // Find related qualification terms
        const relatedQuals = termRelationships.connections
          .filter(c => 
            (c.source === qual || c.target === qual) && 
            c.strength > 0.7
          )
          .map(c => c.source === qual ? c.target : c.source)
          .filter(q => !qualifications.includes(q));
        
        if (relatedQuals.length > 0) {
          return `("${qual}" OR ${relatedQuals.map(q => `"${q}"`).join(" OR ")})`;
        }
        return `"${qual}"`;
      });
      
      queryParts.push(`(${qualClauses.join(" OR ")})`);
    }
    
    // Connect the main parts with AND
    return queryParts.join(" AND ");
  } else {
    // Simplified logic for when we don't have categories,
    // but enhanced with semantic relationships
    
    // For candidate searches, we want to ensure the top skills are required
    const topKeywords = sortedKeywords.slice(0, 5);
    const remainingKeywords = sortedKeywords.slice(5);
    
    // Process each top keyword with potential semantic expansion
    const essentialTerms = await Promise.all(
      topKeywords.map(async (keyword) => {
        // Find semantically related terms
        const relatedTerms = termRelationships.connections
          .filter(c => 
            (c.source === keyword.keyword || c.target === keyword.keyword) && 
            c.strength > 0.7
          )
          .map(c => c.source === keyword.keyword ? c.target : c.source);
        
        if (relatedTerms.length > 0) {
          return `("${keyword.keyword}" OR ${relatedTerms.map(term => `"${term}"`).join(" OR ")})`;
        }
        return `"${keyword.keyword}"`;
      })
    );
    
    // Group remaining keywords by semantic similarity
    const remainingTermGroups: string[][] = [];
    const processedTerms = new Set<string>();
    
    // Process remaining keywords that have strong relationships
    for (const keyword of remainingKeywords) {
      if (processedTerms.has(keyword.keyword)) continue;
      
      const relatedTerms = termRelationships.connections
        .filter(c => 
          (c.source === keyword.keyword || c.target === keyword.keyword) && 
          c.strength > 0.65
        )
        .map(c => c.source === keyword.keyword ? c.target : c.source)
        .filter(term => 
          !processedTerms.has(term) && 
          remainingKeywords.some(k => k.keyword === term)
        );
      
      if (relatedTerms.length > 0) {
        remainingTermGroups.push([keyword.keyword, ...relatedTerms]);
        processedTerms.add(keyword.keyword);
        relatedTerms.forEach(term => processedTerms.add(term));
      } else if (!processedTerms.has(keyword.keyword)) {
        remainingTermGroups.push([keyword.keyword]);
        processedTerms.add(keyword.keyword);
      }
    }
    
    // Create Boolean query for remaining term groups
    const optionalTerms = remainingTermGroups.map(group => {
      if (group.length === 1) return `"${group[0]}"`;
      return `(${group.map(term => `"${term}"`).join(" OR ")})`;
    }).join(" OR ");
    
    // Combine essential and optional terms
    const queryParts = [];
    if (essentialTerms.length > 0) {
      queryParts.push(`(${essentialTerms.join(" AND ")})`);
    }
    if (optionalTerms) {
      queryParts.push(`(${optionalTerms})`);
    }
    
    return queryParts.join(" AND ");
  }
};
