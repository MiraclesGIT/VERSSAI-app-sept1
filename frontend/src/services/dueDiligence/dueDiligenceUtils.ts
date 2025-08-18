
export function generateLogoColor(name: string): string {
  const colors = ['#8B5CF6', '#06B6D4', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function getLogoInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}
