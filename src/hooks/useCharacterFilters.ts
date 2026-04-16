import { useState, useMemo, useEffect } from 'react';
import { Character } from '../data';
import { matchesFilters, getEmotionalCategory, getAllMotifs, type FilterState } from '../lib/ct-logic';

export function useCharacterFilters(viewFilteredCharacters: Character[]) {
  const [selectedQuadra, setSelectedQuadra] = useState<string | null>(null);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string | null>(null);
  const [selectedJudgmentAxis, setSelectedJudgmentAxis] = useState<string | null>(null);
  const [selectedPerceptionAxis, setSelectedPerceptionAxis] = useState<string | null>(null);
  const [selectedLeadEnergetic, setSelectedLeadEnergetic] = useState<string | null>(null);
  const [selectedAuxEnergetic, setSelectedAuxEnergetic] = useState<string | null>(null);
  const [selectedBehaviourQualia, setSelectedBehaviourQualia] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [selectedEmotionalAttitude, setSelectedEmotionalAttitude] = useState<string | null>(null);
  const [selectedMotifs, setSelectedMotifs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const currentFilters: FilterState = useMemo(() => ({
    quadra: selectedQuadra,
    judgmentAxis: selectedJudgmentAxis,
    perceptionAxis: selectedPerceptionAxis,
    leadEnergetic: selectedLeadEnergetic,
    auxEnergetic: selectedAuxEnergetic,
    development: selectedDevelopment,
    behaviourQualia: selectedBehaviourQualia,
    subtype: selectedSubtype,
    emotionalAttitude: selectedEmotionalAttitude,
    motifs: selectedMotifs
  }), [selectedQuadra, selectedJudgmentAxis, selectedPerceptionAxis, selectedLeadEnergetic, selectedAuxEnergetic, selectedDevelopment, selectedBehaviourQualia, selectedSubtype, selectedEmotionalAttitude, selectedMotifs]);

  const developments = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, development: null })
    );
    return Array.from(new Set(filtered.map(c => c.finalDevelopment || c.initialDevelopment))).filter(Boolean).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);
  
  const quadras = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, quadra: null })
    );
    const items = filtered.map(c => c.quadra).filter(Boolean);
    return Array.from(new Set(items as string[])).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const judgmentAxes = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, judgmentAxis: null })
    );
    const items = filtered.map(c => c.judgmentAxis).filter(Boolean);
    return Array.from(new Set(items as string[])).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const energetics = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, leadEnergetic: null })
    );
    const items = filtered.map(c => c.leadEnergetic).filter(Boolean);
    return Array.from(new Set(items as string[])).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const perceptionAxes = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, perceptionAxis: null })
    );
    const items = filtered.map(c => c.perceptionAxis).filter(Boolean);
    return Array.from(new Set(items as string[])).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const auxEnergetics = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, auxEnergetic: null })
    );
    const items = filtered.map(c => c.auxiliaryEnergetic).filter(Boolean);
    return Array.from(new Set(items as string[])).filter(i => i && i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const behaviourQualias = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, behaviourQualia: null })
    );
    return Array.from(new Set(filtered.map(c => c.behaviourQualia))).filter(Boolean).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const subtypes = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, subtype: null })
    );
    return Array.from(new Set(filtered.map(c => c.subtype))).filter(Boolean).filter(i => i.toLowerCase() !== 'all').sort();
  }, [viewFilteredCharacters, currentFilters]);

  const availableMotifs = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(char => 
      matchesFilters(char, { ...currentFilters, motifs: [] })
    );

    const all = getAllMotifs();
    const availableIds = new Set<number>();
    
    filtered.forEach(char => {
      if (char.motifValues) {
        char.motifValues.forEach((val, idx) => {
          if (val) availableIds.add(idx);
        });
      }
    });

    return all.filter(opt => availableIds.has(opt.id));
  }, [viewFilteredCharacters, currentFilters]);

  const emotionalAttitudes = useMemo(() => {
    const filtered = viewFilteredCharacters.filter(c => 
      matchesFilters(c, { ...currentFilters, emotionalAttitude: null })
    );
    
    const items = new Set<string>();
    
    filtered.forEach(c => {
      const category = getEmotionalCategory(c.emotionalAttitude);
      if (category) items.add(category);
    });
    
    const order = ['Unguarded', 'Guarded', 'Neutral'];
    return Array.from(items).filter(Boolean).sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [viewFilteredCharacters, currentFilters]);

  useEffect(() => {
    if (selectedJudgmentAxis && !judgmentAxes.includes(selectedJudgmentAxis)) setSelectedJudgmentAxis(null);
    if (selectedLeadEnergetic && !energetics.includes(selectedLeadEnergetic)) setSelectedLeadEnergetic(null);
    if (selectedPerceptionAxis && !perceptionAxes.includes(selectedPerceptionAxis)) setSelectedPerceptionAxis(null);
    if (selectedAuxEnergetic && !auxEnergetics.includes(selectedAuxEnergetic)) setSelectedAuxEnergetic(null);
    if (selectedDevelopment && !developments.includes(selectedDevelopment)) setSelectedDevelopment(null);
    if (selectedBehaviourQualia && !behaviourQualias.includes(selectedBehaviourQualia)) setSelectedBehaviourQualia(null);
    if (selectedSubtype && !subtypes.includes(selectedSubtype)) setSelectedSubtype(null);
    if (selectedEmotionalAttitude && !emotionalAttitudes.includes(selectedEmotionalAttitude)) setSelectedEmotionalAttitude(null);
    if (selectedQuadra && !quadras.includes(selectedQuadra)) setSelectedQuadra(null);

    const availableIds = availableMotifs.map(m => m.id);
    const validMotifs = selectedMotifs.filter(id => availableIds.includes(id));
    if (validMotifs.length !== selectedMotifs.length) {
      setSelectedMotifs(validMotifs);
    }
  }, [judgmentAxes, energetics, perceptionAxes, auxEnergetics, developments, behaviourQualias, subtypes, emotionalAttitudes, quadras, availableMotifs, selectedMotifs]);

  const filteredCharacters = useMemo(() => {
    return viewFilteredCharacters
      .filter(char => {
        const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             char.source.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch && matchesFilters(char, currentFilters);
      })
      .sort((a, b) => {
        const dateA = a.publishedDate || '';
        const dateB = b.publishedDate || '';
        return dateB.localeCompare(dateA);
      });
  }, [viewFilteredCharacters, searchQuery, currentFilters]);

  const hasActiveFilters = useMemo(() => {
    return !!(selectedQuadra || selectedDevelopment || selectedJudgmentAxis || selectedPerceptionAxis || 
           selectedLeadEnergetic || selectedAuxEnergetic || selectedBehaviourQualia || 
           selectedSubtype || selectedEmotionalAttitude || selectedMotifs.length > 0 || searchQuery);
  }, [selectedQuadra, selectedDevelopment, selectedJudgmentAxis, selectedPerceptionAxis, selectedLeadEnergetic, selectedAuxEnergetic, selectedBehaviourQualia, selectedSubtype, selectedEmotionalAttitude, selectedMotifs, searchQuery]);

  const resetFilters = () => {
    setSelectedQuadra(null);
    setSelectedDevelopment(null);
    setSelectedJudgmentAxis(null);
    setSelectedPerceptionAxis(null);
    setSelectedLeadEnergetic(null);
    setSelectedAuxEnergetic(null);
    setSelectedBehaviourQualia(null);
    setSelectedSubtype(null);
    setSelectedEmotionalAttitude(null);
    setSelectedMotifs([]);
    setSearchQuery('');
  };

  return {
    filters: currentFilters,
    setters: {
      setSelectedQuadra,
      setSelectedDevelopment,
      setSelectedJudgmentAxis,
      setSelectedPerceptionAxis,
      setSelectedLeadEnergetic,
      setSelectedAuxEnergetic,
      setSelectedBehaviourQualia,
      setSelectedSubtype,
      setSelectedEmotionalAttitude,
      setSelectedMotifs,
      setSearchQuery
    },
    options: {
      quadras,
      judgmentAxes,
      perceptionAxes,
      energetics,
      auxEnergetics,
      developments,
      behaviourQualias,
      subtypes,
      availableMotifs,
      emotionalAttitudes
    },
    filteredCharacters,
    hasActiveFilters,
    searchQuery,
    resetFilters
  };
}
