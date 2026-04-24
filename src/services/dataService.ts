import Papa from 'papaparse';
import { type Character } from '../data';

const CSV_URL = '/api/data';

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: false, // Don't skip yet, we need to count rows exactly
        complete: (results) => {
          // Skip first 6 metadata/header rows (indices 0-5)
          const dataRows = results.data.slice(6);
          
          const characters: Character[] = dataRows.map((row: any, index: number) => {
            if (!row || row.length < 31) return null;
            
            const name = row[4] || '';
            const type = row[6] || '';
            
            // isPublished is index 30 based on test-fetch logs
            const isPublished = String(row[30] || '').trim().toUpperCase() === 'TRUE';
            const isWorkArtOpaque = String(row[33] || '').trim().toUpperCase() === 'TRUE';
            const author = row[34] || '';

            // Motifs start from 35+
            const motifValues = row.slice(35).map((val: any) => {
              const sVal = String(val).trim().toUpperCase();
              return sVal === 'TRUE' || sVal === '1' || sVal === 'YES';
            });

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
              publishedDate: row[31] || '',
              editedDate: row[32] || '',
              isWorkArtOpaque,
              author,
              motifValues: motifValues.length > 0 ? motifValues : undefined
            };
          }).filter((char: any) => char && char.name && char.name.toLowerCase() !== 'name');

          console.log(`Successfully parsed ${characters.length} characters.`);
          resolve(characters);
        },
        error: (error: any) => {
          console.error('PapaParse error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
