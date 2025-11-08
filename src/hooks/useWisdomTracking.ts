import { useState, useEffect } from "react";

interface WisdomData {
  churnCount: number;
  totalBVI: number;
  avgBVI: number;
}

export const useWisdomTracking = () => {
  const [wisdomData, setWisdomData] = useState<WisdomData>({
    churnCount: 0,
    totalBVI: 0,
    avgBVI: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("manthan-wisdom");
    if (stored) {
      setWisdomData(JSON.parse(stored));
    }
  }, []);

  const recordChurn = (bviScore: number) => {
    const newCount = wisdomData.churnCount + 1;
    const newTotal = wisdomData.totalBVI + bviScore;
    const newAvg = Math.round(newTotal / newCount);

    const newData = {
      churnCount: newCount,
      totalBVI: newTotal,
      avgBVI: newAvg,
    };

    setWisdomData(newData);
    localStorage.setItem("manthan-wisdom", JSON.stringify(newData));

    return newCount;
  };

  const shouldShowInsight = (churnCount: number) => {
    return churnCount > 0 && churnCount % 3 === 0;
  };

  return {
    wisdomData,
    recordChurn,
    shouldShowInsight,
  };
};
