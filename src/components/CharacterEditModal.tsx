import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, AlertCircle, Loader2, Plus, Lock, ArrowRight, Film, Check, ExternalLink } from 'lucide-react';
import { type Character, type Author, type Work, type MediaType, VALID_MEDIA_TYPES } from '../data';
import {
  saveCharacterToFirestore,
  getAuthors,
  getWorks,
  saveWork
} from '../services/firestoreService';
import {
  deriveAxesFromQuadra,
  resolveFullStack,
  normalizeDynamic,
  slugify,
  getAllMotifs,
  computeTopDownDeduction,
  ALL_DEVELOPMENT_CODES,
  getDevelopmentMeaning,
  getEmotionalAttitudeLabel,
  type Quadra,
  type EmotionalAttitude,
  type DevelopmentCode
} from '../lib/ct-logic';
import { useAuth } from '../context/AuthContext';

interface CharacterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  character?: Character | null;
  onSaved: () => void;
  onOpenWorkManager?: () => void;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  isOpen,
  onClose,
  character,
  onSaved,
  onOpenWorkManager
}) => {
  const { authorName } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [authorId, setAuthorId] = useState(authorName ? slugify(authorName) : '');
  
  // Quick-create work state
  const [isCreatingNewWork, setIsCreatingNewWork] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkMedium, setNewWorkMedium] = useState<MediaType>('Animation');
  const [newWorkYear, setNewWorkYear] = useState('');
  const [newWorkImage, setNewWorkImage] = useState('');
  const [newWorkCreator, setNewWorkCreator] = useState('');
  const [savingNewWork, setSavingNewWork] = useState(false);

  // CT Spec Fields (§1: type is the base truth)
  const [typeInput, setTypeInput] = useState('');
  const [rawQuadra, setRawQuadra] = useState<string>('');
  const [dynamic, setDynamic] = useState('');
  const [development, setDevelopment] = useState('I---');
  const [emotionalAttitude, setEmotionalAttitude] = useState<EmotionalAttitude>('Neutral');

  // Analysis & Motifs
  const [analysis, setAnalysis] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [motifValues, setMotifValues] = useState<boolean[]>(new Array(60).fill(false));
  const [activeTab, setActiveTab] = useState<'core' | 'ct' | 'motifs' | 'analysis'>('core');

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      setIsCreatingNewWork(false);
      if (character) {
        setName(character.name || '');
        setImageUrl(character.imageUrl || '');
        setSelectedWorkId(character.workId || (character.source ? slugify(character.source) : ''));
        setAuthorId(character.authorId || '');
        setTypeInput(character.type || '');
        setRawQuadra(character.rawQuadra || '');
        setDynamic(character.dynamic || character.subtype || '');
        setDevelopment(character.development || character.finalDevelopment || character.initialDevelopment || 'I---');
        setEmotionalAttitude((character.emotionalAttitude as EmotionalAttitude) || 'Neutral');
        setAnalysis(character.analysis || '');
        setNotes(character.notes || '');
        setIsPublished(character.isPublished ?? true);
        if (character.motifValues && character.motifValues.length > 0) {
          setMotifValues([...character.motifValues]);
        } else {
          setMotifValues(new Array(60).fill(false));
        }
      } else {
        // Defaults
        setName('');
        setImageUrl('');
        setSelectedWorkId('');
        setAuthorId(authorName ? slugify(authorName) : '');
        setTypeInput('TiSe');
        setRawQuadra('Beta');
        setDynamic('Ti+Se');
        setDevelopment('I---');
        setEmotionalAttitude('Neutral');
        setAnalysis('');
        setNotes('');
        setIsPublished(true);
        setMotifValues(new Array(60).fill(false));
      }
    }
  }, [isOpen, character]);

  const loadDropdowns = async () => {
    try {
      const [authorsData, worksData] = await Promise.all([getAuthors(), getWorks()]);
      authorsData.sort((a, b) => a.name.localeCompare(b.name));
      worksData.sort((a, b) => a.title.localeCompare(b.title));
      setAuthors(authorsData);
      setWorks(worksData);

      if (!authorId && authorsData.length > 0) {
        if (authorName) {
          const match = authorsData.find(a => a.name.toLowerCase() === authorName.toLowerCase());
          if (match) setAuthorId(match.id);
          else setAuthorId(slugify(authorName));
        } else {
          setAuthorId(authorsData[0].id);
        }
      }

      // If editing and character has source but no workId matching, auto-match by title
      if (character && !character.workId && character.source && worksData.length > 0) {
        const found = worksData.find(w => w.title.toLowerCase() === character.source.toLowerCase());
        if (found) setSelectedWorkId(found.id);
      }
    } catch (e) {
      console.error('Error loading dropdown data:', e);
    }
  };

  // Inherited Work Data
  const selectedWork = useMemo(() => {
    return works.find(w => w.id === selectedWorkId) || null;
  }, [works, selectedWorkId]);

  // Handle Quick Work Creation
  const handleCreateQuickWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkTitle.trim()) {
      setError('Work title is required');
      return;
    }

    setSavingNewWork(true);
    setError(null);
    try {
      const workId = slugify(newWorkTitle.trim());
      const newWorkObj: Work = {
        id: workId,
        title: newWorkTitle.trim(),
        medium: newWorkMedium,
        releaseYear: newWorkYear.trim(),
        imageUrl: newWorkImage.trim(),
        creator: newWorkCreator.trim()
      };

      await saveWork(newWorkObj);
      const updatedWorks = await getWorks();
      updatedWorks.sort((a, b) => a.title.localeCompare(b.title));
      setWorks(updatedWorks);
      setSelectedWorkId(workId);
      setIsCreatingNewWork(false);
      setNewWorkTitle('');
      setNewWorkYear('');
      setNewWorkImage('');
      setNewWorkCreator('');
    } catch (err: any) {
      setError(err.message || 'Failed to create work');
    } finally {
      setSavingNewWork(false);
    }
  };

  // Top-Down CT Deduction Engine from Spec (§1 - §8)
  const deduction = useMemo(() => {
    return computeTopDownDeduction(typeInput, rawQuadra);
  }, [typeInput, rawQuadra]);

  // Sync quadra derived from type
  useEffect(() => {
    if (deduction.lockedQuadra && deduction.lockedQuadra !== rawQuadra) {
      setRawQuadra(deduction.lockedQuadra);
    }
  }, [deduction.lockedQuadra]);

  // Enforce Dynamic gating (§5: type must be fully resolved, must be one of the quadra's 4 valid pairs)
  useEffect(() => {
    if (!deduction.isFullyResolved) {
      if (dynamic) setDynamic('');
    } else if (deduction.validDynamics.length > 0) {
      const currentNorm = normalizeDynamic(dynamic);
      const isValid = deduction.validDynamics.some(d => normalizeDynamic(d.pair) === currentNorm);
      if (!isValid && dynamic) {
        setDynamic('');
      }
    }
  }, [deduction.isFullyResolved, deduction.lockedQuadra, typeInput]);

  const handleTypeChange = (newVal: string) => {
    setTypeInput(newVal);
    const d = computeTopDownDeduction(newVal, rawQuadra);
    if (d.lockedQuadra) {
      setRawQuadra(d.lockedQuadra);
    }
  };

  const handleSelectCandidateType = (candidate: string) => {
    setTypeInput(candidate);
    const d = computeTopDownDeduction(candidate, rawQuadra);
    if (d.lockedQuadra) {
      setRawQuadra(d.lockedQuadra);
    }
  };

  const allMotifItems = useMemo(() => getAllMotifs(), []);
  const isHierarchyKnown = deduction.tier <= 4 || !!deduction.leadEnergetic;
  const isFullyResolved = deduction.isFullyResolved;

  const emotionalLabels = useMemo(() => {
    const unguarded = getEmotionalAttitudeLabel('Unguarded', deduction.lockedJudgmentAxis);
    const guarded = getEmotionalAttitudeLabel('Guarded', deduction.lockedJudgmentAxis);
    const neutral = getEmotionalAttitudeLabel('Neutral', deduction.lockedJudgmentAxis);
    return { unguarded, guarded, neutral };
  }, [deduction.lockedJudgmentAxis]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Character name is required');
      return;
    }
    if (!selectedWorkId) {
      setError('Please select or create an inherited Work for this character');
      return;
    }
    if (!typeInput.trim()) {
      setError('Cognitive type is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const charId = character?.id || slugify(`${name}-${selectedWork?.title || 'char'}`);
      const finalQuadra = deduction.lockedQuadra || rawQuadra || undefined;

      // Inherit work metadata
      const workTitle = selectedWork?.title || character?.source || '';
      const workMedium = selectedWork?.medium || character?.medium || 'Animation';
      const workYear = selectedWork?.releaseYear || character?.year || '';
      const workBanner = selectedWork?.imageUrl || character?.workImageUrl || '';

      await saveCharacterToFirestore({
        id: charId,
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        workId: selectedWorkId,
        authorId: authorId,
        author: authorId,
        source: workTitle,
        medium: workMedium,
        workImageUrl: workBanner,
        year: workYear,
        type: typeInput.trim(),
        rawQuadra: finalQuadra,
        dynamic: dynamic ? normalizeDynamic(dynamic) : undefined,
        subtype: dynamic ? normalizeDynamic(dynamic) : undefined,
        development: isHierarchyKnown ? development : undefined,
        finalDevelopment: isHierarchyKnown ? development : undefined,
        emotionalAttitude,
        analysis,
        notes,
        isPublished,
        motifValues
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save character');
    } finally {
      setSaving(false);
    }
  };

  const handleMotifToggle = (index: number) => {
    const next = [...motifValues];
    next[index] = !next[index];
    setMotifValues(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] rounded-sm shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-normal mb-1">
              {character ? `Edit Profile: ${character.name}` : 'New Character Profile'}
            </h2>
            <p className="font-mono text-[8px] uppercase tracking-widest opacity-40">
              Cognitive Typology Type Model Engine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-charcoal/5 rounded-full transition-colors opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-page)] px-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'core'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            1. Character & Work
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ct')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'ct'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            2. CT Typology
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('motifs')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'motifs'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            3. Motifs ({motifValues.filter(Boolean).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            4. Deep Analysis
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[var(--bg-page)] border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px]">{error}</span>
            </div>
          )}

          {/* TAB 1: Character & Inherited Work */}
          {activeTab === 'core' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Levi Ackerman"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                    Typist / Author *
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                    {authorName && !authors.some(a => a.id === slugify(authorName)) && (
                      <option value={slugify(authorName)}>{authorName}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                  Character Portrait URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... portrait link"
                    className="flex-1 px-3 py-2 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-sm border border-[var(--border-color)]"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  )}
                </div>
              </div>

              {/* Work Inheritance Card */}
              <div className="p-5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold block">
                      Inherited Work Entity *
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-wider opacity-40">
                      Characters strictly inherit universe, medium, and year from a parent Work.
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewWork(!isCreatingNewWork)}
                      className="px-2.5 py-1 text-xs font-mono bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-charcoal rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCreatingNewWork ? 'Select Existing' : 'New Work'}</span>
                    </button>
                    {onOpenWorkManager && (
                      <button
                        type="button"
                        onClick={onOpenWorkManager}
                        className="px-2 py-1 text-xs font-mono text-charcoal/60 hover:text-charcoal hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                        title="Manage All Works"
                      >
                        <Film className="w-3 h-3" />
                        <span>Directory</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isCreatingNewWork ? (
                  <div className="space-y-3">
                    <div>
                      <select
                        required
                        value={selectedWorkId}
                        onChange={(e) => setSelectedWorkId(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif font-medium"
                      >
                        <option value="">-- Choose Inherited Work --</option>
                        {works.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title} ({w.medium}{w.releaseYear ? ` • ${w.releaseYear}` : ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Inherited Details Banner */}
                    {selectedWork ? (
                      <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex items-start gap-3">
                        {selectedWork.imageUrl ? (
                          <img
                            src={selectedWork.imageUrl}
                            alt={selectedWork.title}
                            className="w-12 h-16 object-cover rounded-sm border border-[var(--border-color)] shrink-0"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        ) : (
                          <div className="w-12 h-16 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm flex items-center justify-center shrink-0 opacity-40">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-medium truncate">{selectedWork.title}</span>
                            <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              Inherited
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="font-mono text-[10px] uppercase font-semibold">
                              Medium: <span className="underline">{selectedWork.medium}</span>
                            </span>
                            {selectedWork.releaseYear && (
                              <span className="font-mono text-[10px] opacity-60">
                                Year: {selectedWork.releaseYear}
                              </span>
                            )}
                          </div>
                          {selectedWork.creator && (
                            <div className="font-serif text-xs opacity-60 mt-0.5">
                              Created by {selectedWork.creator}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-sm text-center font-serif text-xs opacity-50 italic">
                        Select a work above to inherit its medium ({VALID_MEDIA_TYPES.join(', ')}), year, and banner art.
                      </div>
                    )}
                  </div>
                ) : (
                  /* Inline Quick Work Creator */
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm space-y-3">
                    <div className="font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
                      Quick Create Parent Work
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="font-mono text-[8px] uppercase tracking-widest opacity-60 block mb-1">
                          Work Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newWorkTitle}
                          onChange={(e) => setNewWorkTitle(e.target.value)}
                          placeholder="e.g. Neon Genesis Evangelion"
                          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[8px] uppercase tracking-widest opacity-60 block mb-1">
                          Valid Media *
                        </label>
                        <select
                          value={newWorkMedium}
                          onChange={(e) => setNewWorkMedium(e.target.value as MediaType)}
                          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                        >
                          {VALID_MEDIA_TYPES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="font-mono text-[8px] uppercase tracking-widest opacity-60 block mb-1">
                          Release Year
                        </label>
                        <input
                          type="text"
                          value={newWorkYear}
                          onChange={(e) => setNewWorkYear(e.target.value)}
                          placeholder="1995"
                          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[8px] uppercase tracking-widest opacity-60 block mb-1">
                          Creator / Author
                        </label>
                        <input
                          type="text"
                          value={newWorkCreator}
                          onChange={(e) => setNewWorkCreator(e.target.value)}
                          placeholder="Hideaki Anno"
                          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[8px] uppercase tracking-widest opacity-60 block mb-1">
                          Cover Art URL
                        </label>
                        <input
                          type="url"
                          value={newWorkImage}
                          onChange={(e) => setNewWorkImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewWork(false)}
                        className="px-3 py-1 text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateQuickWork}
                        disabled={savingNewWork}
                        className="px-4 py-1 bg-charcoal text-beige text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {savingNewWork ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        <span>Create & Inherit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CT Typology — Spec Driven (§1 - §8) */}
          {activeTab === 'ct' && (
            <div className="space-y-6">
              {/* §1 & §2. Base Truth Type Input */}
              <div className="p-5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest opacity-80 block font-bold">
                      Type (§1: The Base Truth) *
                    </label>
                    <span className="font-mono text-[8px] uppercase tracking-wider opacity-40">
                      Every other CT field is derived from or gated by this value.
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-[var(--border-color)] rounded-sm font-semibold opacity-70">
                    {deduction.tierLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <input
                      type="text"
                      required
                      value={typeInput}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      placeholder="e.g. TiSe, TiPe, Ji"
                      className="w-full px-3.5 py-2.5 text-base bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono font-bold tracking-wider uppercase"
                    />
                  </div>

                  {/* Derived State / Quadra summary */}
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[8px] uppercase tracking-widest opacity-50 font-bold">
                        Derived Quadra & Axes
                      </span>
                      {deduction.lockedQuadra && (
                        <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                          <Lock className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      )}
                    </div>

                    {deduction.lockedQuadra ? (
                      <div className="space-y-0.5">
                        <div className="font-serif text-base font-normal">
                          {deduction.lockedQuadra} Quadra
                        </div>
                        <div className="font-mono text-[9px] opacity-60">
                          {deduction.lockedJudgmentAxis} ({deduction.lockedJudgmentAxis === 'Fe-Ti' ? 'Measured' : 'Candid'}) + {deduction.lockedPerceptionAxis} ({deduction.lockedPerceptionAxis === 'Se-Ni' ? 'Grounded' : 'Suspended'})
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="font-serif text-xs italic opacity-70">
                          {deduction.explanation}
                        </div>
                        {!isHierarchyKnown && (
                          <div>
                            <select
                              value={rawQuadra || ''}
                              onChange={(e) => setRawQuadra(e.target.value)}
                              className="w-full px-2 py-1 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] rounded-sm font-mono"
                            >
                              <option value="">-- Assert rawQuadra (no hierarchy) --</option>
                              <option value="Alpha">Alpha</option>
                              <option value="Beta">Beta</option>
                              <option value="Gamma">Gamma</option>
                              <option value="Delta">Delta</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* §3: 4-Slot Stack (when fully resolved) */}
                {isFullyResolved && deduction.leadFunction && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-40 block mb-2 font-semibold">
                      §3 Full 4-Slot Energetic Order (1–2–3–4)
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="p-2 bg-[var(--bg-card)] border border-charcoal/30 rounded-sm">
                        <div className="text-xs font-bold">{deduction.leadFunction}</div>
                        <div className="text-[8px] opacity-50 uppercase">Slot 1 • {deduction.leadEnergetic} (Primary)</div>
                      </div>
                      <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm">
                        <div className="text-xs font-bold">{deduction.auxiliaryFunction}</div>
                        <div className="text-[8px] opacity-50 uppercase">Slot 2 • {deduction.auxiliaryEnergetic} (Secondary)</div>
                      </div>
                      <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm">
                        <div className="text-xs font-bold">{deduction.tertiaryFunction}</div>
                        <div className="text-[8px] opacity-50 uppercase">Slot 3 • {deduction.tertiaryEnergetic} (Tertiary)</div>
                      </div>
                      <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm">
                        <div className="text-xs font-bold">{deduction.polarFunction}</div>
                        <div className="text-[8px] opacity-50 uppercase">Slot 4 • {deduction.polarEnergetic} (Polar)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Resolution Quick-Pills (§2.1 Positional Partials) */}
                {!isFullyResolved && deduction.candidateTypes.length > 1 && deduction.candidateTypes.length <= 4 && (
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-50 font-bold">
                      Resolve to:
                    </span>
                    {deduction.candidateTypes.map((cand) => {
                      const candStack = resolveFullStack(cand);
                      return (
                        <button
                          key={cand}
                          type="button"
                          onClick={() => handleSelectCandidateType(cand)}
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-charcoal rounded-sm font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all hover:bg-charcoal hover:text-beige"
                        >
                          <span className="font-bold">{cand}</span>
                          <span className="opacity-60">({candStack?.quadra})</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-40" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* §5, §6, §7: Gated Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* §5: Dynamic (Quadra-gated, Precondition: fully resolved type) */}
                <div className={`p-4 bg-[var(--bg-page)] border rounded-sm space-y-2 ${
                  isFullyResolved ? 'border-[var(--border-color)]' : 'border-dashed border-[var(--border-color)] opacity-60'
                }`}>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest block font-semibold">
                      §5 Dynamic (Subtype)
                    </label>
                    <span className="font-mono text-[8px] uppercase tracking-wider opacity-40 block">
                      Gated to 4 Quadra-valid pairs
                    </span>
                  </div>

                  {isFullyResolved ? (
                    <select
                      value={dynamic}
                      onChange={(e) => setDynamic(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono font-semibold"
                    >
                      <option value="">None / Unset</option>
                      {deduction.validDynamics.map((d) => (
                        <option key={d.pair} value={d.pair}>
                          {d.pair} — {d.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm font-mono text-[9px] opacity-50 italic">
                      Requires fully resolved type
                    </div>
                  )}
                </div>

                {/* §6: Development (Precondition: hierarchy known) */}
                <div className={`p-4 bg-[var(--bg-page)] border rounded-sm space-y-2 ${
                  isHierarchyKnown ? 'border-[var(--border-color)]' : 'border-dashed border-[var(--border-color)] opacity-60'
                }`}>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest block font-semibold">
                      §6 Development State
                    </label>
                    <span className="font-mono text-[8px] uppercase tracking-wider opacity-40 block">
                      8 conscious/unconscious configurations
                    </span>
                  </div>

                  {isHierarchyKnown ? (
                    <select
                      value={development}
                      onChange={(e) => setDevelopment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                    >
                      {ALL_DEVELOPMENT_CODES.map((code) => {
                        const meaning = getDevelopmentMeaning(code, deduction.leadEnergetic);
                        return (
                          <option key={code} value={code}>
                            {code} — {meaning}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm font-mono text-[9px] opacity-50 italic">
                      Requires known primary energetic
                    </div>
                  )}
                </div>

                {/* §7: Emotional Attitude (Derived naming from Judgment axis) */}
                <div className="p-4 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-2">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest block font-semibold">
                      §7 Emotional Attitude
                    </label>
                    <span className="font-mono text-[8px] uppercase tracking-wider opacity-40 block">
                      Rendered via Judgment Axis
                    </span>
                  </div>

                  <select
                    value={emotionalAttitude}
                    onChange={(e) => setEmotionalAttitude(e.target.value as EmotionalAttitude)}
                    className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                  >
                    <option value="Neutral">{emotionalLabels.neutral.label}</option>
                    <option value="Unguarded">{emotionalLabels.unguarded.label} (Unguarded)</option>
                    <option value="Guarded">{emotionalLabels.guarded.label} (Guarded)</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Motifs Checklist */}
          {activeTab === 'motifs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold">
                  Cognitive Typology 60-Motifs Matrix
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                  {motifValues.filter(Boolean).length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-2 minimal-scrollbar">
                {allMotifItems.map((m, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-sm border text-xs cursor-pointer transition-colors ${
                      motifValues[idx]
                        ? 'bg-[var(--bg-page)] border-charcoal text-charcoal font-semibold'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!motifValues[idx]}
                      onChange={() => handleMotifToggle(idx)}
                      className="mt-0.5"
                    />
                    <div className="leading-snug">
                      <div className="font-mono text-[9px] uppercase tracking-wider opacity-40">
                        #{idx + 1} • {m.function}
                      </div>
                      <div className="text-xs">{m.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Deep Analysis */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-semibold">
                  Markdown Analysis Deep-Dive
                </label>
                <textarea
                  rows={10}
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  placeholder="## Cognitive Typology Analysis&#10;&#10;Write markdown breakdown of cognitive functions, motifs, and psychological dynamics..."
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-semibold">
                  Internal / Typist Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preliminary typing notes"
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <label htmlFor="isPublishedCheck" className="font-mono text-[9px] uppercase tracking-wider opacity-60 cursor-pointer">
                Publish publicly
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{character ? 'Save Changes' : 'Create Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
