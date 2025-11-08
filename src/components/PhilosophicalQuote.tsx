import { useEffect, useState } from "react";

const QUOTES = [
  "Even nectar can poison, if taken without reflection.",
  "Every idea hides both creation and destruction.",
  "To see clearly, churn both what is seen and unseen.",
  "Wisdom is balance between courage and caution.",
  "From chaos emerges clarity — if churned with patience.",
  "Truth reveals itself only to those who dare to look beyond comfort.",
  "The poison you fear may hold the medicine you need.",
  "Great ideas are forged in the fire of doubt and refined by faith.",
  "What appears as failure today may be the seed of tomorrow's triumph.",
  "In every ending lies a beginning; in every risk, an opportunity.",
];

const PhilosophicalQuote = () => {
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`mt-8 text-center transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <p className="text-lg italic text-muted-foreground font-serif max-w-2xl mx-auto leading-relaxed">
        "{quote}"
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/30" />
        <span className="text-xs text-primary/60">Ancient Wisdom</span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/30" />
      </div>
    </div>
  );
};

export default PhilosophicalQuote;
