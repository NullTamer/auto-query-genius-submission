
import React, { memo } from "react";
import { 
  ExternalLink, 
  Loader2, 
  MapPin, 
  Calendar, 
  Building, 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck,
  GraduationCap,
  Briefcase,
  Clock,
  Users,
  Award
} from "lucide-react";
import { SearchResult } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CandidateResultItemProps {
  result: SearchResult;
  index: number;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (result: SearchResult, index: number) => void;
}

const CandidateResultItem = memo(({ 
  result, 
  index, 
  isSaved, 
  isSaving, 
  onSave 
}: CandidateResultItemProps) => {
  // Format skills as badges if available
  const renderSkills = () => {
    if (!result.skills || result.skills.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {result.skills.slice(0, 5).map((skill, i) => (
          <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
            {skill}
          </Badge>
        ))}
        {result.skills.length > 5 && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
            +{result.skills.length - 5} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div
      className="p-4 border rounded-md bg-background/50 transition-all border-green-500/30 hover:border-green-500/50"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-primary">{result.title}</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            onClick={() => onSave(result, index)}
            disabled={isSaving || isSaved}
            title={isSaved ? "Profile saved" : "Save profile"}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-green-500" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-foreground hover:bg-primary/80 p-1 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-base font-medium mt-1">
          <Building size={14} className="mr-1" />
          <span>{result.company || "Not specified"}</span>
        </div>
        
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
          <CheckCircle size={12} className="mr-1" />
          {result.source}
        </Badge>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mt-1 flex-wrap gap-3">
        {result.location && (
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>{result.location}</span>
          </div>
        )}
        {result.experienceLevel && (
          <div className="flex items-center">
            <Award size={14} className="mr-1" />
            <span>{result.experienceLevel}</span>
          </div>
        )}
        {result.education && (
          <div className="flex items-center">
            <GraduationCap size={14} className="mr-1" />
            <span>{result.education}</span>
          </div>
        )}
        {result.lastActive && (
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>Active: {result.lastActive}</span>
          </div>
        )}
        {result.connections !== undefined && (
          <div className="flex items-center">
            <Users size={14} className="mr-1" />
            <span>{result.connections} connections</span>
          </div>
        )}
      </div>

      {renderSkills()}
      
      <p className="mt-2 text-sm line-clamp-3">{result.snippet}</p>
      
      {result.profileCompleteness !== undefined && (
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
            <div 
              className="bg-green-500 h-1.5 rounded-full" 
              style={{ width: `${result.profileCompleteness}%` }}
            ></div>
          </div>
          <span>Profile: {result.profileCompleteness}% complete</span>
        </div>
      )}
    </div>
  );
});

CandidateResultItem.displayName = "CandidateResultItem";

export default CandidateResultItem;
