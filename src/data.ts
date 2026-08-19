import {
  type FunctionCode,
  type EnergeticCode,
  type Quadra,
  type JudgmentAxis,
  type PerceptionAxis,
  type EmotionalAttitude,
  type DevelopmentCode
} from './lib/ct-logic';

export type MediaType = 'Animation' | 'Live Action' | 'Literature' | 'Comic' | 'Game';
export const VALID_MEDIA_TYPES: MediaType[] = [
  'Animation',
  'Live Action',
  'Literature',
  'Comic',
  'Game'
];

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  validatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Work {
  id: string;
  title: string;
  medium: MediaType | string;
  imageUrl?: string;
  description?: string;
  creator?: string;
  releaseYear?: string;
  isArtOpaque?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  workId?: string;
  authorId?: string;
  
  // Work-level flattened metadata (for backward compatibility)
  medium: string;
  source: string;
  year: string;
  workImageUrl: string;
  isWorkArtOpaque?: boolean;
  author?: string;

  // CT Spec Fields
  type: string;
  rawQuadra?: string;
  dynamic?: string;
  development?: string;
  emotionalAttitude?: string;
  
  // Computed / Hierarchy fields
  leadEnergetic: string;
  auxiliaryEnergetic: string;
  tertiaryEnergetic: string;
  polarEnergetic: string;
  leadFunction: string;
  auxiliaryFunction: string;
  tertiaryFunction: string;
  polarFunction: string;
  judgmentAxis: string;
  perceptionAxis: string;
  quadra: string;
  
  // Legacy / Alternate fields
  alternateType?: string;
  subtype?: string; // Legacy alias for dynamic
  behaviourQualia?: string;
  initialDevelopment?: string;
  finalDevelopment?: string;
  unguardedness?: string;
  guardedness?: string;
  
  // Content & Motifs
  analysis: string;
  notes?: string;
  motifValues?: boolean[];
  motifs?: number[];
  
  // Publishing metadata
  isPublished: boolean;
  publishedDate?: string;
  editedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CHARACTERS: Character[] = [];
