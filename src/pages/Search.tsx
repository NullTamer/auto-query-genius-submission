
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import NavigationPane from "@/components/layout/NavigationPane";
import { Search as SearchIcon, History, Copy, Check, Home } from "lucide-react";
import CandidateSearchModule from "@/components/CandidateSearchModule";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchProvider } from "@/components/job-search/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q") || "";
  const provider = (searchParams.get("provider") as SearchProvider) || "github";
  const selectedBoardsParam = searchParams.get("boards");
  const [isCopied, setIsCopied] = useState(false);
  
  // Parse selected boards from URL params if available,
  // ensuring only the specified provider is selected by default
  const selectedBoards = (() => {
    const boards: Record<string, boolean> = {
      google: false,
      linkedin: false,
      indeed: false,
      github: false,
      stackoverflow: false,
      twitter: false,
      wellfound: false
    };
    
    if (selectedBoardsParam) {
      // Set only the boards explicitly listed in the URL parameter
      selectedBoardsParam.split(',').forEach(board => {
        if (board in boards) {
          boards[board] = true;
        }
      });
    } else {
      // If no boards specified, only set the provider to true
      boards[provider] = true;
    }
    
    return boards;
  })();

  // Log the values for debugging
  useEffect(() => {
    console.log("Search page params:", {
      searchQuery,
      provider,
      selectedBoardsParam,
      selectedBoards
    });
  }, [searchQuery, provider, selectedBoardsParam, selectedBoards]);

  // If no query, redirect to home
  useEffect(() => {
    if (!searchQuery) {
      toast.error("Missing search query");
      navigate("/");
    }
  }, [searchQuery, navigate]);

  // Reset copied state after timeout
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleViewHistory = () => {
    navigate("/profile");
  };

  const handleNewSearch = () => {
    navigate("/");
  };

  const copyToClipboard = () => {
    if (!searchQuery) return;
    
    navigator.clipboard.writeText(searchQuery);
    setIsCopied(true);
    toast.success("Query copied to clipboard");
  };

  return (
    <div className="min-h-screen matrix-bg p-4 md:p-8 font-mono">
      <NavigationPane />
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 ml-16">
        <Card className="cyber-card p-4 md:p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="cyber-card hidden md:flex"
                onClick={handleNewSearch}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow">
                <SearchIcon className="inline mr-2 h-5 w-5" />
                Candidate Search Results
              </h2>
            </div>
            <div className="flex gap-2">
              {searchQuery && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="cyber-card"
                  onClick={copyToClipboard}
                >
                  {isCopied ? (
                    <><Check className="mr-2 h-4 w-4" /> Copied</>
                  ) : (
                    <><Copy className="mr-2 h-4 w-4" /> Copy Query</>
                  )}
                </Button>
              )}
              <Button 
                variant="outline"
                size="sm"
                className="cyber-card"
                onClick={handleViewHistory}
              >
                <History className="mr-2 h-4 w-4" />
                Search History
              </Button>
            </div>
          </div>
          
          <p className="mb-6 text-muted-foreground">
            Find candidate profiles based on the selected search terms or your own custom query. 
            Results include profiles from various professional networks.
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="cyber-card md:hidden mb-4 w-full"
            onClick={handleNewSearch}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          
          {searchQuery ? (
            <CandidateSearchModule 
              query={searchQuery} 
              keywords={[]}
              initialProvider={provider}
              initialSelectedBoards={selectedBoards}
            />
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No search query found. Start a new search from the home page.</p>
              <Button 
                className="mt-4 cyber-card hover:neon-glow" 
                onClick={handleNewSearch}
              >
                <Home className="mr-2 h-4 w-4" />
                New Search
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Search;
