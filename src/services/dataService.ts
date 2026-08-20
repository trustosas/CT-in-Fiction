import { type Character, type MediaType, VALID_MEDIA_TYPES, CHARACTERS as STATIC_CHARACTERS } from '../data';
import { getCharactersFromFirestore, saveCharacterToFirestore, saveAuthor, saveWork } from './firestoreService';
import { slugify } from '../lib/ct-logic';

export function normalizeMediaType(rawMedium: string): MediaType {
  const clean = (rawMedium || '').trim().toLowerCase();
  if (clean.includes('anime') || clean.includes('animation') || clean.includes('cartoon')) return 'Animation';
  if (clean.includes('live') || clean.includes('film') || clean.includes('movie') || clean.includes('tv') || clean.includes('series') || clean.includes('drama') || clean.includes('theatre')) return 'Live Action';
  if (clean.includes('lit') || clean.includes('book') || clean.includes('novel') || clean.includes('myth') || clean.includes('text')) return 'Literature';
  if (clean.includes('comic') || clean.includes('manga') || clean.includes('manhwa') || clean.includes('graphic')) return 'Comic';
  if (clean.includes('game') || clean.includes('gaming') || clean.includes('rpg') || clean.includes('visual novel')) return 'Game';
  return 'Animation';
}

const CACHE_KEY = 'ct_characters_firestore_cache';
const CACHE_TIME_KEY = 'ct_characters_firestore_cache_time';

let cachedCharacters: Character[] | null = null;
let lastFetchTime: number = 0;

// Helper with timeout to prevent Firestore network stalls from blocking rendering
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
  ]);
};

/**
 * Fetch characters directly from Firebase Firestore.
 * If Firestore is empty on the very first run, automatically seeds initial data into Firestore.
 */
export async function fetchCharacters(forceRefresh = false): Promise<Character[]> {
  // Check memory cache first if not forcing
  if (!forceRefresh && cachedCharacters && cachedCharacters.length > 0) {
    return cachedCharacters;
  }

  // 1. Fetch from Firebase Firestore as primary and sole source of truth with 3s timeout
  try {
    const firestoreChars = await withTimeout(getCharactersFromFirestore(), 3000, []);
    if (firestoreChars && firestoreChars.length > 0) {
      cachedCharacters = firestoreChars;
      lastFetchTime = Date.now();
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(firestoreChars));
        localStorage.setItem(CACHE_TIME_KEY, lastFetchTime.toString());
      } catch (e) {}
      return firestoreChars;
    }

    // If Firestore database has no characters yet, automatically seed once from static dataset
    if (STATIC_CHARACTERS && STATIC_CHARACTERS.length > 0) {
      console.log('Seeding initial dataset to Firebase Firestore...');
      migrateLegacyDataToFirestore(STATIC_CHARACTERS).catch(err => console.warn('Background seeding error:', err));
      cachedCharacters = STATIC_CHARACTERS;
      return STATIC_CHARACTERS;
    }
  } catch (err) {
    console.error('Firebase Firestore fetch error:', err);
  }

  // 2. Offline / cache fallback
  if (!forceRefresh) {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          cachedCharacters = parsed;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached data', e);
      }
    }
  }

  cachedCharacters = STATIC_CHARACTERS || [];
  return cachedCharacters;
}

// Bulk migration helper: Import characters into Firebase Firestore
export async function migrateLegacyDataToFirestore(characters: Character[]): Promise<{ count: number; errors: number }> {
  let count = 0;
  let errors = 0;

  const authorsSet = new Set<string>();
  const worksMap = new Map<string, { title: string; medium: string; imageUrl: string; year: string }>();

  for (const char of characters) {
    try {
      if (char.author && char.author.trim()) {
        authorsSet.add(char.author.trim());
      }

      if (char.source && char.source.trim()) {
        const workId = slugify(char.source);
        if (!worksMap.has(workId)) {
          worksMap.set(workId, {
            title: char.source.trim(),
            medium: normalizeMediaType(char.medium || 'Animation'),
            imageUrl: char.workImageUrl || '',
            year: char.year || ''
          });
        }
      }

      await saveCharacterToFirestore({
        ...char,
        id: char.id || slugify(`${char.name}-${char.source || 'char'}`),
        medium: normalizeMediaType(char.medium || 'Animation')
      });
      count++;
    } catch (e) {
      console.error('Failed to migrate char to Firestore:', char.name, e);
      errors++;
    }
  }

  // Seed Authors into Firestore
  for (const authorName of authorsSet) {
    try {
      await saveAuthor({
        id: slugify(authorName),
        name: authorName
      });
    } catch (e) {}
  }

  // Seed Works into Firestore
  for (const [workId, workData] of worksMap.entries()) {
    try {
      await saveWork({
        id: workId,
        title: workData.title,
        medium: workData.medium,
        imageUrl: workData.imageUrl,
        releaseYear: workData.year
      });
    } catch (e) {}
  }

  return { count, errors };
}
