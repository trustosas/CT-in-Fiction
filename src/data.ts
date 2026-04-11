export interface Character {
  id: string;
  medium: string;
  source: string;
  year: string;
  workImageUrl: string;
  name: string;
  imageUrl: string;
  type: string;
  alternateType?: string;
  subtype: string;
  initialDevelopment: string;
  finalDevelopment: string;
  emotionalAttitude: string;
  analysis: string;
  notes?: string;
  motifValues?: boolean[];
}

export const CHARACTERS: Character[] = [];
