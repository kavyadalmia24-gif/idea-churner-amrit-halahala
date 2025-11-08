import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";
import IdeaInput from "@/components/IdeaInput";
import AnalysisResults from "@/components/AnalysisResults";

interface Analysis {
  amrit: {
    title: string;
    insights: string[];
  };
  halahala: {
    title: string;
    risks: string[];
  };
  bvi: {
    score: number;
    reasoning: string;
  };
  shivaMode?: {
    title: string;
    mitigations: string[];
  };
}

const Index = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShivaMode, setShowShivaMode] = useState(false);
  const [deeperAnalysis, setDeeperAnalysis] = useState(false);

  const handleChurn = async (idea: string) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("churn-idea", {
        body: { idea, deeperAnalysis },
      });

      if (error) {
        console.error("Function error:", error);
        toast.error(error.message || "Failed to analyze idea");
        return;
      }

      if (!data) {
        toast.error("No response from analysis");
        return;
      }

      setAnalysis(data);
      setDeeperAnalysis(false);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to connect to analysis service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChurnAgain = () => {
    setDeeperAnalysis(true);
    if (analysis) {
      // Re-analyze with deeper mode
      const lastIdea = localStorage.getItem("lastIdea");
      if (lastIdea) {
        handleChurn(lastIdea);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WaveBackground />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 space-y-4 animate-float">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-gold mb-2">
            मंथन AI
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            The Idea Churner
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every idea hides both nectar and poison. Let's churn both before you drink.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70 italic">
            <span className="text-primary">~</span>
            <span>Inspired by Samudra Manthan</span>
            <span className="text-primary">~</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {!analysis ? (
            <IdeaInput
              onChurn={(idea) => {
                localStorage.setItem("lastIdea", idea);
                handleChurn(idea);
              }}
              isLoading={isLoading}
            />
          ) : (
            <AnalysisResults
              analysis={analysis}
              onChurnAgain={handleChurnAgain}
              showShivaMode={showShivaMode}
              onToggleShivaMode={setShowShivaMode}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground/60">
          <p>Ancient wisdom meets modern AI reasoning</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
