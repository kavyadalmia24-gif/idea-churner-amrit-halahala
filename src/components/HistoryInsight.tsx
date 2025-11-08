import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Scroll, X } from "lucide-react";
import { Button } from "./ui/button";

const INSIGHTS = [
  {
    source: "Chanakya",
    insight: "A wise plan is one that can survive its own criticism.",
  },
  {
    source: "Ashoka",
    insight: "True power is in self-control, not conquest.",
  },
  {
    source: "Aryabhata",
    insight: "Knowledge shines brighter when shared.",
  },
  {
    source: "Bhagavad Gita",
    insight: "Action without attachment to results brings true freedom.",
  },
  {
    source: "Buddha",
    insight: "The mind is everything. What you think, you become.",
  },
  {
    source: "Kabir",
    insight: "Where there is truth, there is no need for complexity.",
  },
  {
    source: "Ramayana",
    insight: "Loyalty and righteousness triumph over all obstacles.",
  },
  {
    source: "Mahabharata",
    insight: "Victory belongs to those who stand for truth, not those who stand for convenience.",
  },
];

interface HistoryInsightProps {
  onClose: () => void;
}

const HistoryInsight = ({ onClose }: HistoryInsightProps) => {
  const [insight, setInsight] = useState(INSIGHTS[0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const randomInsight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
    setInsight(randomInsight);
    
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`relative max-w-md mx-4 p-6 bg-gradient-to-br from-accent/20 to-card border-accent/30 transform transition-all duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <Scroll className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-bold text-gradient-gold">
            Decode from History
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-primary/80 font-semibold">
            ~ {insight.source} ~
          </p>
          <p className="text-base text-foreground leading-relaxed italic font-serif">
            "{insight.insight}"
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-accent/40 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HistoryInsight;
