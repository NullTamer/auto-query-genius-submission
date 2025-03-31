
import React from "react";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
  isWorkInProgress?: boolean;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isWorkInProgress }) => {
  return (
    <Card className="p-4 cyber-card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-primary">{question}</h3>
        {isWorkInProgress && (
          <div className="flex items-center text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            <Construction size={14} className="mr-1" />
            <span>Coming Soon</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </Card>
  );
};

export default FaqItem;
