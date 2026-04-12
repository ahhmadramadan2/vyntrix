import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-dark-800 border border-slate-700/50 rounded-xl p-6",
        onClick &&
          "cursor-pointer hover:border-primary-500/50 transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
};
