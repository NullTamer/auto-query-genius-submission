
import React from "react";
import { Check, Linkedin, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobBoardCheckboxProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const JobBoardCheckbox: React.FC<JobBoardCheckboxProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
}) => {
  // Get the appropriate icon based on the board name
  const getIcon = () => {
    switch (name) {
      case "linkedin":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "github":
        return <Github className="h-4 w-4 mr-2" />;
      case "twitter":
        return <Twitter className="h-4 w-4 mr-2" />;
      case "stackoverflow":
        return <span className="mr-2">&#xf16c;</span>; // Stack Overflow icon
      case "google":
        return <span className="mr-2">G</span>;
      case "indeed":
        return <span className="mr-2">In</span>;
      case "wellfound":
        return <span className="mr-2">W</span>;
      default:
        return null;
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex w-full items-center justify-start px-3 py-2 rounded-full text-sm font-medium transition-all",
        checked 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary/80 text-muted-foreground hover:bg-secondary/90 hover:text-foreground"
      )}
      aria-checked={checked}
    >
      {getIcon()}
      <span>{label}</span>
      {checked && (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
};

export default JobBoardCheckbox;
