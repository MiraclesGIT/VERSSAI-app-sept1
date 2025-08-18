
export const getScoreColor = (score: number) => {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#FBBF24'; // yellow  
  if (score >= 40) return '#F59E0B'; // orange
  return '#EF4444'; // red
};

export const getScoreColorClasses = (score: number) => {
  if (score >= 80) return {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    badge: 'bg-green-500 text-white'
  };
  if (score >= 60) return {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50', 
    text: 'text-blue-400',
    badge: 'bg-blue-500 text-white'
  };
  if (score >= 40) return {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500 text-black'
  };
  return {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white'
  };
};
