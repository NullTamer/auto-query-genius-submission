
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TableOfContents } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TitlePageProps {
  onNavigateToSection?: (section: string) => void;
}

const TitlePage: React.FC<TitlePageProps> = ({ onNavigateToSection }) => {
  const handleNavigate = (section: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(section);
    }
  };

  const tableOfContents = [
    { id: "introduction", title: "Introduction", word_count: 785 },
    { id: "literature", title: "Literature Review", word_count: 1964 },
    { id: "design", title: "Design", word_count: 1066 },
    { id: "implementation", title: "Implementation", word_count: 1135 },
    { id: "evaluation", title: "Evaluation", word_count: 1907 },
    { id: "conclusion", title: "Conclusion", word_count: 846 }
  ];

  const totalWordCount = tableOfContents.reduce((acc, section) => acc + section.word_count, 0);

  return (
    <Card className="cyber-card p-6 md:p-8 animate-fade-in">
      <CardContent className="p-0 space-y-8">
        <div className="text-center space-y-4 pb-8 border-b border-primary/20">
          <h1 className="text-3xl md:text-4xl font-bold text-primary neon-glow">
            AutoSearchPro: Automated Search Strategy Generation
          </h1>
          <div className="flex justify-center">
            <div className="h-1 w-24 bg-primary/50 rounded-full"></div>
          </div>
          <p className="text-xl text-muted-foreground">
            CM3005 Data Science Final Project
          </p>
          <p className="text-lg">Adrian Lo</p>
          <p className="text-sm text-muted-foreground mt-4">
            Project word count: {totalWordCount} words (Max: 9500)
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TableOfContents className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Table of Contents</h2>
          </div>

          <div className="space-y-3">
            {tableOfContents.map((section) => (
              <div key={section.id} className="flex justify-between items-center p-2 hover:bg-primary/5 rounded-md transition-colors">
                <Button 
                  variant="ghost" 
                  className="text-left justify-start w-full"
                  onClick={() => handleNavigate(section.id)}
                >
                  <span className="text-lg">{section.title}</span>
                </Button>
                <span className="text-sm text-muted-foreground">{section.word_count} words</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <Button asChild className="cyber-card">
            <Link to="/comparison">
              <BookOpen className="mr-2 h-4 w-4" />
              Open Interactive Comparison
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TitlePage;
