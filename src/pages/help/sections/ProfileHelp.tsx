
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import HelpCard from "../components/HelpCard";

const ProfileHelp: React.FC = () => {
  return (
    <TabsContent value="profile" className="space-y-6">
      <HelpSection 
        title="Profile Management"
        description="Manage your personal profile, saved jobs, and application history."
        image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
      >
        <HelpCard
          title="Account Setup"
          steps={[
            "Navigate to the Profile page",
            "Fill out your profile information",
            "Add professional details like skills and experience",
            "Upload a profile photo (optional)"
          ]}
        />
        
        <HelpCard
          title="Saved Jobs"
          steps={[
            "View all jobs you've saved from search results",
            "Click on any saved job to see full details",
            "Remove jobs you're no longer interested in",
            "Track application status for each saved job"
          ]}
        />
        
        <HelpCard
          title="Application Tracking"
          steps={[
            "Mark jobs as 'Applied' when you submit applications",
            "Set reminders for follow-ups",
            "Track interview schedules",
            "Log all communication with employers"
          ]}
          isWorkInProgress={true}
        />
      </HelpSection>
    </TabsContent>
  );
};

export default ProfileHelp;
