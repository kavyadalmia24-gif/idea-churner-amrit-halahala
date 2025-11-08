import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface IdeaInputProps {
  onChurn: (ideaA: string, ideaB?: string) => void;
  isLoading: boolean;
  isHumanityMode: boolean;
  onToggleHumanityMode: (enabled: boolean) => void;
}

const IdeaInput = ({ onChurn, isLoading, isHumanityMode, onToggleHumanityMode }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");
  const [ideaB, setIdeaB] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      if (compareMode && ideaB.trim()) {
        onChurn(idea.trim(), ideaB.trim());
      } else {
        onChurn(idea.trim());
      }
    }
  };

  const wordCountA = idea.trim().split(/\s+/).filter(Boolean).length;
  const wordCountB = ideaB.trim().split(/\s+/).filter(Boolean).length;
  const isValidA = wordCountA >= 10 && wordCountA <= 200;
  const isValidB = !compareMode || (wordCountB >= 10 && wordCountB <= 200);
  const isValid = isValidA && isValidB;

  const placeholder = isHumanityMode
    ? "Describe a global challenge facing humanity (e.g., climate change, misinformation, AI replacing jobs)..."
    : "Describe your idea or goal in 50-200 words...";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {/* Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <Label htmlFor="compare-mode" className="text-sm text-muted-foreground cursor-pointer">
            Compare Two Ideas
          </Label>
          <Switch
            id="compare-mode"
            checked={compareMode}
            onCheckedChange={setCompareMode}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center space-x-3">
          <Label htmlFor="humanity-mode" className="text-sm text-muted-foreground cursor-pointer">
            Churn for Humanity
          </Label>
          <Switch
            id="humanity-mode"
            checked={isHumanityMode}
            onCheckedChange={onToggleHumanityMode}
            disabled={isLoading}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
      </div>

      {isHumanityMode && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-purple-400 mb-1">
            मंथन for the Future of Humanity
          </h3>
          <p className="text-xs text-muted-foreground">
            Analyzing global-scale challenges and opportunities
          </p>
        </div>
      )}

      {compareMode && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-accent mb-1">
            Manthan Duel – Let the Ideas Reveal Their Truth
          </h3>
          <p className="text-xs text-muted-foreground">
            Enter two ideas to see them side-by-side
          </p>
        </div>
      )}

      {/* Idea A Input */}
      <div className="relative">
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={compareMode ? "Idea A: " + placeholder : placeholder}
          className="min-h-[150px] resize-none bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {wordCountA} words
        </div>
      </div>

      {/* Idea B Input (Comparison Mode) */}
      {compareMode && (
        <div className="relative">
          <Textarea
            value={ideaB}
            onChange={(e) => setIdeaB(e.target.value)}
            placeholder={"Idea B: " + placeholder}
            className="min-h-[150px] resize-none bg-card/50 backdrop-blur-sm border-border/50 focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {wordCountB} words
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
            Churning the Ocean...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            {compareMode ? "Churn Both Ideas" : "Begin the Churning"}
          </>
        )}
      </Button>
    </form>
  );
};

export default IdeaInput;
