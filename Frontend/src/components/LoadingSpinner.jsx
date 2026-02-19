const SIZE_MAP = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-20 h-20",
};

export default function LoadingSpinner({
  size = "md",
  overlay = true,
  className = "",
}) {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${overlay ? "bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-sm" : ""}`}
    >
      <div className={`relative ${sizeClasses} ${className}`}>
        {/* Soft inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 opacity-20 blur-2xl animate-pulse"></div>
        {/* Spinner ring */}
        <div className="w-full h-full border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
      </div>
    </div>
  );
}
