
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import HelpTabs from "./components/HelpTabs";
import JobSearchHelp from "./sections/JobSearchHelp";
import ResumeHelp from "./sections/ResumeHelp";
import ProfileHelp from "./sections/ProfileHelp";
import SettingsHelp from "./sections/SettingsHelp";
import TipsHelp from "./sections/TipsHelp";
import FaqHelp from "./sections/FaqHelp";

const HelpPage: React.FC = () => {
  return (
    <div className="container py-6 animate-fade-in ml-16 lg:ml-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Help Center</h1>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <Home size={16} />
            <span>Home</span>
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="search" className="w-full">
        <HelpTabs />

        <ScrollArea className="h-[calc(100vh-250px)] rounded-md border p-4">
          <div className="help-content text-left w-full">
            <JobSearchHelp />
            <ResumeHelp />
            <ProfileHelp />
            <SettingsHelp />
            <TipsHelp />
            <FaqHelp />
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default HelpPage;
