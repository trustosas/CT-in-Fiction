// ============================================================================
// Cognitive Typology (CT) Logic Engine
// Implementation of the CT Type Model Specification
// ============================================================================

export type FunctionCode = 'Fi' | 'Te' | 'Ti' | 'Fe' | 'Ne' | 'Si' | 'Se' | 'Ni';
export type EnergeticCode = 'Ji' | 'Je' | 'Pe' | 'Pi';
export type Quadra = 'Alpha' | 'Beta' | 'Gamma' | 'Delta';
export type JudgmentAxis = 'Fe-Ti' | 'Te-Fi';
export type PerceptionAxis = 'Ne-Si' | 'Se-Ni';
export type EmotionalAttitude = 'Guarded' | 'Unguarded' | 'Neutral';
export type DevelopmentCode = 'I---' | 'II--' | 'I-I-' | 'I--I' | 'III-' | 'II-I' | 'I-II' | 'IIII';

export const ENERGETIC_NAMES: Record<EnergeticCode, string> = {
  'Ji': 'Introverted Judgment',
  'Je': 'Extroverted Judgment',
  'Pi': 'Introverted Perception',
  'Pe': 'Extroverted Perception'
};

export const FUNCTION_NAMES: Record<FunctionCode, string> = {
  'Fi': 'Introverted Feeling',
  'Te': 'Extroverted Thinking',
  'Ti': 'Introverted Thinking',
  'Fe': 'Extroverted Feeling',
  'Ne': 'Extroverted Intuition',
  'Si': 'Introverted Sensing',
  'Se': 'Extroverted Sensing',
  'Ni': 'Introverted Intuition'
};

export const FUNCTION_ORDER: FunctionCode[] = ['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi'];

// ============================================================================
// §3 & §4. Axes, Energetics & Mates
// ============================================================================

export const FUNCTION_TO_ENERGETIC: Record<FunctionCode, EnergeticCode> = {
  'Ti': 'Ji',
  'Fi': 'Ji',
  'Te': 'Je',
  'Fe': 'Je',
  'Ni': 'Pi',
  'Si': 'Pi',
  'Ne': 'Pe',
  'Se': 'Pe'
};

export const AXIS_MATES: Record<FunctionCode, FunctionCode> = {
  'Te': 'Fi',
  'Fi': 'Te',
  'Fe': 'Ti',
  'Ti': 'Fe',
  'Ne': 'Si',
  'Si': 'Ne',
  'Se': 'Ni',
  'Ni': 'Se'
};

export interface AxisDefinition {
  judgmentOrPerception: 'judgment' | 'perception';
  vultology: string; // Default display
  metabolism: string; // Technical alternate
  functions: [FunctionCode, FunctionCode];
}

export const AXIS_DEFINITIONS: Record<string, AxisDefinition> = {
  'Te-Fi': { judgmentOrPerception: 'judgment', vultology: 'Candid', metabolism: 'Radial', functions: ['Te', 'Fi'] },
  'Fe-Ti': { judgmentOrPerception: 'judgment', vultology: 'Measured', metabolism: 'Gravitic', functions: ['Fe', 'Ti'] },
  'Ne-Si': { judgmentOrPerception: 'perception', vultology: 'Suspended', metabolism: 'Modular', functions: ['Ne', 'Si'] },
  'Se-Ni': { judgmentOrPerception: 'perception', vultology: 'Grounded', metabolism: 'Vortical', functions: ['Se', 'Ni'] }
};

export const QUADRA_AXES: Record<Quadra, { judgment: JudgmentAxis; perception: PerceptionAxis }> = {
  'Alpha': { judgment: 'Fe-Ti', perception: 'Ne-Si' },
  'Beta': { judgment: 'Fe-Ti', perception: 'Se-Ni' },
  'Gamma': { judgment: 'Te-Fi', perception: 'Se-Ni' },
  'Delta': { judgment: 'Te-Fi', perception: 'Ne-Si' }
};

export const ENERGETIC_SLOT_ORDER: Record<EnergeticCode, [EnergeticCode, EnergeticCode, EnergeticCode, EnergeticCode]> = {
  'Ji': ['Ji', 'Pe', 'Pi', 'Je'],
  'Je': ['Je', 'Pi', 'Pe', 'Ji'],
  'Pe': ['Pe', 'Ji', 'Je', 'Pi'],
  'Pi': ['Pi', 'Je', 'Ji', 'Pe']
};

export const FULL_TYPES: string[] = [
  'TiNe', 'TiSe', 'FiNe', 'FiSe',
  'TeNi', 'TeSi', 'FeNi', 'FeSe',
  'NeTi', 'NeFi', 'SeTi', 'SeFi',
  'NiTe', 'NiFe', 'SiTe', 'SiFe'
];

export const ALL_16_TYPES = FULL_TYPES;
export const BASE_16_TYPES = FULL_TYPES;
export const AXES = AXIS_DEFINITIONS;

export function resolveType(typeCode: string, rawQuadra?: string) {
  const candidates = resolveCandidates(typeCode, rawQuadra);
  const clean = (typeCode || '').trim();
  const isFullyResolved = FULL_TYPES.includes(clean);
  const leadEnergetic = getLeadEnergetic(typeCode);
  
  let tier = 6;
  if (isFullyResolved) tier = 1;
  else if (candidates.length === 2) tier = 2;
  else if (candidates.length === 4 && leadEnergetic) tier = 3;
  else if (candidates.length === 4 && rawQuadra) tier = 4;
  else if (candidates.length === 8) tier = 5;

  return {
    typeCode: clean,
    isFullyResolved,
    candidateTypes: candidates,
    tier,
    leadEnergetic
  };
}

// ============================================================================
// §5 & §8. Inter-Function Dynamics & Emergent Archetype Names
// ============================================================================

export const EMERGENT_ARCHETYPE_NAMES: Record<string, string> = {
  'Ti+Ne': 'Ephemeralist',
  'Ti+Se': 'Sensationalist',
  'Fi+Se': 'Sensualist',
  'Fi+Ne': 'Etherealist',
  'Fe+Si': 'Diplomat',
  'Fe+Ni': 'Sectarian',
  'Te+Ni': 'Meritocrat',
  'Te+Si': 'Bureaucrat',
  'Ti+Si': 'Scholastic',
  'Ti+Ni': 'Cabbalist',
  'Fi+Ni': 'Occultist',
  'Fi+Si': 'Druidist',
  'Fe+Ne': 'Inspirer',
  'Fe+Se': 'Persuader',
  'Te+Se': 'Realizer',
  'Te+Ne': 'Inventor'
};

export const QUADRA_VALID_DYNAMICS: Record<Quadra, string[]> = {
  'Alpha': ['Ti+Ne', 'Ti+Si', 'Fe+Si', 'Fe+Ne'],
  'Beta': ['Ti+Se', 'Ti+Ni', 'Fe+Ni', 'Fe+Se'],
  'Gamma': ['Fi+Se', 'Fi+Ni', 'Te+Ni', 'Te+Se'],
  'Delta': ['Fi+Ne', 'Fi+Si', 'Te+Si', 'Te+Ne']
};

// Canonical normalization for commutative pairs (e.g., 'Ne+Fe' -> 'Fe+Ne')
export function normalizeDynamicPair(dynamic: string): string {
  if (!dynamic) return '';
  const parts = dynamic.split('+').map(s => s.trim());
  if (parts.length !== 2) return dynamic.trim();
  
  const p1 = parts[0];
  const p2 = parts[1];

  // Try direct lookup
  if (EMERGENT_ARCHETYPE_NAMES[`${p1}+${p2}`]) {
    return `${p1}+${p2}`;
  }
  // Try reversed lookup
  if (EMERGENT_ARCHETYPE_NAMES[`${p2}+${p1}`]) {
    return `${p2}+${p1}`;
  }

  // Fallback sorted
  return [p1, p2].sort().join('+');
}

export const normalizeDynamic = normalizeDynamicPair;

export function getSubtypeName(subtypeOrDynamic: string): string {
  if (!subtypeOrDynamic) return '';
  const normalized = normalizeDynamicPair(subtypeOrDynamic);
  return EMERGENT_ARCHETYPE_NAMES[normalized] || EMERGENT_ARCHETYPE_NAMES[subtypeOrDynamic] || '';
}

export function isDynamicValidForQuadra(dynamic: string, quadra: Quadra): boolean {
  if (!dynamic || !quadra) return false;
  const normalized = normalizeDynamicPair(dynamic);
  const validList = QUADRA_VALID_DYNAMICS[quadra];
  if (!validList) return false;
  return validList.includes(normalized);
}

// ============================================================================
// §2 & §3. Type Resolution Engine
// ============================================================================

export interface ResolvedTypeStack {
  lead: FunctionCode;
  auxiliary: FunctionCode;
  tertiary: FunctionCode;
  polar: FunctionCode;
  leadEnergetic: EnergeticCode;
  auxiliaryEnergetic: EnergeticCode;
  tertiaryEnergetic: EnergeticCode;
  polarEnergetic: EnergeticCode;
  energetics: [EnergeticCode, EnergeticCode, EnergeticCode, EnergeticCode];
  judgmentAxis: JudgmentAxis;
  perceptionAxis: PerceptionAxis;
  quadra: Quadra;
}

export function isFullyResolvedType(type: string): boolean {
  if (!type) return false;
  const clean = type.trim();
  return FULL_TYPES.includes(clean);
}

export function resolveFullStack(type: string): ResolvedTypeStack | null {
  if (!isFullyResolvedType(type)) return null;

  const lead = type.substring(0, 2) as FunctionCode;
  const aux = type.substring(2, 4) as FunctionCode;

  const leadEnergetic = FUNCTION_TO_ENERGETIC[lead];
  const auxiliaryEnergetic = FUNCTION_TO_ENERGETIC[aux];
  if (!leadEnergetic || !auxiliaryEnergetic) return null;

  // Slot 3 is axis mate of auxiliary (slot 2)
  const tertiary = AXIS_MATES[aux];
  // Slot 4 is axis mate of lead (slot 1) - Polar function
  const polar = AXIS_MATES[lead];

  const tertiaryEnergetic = FUNCTION_TO_ENERGETIC[tertiary];
  const polarEnergetic = FUNCTION_TO_ENERGETIC[polar];

  // Determine axes
  const isLeadJudgment = leadEnergetic === 'Ji' || leadEnergetic === 'Je';
  const judgmentFunc = isLeadJudgment ? lead : aux;
  const perceptionFunc = isLeadJudgment ? aux : lead;

  const judgmentAxis: JudgmentAxis = (judgmentFunc === 'Fe' || judgmentFunc === 'Ti') ? 'Fe-Ti' : 'Te-Fi';
  const perceptionAxis: PerceptionAxis = (perceptionFunc === 'Ne' || perceptionFunc === 'Si') ? 'Ne-Si' : 'Se-Ni';

  const quadra = deriveQuadra(judgmentAxis, perceptionAxis) as Quadra;

  return {
    lead,
    auxiliary: aux,
    tertiary,
    polar,
    leadEnergetic,
    auxiliaryEnergetic,
    tertiaryEnergetic,
    polarEnergetic,
    energetics: [leadEnergetic, auxiliaryEnergetic, tertiaryEnergetic, polarEnergetic],
    judgmentAxis,
    perceptionAxis,
    quadra
  };
}

export function getLeadFunction(type: string): string {
  if (!type || type.length < 2) return '';
  return type.substring(0, 2);
}

export function getAuxFunction(type: string): string {
  if (!type || type.length < 4) return '';
  return type.substring(2, 4);
}

export function getLeadEnergetic(type: string): EnergeticCode | '' {
  if (!type) return '';
  const clean = type.trim();
  if (clean === 'Ji' || clean === 'Je' || clean === 'Pe' || clean === 'Pi') {
    return clean;
  }
  const leadFunc = clean.substring(0, 2) as FunctionCode;
  return FUNCTION_TO_ENERGETIC[leadFunc] || '';
}

/**
 * Resolves candidate types for a given type code across all 6 tiers
 */
export function resolveCandidates(typeCode: string, rawQuadra?: string): string[] {
  if (!typeCode && !rawQuadra) return [...FULL_TYPES];

  const clean = (typeCode || '').trim();

  // Tier 1: Fully resolved (1 candidate)
  if (FULL_TYPES.includes(clean)) {
    return [clean];
  }

  // Tier 2: Positional partial (2 candidates)
  // {Attitude}{Energetic} -> primary resolved, secondary open
  const att1 = clean.substring(0, 2);
  const att2 = clean.substring(2, 4);

  if (FUNCTION_NAMES[att1 as FunctionCode] && ENERGETIC_NAMES[att2 as EnergeticCode]) {
    // E.g. TiPe -> TiNe, TiSe
    const lead = att1 as FunctionCode;
    const targetEnergetic = att2 as EnergeticCode;
    return FULL_TYPES.filter(t => t.startsWith(lead) && FUNCTION_TO_ENERGETIC[t.substring(2, 4) as FunctionCode] === targetEnergetic);
  }

  // {Energetic}{Attitude} -> primary open, secondary resolved
  if (ENERGETIC_NAMES[att1 as EnergeticCode] && FUNCTION_NAMES[att2 as FunctionCode]) {
    // E.g. PeTi -> NeTi, SeTi
    const leadEnergetic = att1 as EnergeticCode;
    const aux = att2 as FunctionCode;
    return FULL_TYPES.filter(t => FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode] === leadEnergetic && t.substring(2, 4) === aux);
  }

  // Tier 3: Hierarchy known, axis unknown (4 candidates)
  if (clean === 'Ji' || clean === 'Je' || clean === 'Pe' || clean === 'Pi') {
    return FULL_TYPES.filter(t => FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode] === clean);
  }

  // Tier 4: Hierarchy unknown, rawQuadra asserted (4 candidates)
  if (rawQuadra && ['Alpha', 'Beta', 'Gamma', 'Delta'].includes(rawQuadra)) {
    const quad = rawQuadra as Quadra;
    const axes = QUADRA_AXES[quad];
    return FULL_TYPES.filter(t => {
      const resolved = resolveFullStack(t);
      return resolved && resolved.quadra === quad;
    });
  }

  // Tier 5: Hierarchy unknown, 1 axis known (8 candidates)
  const axisMap: Record<string, { j?: JudgmentAxis; p?: PerceptionAxis }> = {
    'Candid': { j: 'Te-Fi' },
    'Measured': { j: 'Fe-Ti' },
    'Suspended': { p: 'Ne-Si' },
    'Grounded': { p: 'Se-Ni' },
    'Te-Fi': { j: 'Te-Fi' },
    'Fe-Ti': { j: 'Fe-Ti' },
    'Ne-Si': { p: 'Ne-Si' },
    'Se-Ni': { p: 'Se-Ni' }
  };

  if (axisMap[clean]) {
    const target = axisMap[clean];
    return FULL_TYPES.filter(t => {
      const resolved = resolveFullStack(t);
      if (!resolved) return false;
      if (target.j && resolved.judgmentAxis !== target.j) return false;
      if (target.p && resolved.perceptionAxis !== target.p) return false;
      return true;
    });
  }

  // Tier 6: Dichotomies (8 or 16 candidates)
  if (clean === 'J') {
    return FULL_TYPES.filter(t => {
      const e = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return e === 'Ji' || e === 'Je';
    });
  }
  if (clean === 'P') {
    return FULL_TYPES.filter(t => {
      const e = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return e === 'Pi' || e === 'Pe';
    });
  }
  if (clean === 'I') {
    return FULL_TYPES.filter(t => {
      const e = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return e === 'Ji' || e === 'Pi';
    });
  }
  if (clean === 'E') {
    return FULL_TYPES.filter(t => {
      const e = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return e === 'Je' || e === 'Pe';
    });
  }

  return [...FULL_TYPES];
}

// ============================================================================
// §4. Quadra & Axis Derivations
// ============================================================================

export function deriveQuadra(judgmentAxis: string, perceptionAxis: string): string {
  const j = judgmentAxis?.trim();
  const p = perceptionAxis?.trim();

  if (j === 'Fe-Ti') {
    if (p === 'Ne-Si') return 'Alpha';
    if (p === 'Se-Ni') return 'Beta';
  }
  if (j === 'Te-Fi') {
    if (p === 'Se-Ni') return 'Gamma';
    if (p === 'Ne-Si') return 'Delta';
  }
  return '';
}

export function deriveAxesFromQuadra(quadra: string): { judgment: string; perception: string } {
  const q = quadra?.trim().toLowerCase();
  if (q === 'alpha') return { judgment: 'Fe-Ti', perception: 'Ne-Si' };
  if (q === 'beta') return { judgment: 'Fe-Ti', perception: 'Se-Ni' };
  if (q === 'gamma') return { judgment: 'Te-Fi', perception: 'Se-Ni' };
  if (q === 'delta') return { judgment: 'Te-Fi', perception: 'Ne-Si' };
  return { judgment: '', perception: '' };
}

export function getAxisDisplayNames(judgmentAxis: string, perceptionAxis: string) {
  const jDef = AXIS_DEFINITIONS[judgmentAxis];
  const pDef = AXIS_DEFINITIONS[perceptionAxis];
  return {
    judgment: jDef ? jDef.vultology : judgmentAxis,
    perception: pDef ? pDef.vultology : perceptionAxis,
    judgmentMetabolism: jDef ? jDef.metabolism : judgmentAxis,
    perceptionMetabolism: pDef ? pDef.metabolism : perceptionAxis
  };
}

// ============================================================================
// §6. Development Symbol Calculations
// ============================================================================

export function getDevelopmentName(symbol: string, leadEnergetic: string, _behaviourQualia?: string): string {
  if (!symbol) return '';

  // Precondition: Hierarchy must be known (minimum 4-candidate tier)
  if (!leadEnergetic) {
    const genericMapping: Record<string, string> = {
      'I---': 'Standard',
      'II--': 'Full Reviser / Full Conductor',
      'I-I-': 'Double-Introverted / Double-Extroverted',
      'I--I': 'Judgement Polarized / Perception Polarized',
      'III-': 'Perception Heavy / Judgement Heavy',
      'II-I': 'Energy Inverted',
      'I-II': 'Antithetical',
      'IIII': 'Fully Conscious'
    };
    return genericMapping[symbol] || symbol;
  }

  const isJLead = leadEnergetic === 'Ji' || leadEnergetic === 'Je';
  const isConductor = leadEnergetic === 'Je' || leadEnergetic === 'Pi';

  const mapping: Record<string, string> = {
    'I---': 'Standard',
    'II--': isConductor ? 'Full Conductor' : 'Full Reviser',
    'I-I-': (leadEnergetic === 'Je' || leadEnergetic === 'Pe') ? 'Double-Extroverted' : 'Double-Introverted',
    'I--I': isJLead ? 'Judgement Polarized' : 'Perception Polarized',
    'III-': isJLead ? 'Perception Heavy' : 'Judgement Heavy',
    'II-I': 'Energy Inverted',
    'I-II': 'Antithetical',
    'IIII': 'Fully Conscious'
  };

  return mapping[symbol] || symbol;
}

// ============================================================================
// §7. Emotional Attitude Derivation
// ============================================================================

export function getEmotionalCategory(attitude: string): string {
  if (!attitude) return '';
  const lower = attitude.toLowerCase().trim();
  if (lower.includes('balanced') || lower === 'neutral') return 'Neutral';
  if (lower.includes('unguarded') || lower === 'adaptive' || lower === 'seelie') return 'Unguarded';
  if (lower.includes('guarded') || lower === 'directive' || lower === 'unseelie') return 'Guarded';
  return attitude;
}

export function getEmotionalDescriptor(attitude: string, axis: string): string | null {
  if (!attitude) return null;
  const category = getEmotionalCategory(attitude);
  
  if (category === 'Neutral') return 'Neutral';
  if (!axis) return null;

  const cleanAxis = axis.trim();
  if (cleanAxis === 'Fe-Ti') {
    if (category === 'Guarded') return 'Directive';
    if (category === 'Unguarded') return 'Adaptive';
  }
  if (cleanAxis === 'Te-Fi') {
    if (category === 'Guarded') return 'Unseelie';
    if (category === 'Unguarded') return 'Seelie';
  }
  return category;
}

export function checkEmotionalMatch(charAttitude: string, charAxis: string, selectedAttitude: string | null): boolean {
  if (!selectedAttitude) return true;
  if (!charAttitude) return false;

  const category = getEmotionalCategory(charAttitude);
  return category.toLowerCase() === selectedAttitude.toLowerCase();
}

// ============================================================================
// §9. Tier-Level Display Names & Type Display
// ============================================================================

export function formatTypeDisplay(type: string, rawQuadra?: string, subtype?: string): string {
  if (!type || type.trim().length === 0) {
    if (subtype && subtype.trim().length > 0) {
      return subtype.trim();
    }
    if (rawQuadra && rawQuadra.trim().length > 0) {
      return rawQuadra.trim();
    }
    return '';
  }

  const cleanType = type.trim().replace(/\s+/g, '');
  const q = rawQuadra ? rawQuadra.trim() : '';

  // Coarse hierarchy notation
  if (cleanType.toLowerCase() === 'jepi' || cleanType === 'Je+Pi') {
    return q ? `${q} Conductor` : 'Conductor';
  }
  if (cleanType.toLowerCase() === 'jipe' || cleanType === 'Ji+Pe') {
    return q ? `${q} Revisor` : 'Revisor';
  }
  if (cleanType.toUpperCase() === 'E') {
    return q ? `${q} Extrovert` : 'Extrovert';
  }
  if (cleanType.toUpperCase() === 'I') {
    return q ? `${q} Introvert` : 'Introvert';
  }
  if (cleanType.toUpperCase() === 'J') {
    return q ? `${q} J-lead` : 'J-lead';
  }
  if (cleanType.toUpperCase() === 'P') {
    return q ? `${q} P-lead` : 'P-lead';
  }

  // Tier 3: Bare Energetic (e.g. Ji, Je, Pe, Pi)
  if (['Ji', 'Je', 'Pe', 'Pi'].includes(cleanType)) {
    return q ? `${q} ${cleanType}-lead` : `${cleanType}-lead`;
  }

  // Tier 2: Positional partials (e.g. TiPe, PeTi)
  const att1 = cleanType.substring(0, 2);
  const att2 = cleanType.substring(2, 4);
  if (FUNCTION_NAMES[att1 as FunctionCode] && ENERGETIC_NAMES[att2 as EnergeticCode]) {
    return cleanType; // e.g. TiPe
  }
  if (ENERGETIC_NAMES[att1 as EnergeticCode] && FUNCTION_NAMES[att2 as FunctionCode]) {
    return cleanType; // e.g. PeTi
  }

  return cleanType;
}

// Helper to normalize function codes
export function normalizeFunctionCode(func: string): string {
  if (!func) return '';
  const trimmed = func.trim();
  
  const code = trimmed.substring(0, 2) as FunctionCode;
  if (FUNCTION_NAMES[code] || ENERGETIC_NAMES[code as unknown as EnergeticCode]) return code;
  
  for (const [c, name] of Object.entries(FUNCTION_NAMES)) {
    if (trimmed.toLowerCase().includes(name.toLowerCase())) return c;
  }
  
  const lower = trimmed.toLowerCase();
  if (lower.includes('sensing')) {
    if (lower.includes('extroverted') || lower.includes('extraverted')) return 'Se';
    if (lower.includes('introverted')) return 'Si';
  }
  if (lower.includes('intuition')) {
    if (lower.includes('extroverted') || lower.includes('extraverted')) return 'Ne';
    if (lower.includes('introverted')) return 'Ni';
  }
  if (lower.includes('thinking')) {
    if (lower.includes('extroverted') || lower.includes('extraverted')) return 'Te';
    if (lower.includes('introverted')) return 'Ti';
  }
  if (lower.includes('feeling')) {
    if (lower.includes('extroverted') || lower.includes('extraverted')) return 'Fe';
    if (lower.includes('introverted')) return 'Fi';
  }

  return '';
}

export function getInterEnergeticDynamics(char: any): string | null {
  const dynamicVal = char?.dynamic || char?.subtype;
  if (!dynamicVal) return null;
  const parts = dynamicVal.split('+');
  if (parts.length !== 2) return null;
  
  const funcToEnergetic = (func: string): string | null => {
    const f = func.trim().substring(0, 2) as FunctionCode;
    return FUNCTION_TO_ENERGETIC[f] || null;
  };
  
  const e1 = funcToEnergetic(parts[0]);
  const e2 = funcToEnergetic(parts[1]);
  
  if (e1 && e2) {
    return `${e1}+${e2}`;
  }
  return null;
}

// ============================================================================
// Motifs Definitions & Parsing
// ============================================================================

export const MOTIF_DEFINITIONS: Record<string, Record<string, string[]>> = {
  'Je': {
    'Philosophical': [
      'Causality: The universe is contingent on cause-effect sequences (inputs-outputs)',
      'Language Universe: The universe is fundamentally a language/code/syntax "running"',
      'Vector Ontology: Objects are their vectors/functionalities (verbs)'
    ],
    'Behavioural': [
      'Productivity and Efficiency: Businessminded, Achievement Focus, Entrepreneurship',
      'Willpower & Personal Challenge: Conscientiousness, self-control, motivation',
      'Politics & Leadership: Management positions, mentorship roles, coaching/guidance'
    ],
    'Linguistic': [
      'Syllogistic Form: Given X, then Y; If-then statements, conditional logic',
      'Authoritative Form: Speaking with a strong expectation for others to accept and follow the statement'
    ]
  },
  'Pi': {
    'Philosophical': [
      'Temporal Ontology: Objects are their entire episodic totality, not just the present',
      'Coordinates: Everything has a somewhere/someplace, positionality is central to objects',
      'Processes: Everything is "a process", there are no "timeless" absolutes, just temporary states'
    ],
    'Behavioural': [
      'Philosophical Focus: Study of classic/modern philosophy; creation of their own',
      'History & Narratives: History, novel writing, screenwriting, storytelling, playwriting',
      'Steadiness & Temperance: Caution, conservatism, long-term thinking, dependability'
    ],
    'Linguistic': [
      'Dense Information: Reference-rich, information heavy sentences',
      'Long Elaborations: Prolonged backstories, long paragraphs and buildup'
    ]
  },
  'Pe': {
    'Philosophical': [
      'Realtime Ontology: Life and reality is "now" — "presence" is our primary existence',
      'Refresh Factor: Reality needs constant renewal, freedom from the "past", the outdated and unflowing',
      'The Undiscovered: The "unknown" is real, vast, and awaiting exploration; lust for universal mystery'
    ],
    'Behavioural': [
      'Life Experiences: "Day to Day" vlogging, social media upkeep, recent adventures, passions, trips',
      'Playfulness & Humor: Banter, jokes, comedy & child-like fun, sanguine traits',
      'Beauty, Art & Creativity: Singing music, dance, instruments, artwork, aesthetics, cosmetics'
    ],
    'Linguistic': [
      'Short Phrases: With quick follow-ups',
      'Casual Language: Informal tone and style'
    ]
  },
  'Ji': {
    'Philosophical': [
      'Essentialism: Seeking fundamental essences to objects, pure, timeless, ideal forms',
      'Non-contingents: Articulating starting axioms and absolutes that are static eternals',
      'Existentialism: Preoccupation with "meaning of life" and living in an authentic manner'
    ],
    'Behavioural': [
      'Identity & Individualism: Precious sense of self identity, private values, idiosyncratic, counter-cultural',
      'Idealistic: Imagining utopian worlds, society, selves, beauty and aspiring for that in their life',
      'Pickiness & Perfection: Meticulous, obsessive crafts, quality-over-quantity, choosy, selective'
    ],
    'Linguistic': [
      "Self-Evaluating: \"I\" language that points inward to evaluate one's own subjective opinion/belief",
      'Terseness: Brief, minimalist language, stating things statically without much elaboration'
    ]
  },
  'Fe': {
    'Philosophical': [
      'Teleology: The universe is a teleological/purposeful/wilful evolution unfolding',
      'Panpsychism: The universe is made of conscious agents interacting',
      'I-Thou Ontology: Our being is co-defined by our interaction with others'
    ],
    'Behavioural': [
      'Transmutable Soul: Character is malleable and contingent on what we do/believe',
      'Mind Over Body: Mental mastery over our physical limitations and overall self',
      'Social Dynamics: Moving social dynamics, leveraging social economics via transactions'
    ],
    'Linguistic': [
      'Persuasive Cadence: Pacing, word choice and delivery meant to maximize affect',
      'Familiar Tone: Friendly, colloquial tone to invoke relatability and camaraderie'
    ]
  },
  'Te': {
    'Philosophical': [
      'Mechanics: The universe operates based on clockwork rules',
      'Objectivity: Causality is impersonal/objective/dispassionate',
      'I-It Ontology: Objects are dead tools, to be used by living beings for their own aims'
    ],
    'Behavioural': [
      'Computation: Data analysis, computer science, programming, math, statistical modelling',
      'Government Systems: The legal system, economics, finance, military operations',
      'Engineering: Bioengineering, mechanical engineering, circuits, fluid mechanics, robotics, automotive'
    ],
    'Linguistic': [
      'Blunt Delivery: Matter-of-fact language, straightforward and unadorned',
      'Avalanching Facts: Communication via an impersonal series of causal events (news anchor style)'
    ]
  },
  'Ni': {
    'Philosophical': [
      'Translocal Isomorphisms: There are eternal patterns which manifest themselves across scenarios',
      'Temporal Isomorphisms: Time is cyclical and events "repeat" in waves or spirals; geometries',
      'Synchronicity: Coinciding events are brought together via an unknown force'
    ],
    'Behavioural': [
      'Consciousness: Mind-body problem, Brain research, NDE, psychedelics, phenomenology',
      'Mysticism: Cosmic Unity, Astrology, Tarot, Karma, "Eastern" theologies',
      'Archetypes & Stereotypes: Viewing "the same" features in many datasets, generalizing'
    ],
    'Linguistic': [
      'Convergent Events: Rather than one linear chronology, past is explained as separate events converging paths',
      'Cross-Domain Synthesis: Tying different domains/layers into the present topic, as real or as metaphors'
    ]
  },
  'Si': {
    'Philosophical': [
      'Chronology: Information follows temporal sequences in linear timelines',
      'Information Locality: Informational concepts are localized and sequential without gaps',
      'Modularity: Non-adjacent concepts are not connected, thus are separate modules/topics'
    ],
    'Behavioural': [
      'Numbers, Names, Dates: Heavy use of specific literal historical information in explanations',
      'Archeology & Geology: Investigation of artefacts, sediment layers, ruins/remains, cultural objects',
      'Traditionalism: A tie to a parent spiritual culture or tradition in a very literal manner'
    ],
    'Linguistic': [
      'Backstory & Context: Thorough setup and backstory provided for a given point or topic',
      'Step by Step Elaboration: Explanations that follow a brick-by-brick narrative sequence'
    ]
  },
  'Ti': {
    'Philosophical': [
      'First Principles: All things reduce down to one/few irreducible axioms',
      'Archimedean Point: Reaching for the maximally "unbiased," distant view that exists',
      'Third-Person Self: One\'s true self is known by observing your nature "beside oneself"'
    ],
    'Behavioural': [
      'Reductionism: Eliminating incongruent beliefs or ideas, clearing out asymmetries or errors',
      'Elegant Simplicity: Seeking elegant simplicity in design/art, dance, or any topic',
      'Castle Reconstruction: "From-scratch" reconstructing of a topic\'s framing, creating a very personal structure'
    ],
    'Linguistic': [
      'Ontological Clarifying: Heavy time spent defining initial "terms" and avoiding equivocations',
      'Semantic Disclaimers: Preemptive addressing of common misunderstandings, to ensure comprehension'
    ]
  },
  'Fi': {
    'Philosophical': [
      'Animism: All things carry a unique spark of consciousness and soul',
      'Radiation: Everything radiates out an essential spiritual character or "vibe"',
      'Embodied Self: One\'s true self is known by intimacy/contact with one\'s personal body'
    ],
    'Behavioural': [
      'Attunement & Purification: Desire to become attuned to one\'s inner truth and eliminate "noise" in the way',
      'Emotional Palate: Strong Resonances/Repulsions to things, based on (dis)harmony with their essence',
      'Raw Self-Expression: Self-exposure, exhibitionism, cross-dressing, queer identities, LGBTQ+'
    ],
    'Linguistic': [
      'Self-Revealing Language: Candid details of personal life, oversharing',
      'Direct Affirmation of Self-Properties: Declaring what one is directly, without speculation'
    ]
  },
  'Se': {
    'Philosophical': [
      'Actuality: Informational realism; "it is what it is" (abstract or concrete)',
      'Presence: Reality is "now"; this present moment',
      'Amplification: "Knowing" via immersion, intensity, augmentation, penetration/"contact"'
    ],
    'Behavioural': [
      'Visceral Experiences: Intense stimuli seeking, extreme hot/cold/pain/pleasure, thrills and stunts',
      'Athletics & Competitiveness: Team sports, esports, martial arts, gaming, vitality & volition',
      'Sensuality & Aesthetics: Fashion, modelling, cosmetics/makeup, ergonomics'
    ],
    'Linguistic': [
      'Vivid Realism: Description of objects/experiences in visceral detail, highlighting the overall feeling evoked',
      'Trendy Language: On-trend slang words and references'
    ]
  },
  'Ne': {
    'Philosophical': [
      'Allocentrism: The present moment is multi-meaning and multi-angled. Relativism of viewpoints',
      'Potentiality: "What could be" is as real as what is; optimistic belief in the "unborn"',
      'Flight: True living requires leaving this "one possibility" to enter the imaginal realms'
    ],
    'Behavioural': [
      'Puns, Parodies & Wordplay: Mini-skits, imitations of characters, voice and face modulation',
      'Fantastical Exploration: "What-if" thinking, fantasy world building, make-believe, daydreaming, escapism',
      'Tinkering & Hodgepodgeing: Playing with mixing-and-matching objects or ideas into new combinations'
    ],
    'Linguistic': [
      'Indiscriminate Correlation: Large leaps of association between disparate points, farfetched ideas',
      'Tangent-Hopping: Topic-jumping, chasing side tangents, ending up far away from the starting topic'
    ]
  }
};

export interface Motif {
  category: 'Philosophical' | 'Behavioural' | 'Linguistic';
  label: string;
  value: boolean;
  index: number;
}

export interface FunctionMotifs {
  function: string;
  motifs: Motif[];
}

export function getStructuredMotifs(values: boolean[]): FunctionMotifs[] {
  const functions = ['Je', 'Pi', 'Pe', 'Ji', 'Fe', 'Te', 'Ni', 'Si', 'Ti', 'Fi', 'Se', 'Ne'];
  const structured: FunctionMotifs[] = [];
  let currentIndex = 0;

  functions.forEach(func => {
    const defs = MOTIF_DEFINITIONS[func];
    const motifs: Motif[] = [];

    ['Philosophical', 'Behavioural', 'Linguistic'].forEach(cat => {
      const labels = defs[cat];
      labels.forEach(label => {
        motifs.push({
          category: cat as any,
          label,
          value: values[currentIndex] || false,
          index: currentIndex
        });
        currentIndex++;
      });
    });

    if (motifs.some(m => m.value)) {
      structured.push({
        function: func,
        motifs
      });
    }
  });

  return structured;
}

export function getAllMotifs(): { id: number; label: string; function: string }[] {
  const functions = ['Je', 'Pi', 'Pe', 'Ji', 'Fe', 'Te', 'Ni', 'Si', 'Ti', 'Fi', 'Se', 'Ne'];
  const all: { id: number; label: string; function: string }[] = [];
  let currentIndex = 0;

  functions.forEach(func => {
    const defs = MOTIF_DEFINITIONS[func];
    ['Philosophical', 'Behavioural', 'Linguistic'].forEach(cat => {
      const labels = defs[cat];
      labels.forEach(label => {
        all.push({
          id: currentIndex,
          label,
          function: func
        });
        currentIndex++;
      });
    });
  });

  return all;
}

// ============================================================================
// Filtering Engine
// ============================================================================

export interface FilterState {
  quadra: string | null;
  judgmentAxis: string | null;
  perceptionAxis: string | null;
  leadEnergetic: string | null;
  auxEnergetic: string | null;
  development: string | null;
  behaviourQualia: string | null;
  subtype: string | null;
  dynamic?: string | null;
  interEnergetic: string | null;
  emotionalAttitude: string | null;
  authors: string[];
  motifs: number[];
}

export function matchesFilters(char: any, filters: Partial<FilterState>): boolean {
  if (!char.author) return false;

  const derived = deriveAxesFromQuadra(char.rawQuadra || char.quadra);
  const judgment = (char.judgmentAxis || derived.judgment).toLowerCase();
  const perception = (char.perceptionAxis || derived.perception).toLowerCase();

  if (filters.quadra) {
    const quadra = char.quadra?.toLowerCase();
    const rawQuadra = char.rawQuadra?.toLowerCase();
    const filterQuadra = filters.quadra.toLowerCase();
    if (quadra !== filterQuadra && rawQuadra !== filterQuadra) return false;
  }
  if (filters.judgmentAxis && judgment !== filters.judgmentAxis.toLowerCase()) return false;
  if (filters.perceptionAxis && perception !== filters.perceptionAxis.toLowerCase()) return false;
  if (filters.leadEnergetic && char.leadEnergetic?.toLowerCase() !== filters.leadEnergetic.toLowerCase()) return false;
  if (filters.auxEnergetic && char.auxiliaryEnergetic?.toLowerCase() !== filters.auxEnergetic.toLowerCase()) return false;
  
  const charDev = (char.finalDevelopment || char.initialDevelopment || '').toLowerCase();
  if (filters.development && charDev !== filters.development.toLowerCase()) return false;
  
  if (filters.behaviourQualia && char.behaviourQualia !== filters.behaviourQualia) return false;
  
  const activeSubtype = filters.subtype || filters.dynamic;
  if (activeSubtype) {
    const charDynamic = char.dynamic || char.subtype || '';
    if (normalizeDynamicPair(charDynamic) !== normalizeDynamicPair(activeSubtype)) return false;
  }
  
  if (filters.interEnergetic && getInterEnergeticDynamics(char) !== filters.interEnergetic) return false;
  
  if (filters.emotionalAttitude && !checkEmotionalMatch(char.emotionalAttitude, char.judgmentAxis, filters.emotionalAttitude)) return false;
  
  if (filters.authors && filters.authors.length > 0 && !filters.authors.includes(char.author)) return false;

  if (filters.motifs && filters.motifs.length > 0) {
    if (!char.motifValues || !filters.motifs.every((idx: number) => char.motifValues![idx])) return false;
  }
  
  return true;
}

// ============================================================================
// Utilities
// ============================================================================

export function formatAnalysisForDiscord(markdown: string): string {
  if (!markdown) return '';

  let transformed = markdown;
  transformed = transformed.replace(/<details><summary>.*?<\/summary>(.*?)<\/details>/gs, '||$1||');
  transformed = transformed.replace(/<u>(.*?)<\/u>/g, '__$1__');
  transformed = transformed.replace(/<small>(.*?)<\/small>/g, '-# $1');

  return transformed;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// ============================================================================
// Top-Down CT Suggestion & Constraint Engine
// ============================================================================

export interface TopDownDeduction {
  typeCode: string;
  tier: number;
  tierLabel: string;
  isFullyResolved: boolean;
  leadFunction?: FunctionCode;
  auxiliaryFunction?: FunctionCode;
  tertiaryFunction?: FunctionCode;
  polarFunction?: FunctionCode;
  leadEnergetic?: EnergeticCode;
  auxiliaryEnergetic?: EnergeticCode;
  tertiaryEnergetic?: EnergeticCode;
  polarEnergetic?: EnergeticCode;
  lockedJudgmentAxis?: JudgmentAxis | null;
  lockedPerceptionAxis?: PerceptionAxis | null;
  lockedQuadra?: Quadra | null;
  candidateQuadras: Quadra[];
  candidateTypes: string[];
  validDynamics: { pair: string; title: string }[];
  hierarchyType?: 'Conductor' | 'Revisor' | 'Extrovert' | 'Introvert' | null;
  explanation: string;
}

export function computeTopDownDeduction(typeCode: string, currentQuadra?: string): TopDownDeduction {
  const clean = (typeCode || '').trim();
  
  if (!clean) {
    return {
      typeCode: '',
      tier: 6,
      tierLabel: 'Unassigned',
      isFullyResolved: false,
      candidateQuadras: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      candidateTypes: [...FULL_TYPES],
      validDynamics: [],
      explanation: 'Enter a type code (e.g. TiSe, TiPe, Ji) to initiate top-down CT deduction.'
    };
  }

  // Tier 1: Fully Resolved 4-Function Type (e.g. TiSe, TiNe, FeNi)
  if (FULL_TYPES.includes(clean)) {
    const stack = resolveFullStack(clean)!;
    const dynamics = (QUADRA_VALID_DYNAMICS[stack.quadra] || []).map(pair => ({
      pair,
      title: EMERGENT_ARCHETYPE_NAMES[pair] || ''
    }));

    const hierarchy: 'Conductor' | 'Revisor' =
      stack.leadEnergetic === 'Je' || stack.leadEnergetic === 'Pi' ? 'Conductor' : 'Revisor';

    const jQualia = stack.judgmentAxis === 'Fe-Ti' ? 'Measured' : 'Candid';
    const pQualia = stack.perceptionAxis === 'Se-Ni' ? 'Grounded' : 'Suspended';

    return {
      typeCode: clean,
      tier: 1,
      tierLabel: 'Full Resolution (Tier 1)',
      isFullyResolved: true,
      leadFunction: stack.lead,
      auxiliaryFunction: stack.auxiliary,
      tertiaryFunction: stack.tertiary,
      polarFunction: stack.polar,
      leadEnergetic: stack.leadEnergetic,
      auxiliaryEnergetic: stack.auxiliaryEnergetic,
      tertiaryEnergetic: stack.tertiaryEnergetic,
      polarEnergetic: stack.polarEnergetic,
      lockedJudgmentAxis: stack.judgmentAxis,
      lockedPerceptionAxis: stack.perceptionAxis,
      lockedQuadra: stack.quadra,
      candidateQuadras: [stack.quadra],
      candidateTypes: [clean],
      validDynamics: dynamics,
      hierarchyType: hierarchy,
      explanation: `${clean} locks ${stack.quadra} Quadra with ${stack.judgmentAxis} (${jQualia}) and ${stack.perceptionAxis} (${pQualia}) axes.`
    };
  }

  // Tier 2: Positional Partials (e.g. TiPe, PeTi, FiPe, TePi)
  const att1 = clean.substring(0, 2);
  const att2 = clean.substring(2, 4);

  // Pattern A: {Function}{Energetic} e.g. TiPe, FiPe, TePi, FePi, NeJi, SeJi, etc.
  if (FUNCTION_NAMES[att1 as FunctionCode] && ENERGETIC_NAMES[att2 as EnergeticCode]) {
    const lead = att1 as FunctionCode;
    const auxEnergetic = att2 as EnergeticCode;
    const leadEnergetic = FUNCTION_TO_ENERGETIC[lead];
    const candidateTypes = FULL_TYPES.filter(
      t => t.startsWith(lead) && FUNCTION_TO_ENERGETIC[t.substring(2, 4) as FunctionCode] === auxEnergetic
    );
    const candidateQuadras = Array.from(
      new Set(candidateTypes.map(t => resolveFullStack(t)?.quadra).filter(Boolean))
    ) as Quadra[];

    const isLeadJudgment = leadEnergetic === 'Ji' || leadEnergetic === 'Je';
    const lockedJudgmentAxis: JudgmentAxis | null = isLeadJudgment
      ? (lead === 'Fe' || lead === 'Ti' ? 'Fe-Ti' : 'Te-Fi')
      : null;
    const lockedPerceptionAxis: PerceptionAxis | null = !isLeadJudgment
      ? (lead === 'Ne' || lead === 'Si' ? 'Ne-Si' : 'Se-Ni')
      : null;

    const jQualia = lockedJudgmentAxis === 'Fe-Ti' ? 'Measured' : lockedJudgmentAxis === 'Te-Fi' ? 'Candid' : '';
    const pQualia = lockedPerceptionAxis === 'Se-Ni' ? 'Grounded' : lockedPerceptionAxis === 'Ne-Si' ? 'Suspended' : '';

    const lockedAxisText = lockedJudgmentAxis
      ? `${lockedJudgmentAxis} (${jQualia})`
      : `${lockedPerceptionAxis} (${pQualia})`;

    return {
      typeCode: clean,
      tier: 2,
      tierLabel: 'Positional Partial (Tier 2)',
      isFullyResolved: false,
      leadFunction: lead,
      leadEnergetic: leadEnergetic,
      auxiliaryEnergetic: auxEnergetic,
      lockedJudgmentAxis,
      lockedPerceptionAxis,
      lockedQuadra: candidateQuadras.length === 1 ? candidateQuadras[0] : null,
      candidateQuadras,
      candidateTypes,
      validDynamics: [],
      explanation: `${clean} locks ${lockedAxisText} with ${lead} (${leadEnergetic}) lead. Quadra narrows to ${candidateQuadras.join(' or ')}.`
    };
  }

  // Pattern B: {Energetic}{Function} e.g. PeTi, PeFi, PiTe, PiFe, JiNe, etc.
  if (ENERGETIC_NAMES[att1 as EnergeticCode] && FUNCTION_NAMES[att2 as FunctionCode]) {
    const leadEnergetic = att1 as EnergeticCode;
    const aux = att2 as FunctionCode;
    const auxEnergetic = FUNCTION_TO_ENERGETIC[aux];
    const candidateTypes = FULL_TYPES.filter(
      t => FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode] === leadEnergetic && t.substring(2, 4) === aux
    );
    const candidateQuadras = Array.from(
      new Set(candidateTypes.map(t => resolveFullStack(t)?.quadra).filter(Boolean))
    ) as Quadra[];

    const isAuxJudgment = auxEnergetic === 'Ji' || auxEnergetic === 'Je';
    const lockedJudgmentAxis: JudgmentAxis | null = isAuxJudgment
      ? (aux === 'Fe' || aux === 'Ti' ? 'Fe-Ti' : 'Te-Fi')
      : null;
    const lockedPerceptionAxis: PerceptionAxis | null = !isAuxJudgment
      ? (aux === 'Ne' || aux === 'Si' ? 'Ne-Si' : 'Se-Ni')
      : null;

    const jQualia = lockedJudgmentAxis === 'Fe-Ti' ? 'Measured' : lockedJudgmentAxis === 'Te-Fi' ? 'Candid' : '';
    const pQualia = lockedPerceptionAxis === 'Se-Ni' ? 'Grounded' : lockedPerceptionAxis === 'Ne-Si' ? 'Suspended' : '';

    const lockedAxisText = lockedJudgmentAxis
      ? `${lockedJudgmentAxis} (${jQualia})`
      : `${lockedPerceptionAxis} (${pQualia})`;

    return {
      typeCode: clean,
      tier: 2,
      tierLabel: 'Positional Partial (Tier 2)',
      isFullyResolved: false,
      auxiliaryFunction: aux,
      leadEnergetic: leadEnergetic,
      auxiliaryEnergetic: auxEnergetic,
      lockedJudgmentAxis,
      lockedPerceptionAxis,
      lockedQuadra: candidateQuadras.length === 1 ? candidateQuadras[0] : null,
      candidateQuadras,
      candidateTypes,
      validDynamics: [],
      explanation: `${clean} locks ${lockedAxisText} via auxiliary ${aux} (${auxEnergetic}). Quadra narrows to ${candidateQuadras.join(' or ')}.`
    };
  }

  // Tier 3: Bare Energetic (e.g. Ji, Je, Pe, Pi)
  if (['Ji', 'Je', 'Pe', 'Pi'].includes(clean)) {
    const leadEnergetic = clean as EnergeticCode;
    const candidateTypes = FULL_TYPES.filter(
      t => FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode] === leadEnergetic
    );
    const hierarchy: 'Conductor' | 'Revisor' =
      leadEnergetic === 'Je' || leadEnergetic === 'Pi' ? 'Conductor' : 'Revisor';

    return {
      typeCode: clean,
      tier: 3,
      tierLabel: 'Energetic Lead (Tier 3)',
      isFullyResolved: false,
      leadEnergetic,
      lockedJudgmentAxis: null,
      lockedPerceptionAxis: null,
      lockedQuadra: null,
      candidateQuadras: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      candidateTypes,
      validDynamics: [],
      hierarchyType: hierarchy,
      explanation: `${clean}-lead (${ENERGETIC_NAMES[leadEnergetic]}). ${hierarchy} configuration with 4 open candidate branches.`
    };
  }

  // Tier 4: Coarse Hierarchy notation (e.g. JePi, JiPe, Conductor, Revisor)
  if (clean.toLowerCase() === 'jepi' || clean === 'Je+Pi' || clean.toLowerCase() === 'conductor') {
    const candidateTypes = FULL_TYPES.filter(t => {
      const leadE = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return leadE === 'Je' || leadE === 'Pi';
    });
    return {
      typeCode: clean,
      tier: 4,
      tierLabel: 'Coarse Hierarchy (Conductor)',
      isFullyResolved: false,
      lockedJudgmentAxis: null,
      lockedPerceptionAxis: null,
      lockedQuadra: null,
      candidateQuadras: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      candidateTypes,
      validDynamics: [],
      hierarchyType: 'Conductor',
      explanation: 'Conductor hierarchy (Je/Pi orientation). Directs structure and overarching progression.'
    };
  }

  if (clean.toLowerCase() === 'jipe' || clean === 'Ji+Pe' || clean.toLowerCase() === 'revisor') {
    const candidateTypes = FULL_TYPES.filter(t => {
      const leadE = FUNCTION_TO_ENERGETIC[t.substring(0, 2) as FunctionCode];
      return leadE === 'Ji' || leadE === 'Pe';
    });
    return {
      typeCode: clean,
      tier: 4,
      tierLabel: 'Coarse Hierarchy (Revisor)',
      isFullyResolved: false,
      lockedJudgmentAxis: null,
      lockedPerceptionAxis: null,
      lockedQuadra: null,
      candidateQuadras: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      candidateTypes,
      validDynamics: [],
      hierarchyType: 'Revisor',
      explanation: 'Revisor hierarchy (Ji/Pe orientation). Explores novelty and refines internal precision.'
    };
  }

  // Fallback candidate search
  const candidates = resolveCandidates(clean, currentQuadra);
  return {
    typeCode: clean,
    tier: 5,
    tierLabel: 'Custom / Partial',
    isFullyResolved: candidates.length === 1,
    candidateQuadras: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    candidateTypes: candidates,
    validDynamics: [],
    explanation: `Type query matched ${candidates.length} potential candidate profiles.`
  };
}

// ============================================================================
// §6 Development & §7 Emotional Attitude Spec Mappings
// ============================================================================

export const DEVELOPMENT_DEFINITIONS: Record<DevelopmentCode, { jMeaning: string; pMeaning: string }> = {
  'I---': { jMeaning: 'Standard', pMeaning: 'Standard' },
  'II--': { jMeaning: 'Full Reviser', pMeaning: 'Full Conductor' },
  'I-I-': { jMeaning: 'Double-Introverted (Ji) / Double-Extroverted (Je)', pMeaning: 'Double-Introverted (Pi) / Double-Extroverted (Pe)' },
  'I--I': { jMeaning: 'Judgement Polarized', pMeaning: 'Perception Polarized' },
  'III-': { jMeaning: 'Perception Heavy', pMeaning: 'Judgement Heavy' },
  'II-I': { jMeaning: 'Energy Inverted', pMeaning: 'Energy Inverted' },
  'I-II': { jMeaning: 'Antithetical', pMeaning: 'Antithetical' },
  'IIII': { jMeaning: 'Fully Conscious', pMeaning: 'Fully Conscious' }
};

export const ALL_DEVELOPMENT_CODES: DevelopmentCode[] = [
  'I---', 'II--', 'I-I-', 'I--I', 'III-', 'II-I', 'I-II', 'IIII'
];

export function getDevelopmentMeaning(symbol: string, leadEnergetic?: string): string {
  const def = DEVELOPMENT_DEFINITIONS[symbol as DevelopmentCode];
  if (!def) return symbol;
  const isJPrimary = leadEnergetic === 'Ji' || leadEnergetic === 'Je';
  return isJPrimary ? def.jMeaning : def.pMeaning;
}

export function getEmotionalAttitudeLabel(
  attitude: EmotionalAttitude,
  judgmentAxis?: JudgmentAxis | null
): { label: string; sublabel: string } {
  if (attitude === 'Neutral') {
    return { label: 'Neutral', sublabel: 'Equidistant / Mid-range affect' };
  }
  if (judgmentAxis === 'Fe-Ti') {
    return attitude === 'Unguarded'
      ? { label: 'Adaptive', sublabel: 'Unguarded (Fe-Ti Measured)' }
      : { label: 'Directive', sublabel: 'Guarded (Fe-Ti Measured)' };
  }
  if (judgmentAxis === 'Te-Fi') {
    return attitude === 'Unguarded'
      ? { label: 'Seelie', sublabel: 'Unguarded (Te-Fi Candid)' }
      : { label: 'Unseelie', sublabel: 'Guarded (Te-Fi Candid)' };
  }
  return {
    label: attitude,
    sublabel: attitude === 'Unguarded' ? 'Permeable boundary' : 'Defensive boundary'
  };
}

// ============================================================================
// §11. Epistemic Type Selection Engine (Uncertainty-First 5-Layer Resolution)
// ============================================================================

export interface CTTypeCandidate {
  code: string;
  lead: 'Ji' | 'Je' | 'Pe' | 'Pi';
  j_p: 'J' | 'P';
  macro: 'Ji+Pe' | 'Je+Pi';
  j_axis: 'Fe-Ti' | 'Te-Fi';
  p_axis: 'Ne-Si' | 'Se-Ni';
  quadra: Quadra;
}

export const EPISTEMIC_16_CANDIDATES: CTTypeCandidate[] = [
  { code: 'TiNe', lead: 'Ji', j_p: 'J', macro: 'Ji+Pe', j_axis: 'Fe-Ti', p_axis: 'Ne-Si', quadra: 'Alpha' },
  { code: 'TiSe', lead: 'Ji', j_p: 'J', macro: 'Ji+Pe', j_axis: 'Fe-Ti', p_axis: 'Se-Ni', quadra: 'Beta' },
  { code: 'FiNe', lead: 'Ji', j_p: 'J', macro: 'Ji+Pe', j_axis: 'Te-Fi', p_axis: 'Ne-Si', quadra: 'Delta' },
  { code: 'FiSe', lead: 'Ji', j_p: 'J', macro: 'Ji+Pe', j_axis: 'Te-Fi', p_axis: 'Se-Ni', quadra: 'Gamma' },

  { code: 'FeSi', lead: 'Je', j_p: 'J', macro: 'Je+Pi', j_axis: 'Fe-Ti', p_axis: 'Ne-Si', quadra: 'Alpha' },
  { code: 'FeNi', lead: 'Je', j_p: 'J', macro: 'Je+Pi', j_axis: 'Fe-Ti', p_axis: 'Se-Ni', quadra: 'Beta' },
  { code: 'TeSi', lead: 'Je', j_p: 'J', macro: 'Je+Pi', j_axis: 'Te-Fi', p_axis: 'Ne-Si', quadra: 'Delta' },
  { code: 'TeNi', lead: 'Je', j_p: 'J', macro: 'Je+Pi', j_axis: 'Te-Fi', p_axis: 'Se-Ni', quadra: 'Gamma' },

  { code: 'NeTi', lead: 'Pe', j_p: 'P', macro: 'Ji+Pe', j_axis: 'Fe-Ti', p_axis: 'Ne-Si', quadra: 'Alpha' },
  { code: 'SeTi', lead: 'Pe', j_p: 'P', macro: 'Ji+Pe', j_axis: 'Fe-Ti', p_axis: 'Se-Ni', quadra: 'Beta' },
  { code: 'NeFi', lead: 'Pe', j_p: 'P', macro: 'Ji+Pe', j_axis: 'Te-Fi', p_axis: 'Ne-Si', quadra: 'Delta' },
  { code: 'SeFi', lead: 'Pe', j_p: 'P', macro: 'Ji+Pe', j_axis: 'Te-Fi', p_axis: 'Se-Ni', quadra: 'Gamma' },

  { code: 'SiFe', lead: 'Pi', j_p: 'P', macro: 'Je+Pi', j_axis: 'Fe-Ti', p_axis: 'Ne-Si', quadra: 'Alpha' },
  { code: 'NiFe', lead: 'Pi', j_p: 'P', macro: 'Je+Pi', j_axis: 'Fe-Ti', p_axis: 'Se-Ni', quadra: 'Beta' },
  { code: 'SiTe', lead: 'Pi', j_p: 'P', macro: 'Je+Pi', j_axis: 'Te-Fi', p_axis: 'Ne-Si', quadra: 'Delta' },
  { code: 'NiTe', lead: 'Pi', j_p: 'P', macro: 'Je+Pi', j_axis: 'Te-Fi', p_axis: 'Se-Ni', quadra: 'Gamma' }
];

export const QUADRA_AXES_MAP: Record<string, { j_axis: 'Fe-Ti' | 'Te-Fi'; p_axis: 'Ne-Si' | 'Se-Ni' }> = {
  Alpha: { j_axis: 'Fe-Ti', p_axis: 'Ne-Si' },
  Beta:  { j_axis: 'Fe-Ti', p_axis: 'Se-Ni' },
  Gamma: { j_axis: 'Te-Fi', p_axis: 'Se-Ni' },
  Delta: { j_axis: 'Te-Fi', p_axis: 'Ne-Si' }
};

export interface EpistemicUserState {
  j_p: 'J' | 'P' | null;
  macro: 'Ji+Pe' | 'Je+Pi' | null;
  lead: 'Ji' | 'Je' | 'Pe' | 'Pi' | null;
  quadra: Quadra | null;
  j_axis: 'Fe-Ti' | 'Te-Fi' | null;
  p_axis: 'Ne-Si' | 'Se-Ni' | null;
}

export interface EpistemicEngineResult {
  candidates: CTTypeCandidate[];
  inferredState: EpistemicUserState;
  activeOptions: Record<keyof EpistemicUserState, Set<string>>;
}

/**
 * Pure epistemic inference engine recalculation.
 * Iteratively propagates constraints and collapses candidates.
 */
export function recalculateEpistemicEngine(userState: EpistemicUserState): EpistemicEngineResult {
  const inferred: EpistemicUserState = {
    j_p: null,
    macro: null,
    lead: null,
    quadra: null,
    j_axis: null,
    p_axis: null
  };

  // Quadra enforcement derived from schema map
  if (userState.quadra && QUADRA_AXES_MAP[userState.quadra]) {
    inferred.j_axis = QUADRA_AXES_MAP[userState.quadra].j_axis;
    inferred.p_axis = QUADRA_AXES_MAP[userState.quadra].p_axis;
  }

  let filtered = EPISTEMIC_16_CANDIDATES.filter(t => {
    for (const [key, val] of Object.entries(userState)) {
      if (val && t[key as keyof CTTypeCandidate] !== val) return false;
    }
    for (const [key, val] of Object.entries(inferred)) {
      if (val && t[key as keyof CTTypeCandidate] !== val) return false;
    }
    return true;
  });

  let inferring = true;
  while (inferring) {
    inferring = false;
    
    const validPool = {
      j_p: new Set(filtered.map(c => c.j_p)),
      macro: new Set(filtered.map(c => c.macro)),
      lead: new Set(filtered.map(c => c.lead)),
      quadra: new Set(filtered.map(c => c.quadra)),
      j_axis: new Set(filtered.map(c => c.j_axis)),
      p_axis: new Set(filtered.map(c => c.p_axis))
    };

    (Object.keys(validPool) as Array<keyof EpistemicUserState>).forEach(cat => {
      if (!userState[cat] && !inferred[cat] && validPool[cat].size === 1) {
        (inferred as any)[cat] = Array.from(validPool[cat])[0];
        inferring = true;
      }
    });

    if (inferring) {
      filtered = filtered.filter(t => {
        for (const [key, val] of Object.entries(inferred)) {
          if (val && t[key as keyof CTTypeCandidate] !== val) return false;
        }
        return true;
      });
    }
  }

  const options: Record<keyof EpistemicUserState, Set<string>> = {
    j_p: new Set(filtered.map(c => c.j_p)),
    macro: new Set(filtered.map(c => c.macro)),
    lead: new Set(filtered.map(c => c.lead)),
    quadra: new Set(filtered.map(c => c.quadra)),
    j_axis: new Set(filtered.map(c => c.j_axis)),
    p_axis: new Set(filtered.map(c => c.p_axis))
  };

  return { candidates: filtered, inferredState: inferred, activeOptions: options };
}

/**
 * Generates editorial natural language resolution description.
 */
export function generateNaturalLanguageResolution(
  activeState: EpistemicUserState,
  candidateCount: number,
  singleType: CTTypeCandidate | null
): string {
  if (candidateCount === 16) return "Uncertain (Full Matrix Open)";
  if (candidateCount === 1 && singleType) return `${singleType.code} (Single Type Lock)`;

  const parts: string[] = [];

  let explicitLeadFound = false;
  if (activeState.lead) {
    if (activeState.lead === 'Ji' && activeState.j_axis === 'Fe-Ti') { parts.push("Ti-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Ji' && activeState.j_axis === 'Te-Fi') { parts.push("Fi-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Je' && activeState.j_axis === 'Fe-Ti') { parts.push("Fe-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Je' && activeState.j_axis === 'Te-Fi') { parts.push("Te-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Pe' && activeState.p_axis === 'Ne-Si') { parts.push("Ne-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Pe' && activeState.p_axis === 'Se-Ni') { parts.push("Se-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Pi' && activeState.p_axis === 'Ne-Si') { parts.push("Si-lead"); explicitLeadFound = true; }
    else if (activeState.lead === 'Pi' && activeState.p_axis === 'Se-Ni') { parts.push("Ni-lead"); explicitLeadFound = true; }
  }

  if (activeState.quadra) {
    parts.unshift(activeState.quadra);
  } else if (!explicitLeadFound) {
    if (activeState.j_axis === 'Fe-Ti') parts.unshift("Measured");
    if (activeState.j_axis === 'Te-Fi') parts.unshift("Candid");
    if (activeState.p_axis === 'Ne-Si') parts.unshift("Suspended");
    if (activeState.p_axis === 'Se-Ni') parts.unshift("Grounded");
  } else {
    if (activeState.lead === 'Pe' || activeState.lead === 'Pi') {
      if (activeState.j_axis === 'Fe-Ti') parts.unshift("Measured");
      if (activeState.j_axis === 'Te-Fi') parts.unshift("Candid");
    } else if (activeState.lead === 'Ji' || activeState.lead === 'Je') {
      if (activeState.p_axis === 'Ne-Si') parts.unshift("Suspended");
      if (activeState.p_axis === 'Se-Ni') parts.unshift("Grounded");
    }
  }

  if (!explicitLeadFound) {
    if (activeState.lead) {
      parts.push(`${activeState.lead}-lead`);
    } else if (activeState.macro === 'Je+Pi' && activeState.j_p === 'J') {
      parts.push("Je-lead");
    } else if (activeState.macro === 'Ji+Pe' && activeState.j_p === 'J') {
      parts.push("Ji-lead");
    } else if (activeState.macro === 'Je+Pi' && activeState.j_p === 'P') {
      parts.push("Pi-lead");
    } else if (activeState.macro === 'Ji+Pe' && activeState.j_p === 'P') {
      parts.push("Pe-lead");
    } else if (activeState.macro) {
      parts.push(activeState.macro === 'Ji+Pe' ? "Revisor" : "Conductor");
    } else if (activeState.j_p) {
      parts.push(activeState.j_p === 'P' ? "Perception lead" : "Judgment lead");
    }
  }

  return parts.length > 0 ? parts.join(" ") : "Partial Constraint";
}



