
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import HelpCard from "../components/HelpCard";

const JobSearchHelp: React.FC = () => {
  return (
    <TabsContent value="search" className="space-y-6">
      <HelpSection 
        title="Candidate Search Features"
        description="Learn how to use the powerful candidate search features to find the right talent."
        image="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
      >
        <HelpCard
          title="Boolean Search Queries"
          steps={[
            "Select relevant terms on the left panel to build your search query",
            "Click 'Generate Query' to create a boolean search string",
            "The query will appear in the search box",
            "Click 'Search' to find matching candidates"
          ]}
        />
        
        <HelpCard
          title="External Profile Search"
          steps={[
            "After generating a query, click 'External Search' to open results in your selected platform",
            "Use 'Open Selected' to open results in all selected platforms from Search Options",
            "Select specific platforms under the tabs below to search by region",
            "Note: 'External Search' uses the search provider selected in the tabs above, while 'Open Selected' uses the platforms checked in Search Options"
          ]}
        />
        
        <HelpCard
          title="Saving Candidate Profiles"
          steps={[
            "When you find an interesting candidate, click the bookmark icon",
            "The profile will be saved to your account",
            "View all saved profiles in your Profile section",
            "You must be logged in to save profiles"
          ]}
        />
      </HelpSection>
    </TabsContent>
  );
};

export default JobSearchHelp;
