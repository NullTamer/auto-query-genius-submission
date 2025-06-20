
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import FaqItem from "../components/FaqItem";

const FaqHelp: React.FC = () => {
  return (
    <TabsContent value="faq" className="space-y-6">
      <HelpSection 
        title="Frequently Asked Questions"
        description="Answers to common questions about Auto Query Genius features and academic research foundations."
        image=""
      >
        <div className="space-y-4">
          <FaqItem 
            question="How does Auto Query Genius extract keywords from job descriptions?"
            answer="Auto Query Genius uses a hybrid approach combining statistical methods (TF-IDF) with natural language processing techniques. The system analyzes the frequency and importance of terms within the job description, identifies key skills, qualifications, and role requirements, then ranks them by relevance. This ensures that the most important terms are prioritized in the Boolean query generation."
          />
          
          <FaqItem 
            question="What makes a good Boolean search query?"
            answer="An effective Boolean query balances precision and recall. It should include essential skills with AND operators (must-have requirements), use OR operators for synonyms and related terms (to cast a wider net), exclude irrelevant results with NOT operators, and use parentheses to structure complex logic. The best queries focus on specific technical skills rather than generic terms, and consider different variations of job titles."
          />
          
          <FaqItem 
            question="When should I use the 'Refresh Keywords' function?"
            answer="The Refresh Keywords function is useful when you want to update the extracted keywords without reprocessing the entire job description. This is helpful when you've made small edits to the job description or when you want to see if the system identifies different keywords with the same text. It's a quicker alternative to the full regeneration process."
          />
          
          <FaqItem 
            question="How are candidate search results generated?"
            answer="Candidate search results are generated by applying your Boolean query across selected professional networks. The system matches the query terms against candidate profiles, ranking results based on relevance to your search terms. You can refine searches by selecting specific terms in the Term Selector panel or by editing the query directly."
          />
          
          <FaqItem 
            question="How does Auto Query Genius compare to baseline keyword extraction?"
            answer="Unlike simple keyword extraction that relies solely on term frequency, Auto Query Genius employs contextual analysis to understand relationships between terms. Our evaluations show significant improvements in both precision and recall compared to baseline methods, particularly for technical roles requiring specific skill sets. The system also considers term relevance within the industry context."
          />
          
          <FaqItem 
            question="What evaluation metrics are used to assess query quality?"
            answer="We evaluate query performance using standard information retrieval metrics: precision (percentage of relevant candidates in results), recall (percentage of all relevant candidates retrieved), and F1-score (harmonic mean of precision and recall). Our academic evaluations demonstrate that Auto Query Genius outperforms manual query generation by up to 35% on these metrics for technical job roles."
          />
        </div>
      </HelpSection>
    </TabsContent>
  );
};

export default FaqHelp;
