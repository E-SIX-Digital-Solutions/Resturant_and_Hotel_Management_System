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
    <tr>
      <td colSpan={6} className="py-12">
        <div className="flex items-center justify-center w-full">
          <div
            className={`
                ${sizeClasses[size]} 
                border-4 border-gray-300 
                ${color} 
                rounded-full 
                animate-spin
                ${className}
            `}
          />
        </div>
      </td>
    </tr>
  );
};

export default Spinner;
