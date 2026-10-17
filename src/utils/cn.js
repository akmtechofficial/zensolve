// Utility function for merging Tailwind and conditional classes
export function cn(...classes) {
  return classes
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim();
}
