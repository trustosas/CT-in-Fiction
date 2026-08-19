import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Loader2, AlertCircle, Film, Sparkles, Image as ImageIcon } from 'lucide-react';
import { type Work, type MediaType, VALID_MEDIA_TYPES } from '../data';
import { getWorks, saveWork, deleteWork } from '../services/firestoreService';
import { slugify } from '../lib/ct-logic';
import { useAuth } from '../context/AuthContext';

interface WorkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorksUpdated?: () => void;
}

export const WorkManagerModal: React.FC<WorkManagerModalProps> = ({
  isOpen,
  onClose,
  onWorksUpdated
}) => {
  const { isAdmin, authorName } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMediumFilter, setSelectedMediumFilter] = useState<string>('all');

  // Creation / Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState<MediaType>('Animation');
  const [releaseYear, setReleaseYear] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWorks();
      resetForm();
    }
  }, [isOpen]);

  const loadWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorks();
      data.sort((a, b) => a.title.localeCompare(b.title));
      setWorks(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setMedium('Animation');
    setReleaseYear('');
    setImageUrl('');
    setCreator('');
    setDescription('');
  };

  const handleStartEdit = (work: Work) => {
    setIsEditing(true);
    setEditingId(work.id);
    setTitle(work.title);
    setMedium((VALID_MEDIA_TYPES.includes(work.medium as any) ? work.medium : 'Animation') as MediaType);
    setReleaseYear(work.releaseYear || '');
    setImageUrl(work.imageUrl || '');
    setCreator(work.creator || '');
    setDescription(work.description || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Work title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const workId = editingId || slugify(title.trim());
      await saveWork({
        id: workId,
        title: title.trim(),
        medium,
        releaseYear: releaseYear.trim(),
        imageUrl: imageUrl.trim(),
        creator: creator.trim(),
        description: description.trim()
      });

      await loadWorks();
      resetForm();
      if (onWorksUpdated) onWorksUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (workId: string, workTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the work "${workTitle}"? Characters linked to this work will retain their inherited data.`)) {
      return;
    }

    try {
      await deleteWork(workId);
      await loadWorks();
      if (onWorksUpdated) onWorksUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to delete work');
    }
  };

  const filteredWorks = works.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) ||
      (w.creator && w.creator.toLowerCase().includes(search.toLowerCase()));
    const matchesMedium = selectedMediumFilter === 'all' || w.medium === selectedMediumFilter;
    return matchesSearch && matchesMedium;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] rounded-sm shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-normal mb-1">
              Works Directory
            </h2>
            <p className="font-mono text-[8px] uppercase tracking-widest opacity-40">
              Parent Fictional Universes & Canon Sources
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-charcoal/5 rounded-full transition-colors opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[var(--bg-page)] border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px]">{error}</span>
            </div>
          )}

          {/* Work Creation / Edit Form */}
          <div className="p-5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold">
                {isEditing ? `Edit Work: ${title}` : 'Create New Work'}
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-mono text-[9px] uppercase tracking-wider opacity-60 hover:opacity-100 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-semibold">
                    Work Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Attack on Titan"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-semibold">
                    Valid Media *
                  </label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value as MediaType)}
                    className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                  >
                    {VALID_MEDIA_TYPES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1">
                    Release Year
                  </label>
                  <input
                    type="text"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="2013"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1">
                    Creator / Author
                  </label>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Hajime Isayama"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-serif"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1">
                    Cover Art URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... cover image"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  <span>{isEditing ? 'Update Work' : 'Add Work'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Works List & Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold">
                  Existing Works ({filteredWorks.length})
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter works..."
                  className="px-2.5 py-1 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm font-mono"
                />

                {/* Media Filter */}
                <select
                  value={selectedMediumFilter}
                  onChange={(e) => setSelectedMediumFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] rounded-sm font-mono"
                >
                  <option value="all">All Media</option>
                  {VALID_MEDIA_TYPES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
              </div>
            ) : filteredWorks.length === 0 ? (
              <div className="py-8 text-center font-serif text-sm opacity-50 italic">
                No works found matching your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1 minimal-scrollbar">
                {filteredWorks.map((work) => (
                  <div
                    key={work.id}
                    className="p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {work.imageUrl ? (
                        <img
                          src={work.imageUrl}
                          alt={work.title}
                          className="w-10 h-14 object-cover rounded-sm border border-[var(--border-color)] shrink-0"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      ) : (
                        <div className="w-10 h-14 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex items-center justify-center shrink-0 opacity-40">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-serif text-sm font-normal truncate">{work.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm font-semibold">
                            {work.medium}
                          </span>
                          {work.releaseYear && (
                            <span className="font-mono text-[9px] opacity-60">
                              {work.releaseYear}
                            </span>
                          )}
                        </div>
                        {work.creator && (
                          <div className="font-serif text-[11px] opacity-60 mt-0.5 truncate">
                            by {work.creator}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(work)}
                        className="p-1.5 hover:bg-charcoal/5 rounded-sm opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                        title="Edit Work"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(work.id, work.title)}
                        className="p-1.5 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-sm opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                        title="Delete Work"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-mono text-[10px] uppercase tracking-widest border border-[var(--border-color)] rounded-full hover:bg-charcoal/5 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
