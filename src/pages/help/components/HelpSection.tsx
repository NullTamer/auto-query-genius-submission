
import React from "react";
import { Separator } from "@/components/ui/separator";

interface HelpSectionProps {
  title: string;
  description: string;
  image: string;
  children: React.ReactNode;
}

const HelpSection: React.FC<HelpSectionProps> = ({ 
  title, 
  description, 
  image, 
  children 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-primary mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
        </div>
        {image && (
          <div className="w-full md:w-1/3">
            <img 
              src={image} 
              alt={title} 
              className="rounded-lg shadow-md border border-border"
            />
          </div>
        )}
      </div>
      <Separator className="my-4" />
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default HelpSection;
