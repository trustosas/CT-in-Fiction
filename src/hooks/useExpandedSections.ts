import { useState } from 'react';

export function useExpandedSections() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return { expandedSections, toggleSection };
}
