
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import HelpSection from "../components/HelpSection";
import HelpCard from "../components/HelpCard";

const SettingsHelp: React.FC = () => {
  return (
    <TabsContent value="settings" className="space-y-6">
      <HelpSection 
        title="System Settings"
        description="Customize your experience and manage your account settings."
        image="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80"
      >
        <HelpCard
          title="Theme Settings"
          steps={[
            "Go to the Settings page",
            "Toggle between Light and Dark mode",
            "Changes are saved automatically",
            "Theme preference is remembered for future visits"
          ]}
        />
        
        <HelpCard
          title="Job Board API Keys"
          steps={[
            "Add API keys for premium job boards",
            "Enable advanced search features",
            "API keys are securely stored",
            "Manage and update keys anytime"
          ]}
          isWorkInProgress={true}
        />
        
        <HelpCard
          title="Notification Preferences"
          steps={[
            "Choose which notifications you want to receive",
            "Set frequency of job alerts",
            "Configure email notification settings",
            "Enable browser notifications for real-time updates"
          ]}
          isWorkInProgress={true}
        />
      </HelpSection>
    </TabsContent>
  );
};

export default SettingsHelp;
