
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, FileBadge, User, Settings, 
  Lightbulb, MessageCircleQuestion
} from "lucide-react";

const HelpTabs: React.FC = () => {
  return (
    <TabsList className="mb-6 bg-background/50 p-1 gap-2 flex-wrap">
      <TabsTrigger value="search" className="gap-2">
        <Search size={16} />
        <span>Job Search</span>
      </TabsTrigger>
      <TabsTrigger value="resume" className="gap-2">
        <FileBadge size={16} />
        <span>Resume</span>
      </TabsTrigger>
      <TabsTrigger value="profile" className="gap-2">
        <User size={16} />
        <span>Profile</span>
      </TabsTrigger>
      <TabsTrigger value="settings" className="gap-2">
        <Settings size={16} />
        <span>Settings</span>
      </TabsTrigger>
      <TabsTrigger value="tips" className="gap-2">
        <Lightbulb size={16} />
        <span>Tips</span>
      </TabsTrigger>
      <TabsTrigger value="faq" className="gap-2">
        <MessageCircleQuestion size={16} />
        <span>FAQ</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default HelpTabs;
