import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";
import IdeaInput from "@/components/IdeaInput";
import AnalysisResults from "@/components/AnalysisResults";
import ChurningAnimation from "@/components/ChurningAnimation";
import HistoryInsight from "@/components/HistoryInsight";
import WisdomLevel from "@/components/WisdomLevel";
import { useWisdomTracking } from "@/hooks/useWisdomTracking";

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
  const [analysisB, setAnalysisB] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShivaMode, setShowShivaMode] = useState(false);
  const [deeperAnalysis, setDeeperAnalysis] = useState(false);
  const [showChurningAnimation, setShowChurningAnimation] = useState(false);
  const [showHistoryInsight, setShowHistoryInsight] = useState(false);
  const [isHumanityMode, setIsHumanityMode] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const { wisdomData, recordChurn, shouldShowInsight } = useWisdomTracking();

  const handleChurn = async (ideaA: string, ideaB?: string) => {
    setIsLoading(true);
    setShowChurningAnimation(true);
    setAnalysis(null);
    setAnalysisB(null);
    setIsCompareMode(!!ideaB);

    try {
      // Handle comparison mode
      if (ideaB) {
        const [resultA, resultB] = await Promise.all([
          supabase.functions.invoke("churn-idea", {
            body: { idea: ideaA, deeperAnalysis, isHumanityMode },
          }),
          supabase.functions.invoke("churn-idea", {
            body: { idea: ideaB, deeperAnalysis, isHumanityMode },
          }),
        ]);

        if (resultA.error || resultB.error) {
          console.error("Function errors:", resultA.error, resultB.error);
          toast.error("Failed to analyze one or both ideas");
          setShowChurningAnimation(false);
          return;
        }

        if (!resultA.data || !resultB.data) {
          toast.error("No response from analysis");
          setShowChurningAnimation(false);
          return;
        }

        setAnalysis(resultA.data);
        setAnalysisB(resultB.data);

        // Record both churns
        const countAfterA = recordChurn(resultA.data.bvi.score);
        const countAfterB = recordChurn(resultB.data.bvi.score);

        if (shouldShowInsight(countAfterB)) {
          setShowHistoryInsight(true);
        }

        setDeeperAnalysis(false);
        toast.success("Both ideas analyzed!");
      } else {
        // Single idea mode
        const { data, error } = await supabase.functions.invoke("churn-idea", {
          body: { idea: ideaA, deeperAnalysis, isHumanityMode },
        });

        if (error) {
          console.error("Function error:", error);
          toast.error(error.message || "Failed to analyze idea");
          setShowChurningAnimation(false);
          return;
        }

        if (!data) {
          toast.error("No response from analysis");
          setShowChurningAnimation(false);
          return;
        }

        setAnalysis(data);

        // Record churn and check for insight
        const churnCount = recordChurn(data.bvi.score);
        if (shouldShowInsight(churnCount)) {
          setShowHistoryInsight(true);
        }

        setDeeperAnalysis(false);
        toast.success("Analysis complete!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to connect to analysis service");
      setShowChurningAnimation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChurnAgain = () => {
    setDeeperAnalysis(true);
    setAnalysis(null);
    setAnalysisB(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WaveBackground />

      {/* Wisdom Level Badge */}
      {wisdomData.churnCount > 0 && (
        <WisdomLevel churnCount={wisdomData.churnCount} avgBVI={wisdomData.avgBVI} />
      )}

      {/* Churning Animation */}
      {showChurningAnimation && (
        <ChurningAnimation onComplete={() => setShowChurningAnimation(false)} />
      )}

      {/* History Insight Easter Egg */}
      {showHistoryInsight && (
        <HistoryInsight onClose={() => setShowHistoryInsight(false)} />
      )}

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
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
              onChurn={handleChurn}
              isLoading={isLoading}
              isHumanityMode={isHumanityMode}
              onToggleHumanityMode={setIsHumanityMode}
            />
          ) : (
            <AnalysisResults
              analysis={analysis}
              analysisB={analysisB || undefined}
              onChurnAgain={handleChurnAgain}
              showShivaMode={showShivaMode}
              onToggleShivaMode={setShowShivaMode}
              isCompareMode={isCompareMode}
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
