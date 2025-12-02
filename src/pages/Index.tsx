import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import WaveBackground from "@/components/WaveBackground";
import IdeaInput from "@/components/IdeaInput";
import AnalysisResults from "@/components/AnalysisResults";
import ChurningAnimation from "@/components/ChurningAnimation";
import HistoryInsight from "@/components/HistoryInsight";
import WisdomLevel from "@/components/WisdomLevel";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import CompetitorAnalysis from "@/components/CompetitorAnalysis";
import { useWisdomTracking } from "@/hooks/useWisdomTracking";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

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

type ViewMode = "input" | "analysis" | "chat" | "competitor";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisB, setAnalysisB] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShivaMode, setShowShivaMode] = useState(false);
  const [deeperAnalysis, setDeeperAnalysis] = useState(false);
  const [showChurningAnimation, setShowChurningAnimation] = useState(false);
  const [showHistoryInsight, setShowHistoryInsight] = useState(false);
  const [isHumanityMode, setIsHumanityMode] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [currentIdea, setCurrentIdea] = useState("");
  const navigate = useNavigate();

  const { wisdomData, recordChurn, shouldShowInsight } = useWisdomTracking();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createConversation = async (ideaText: string) => {
    if (!user) return null;

    try {
      const title = ideaText.slice(0, 50) + (ideaText.length > 50 ? "..." : "");
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  };

  const saveInitialAnalysis = async (conversationId: string, analysisData: Analysis) => {
    try {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "system",
        content: JSON.stringify(analysisData),
      });
    } catch (error) {
      console.error("Failed to save initial analysis:", error);
    }
  };

  const saveToHistory = async (ideaA: string, ideaB: string | null, analysisData: Analysis, conversationId?: string) => {
    if (!user) return;

    try {
      await supabase.from("churn_history").insert({
        user_id: user.id,
        idea_text: ideaA,
        idea_b_text: ideaB,
        is_humanity_mode: isHumanityMode,
        amrit_view: JSON.stringify(analysisData.amrit),
        halahala_view: JSON.stringify(analysisData.halahala),
        bvi_score: analysisData.bvi.score,
        shiva_mode: JSON.stringify(analysisData.shivaMode || {}),
        conversation_id: conversationId || null,
      });
    } catch (error) {
      console.error("Failed to save to history:", error);
    }
  };

  const handleChurn = async (ideaA: string, ideaB?: string) => {
    setIsLoading(true);
    setShowChurningAnimation(true);
    setAnalysis(null);
    setAnalysisB(null);
    setIsCompareMode(!!ideaB);
    setCurrentIdea(ideaA);

    try {
      // Create conversation first
      const conversation = await createConversation(ideaA);
      if (conversation) {
        setCurrentConversationId(conversation.id);
      }

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
        setViewMode("analysis");

        // Save to history and conversation
        await saveToHistory(ideaA, ideaB, resultA.data, conversation?.id);
        if (conversation) {
          await saveInitialAnalysis(conversation.id, resultA.data);
        }

        const countAfterA = recordChurn(resultA.data.bvi.score);
        const countAfterB = recordChurn(resultB.data.bvi.score);

        if (shouldShowInsight(countAfterB)) {
          setShowHistoryInsight(true);
        }

        setDeeperAnalysis(false);
        toast.success("Both ideas analyzed!");
      } else {
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
        setViewMode("analysis");

        // Save to history and conversation
        await saveToHistory(ideaA, null, data, conversation?.id);
        if (conversation) {
          await saveInitialAnalysis(conversation.id, data);
        }

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
    setViewMode("input");
  };

  const handleNewChat = () => {
    setAnalysis(null);
    setAnalysisB(null);
    setCurrentConversationId(null);
    setViewMode("input");
    setCurrentIdea("");
  };

  const handleSelectConversation = async (id: string | null) => {
    if (!id) {
      handleNewChat();
      return;
    }
    setCurrentConversationId(id);
    setViewMode("chat");
  };

  const handleContinueChat = () => {
    if (currentConversationId) {
      setViewMode("chat");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <WaveBackground />

      {/* Sidebar */}
      <ChatSidebar
        userId={user.id}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        wisdomData={wisdomData}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-auto">
        {showChurningAnimation && (
          <ChurningAnimation onComplete={() => setShowChurningAnimation(false)} />
        )}

        {showHistoryInsight && (
          <HistoryInsight onClose={() => setShowHistoryInsight(false)} />
        )}

        {viewMode === "chat" && currentConversationId ? (
          <div className="h-screen">
            <ChatInterface conversationId={currentConversationId} userId={user.id} />
          </div>
        ) : viewMode === "competitor" ? (
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <CompetitorAnalysis 
              onBack={() => setViewMode(analysis ? "analysis" : "input")} 
              initialIdea={currentIdea}
            />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <header className="text-center mb-12 space-y-4 animate-float">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="text-sm text-primary hover:underline"
                >
                  View Profile & History
                </button>
              </div>
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
              {viewMode === "input" || !analysis ? (
                <div className="space-y-6">
                  <IdeaInput
                    onChurn={handleChurn}
                    isLoading={isLoading}
                    isHumanityMode={isHumanityMode}
                    onToggleHumanityMode={setIsHumanityMode}
                  />
                  
                  {/* Competitor Analysis Button */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setViewMode("competitor")}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Competitor Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnalysisResults
                    analysis={analysis}
                    analysisB={analysisB || undefined}
                    onChurnAgain={handleChurnAgain}
                    showShivaMode={showShivaMode}
                    onToggleShivaMode={setShowShivaMode}
                    isCompareMode={isCompareMode}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {currentConversationId && (
                      <Button onClick={handleContinueChat} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                        Continue Chat →
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setViewMode("competitor")}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Competitors
                    </Button>
                  </div>
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="mt-16 text-center text-sm text-muted-foreground/60">
              <p>Ancient wisdom meets modern AI reasoning</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
