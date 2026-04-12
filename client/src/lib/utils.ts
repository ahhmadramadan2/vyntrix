// Combine class names (simple utility)
export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Format date to readable string
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get color class based on match score
export const getScoreColor = (score: number): string => {
  if (score >= 75) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
};

// Get badge color for application status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "ACCEPTED":  return "bg-green-500/20 text-green-400";
    case "REJECTED":  return "bg-red-500/20 text-red-400";
    case "REVIEWED":  return "bg-blue-500/20 text-blue-400";
    default:          return "bg-gray-500/20 text-gray-400";
  }
};

// Get badge color for job type
export const getJobTypeColor = (type: string): string => {
  switch (type) {
    case "FULL_TIME":   return "bg-primary-500/20 text-primary-500";
    case "INTERNSHIP":  return "bg-purple-500/20 text-purple-400";
    case "PART_TIME":   return "bg-yellow-500/20 text-yellow-400";
    case "REMOTE":      return "bg-teal-500/20 text-teal-400";
    default:            return "bg-gray-500/20 text-gray-400";
  }
};

// Format job type to readable label
export const formatJobType = (type: string): string => {
  return type.replace("_", " ");
};