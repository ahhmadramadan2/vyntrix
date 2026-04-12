import { getScoreColor } from "../../lib/utils";

interface ScoreMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ScoreMeter = ({
  score,
  size = "md",
  showLabel = true,
}: ScoreMeterProps) => {
  const radius = size === "sm" ? 28 : size === "md" ? 36 : 48;
  const stroke = size === "sm" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;
  const fontSize =
    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl";

  const strokeColor =
    score >= 75
      ? "#4ade80"
      : score >= 50
        ? "#facc15"
        : score >= 25
          ? "#fb923c"
          : "#f87171";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#1e2132"
            strokeWidth={stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <span
          className={`absolute font-bold ${fontSize} ${getScoreColor(score)}`}
        >
          {score}
        </span>
      </div>
      {showLabel && <span className="text-xs text-slate-500">Match Score</span>}
    </div>
  );
};
