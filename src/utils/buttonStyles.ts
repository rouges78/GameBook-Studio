export const buttonClasses = (color: string, size: 'normal' | 'small' = 'normal') => {
  const baseClasses = `flex items-center gap-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border ${
    size === 'normal' ? 'px-4 py-2' : 'p-2'
  }`;

  const colorClasses = {
    blue: `bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 hover:text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:ring-2 hover:ring-blue-500/20`,
    purple: `bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 hover:text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:ring-2 hover:ring-purple-500/20`,
    green: `bg-green-500/10 hover:bg-green-500/20 text-green-500 hover:text-green-400 border-green-500/20 hover:border-green-500/40 hover:ring-2 hover:ring-green-500/20`,
    yellow: `bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 hover:text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40 hover:ring-2 hover:ring-yellow-500/20`,
    red: `bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border-red-500/20 hover:border-red-500/40 hover:ring-2 hover:ring-red-500/20`
  }[color];

  return `${baseClasses} ${colorClasses}`;
};
