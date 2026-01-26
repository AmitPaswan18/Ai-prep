import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

const ScoreDisplay = ({
  score,
  size = "md",
  showBadge = false,
}: ScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-average";
    return "score-poor";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "score-bg-excellent";
    if (score >= 60) return "score-bg-good";
    if (score >= 40) return "score-bg-average";
    return "score-bg-poor";
  };

  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
  };

  if (showBadge) {
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-lg",
          getScoreBgColor(score),
          sizeClasses[size],
        )}>
        {score}%
      </span>
    );
  }

  return (
    <span
      className={cn("font-display", sizeClasses[size], getScoreColor(score))}>
      {score}%
    </span>
  );
};

export default ScoreDisplay;
