import { useState, useCallback } from 'react';
import { Character, CHARACTERS as STATIC_CHARACTERS } from '../data';
import { fetchCharacters } from '../services/dataService';
import { slugify } from '../lib/ct-logic';

export function useCharacterData() {
  const [characters, setCharacters] = useState<Character[]>(STATIC_CHARACTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestCommitSha, setLatestCommitSha] = useState<string | null>(null);
  const [analysisMarkdown, setAnalysisMarkdown] = useState<string>('');

  const fetchLatestCommitSha = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/trustosas/CT-in-Fiction-Analyses/commits/main', {
        mode: 'cors',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return data.sha;
      }
    } catch (err) {
      // Silently fail
    }
    return null;
  };

  const fetchAnalysisMarkdown = useCallback(async (content: string, sha?: string | null) => {
    if (!content) return '';
    const trimmedContent = content.trim();
    const urlPattern = /^https?:\/\//;
    let url = '';

    if (urlPattern.test(trimmedContent)) {
      url = trimmedContent;
      if (url.includes('raw.githubusercontent.com') && sha) {
        url = url.replace('/refs/heads/main/', `/${sha}/`);
        url = url.replace('/main/', `/${sha}/`);
      }
    } else {
      const base = 'https://raw.githubusercontent.com/trustosas/CT-in-Fiction-Analyses';
      const path = trimmedContent.split('/').map(segment => encodeURIComponent(segment)).join('/');
      if (sha) {
        url = `${base}/${sha}/${path}`;
      } else {
        url = `${base}/refs/heads/main/${path}`;
      }
    }

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`HTTP error! status: ${res.status}${errorText ? ` - ${errorText.substring(0, 100)}` : ''}`);
      }
      const text = await res.text();
      setAnalysisMarkdown(text);
      return text;
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
      const errorMsg = `Failed to load analysis from: ${url}\n\nError: ${err instanceof Error ? err.message : String(err)}`;
      setAnalysisMarkdown(errorMsg);
      return errorMsg;
    }
  }, []);

  const loadData = useCallback(async (isSilent = false, subjectSlug?: string) => {
    try {
      if (!isSilent) setIsLoading(true);
      
      const [data, sha] = await Promise.all([
        fetchCharacters(),
        fetchLatestCommitSha()
      ]);

      if (sha) setLatestCommitSha(sha);

      if (data && data.length > 0) {
        setCharacters(data);
        setError(null);

        if (subjectSlug) {
          const char = data.find(c => slugify(c.name) === subjectSlug);
          if (char && char.analysis) {
            await fetchAnalysisMarkdown(char.analysis, sha);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load character data. Please try again later.');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [fetchAnalysisMarkdown]);

  return {
    characters,
    isLoading,
    error,
    latestCommitSha,
    analysisMarkdown,
    setAnalysisMarkdown,
    loadData,
    fetchAnalysisMarkdown
  };
}
