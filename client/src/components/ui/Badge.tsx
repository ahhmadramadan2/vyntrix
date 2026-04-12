import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={cn("px-2.5 py-1 rounded-full text-xs font-medium", className)}
    >
      {children}
    </span>
  );
};
