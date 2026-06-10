interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

const Spinner = ({
  size = "md",
  color = "border-t-yellow-600",
  className = "",
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`flex items-center justify-center ${className}`}
    >
      <div
        className={`
          ${sizeClasses[size]}
          border-4 border-gray-300
          ${color}
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
};

export default Spinner;
