import { Card } from "./ui/card";
import { Droplet, Skull, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import BalanceMeter from "./BalanceMeter";
import PhilosophicalQuote from "./PhilosophicalQuote";

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

interface AnalysisResultsProps {
  analysis: Analysis;
  analysisB?: Analysis;
  onChurnAgain: () => void;
  showShivaMode: boolean;
  onToggleShivaMode: (show: boolean) => void;
  isCompareMode?: boolean;
}

const AnalysisResults = ({
  analysis,
  analysisB,
  onChurnAgain,
  showShivaMode,
  onToggleShivaMode,
  isCompareMode = false,
}: AnalysisResultsProps) => {
  if (isCompareMode && analysisB) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Comparison Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gradient-gold mb-2">
            Manthan Duel – The Truth Revealed
          </h2>
          <p className="text-sm text-muted-foreground">Side-by-side analysis</p>
        </div>

        {/* Shiva Mode Toggle */}
        <div className="flex items-center justify-end space-x-3 mb-6">
          <Label htmlFor="shiva-mode" className="text-sm text-muted-foreground cursor-pointer">
            Shiva Mode
          </Label>
          <Switch
            id="shiva-mode"
            checked={showShivaMode}
            onCheckedChange={onToggleShivaMode}
            className="data-[state=checked]:bg-accent"
          />
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Idea A */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary text-center">Idea A</h3>
            
            {/* Amrit A */}
            <Card className="p-4 bg-gradient-to-br from-primary/20 to-card border-primary/30 backdrop-blur-sm animate-[glow_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-gradient-ocean">Amrit</h4>
              </div>
              <ul className="space-y-2 text-sm">
                {analysis.amrit.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-primary">✦</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Halahala A */}
            <Card className="p-4 bg-gradient-to-br from-destructive/20 to-card border-destructive/30 backdrop-blur-sm animate-[shadow-pulse_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <Skull className="w-5 h-5 text-destructive" />
                <h4 className="font-bold text-destructive">Halahala</h4>
              </div>
              <ul className="space-y-2 text-sm">
                {analysis.halahala.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-destructive">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* BVI A */}
            <Card className="p-4 bg-gradient-to-br from-card to-muted border-border/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <BalanceMeter score={analysis.bvi.score} size={120} />
                <p className="text-xs text-muted-foreground text-center">
                  {analysis.bvi.reasoning}
                </p>
              </div>
            </Card>
          </div>

          {/* Idea B */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-accent text-center">Idea B</h3>
            
            {/* Amrit B */}
            <Card className="p-4 bg-gradient-to-br from-primary/20 to-card border-primary/30 backdrop-blur-sm animate-[glow_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-gradient-ocean">Amrit</h4>
              </div>
              <ul className="space-y-2 text-sm">
                {analysisB.amrit.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-primary">✦</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Halahala B */}
            <Card className="p-4 bg-gradient-to-br from-destructive/20 to-card border-destructive/30 backdrop-blur-sm animate-[shadow-pulse_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="flex items-center gap-2 mb-3">
                <Skull className="w-5 h-5 text-destructive" />
                <h4 className="font-bold text-destructive">Halahala</h4>
              </div>
              <ul className="space-y-2 text-sm">
                {analysisB.halahala.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-destructive">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* BVI B */}
            <Card className="p-4 bg-gradient-to-br from-card to-muted border-border/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <BalanceMeter score={analysisB.bvi.score} size={120} />
                <p className="text-xs text-muted-foreground text-center">
                  {analysisB.bvi.reasoning}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Winner Declaration */}
        <Card className="p-6 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gradient-gold mb-2">Verdict</h3>
            {analysis.bvi.score > analysisB.bvi.score ? (
              <p className="text-foreground">
                <span className="text-primary font-bold">Idea A</span> shows higher viability (BVI: {analysis.bvi.score} vs {analysisB.bvi.score})
              </p>
            ) : analysis.bvi.score < analysisB.bvi.score ? (
              <p className="text-foreground">
                <span className="text-accent font-bold">Idea B</span> shows higher viability (BVI: {analysisB.bvi.score} vs {analysis.bvi.score})
              </p>
            ) : (
              <p className="text-foreground">
                Both ideas show <span className="text-yellow-400 font-bold">equal viability</span> (BVI: {analysis.bvi.score})
              </p>
            )}
          </div>
        </Card>

        {/* Shiva Mode for both */}
        {showShivaMode && (
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.shivaMode && (
              <Card className="p-4 bg-gradient-to-br from-accent/20 to-card border-accent/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <h4 className="font-bold text-gradient-gold">Shiva Mode A</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  {analysis.shivaMode.mitigations.map((mitigation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-accent">🛡</span>
                      <span>{mitigation}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {analysisB.shivaMode && (
              <Card className="p-4 bg-gradient-to-br from-accent/20 to-card border-accent/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <h4 className="font-bold text-gradient-gold">Shiva Mode B</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  {analysisB.shivaMode.mitigations.map((mitigation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-accent">🛡</span>
                      <span>{mitigation}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        <PhilosophicalQuote />

        <Button
          onClick={onChurnAgain}
          variant="outline"
          className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-primary-foreground"
        >
          Churn Again
        </Button>
      </div>
    );
  }

  // Single idea analysis view
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Shiva Mode Toggle */}
      <div className="flex items-center justify-end space-x-3 mb-6">
        <Label htmlFor="shiva-mode" className="text-sm text-muted-foreground cursor-pointer">
          Shiva Mode
        </Label>
        <Switch
          id="shiva-mode"
          checked={showShivaMode}
          onCheckedChange={onToggleShivaMode}
          className="data-[state=checked]:bg-accent"
        />
      </div>

      {/* Amrit View with golden glow */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 to-card border-primary/30 backdrop-blur-sm animate-[glow_2s_ease-in-out_infinite] shadow-[0_0_30px_rgba(251,191,36,0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <Droplet className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-gradient-ocean">Amrit: The Nectar</h3>
        </div>
        <ul className="space-y-3">
          {analysis.amrit.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2 text-foreground/90">
              <span className="text-primary mt-1">✦</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Halahala View with blue shadow */}
      <Card className="p-6 bg-gradient-to-br from-destructive/20 to-card border-destructive/30 backdrop-blur-sm animate-[shadow-pulse_2s_ease-in-out_infinite] shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <Skull className="w-6 h-6 text-destructive" />
          <h3 className="text-xl font-bold text-destructive">Halahala: The Poison</h3>
        </div>
        <ul className="space-y-3">
          {analysis.halahala.risks.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2 text-foreground/90">
              <span className="text-destructive mt-1">⚠</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* BVI Score with Balance Meter */}
      <Card className="p-6 bg-gradient-to-br from-card to-muted border-border/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-accent text-center mb-6">Balanced Viability Index</h3>
        <div className="flex flex-col items-center gap-4">
          <BalanceMeter score={analysis.bvi.score} />
          <p className="text-sm text-muted-foreground max-w-lg text-center">
            {analysis.bvi.reasoning}
          </p>
        </div>
      </Card>

      {/* Shiva Mode with ripple effect */}
      {showShivaMode && analysis.shivaMode && (
        <div className="relative">
          <div className="absolute inset-0 bg-accent/5 rounded-lg animate-ping" style={{ animationDuration: '3s', animationIterationCount: '1' }} />
          <Card className="relative p-6 bg-gradient-to-br from-accent/20 to-card border-accent/30 backdrop-blur-sm animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold text-gradient-gold">
                Shiva Mode: Absorbing the Poison
              </h3>
            </div>
            <ul className="space-y-3">
              {analysis.shivaMode.mitigations.map((mitigation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground/90">
                  <span className="text-accent mt-1">🛡</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Philosophical Quote */}
      <PhilosophicalQuote />

      {/* Churn Again Button */}
      <Button
        onClick={onChurnAgain}
        variant="outline"
        className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-primary-foreground"
      >
        Churn Again (Deeper Analysis)
      </Button>
    </div>
  );
};

export default AnalysisResults;
