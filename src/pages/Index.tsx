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
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
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
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const { wisdomData, recordChurn, shouldShowInsight } = useWisdomTracking();

  useEffect(() => {
    // Check authentication
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

  const createNewConversation = async (title: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveToHistory = async (ideaA: string, ideaB: string | null, analysisData: Analysis, conversationId: string) => {
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
        conversation_id: conversationId,
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
    setShowChat(false);

    // Create new conversation
    const title = ideaB 
      ? `${ideaA.slice(0, 30)}... vs ${ideaB.slice(0, 30)}...`
      : ideaA.slice(0, 50) + (ideaA.length > 50 ? '...' : '');
    
    const conversationId = await createNewConversation(title);
    if (conversationId) {
      setCurrentConversationId(conversationId);
    }

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

        // Save both to history
        if (conversationId) {
          await saveToHistory(ideaA, ideaB, resultA.data, conversationId);

          // Save initial churn as system message
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'system',
            content: `Churned ideas:\nA: "${ideaA}"\nB: "${ideaB}"\n\nBVI Scores: A=${resultA.data.bvi.score}, B=${resultB.data.bvi.score}`,
          });
        }

        // Record both churns
        const countAfterA = recordChurn(resultA.data.bvi.score);
        const countAfterB = recordChurn(resultB.data.bvi.score);

        if (shouldShowInsight(countAfterB)) {
          setShowHistoryInsight(true);
        }

        setDeeperAnalysis(false);
        setShowChat(true);
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

        // Save to history
        if (conversationId) {
          await saveToHistory(ideaA, null, data, conversationId);

          // Save initial churn as system message
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'system',
            content: `Churned idea: "${ideaA}"\n\nAmrit View: ${JSON.stringify(data.amrit)}\n\nHalahala View: ${JSON.stringify(data.halahala)}\n\nBVI Score: ${data.bvi.score}`,
          });
        }

        // Record churn and check for insight
        const churnCount = recordChurn(data.bvi.score);
        if (shouldShowInsight(churnCount)) {
          setShowHistoryInsight(true);
        }

        setDeeperAnalysis(false);
        setShowChat(true);
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
    setShowChat(false);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setAnalysis(null);
    setAnalysisB(null);
    setShowChat(false);
    setDeeperAnalysis(false);
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setShowChat(true);
    setAnalysis(null);
    setAnalysisB(null);
    
    // Load the churn history for this conversation to show results
    const { data } = await supabase
      .from('churn_history')
      .select('*')
      .eq('conversation_id', id)
      .single();
    
    if (data) {
      const amritView = JSON.parse(data.amrit_view);
      const halahalaView = JSON.parse(data.halahala_view);
      const shivaMode = data.shiva_mode ? JSON.parse(data.shiva_mode) : undefined;
      
      setAnalysis({
        amrit: amritView,
        halahala: halahalaView,
        bvi: { score: data.bvi_score, reasoning: "" },
        shivaMode: shivaMode,
      });
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <ChatSidebar
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        churnCount={wisdomData.churnCount}
        avgBVI={wisdomData.avgBVI}
      />

      <div className="flex-1 relative overflow-hidden">
        <WaveBackground />

        {/* Churning Animation */}
        {showChurningAnimation && (
          <ChurningAnimation onComplete={() => setShowChurningAnimation(false)} />
        )}

        {/* History Insight Easter Egg */}
        {showHistoryInsight && (
          <HistoryInsight onClose={() => setShowHistoryInsight(false)} />
        )}

        <div className="relative z-10 h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gradient-gold">
                  मंथन AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Churning Ideas into Wisdom
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-sm"
              >
                View Profile
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {showChat && currentConversationId ? (
              <div className="h-full flex flex-col">
                {analysis && (
                  <div className="border-b border-border bg-card/50 p-4 max-h-[40vh] overflow-y-auto">
                    <AnalysisResults
                      analysis={analysis}
                      analysisB={analysisB || undefined}
                      onChurnAgain={handleChurnAgain}
                      showShivaMode={showShivaMode}
                      onToggleShivaMode={setShowShivaMode}
                      isCompareMode={isCompareMode}
                    />
                  </div>
                )}
                <ChatInterface conversationId={currentConversationId} />
              </div>
            ) : !analysis ? (
              <div className="h-full flex items-center justify-center p-4">
                <IdeaInput
                  onChurn={handleChurn}
                  isLoading={isLoading}
                  isHumanityMode={isHumanityMode}
                  onToggleHumanityMode={setIsHumanityMode}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <AnalysisResults
                  analysis={analysis}
                  analysisB={analysisB || undefined}
                  onChurnAgain={handleChurnAgain}
                  showShivaMode={showShivaMode}
                  onToggleShivaMode={setShowShivaMode}
                  isCompareMode={isCompareMode}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
