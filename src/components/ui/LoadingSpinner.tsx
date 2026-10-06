interface SpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 20, className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size={40} className="text-orange-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressBar({ value, color = 'orange' }: { value: number; color?: 'orange' | 'green' | 'blue' }) {
  const colors = { orange: 'bg-orange-500', green: 'bg-green-500', blue: 'bg-blue-500' };
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[color]} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
