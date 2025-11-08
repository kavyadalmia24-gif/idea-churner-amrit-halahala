import { useEffect, useState } from "react";

interface ChurningAnimationProps {
  onComplete: () => void;
  duration?: number;
}

const ChurningAnimation = ({ onComplete, duration = 4000 }: ChurningAnimationProps) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Optional audio - uncomment if you want ocean waves sound
    // const audio = new Audio('/ocean-waves.mp3');
    // audio.play().catch(e => console.log('Audio play failed:', e));

    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[hsl(213,94%,20%)] via-[hsl(213,94%,15%)] to-[hsl(213,94%,10%)] transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* Spiral Animation */}
      <div className="relative">
        {/* Outer rotating circle */}
        <div className="w-64 h-64 border-4 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        
        {/* Middle rotating circle */}
        <div className="absolute inset-8 border-4 border-accent/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        
        {/* Inner rotating circle */}
        <div className="absolute inset-16 border-4 border-primary/50 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary/30 rounded-full animate-pulse blur-xl" />
        </div>

        {/* Wave effect */}
        <svg className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-32 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="hsl(213 94% 25%)"
            fillOpacity="0.4"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center space-y-2">
        <p className="text-2xl font-bold text-gradient-gold animate-pulse">
          मंथन चल रहा है...
        </p>
        <p className="text-sm text-muted-foreground italic">
          Churning the cosmic ocean of possibilities
        </p>
      </div>
    </div>
  );
};

export default ChurningAnimation;
