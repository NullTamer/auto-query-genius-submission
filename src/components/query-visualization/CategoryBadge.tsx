
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  term: string;
  category: string;
  frequency?: number;
  isRequired?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  term,
  category,
  frequency,
  isRequired = false
}) => {
  // Get category-specific styles
  const getCategoryStyles = () => {
    switch (category.toLowerCase()) {
      case "role":
        return "bg-blue-900/30 text-blue-300 dark:bg-blue-900/30 dark:text-blue-300 border-blue-800 dark:border-blue-800";
      case "technical skill":
      case "tech":
      case "programming language":
        return "bg-green-900/30 text-green-300 dark:bg-green-900/30 dark:text-green-300 border-green-800 dark:border-green-800";
      case "skill":
        return "bg-teal-900/30 text-teal-300 dark:bg-teal-900/30 dark:text-teal-300 border-teal-800 dark:border-teal-800";
      case "qualification":
        return "bg-purple-900/30 text-purple-300 dark:bg-purple-900/30 dark:text-purple-300 border-purple-800 dark:border-purple-800";
      case "related term":
        return "bg-amber-900/30 text-amber-300 dark:bg-amber-900/30 dark:text-amber-300 border-amber-800 dark:border-amber-800";
      default:
        return "bg-gray-900/30 text-gray-300 dark:bg-gray-900/30 dark:text-gray-300 border-gray-800 dark:border-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 text-xs font-medium rounded-full transition-all border backdrop-blur-sm",
        getCategoryStyles(),
        isRequired && "ring-1 ring-primary/40",
        "hover:shadow-glow hover:scale-105 transition-all duration-200"
      )}
    >
      {term}
      {frequency !== undefined && (
        <span className="ml-1 opacity-70 text-[10px]">({frequency})</span>
      )}
    </Badge>
  );
};

export default CategoryBadge;
