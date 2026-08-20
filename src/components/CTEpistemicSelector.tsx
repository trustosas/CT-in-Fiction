import React, { useState, useEffect, useMemo } from 'react';
import { Lock, RotateCcw, Check } from 'lucide-react';
import {
  EPISTEMIC_16_CANDIDATES,
  QUADRA_AXES_MAP,
  type CTTypeCandidate,
  type EpistemicUserState,
  recalculateEpistemicEngine,
  generateNaturalLanguageResolution
} from '../lib/ct-logic';

export interface CTEpistemicSelectorProps {
  value: string;
  quadraValue?: string;
  onChange: (type: string, quadra: string) => void;
}

export const CTEpistemicSelector: React.FC<CTEpistemicSelectorProps> = ({
  value,
  quadraValue,
  onChange
}) => {
  const [userState, setUserState] = useState<EpistemicUserState>({
    j_p: null,
    macro: null,
    lead: null,
    quadra: null,
    j_axis: null,
    p_axis: null
  });

  // Hydrate userState if external value changes (e.g. initial edit load)
  useEffect(() => {
    if (value && value.trim()) {
      const match = EPISTEMIC_16_CANDIDATES.find(t => t.code.toLowerCase() === value.trim().toLowerCase());
      if (match) {
        // If exact full type matches, set all explicit states or candidate lock
        setUserState({
          j_p: match.j_p,
          macro: match.macro,
          lead: match.lead,
          quadra: match.quadra,
          j_axis: match.j_axis,
          p_axis: match.p_axis
        });
      } else {
        // Check partials (e.g. 'Ji', 'Je', 'TiPe', etc.)
        const upper = value.trim();
        if (upper === 'J' || upper === 'P') {
          setUserState(prev => ({ ...prev, j_p: upper as any }));
        } else if (upper === 'Ji' || upper === 'Je' || upper === 'Pe' || upper === 'Pi') {
          setUserState(prev => ({ ...prev, lead: upper as any }));
        }
      }
    } else if (!value) {
      setUserState({
        j_p: null,
        macro: null,
        lead: null,
        quadra: null,
        j_axis: null,
        p_axis: null
      });
    }
  }, [value]);

  // Recalculate engine logic and candidates via pure ct-logic function
  const { candidates, inferredState, activeOptions } = useMemo(() => {
    return recalculateEpistemicEngine(userState);
  }, [userState]);

  // Generate Natural Language Resolution Text via pure ct-logic function
  const naturalLanguageResolution = useMemo(() => {
    const candidateCount = candidates.length;
    const activeState = { ...inferredState, ...userState };
    return generateNaturalLanguageResolution(
      activeState,
      candidateCount,
      candidateCount === 1 ? candidates[0] : null
    );
  }, [candidates, inferredState, userState]);

  // Handle toggling a category value
  const handleToggle = (category: keyof EpistemicUserState, val: any) => {
    if (inferredState[category] === val) return; // cannot toggle inferred

    setUserState(prev => {
      const next = { ...prev };
      (next as any)[category] = prev[category] === val ? null : val;
      return next;
    });
  };

  // Direct Candidate Type click -> Lock to single type
  const handleSelectCandidate = (candidate: CTTypeCandidate) => {
    if (candidates.length === 1 && candidates[0].code === candidate.code) {
      // Toggle off / reset to open
      handleReset();
      return;
    }

    setUserState({
      j_p: candidate.j_p,
      macro: candidate.macro,
      lead: candidate.lead,
      quadra: candidate.quadra,
      j_axis: candidate.j_axis,
      p_axis: candidate.p_axis
    });

    onChange(candidate.code, candidate.quadra);
  };

  // Reset all constraints
  const handleReset = () => {
    setUserState({
      j_p: null,
      macro: null,
      lead: null,
      quadra: null,
      j_axis: null,
      p_axis: null
    });
    onChange('', '');
  };

  // Whenever candidates change, trigger parent sync if single lock or partial
  useEffect(() => {
    if (candidates.length === 1) {
      const single = candidates[0];
      onChange(single.code, single.quadra);
    } else {
      // If partial lead or quadra known
      const active = { ...inferredState, ...userState };
      const currentCode = active.lead || (active.j_p ? `${active.j_p}` : '');
      const currentQuadra = active.quadra || '';
      if (value !== currentCode && currentCode) {
        onChange(currentCode, currentQuadra);
      }
    }
  }, [candidates, inferredState, userState]);

  const candidateCount = candidates.length;
  const isLocked = candidateCount === 1;
  const progressPercent = Math.round(((16 - candidateCount) / 15) * 100);
  const activeCodes = useMemo(() => new Set(candidates.map(c => c.code)), [candidates]);

  // Helper to render button states
  const renderButton = (
    category: keyof EpistemicUserState,
    val: any,
    label: string,
    sublabel?: string
  ) => {
    const isInferred = inferredState[category] === val;
    const isUserSelected = userState[category] === val && !isInferred;
    const isPossible = (activeOptions as Record<string, Set<any>>)[category]?.has(val);
    const isDisabled = (!isPossible && !isUserSelected) || isInferred;

    let buttonClass = 'px-3 py-2 text-xs font-mono rounded-sm border transition-all text-center flex-1 min-w-[100px] cursor-pointer ';

    if (isUserSelected) {
      buttonClass += 'bg-charcoal text-beige border-charcoal font-semibold shadow-sm ';
    } else if (isInferred) {
      buttonClass += 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold cursor-not-allowed ';
    } else if (!isDisabled) {
      buttonClass += 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-charcoal text-charcoal/80 hover:text-charcoal ';
    } else {
      buttonClass += 'opacity-20 border-transparent bg-charcoal/5 cursor-not-allowed ';
    }

    return (
      <button
        key={val}
        type="button"
        disabled={isDisabled}
        onClick={() => handleToggle(category, val)}
        className={buttonClass}
        title={isInferred ? `Inferred (${label})` : undefined}
      >
        <span className="block">{label}</span>
        {sublabel && <span className="block text-[8px] opacity-60 mt-0.5 tracking-tight">{sublabel}</span>}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Progress Card */}
      <div className="p-4 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold">
              Epistemic State Engine
            </span>
            {isLocked && (
              <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-sm font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Locked (100%)
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold opacity-80">
            {candidateCount}/16 Candidates
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isLocked ? 'bg-emerald-500' : 'bg-charcoal'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Natural Language State Resolution Banner */}
      <div className={`p-3.5 border rounded-sm transition-all flex items-center justify-between gap-4 ${
        isLocked 
          ? 'bg-emerald-500/5 border-emerald-500/40 text-charcoal' 
          : candidateCount < 16 
          ? 'bg-charcoal/5 border-charcoal/30 text-charcoal' 
          : 'bg-[var(--bg-page)] border-[var(--border-color)] text-charcoal'
      }`}>
        <div className="min-w-0">
          <div className="font-mono text-[8px] uppercase tracking-widest opacity-50 mb-0.5 font-semibold">
            Current Resolution State
          </div>
          <div className="font-serif text-lg font-bold tracking-tight truncate flex items-center gap-2">
            <span>{naturalLanguageResolution}</span>
            {isLocked && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </div>
        </div>

        {candidateCount < 16 && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* 5 Modular Layers */}
      <div className="space-y-3">
        {/* Layer 1: Primary Duality (J vs P) */}
        <div className="p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Layer 1: Primary Duality (J vs P)
          </h4>
          <div className="flex gap-2 flex-wrap">
            {renderButton('j_p', 'J', 'J (Judgment Lead)')}
            {renderButton('j_p', 'P', 'P (Perception Lead)')}
          </div>
        </div>

        {/* Layer 2: Macro Dynamics */}
        <div className="p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Layer 2: Macro Dynamics
          </h4>
          <div className="flex gap-2 flex-wrap">
            {renderButton('macro', 'Ji+Pe', 'Revisor (Ji + Pe)')}
            {renderButton('macro', 'Je+Pi', 'Conductor (Je + Pi)')}
          </div>
        </div>

        {/* Layer 3: Primary Energetic Lead */}
        <div className="p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Layer 3: Primary Energetic Lead
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {renderButton('lead', 'Ji', 'Ji', 'Introverted Judgment')}
            {renderButton('lead', 'Je', 'Je', 'Extroverted Judgment')}
            {renderButton('lead', 'Pe', 'Pe', 'Extroverted Perception')}
            {renderButton('lead', 'Pi', 'Pi', 'Introverted Perception')}
          </div>
        </div>

        {/* Layer 4: Quadra Architecture */}
        <div className="p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Layer 4: Quadra Architecture
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {renderButton('quadra', 'Alpha', 'Alpha', 'Fe-Ti + Ne-Si')}
            {renderButton('quadra', 'Beta', 'Beta', 'Fe-Ti + Se-Ni')}
            {renderButton('quadra', 'Gamma', 'Gamma', 'Te-Fi + Se-Ni')}
            {renderButton('quadra', 'Delta', 'Delta', 'Te-Fi + Ne-Si')}
          </div>
        </div>

        {/* Layer 5: Function Axes */}
        <div className="p-3.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Layer 5: Function Axes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="font-mono text-[8px] uppercase tracking-wider opacity-50 block mb-1.5">
                Judgment Axis
              </span>
              <div className="flex gap-2">
                {renderButton('j_axis', 'Fe-Ti', 'Fe-Ti', 'Measured')}
                {renderButton('j_axis', 'Te-Fi', 'Te-Fi', 'Candid')}
              </div>
            </div>
            <div>
              <span className="font-mono text-[8px] uppercase tracking-wider opacity-50 block mb-1.5">
                Perception Axis
              </span>
              <div className="flex gap-2">
                {renderButton('p_axis', 'Ne-Si', 'Ne-Si', 'Suspended')}
                {renderButton('p_axis', 'Se-Ni', 'Se-Ni', 'Grounded')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Space: 16 Types Matrix */}
      <div className="p-4 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            Candidate Space (1/16 Resolution Matrix)
          </h4>
          <span className="font-mono text-[8px] uppercase tracking-wider opacity-40">
            Click any valid type to lock directly
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {EPISTEMIC_16_CANDIDATES.map((cand) => {
            const isValid = activeCodes.has(cand.code);
            const isSelected = isLocked && candidates[0]?.code === cand.code;

            let cardStyle = 'p-2.5 text-center rounded-sm border transition-all font-mono ';
            if (isSelected) {
              cardStyle += 'bg-charcoal text-beige border-charcoal font-bold shadow ring-2 ring-emerald-500/60 cursor-pointer';
            } else if (isValid) {
              cardStyle += 'bg-[var(--bg-card)] border-charcoal/30 hover:border-charcoal text-charcoal font-bold hover:bg-charcoal/5 cursor-pointer';
            } else {
              cardStyle += 'opacity-15 bg-charcoal/5 border-transparent text-charcoal/40 cursor-not-allowed';
            }

            return (
              <button
                key={cand.code}
                type="button"
                disabled={!isValid && !isSelected}
                onClick={() => handleSelectCandidate(cand)}
                className={cardStyle}
              >
                <div className="text-xs">{cand.code}</div>
                <div className="text-[7px] uppercase tracking-tighter opacity-50 mt-0.5">
                  {cand.quadra}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
