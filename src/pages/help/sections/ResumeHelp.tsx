
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import HelpCard from "../components/HelpCard";

const ResumeHelp: React.FC = () => {
  return (
    <TabsContent value="resume" className="space-y-6">
      <HelpSection 
        title="Resume Management"
        description="Upload, analyze, and optimize your resume for better job matches."
        image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
      >
        <HelpCard
          title="Resume Upload"
          steps={[
            "Go to the Resume page",
            "Click 'Upload Resume' to select your PDF or Word document",
            "The system will parse your resume automatically",
            "Review extracted information for accuracy"
          ]}
        />
        
        <HelpCard
          title="Resume Analysis"
          steps={[
            "After uploading, click 'Analyze Resume'",
            "The system will identify key skills and experience",
            "You'll receive suggestions for improvement",
            "Keywords from your resume will be added to your search profile"
          ]}
          isWorkInProgress={true}
        />
        
        <HelpCard
          title="Keyword Matching"
          steps={[
            "View how your resume keywords match with job postings",
            "Add missing keywords to improve match rates",
            "Higher match percentages indicate better job fits",
            "Update your resume based on these insights"
          ]}
          isWorkInProgress={true}
        />
      </HelpSection>
    </TabsContent>
  );
};

export default ResumeHelp;
