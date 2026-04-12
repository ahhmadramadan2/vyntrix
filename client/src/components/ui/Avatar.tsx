import { cn } from "../../lib/utils";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const colors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

const getColor = (name: string) => {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const Avatar = ({
  name,
  avatarUrl,
  size = "md",
  className,
}: AvatarProps) => {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover border-2 border-slate-700/50 flex-shrink-0",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-slate-700/50",
        sizes[size],
        getColor(name),
        className,
      )}
    >
      {initials}
    </div>
  );
};
