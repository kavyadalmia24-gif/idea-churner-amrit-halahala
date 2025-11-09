import { Award } from "lucide-react";

interface WisdomLevelProps {
  churnCount: number;
  avgBVI: number;
}

const getWisdomLevel = (count: number) => {
  if (count >= 21) return { title: "Sage", icon: "🧘", color: "text-purple-400" };
  if (count >= 13) return { title: "Visionary", icon: "👁️", color: "text-indigo-400" };
  if (count >= 8) return { title: "Balancer", icon: "⚖️", color: "text-blue-400" };
  if (count >= 4) return { title: "Churner", icon: "🌊", color: "text-cyan-400" };
  return { title: "Seeker", icon: "🔍", color: "text-green-400" };
};

const WisdomLevel = ({ churnCount, avgBVI }: WisdomLevelProps) => {
  const level = getWisdomLevel(churnCount);

  return (
    <div className="animate-fade-in">
      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
        <span className="text-2xl">{level.icon}</span>
        <div className="text-left">
          <div className={`text-sm font-bold ${level.color}`}>
            {level.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {churnCount} churns • Avg {avgBVI}
          </div>
        </div>
        <Award className="w-4 h-4 text-accent" />
      </div>
    </div>
  );
};

export default WisdomLevel;
