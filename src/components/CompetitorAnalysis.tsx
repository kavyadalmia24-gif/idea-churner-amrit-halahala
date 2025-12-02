import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import {
  Target,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface CompetitorResult {
  competitorOverview: {
    name: string;
    description: string;
    marketPosition: string;
    estimatedSize: string;
    keyStrengths: string[];
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    trends: string[];
    targetSegments: string[];
  };
  competitiveAdvantages: {
    yourAdvantages: string[];
    theirAdvantages: string[];
    differentiationOpportunities: string[];
  };
  strategicRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskAssessment: {
    competitiveRisks: string[];
    marketRisks: string[];
    mitigationStrategies: string[];
  };
  overallScore: {
    competitiveViability: number;
    marketOpportunity: number;
    executionDifficulty: number;
    summary: string;
  };
}

interface CompetitorAnalysisProps {
  onBack: () => void;
  initialIdea?: string;
}

const CompetitorAnalysis = ({ onBack, initialIdea = "" }: CompetitorAnalysisProps) => {
  const [competitor, setCompetitor] = useState("");
  const [userIdea, setUserIdea] = useState(initialIdea);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResult | null>(null);

  const analyzeCompetitor = async () => {
    if (!competitor.trim() || !userIdea.trim()) {
      toast.error("Please enter both your idea and a competitor");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitor", {
        body: { competitor: competitor.trim(), userIdea: userIdea.trim() },
      });

      if (error) throw error;
      setResult(data);
      toast.success("Competitor analysis complete!");
    } catch (error: any) {
      console.error("Error analyzing competitor:", error);
      toast.error(error.message || "Failed to analyze competitor");
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  if (result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => setResult(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </Button>

        {/* Overall Scores */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.overallScore.summary}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <ScoreBar score={result.overallScore.competitiveViability} label="Competitive Viability" />
              <ScoreBar score={result.overallScore.marketOpportunity} label="Market Opportunity" />
              <ScoreBar score={result.overallScore.executionDifficulty} label="Execution Difficulty" />
            </div>
          </CardContent>
        </Card>

        {/* Competitor Overview */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{result.competitorOverview.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">{result.competitorOverview.description}</p>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Market Position:</span> {result.competitorOverview.marketPosition}</div>
              <div><span className="font-medium">Est. Size:</span> {result.competitorOverview.estimatedSize}</div>
            </div>
            <div>
              <span className="font-medium text-sm">Key Strengths:</span>
              <ul className="list-disc ml-5 mt-1 text-sm text-muted-foreground">
                {result.competitorOverview.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* SWOT Analysis */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" /> Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-sm space-y-1">
                {result.swotAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" /> Your Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-sm space-y-1">
                {result.swotAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                <Zap className="h-4 w-4" /> Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-sm space-y-1">
                {result.swotAnalysis.opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-4 w-4" /> Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-sm space-y-1">
                {result.swotAnalysis.threats.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Market Analysis */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium">Market Size:</span>
                <p className="text-muted-foreground">{result.marketAnalysis.marketSize}</p>
              </div>
              <div>
                <span className="font-medium">Growth Rate:</span>
                <p className="text-muted-foreground">{result.marketAnalysis.growthRate}</p>
              </div>
            </div>
            <div>
              <span className="font-medium">Key Trends:</span>
              <ul className="list-disc ml-5 mt-1 text-sm text-muted-foreground">
                {result.marketAnalysis.trends.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium">Target Segments:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.marketAnalysis.targetSegments.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium text-green-400">Immediate Actions:</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.strategicRecommendations.immediate.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium text-yellow-400">Short-term (3-6 months):</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.strategicRecommendations.shortTerm.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium text-blue-400">Long-term Strategy:</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.strategicRecommendations.longTerm.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <span className="font-medium text-red-400">Competitive Risks:</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.riskAssessment.competitiveRisks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium text-yellow-400">Market Risks:</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.riskAssessment.marketRisks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium text-green-400">Mitigation Strategies:</span>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {result.riskAssessment.mitigationStrategies.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Main Analysis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gradient-gold mb-2">Competitor Analysis</h2>
        <p className="text-muted-foreground">
          Get a full market analysis comparing your idea against competitors
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Idea / Product</label>
          <Textarea
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
            placeholder="Describe your idea or product..."
            className="min-h-[100px] bg-card/50 border-border/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Competitor (Name or URL)</label>
          <Input
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="e.g., Notion, Slack, or https://competitor.com"
            className="bg-card/50 border-border/50"
          />
        </div>

        <Button
          onClick={analyzeCompetitor}
          disabled={isLoading || !competitor.trim() || !userIdea.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Market...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Analyze Competitor
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
