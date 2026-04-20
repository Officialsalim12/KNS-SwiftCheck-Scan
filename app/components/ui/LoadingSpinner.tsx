export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue' 
}: { 
  size?: 'sm' | 'md' | 'lg', 
  color?: 'blue' | 'white' | 'slate' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    blue: 'border-blue-600/30 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-800/30 border-t-slate-800'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{ animationDuration: '0.8s' }}
      ></div>
    </div>
  );
}
