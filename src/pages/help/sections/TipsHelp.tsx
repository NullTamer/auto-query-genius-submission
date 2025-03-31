
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import HelpCard from "../components/HelpCard";

const TipsHelp: React.FC = () => {
  return (
    <TabsContent value="tips" className="space-y-6">
      <HelpSection 
        title="Boolean Search Strategies"
        description="Expert advice to optimize your search queries and find the best candidates."
        image="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80"
      >
        <HelpCard
          title="Effective Boolean Queries"
          steps={[
            "Use AND to combine essential skills that candidates must have (e.g., 'Java AND AWS')",
            "Use OR with synonyms and related terms to broaden your search (e.g., 'JavaScript OR JS')",
            "Apply NOT to exclude irrelevant results (e.g., 'Developer NOT Junior')",
            "Group complex expressions with parentheses for logical clarity (e.g., '(Java OR Python) AND AWS')"
          ]}
        />
        
        <HelpCard
          title="Optimizing Your Searches"
          steps={[
            "Focus on specific technical skills rather than generic terms",
            "Include both the full term and common abbreviations (e.g., 'JavaScript OR JS')",
            "Consider different job title variations (e.g., 'Software Engineer OR Developer OR Programmer')",
            "Target seniority levels with terms like 'Senior', 'Lead', or 'Principal'"
          ]}
        />
        
        <HelpCard
          title="Query Optimization Techniques"
          steps={[
            "Prioritize technical skills and qualifications in your query structure",
            "Use industry-specific terminology to target relevant candidate profiles",
            "Consider geographical factors and remote work preferences in your search",
            "Test and refine queries based on the quality of returned profiles"
          ]}
        />

        <HelpCard
          title="Research Foundations"
          steps={[
            "Our system uses NLP techniques to identify key terms in job descriptions",
            "Extracted keywords are ranked by relevance using TF-IDF algorithms",
            "Boolean query structure follows information retrieval best practices",
            "Evaluation metrics include precision, recall, and F1-score to measure query effectiveness"
          ]}
        />
      </HelpSection>
    </TabsContent>
  );
};

export default TipsHelp;
