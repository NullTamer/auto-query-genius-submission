
import React from "react";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface HelpCardProps {
  title: string;
  steps: string[];
  isWorkInProgress?: boolean;
}

const HelpCard: React.FC<HelpCardProps> = ({ title, steps, isWorkInProgress }) => {
  return (
    <Card className="p-4 cyber-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-primary">{title}</h3>
        {isWorkInProgress && (
          <div className="flex items-center text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            <Construction size={14} className="mr-1" />
            <span>Coming Soon</span>
          </div>
        )}
      </div>
      <ol className="list-decimal pl-5 space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="text-sm pl-1 mb-2">
            <span className="text-foreground block py-1">{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export default HelpCard;
