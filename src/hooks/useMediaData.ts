import { useMemo } from 'react';
import { Character } from '../data';

export function useMediaData(characters: Character[]) {
  const publishedCharacters = useMemo(() => {
    return characters.filter(c => c.isPublished);
  }, [characters]);

  const media = useMemo(() => 
    Array.from(new Set(publishedCharacters.map(c => c.medium))).sort()
  , [publishedCharacters]);

  const works = useMemo(() => {
    const workMap = new Map<string, { title: string; imageUrl: string; year: string }>();
    publishedCharacters.forEach(char => {
      if (!workMap.has(char.source)) {
        workMap.set(char.source, { 
          title: char.source, 
          imageUrl: char.workImageUrl, 
          year: char.year 
        });
      }
    });
    return Array.from(workMap.values());
  }, [publishedCharacters]);

  return { publishedCharacters, media, works };
}
