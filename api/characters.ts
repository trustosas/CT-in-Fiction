import type { VercelRequest, VercelResponse } from '@vercel/node';
import Papa from 'papaparse';

const CSV_URL = process.env.VITE_DATABASE_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!CSV_URL) {
    return res.status(500).json({ error: 'Config Error: VITE_DATABASE_URL is not set in environment variables.' });
  }

  try {
    const isForce = !!req.query.t;
    const targetUrl = isForce 
      ? `${CSV_URL}${CSV_URL.includes('?') ? '&' : '?'}_t=${Date.now()}` 
      : CSV_URL;

    const response = await fetch(targetUrl, {
      cache: isForce ? 'no-store' : 'default',
      headers: isForce ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {}
    });

    if (!response.ok) throw new Error('Failed to fetch from Google');
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const dataLines = lines.slice(6).join('\n');
    
    const characters = await new Promise<any[]>((resolve, reject) => {
      Papa.parse(dataLines, {
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const parsed = results.data.map((row: any, index: number) => {
            const name = row[4] || '';
            const type = row[6] || '';
            const motifValues = row.slice(34).map((val: any) => {
              const sVal = String(val).trim().toUpperCase();
              return sVal === 'TRUE' || sVal === '1' || sVal === 'YES';
            });
            const isPublished = ['TRUE', '1', 'YES', 'T', 'Y'].includes(String(row[29]).trim().toUpperCase());
            const isWorkArtOpaque = ['TRUE', '1', 'YES', 'T', 'Y'].includes(String(row[32]).trim().toUpperCase());

            return {
              id: `char-${index}`,
              medium: row[0] || '',
              source: row[1] || '',
              year: row[2] || '',
              workImageUrl: row[3] || '',
              name: name.trim(),
              imageUrl: row[5] || '',
              type: type.trim(),
              leadEnergetic: row[9] || '',
              auxiliaryEnergetic: row[10] || '',
              tertiaryEnergetic: row[11] || '',
              polarEnergetic: row[12] || '',
              leadFunction: row[13] || '',
              auxiliaryFunction: row[14] || '',
              tertiaryFunction: row[15] || '',
              polarFunction: row[16] || '',
              judgmentAxis: row[17] || '',
              perceptionAxis: row[18] || '',
              behaviourQualia: row[19] || '',
              quadra: row[20] || '',
              emotionalAttitude: row[21] || '',
              unguardedness: row[22] || '',
              guardedness: row[23] || '',
              rawQuadra: row[24] || '',
              alternateType: row[7] || '',
              subtype: row[8] || '',
              initialDevelopment: row[25] || '',
              finalDevelopment: row[26] || '',
              analysis: row[27] || '',
              notes: row[28] || '',
              isPublished,
              publishedDate: row[30] || '',
              editedDate: row[31] || '',
              isWorkArtOpaque,
              author: row[33] || '',
              motifValues: motifValues.length > 0 ? motifValues : undefined
            };
          }).filter((char: any) => 
            char.name && 
            (char.type || char.rawQuadra) && 
            char.isPublished &&
            char.author && char.author.trim() !== ''
          );
          resolve(parsed);
        },
        error: reject
      });
    });

    if (isForce) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    }
    res.status(200).json(characters);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
