import { Card } from "./ui/card";
import { Droplet, Skull, Scale, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

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
  onChurnAgain: () => void;
  showShivaMode: boolean;
  onToggleShivaMode: (show: boolean) => void;
}

const AnalysisResults = ({
  analysis,
  onChurnAgain,
  showShivaMode,
  onToggleShivaMode,
}: AnalysisResultsProps) => {
  const getBviColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

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

      {/* Amrit View */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 to-card border-primary/30 backdrop-blur-sm">
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

      {/* Halahala View */}
      <Card className="p-6 bg-gradient-to-br from-destructive/20 to-card border-destructive/30 backdrop-blur-sm">
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

      {/* BVI Score */}
      <Card className="p-6 bg-gradient-to-br from-card to-muted border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-bold text-accent">Balanced Viability Index</h3>
        </div>
        <div className="text-center space-y-2">
          <div className={`text-6xl font-bold ${getBviColor(analysis.bvi.score)}`}>
            {analysis.bvi.score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {analysis.bvi.reasoning}
          </p>
        </div>
      </Card>

      {/* Shiva Mode */}
      {showShivaMode && analysis.shivaMode && (
        <Card className="p-6 bg-gradient-to-br from-accent/20 to-card border-accent/30 backdrop-blur-sm animate-scale-in">
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
      )}

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
