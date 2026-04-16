import { useState, useRef, useEffect } from 'react';

export function useMotifHover() {
  const [activeMotifDesc, setActiveMotifDesc] = useState<string | null>(null);
  const [activeMotifId, setActiveMotifId] = useState<string | null>(null);
  const [motifAnchor, setMotifAnchor] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const onHoverMotif = (desc: string | null, id: string | null, anchor: any) => {
    setActiveMotifDesc(desc);
    setActiveMotifId(id);
    setMotifAnchor(anchor);
  };

  useEffect(() => {
    const handleEvents = (e: Event) => {
      if (!activeMotifId) return;
      if (e.type === 'scroll' || e.type === 'resize') {
        setActiveMotifId(null);
        setActiveMotifDesc(null);
        setMotifAnchor(null);
      }
    };

    window.addEventListener('scroll', handleEvents, true);
    window.addEventListener('resize', handleEvents);
    return () => {
      window.removeEventListener('scroll', handleEvents, true);
      window.removeEventListener('resize', handleEvents);
    };
  }, [activeMotifId]);

  return {
    activeMotifDesc,
    activeMotifId,
    motifAnchor,
    bubbleRef,
    onHoverMotif,
    setActiveMotifId,
    setActiveMotifDesc,
    setMotifAnchor
  };
}
