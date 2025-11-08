import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";

interface IdeaInputProps {
  onChurn: (idea: string) => void;
  isLoading: boolean;
}

const IdeaInput = ({ onChurn, isLoading }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      onChurn(idea.trim());
    }
  };

  const wordCount = idea.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount >= 10 && wordCount <= 200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="relative">
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea or goal in 50-200 words..."
          className="min-h-[150px] resize-none bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {wordCount} words
        </div>
      </div>

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
            Begin the Churning
          </>
        )}
      </Button>
    </form>
  );
};

export default IdeaInput;
