
import React from "react";
import { Separator } from "@/components/ui/separator";

interface HelpHeaderProps {
  title: string;
  description?: string;
}

const HelpHeader: React.FC<HelpHeaderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-primary">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
      <Separator className="mt-3" />
    </div>
  );
};

export default HelpHeader;
