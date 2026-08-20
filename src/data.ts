import {
  type FunctionCode,
  type EnergeticCode,
  type Quadra,
  type JudgmentAxis,
  type PerceptionAxis,
  type EmotionalAttitude,
  type DevelopmentCode,
  resolveFullStack,
  slugify
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

function buildCharacter(raw: {
  name: string;
  work: string;
  year: string;
  medium: string;
  workImageUrl: string;
  subjectImageUrl: string;
  type: string;
  alternateType?: string;
  dynamic?: string;
  rawQuadra?: string;
  unguardedness?: string;
  guardedness?: string;
  initialDevelopment?: string;
  finalDevelopment?: string;
  analysis?: string;
  notes?: string;
  author?: string;
  isPublished?: boolean;
  publishedDate?: string;
  editedDate?: string;
  isWorkArtOpaque?: boolean;
}): Character {
  const stack = resolveFullStack(raw.type);
  const id = slugify(`${raw.work}-${raw.name}`);
  const workId = slugify(raw.work);
  const authorId = raw.author ? slugify(raw.author) : undefined;

  let emotionalAttitude = 'Neutral';
  if (raw.unguardedness === 'High') emotionalAttitude = 'Unguarded';
  else if (raw.guardedness === 'High') emotionalAttitude = 'Guarded';

  return {
    id,
    name: raw.name,
    imageUrl: raw.subjectImageUrl,
    workId,
    authorId,
    medium: raw.medium,
    source: raw.work,
    year: raw.year,
    workImageUrl: raw.workImageUrl,
    isWorkArtOpaque: raw.isWorkArtOpaque || false,
    author: raw.author || '',
    type: raw.type,
    alternateType: raw.alternateType || '',
    dynamic: raw.dynamic || '',
    subtype: raw.dynamic || '',
    rawQuadra: raw.rawQuadra || (stack?.quadra || ''),
    development: raw.finalDevelopment || raw.initialDevelopment || 'I---',
    initialDevelopment: raw.initialDevelopment || 'I---',
    finalDevelopment: raw.finalDevelopment || raw.initialDevelopment || 'I---',
    unguardedness: raw.unguardedness || 'Medium',
    guardedness: raw.guardedness || 'Medium',
    emotionalAttitude,
    leadEnergetic: stack?.leadEnergetic || '',
    auxiliaryEnergetic: stack?.auxiliaryEnergetic || '',
    tertiaryEnergetic: stack?.tertiaryEnergetic || '',
    polarEnergetic: stack?.polarEnergetic || '',
    leadFunction: stack?.lead || '',
    auxiliaryFunction: stack?.auxiliary || '',
    tertiaryFunction: stack?.tertiary || '',
    polarFunction: stack?.polar || '',
    judgmentAxis: stack?.judgmentAxis || '',
    perceptionAxis: stack?.perceptionAxis || '',
    quadra: stack?.quadra || raw.rawQuadra || '',
    analysis: raw.analysis || `${raw.author || 'CT'}/${raw.work} (${raw.year})/${raw.name}.md`,
    notes: raw.notes || '',
    isPublished: raw.isPublished !== undefined ? raw.isPublished : true,
    publishedDate: raw.publishedDate || '2026-06-01',
    editedDate: raw.editedDate || undefined
  };
}

export const CHARACTERS: Character[] = [
  buildCharacter({
    name: 'Cameron Wilson',
    work: 'Arches',
    year: '2021',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Arches_(2021).webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Cameron_Wilson.jpg',
    type: 'TiSe',
    alternateType: 'NiFe',
    unguardedness: 'Medium',
    guardedness: 'Medium',
    initialDevelopment: 'I---',
    finalDevelopment: 'I-I-',
    analysis: 'Earthlingwolf/Arches (2021)/Cameron Wilson.md',
    notes: 'Significant Se development',
    publishedDate: '6/8/2026 2:14:35',
    editedDate: '6/27/2026 16:36:37',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Devon Ortega',
    work: 'Arches',
    year: '2021',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Arches_(2021).webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Devon_Ortega.png',
    type: 'TeNi',
    alternateType: 'SeFi',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'III-',
    finalDevelopment: 'III-',
    analysis: 'Earthlingwolf/Arches (2021)/Devon Ortega.md',
    publishedDate: '6/8/2026 2:14:37',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Arturo Herrera',
    work: 'Arches',
    year: '2021',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Arches_(2021).webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Arches_(2021)/Artie_Herrera.png',
    type: 'SeFi',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'I---',
    finalDevelopment: 'I---',
    analysis: 'Earthlingwolf/Arches (2021)/Arturo Herrera.md',
    publishedDate: '6/8/2026 2:14:38',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Ayumu "Osaka" Kasuga',
    work: 'Azumanga Daioh',
    year: '2002',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/Osaka.jpeg',
    type: 'TiNe',
    alternateType: 'NeTi',
    dynamic: 'Ti+Ne',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'II--',
    finalDevelopment: 'II--',
    analysis: 'Osakpolor/Azumanga Daioh (2002)/Ayumu Osaka Kasuga.md',
    notes: "Can't place Tomo and her as Pe-lead. They're stark contrasts. I think Ji II-- is a decent middle ground. I personally think Ti traits are typically downplayed, as they aren't always interesting in a common sense.",
    publishedDate: '6/27/2026 9:32:32',
    editedDate: '7/15/2026 5:32:32',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Chiyo Mihama',
    work: 'Azumanga Daioh',
    year: '2002',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/Chiyo.jpg',
    type: 'FeSi',
    alternateType: 'TeSi',
    dynamic: 'Fe+Si',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'I---',
    finalDevelopment: 'I---',
    analysis: 'Osakpolor/Azumanga Daioh (2002)/Chiyo Mihama.md',
    publishedDate: '6/27/2026 9:31:28',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Tomo Takino',
    work: 'Azumanga Daioh',
    year: '2002',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/Tomo.png',
    type: 'NeTi',
    alternateType: 'SeTi',
    dynamic: 'Fe+Ne',
    unguardedness: 'High',
    guardedness: 'Medium',
    initialDevelopment: 'I---',
    finalDevelopment: 'I---',
    analysis: 'Osakpolor/Azumanga Daioh (2002)/Tomo Takino.md',
    publishedDate: '6/27/2026 14:19:41',
    editedDate: '7/14/2026 19:56:48',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Koyomi Mizuhara',
    work: 'Azumanga Daioh',
    year: '2002',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/Yomi.jpg',
    type: 'TeSi',
    alternateType: 'SiTe',
    dynamic: 'Te+Si',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'II--',
    finalDevelopment: 'II--',
    analysis: 'Osakpolor/Azumanga Daioh (2002)/Koyomi Mizuhara.md',
    publishedDate: '7/18/2026 14:17:27',
    editedDate: '7/18/2026 21:17:27',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Sakaki',
    work: 'Azumanga Daioh',
    year: '2002',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Azumanga_Daioh_(2002)/Sakaki.jpeg',
    type: 'SiTe',
    alternateType: 'NiTe',
    dynamic: 'Fi+Si',
    unguardedness: 'High',
    guardedness: 'Low',
    initialDevelopment: 'I-I-',
    finalDevelopment: 'I-I-',
    analysis: 'Osakpolor/Azumanga Daioh (2002)/Sakaki.md',
    notes: "She undeniably feels more Gamma than any other Quadra, but it's accidental, and not used as a form of leverage either.",
    publishedDate: '7/29/2026 22:06:16',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Ayanokoji Kiyotaka',
    work: 'Classroom of the Elite',
    year: '2017',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Classroom_of_the_Elite_(2017)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Classroom_of_the_Elite_(2017)/Ayanokoji_Kiyotaka.webp',
    type: 'NiFe',
    alternateType: 'NiTe',
    dynamic: 'Fe+Se',
    unguardedness: 'Low',
    guardedness: 'High',
    initialDevelopment: 'I--I',
    finalDevelopment: 'I--I',
    analysis: 'Osakpolor/Classroom of the Elite (2017)/Ayanokoji Kiyotaka.md',
    publishedDate: '4/27/2026 10:16:09',
    editedDate: '7/14/2026 13:40:01',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Suzune Horikita',
    work: 'Classroom of the Elite',
    year: '2017',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Classroom_of_the_Elite_(2017)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Classroom_of_the_Elite_(2017)/Suzune_Horikita.jpg',
    type: 'NiTe',
    dynamic: 'Te+Ni',
    unguardedness: 'Low',
    guardedness: 'High',
    initialDevelopment: 'II--',
    finalDevelopment: 'III-',
    analysis: 'Osakpolor/Classroom of the Elite (2017)/Suzune Horikita.md',
    publishedDate: '4/27/2026 11:06:57',
    editedDate: '5/7/2026 20:27:07',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Chase Hunter',
    work: 'Echo',
    year: '2015',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Echo_(2015).jpg',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Chase_Hunter.jpg',
    type: 'SiFe',
    unguardedness: 'High',
    guardedness: 'Medium',
    initialDevelopment: 'I--I',
    finalDevelopment: 'I--I',
    analysis: 'Earthlingwolf/Echo (2015)/Chase Hunter.md',
    publishedDate: '5/22/2026 18:37:07',
    editedDate: '5/22/2026 19:06:51',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'TJ Hess',
    work: 'Echo',
    year: '2015',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Echo_(2015).jpg',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/TJ_Hess.jpg',
    type: 'FiSe',
    unguardedness: 'High',
    guardedness: 'Low',
    initialDevelopment: 'I---',
    finalDevelopment: 'I---',
    analysis: 'Earthlingwolf/Echo (2015)/TJ Hess.md',
    publishedDate: '5/22/2026 18:41:49',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Jenna Begay',
    work: 'Echo',
    year: '2015',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Echo_(2015).jpg',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Jenna_Begay.jpg',
    type: 'FeNi',
    unguardedness: 'Low',
    guardedness: 'Medium',
    initialDevelopment: 'IIII',
    finalDevelopment: 'IIII',
    analysis: 'Earthlingwolf/Echo (2015)/Jenna Begay.md',
    publishedDate: '5/22/2026 18:41:50',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Carl Hendricks',
    work: 'Echo',
    year: '2015',
    medium: 'Game',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Echo_(2015).jpg',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Earthlingwolf/Echo_(2015)/Carl_Hendricks.jpg',
    type: 'NeFi',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'II--',
    finalDevelopment: 'II--',
    analysis: 'Earthlingwolf/Echo (2015)/Carl Hendricks.md',
    publishedDate: '5/22/2026 18:43:47',
    editedDate: '8/14/2026 19:01:59',
    author: 'Earthlingwolf'
  }),
  buildCharacter({
    name: 'Shinji Ikari',
    work: 'Neon Genesis Evangelion',
    year: '1995',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/Shinji_Ikari.jpeg',
    type: 'TiNe',
    alternateType: 'FiNe',
    dynamic: 'Ti+Ne',
    unguardedness: 'Medium',
    guardedness: 'Low',
    initialDevelopment: 'I---',
    finalDevelopment: 'I---',
    analysis: 'Osakpolor/Neon Genesis Evangelion (1995)/Shinji Ikari.md',
    notes: "Ji-lead, Si, and Fe (but it's much a weaker case) appear, so I'm opting for TiNe. Open to FiNe arguments.",
    publishedDate: '5/7/2026 17:26:26',
    editedDate: '5/14/2026 14:05:21',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Rei Ayanami',
    work: 'Neon Genesis Evangelion',
    year: '1995',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/Rei_Ayanami.webp',
    type: 'SiTe',
    alternateType: 'FiPe',
    dynamic: 'Fi+Si',
    unguardedness: 'Low',
    guardedness: 'Low',
    initialDevelopment: 'I---',
    finalDevelopment: 'I-I-',
    analysis: 'Osakpolor/Neon Genesis Evangelion (1995)/Rei Ayanami.md',
    notes: 'Behaviours constellate around Fi, Te, and Si. She shows virtually no Pe.',
    publishedDate: '5/8/2026 11:00:41',
    editedDate: '6/11/2026 6:17:59',
    author: 'Osakpolor'
  }),
  buildCharacter({
    name: 'Asuka Langley Soryu',
    work: 'Neon Genesis Evangelion',
    year: '1995',
    medium: 'Animation',
    workImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/logo.webp',
    subjectImageUrl: 'https://autumn-flower-b692.osayandeosas1000.workers.dev/Osakpolor/Neon_Genesis_Evangelion_(1995)/Asuka_Langley_Soryu.jpg',
    type: 'SeFi',
    alternateType: 'TeNi',
    dynamic: 'Te+Se',
    unguardedness: 'Low',
    guardedness: 'High',
    initialDevelopment: 'I-I-',
    finalDevelopment: 'I-I-',
    analysis: 'Osakpolor/Neon Genesis Evangelion (1995)/Asuka Langley Soryu.md',
    notes: 'Is more Te than Se, but fails hard on Conductor qualia.',
    publishedDate: '5/9/2026 18:37:15',
    author: 'Osakpolor'
  })
];

