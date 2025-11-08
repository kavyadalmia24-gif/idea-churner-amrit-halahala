import { useEffect, useState } from "react";

interface BalanceMeterProps {
  score: number;
  size?: number;
}

const BalanceMeter = ({ score, size = 160 }: BalanceMeterProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (score: number) => {
    if (score >= 71) return "hsl(142, 76%, 36%)"; // green
    if (score >= 41) return "hsl(48, 96%, 53%)"; // yellow
    return "hsl(0, 84%, 60%)"; // red
  };

  const getGlowColor = (score: number) => {
    if (score >= 71) return "0 0 40px hsla(142, 76%, 36%, 0.6)";
    if (score >= 41) return "0 0 40px hsla(48, 96%, 53%, 0.6)";
    return "0 0 40px hsla(0, 84%, 60%, 0.6)";
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="70"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          fill="none"
          opacity="0.2"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="70"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(${getGlowColor(score)})`,
          }}
        />
      </svg>
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold" style={{ color }}>
          {animatedScore}
        </div>
        <div className="text-xs text-muted-foreground mt-1">/ 100</div>
      </div>
      {/* Ripple effect when complete */}
      {animatedScore === score && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            animationDuration: "2s",
            animationIterationCount: "3",
          }}
        />
      )}
    </div>
  );
};

export default BalanceMeter;
