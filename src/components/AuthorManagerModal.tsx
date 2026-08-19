import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  KeyRound,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';
import { type Author } from '../data';
import {
  getAuthors,
  saveAuthor,
  deleteAuthor,
  getInviteCodes,
  createInviteCode,
  deleteInviteCode,
  type InviteCode
} from '../services/firestoreService';
import { slugify } from '../lib/ct-logic';

interface AuthorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorsUpdated: () => void;
}

export const AuthorManagerModal: React.FC<AuthorManagerModalProps> = ({
  isOpen,
  onClose,
  onAuthorsUpdated
}) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'codes' | 'authors'>('codes');

  // Generator form
  const [newAuthorName, setNewAuthorName] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [codeRole, setCodeRole] = useState<'author' | 'admin'>('author');
  const [codeNotes, setCodeNotes] = useState('');
  const [generatedCode, setGeneratedCode] = useState<InviteCode | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Author creation form
  const [directAuthorName, setDirectAuthorName] = useState('');
  const [directBio, setDirectBio] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [authorsList, codesList] = await Promise.all([getAuthors(), getInviteCodes()]);
      setAuthors(authorsList);
      setInviteCodes(codesList);
      if (authorsList.length > 0 && !selectedAuthor) {
        setSelectedAuthor(authorsList[0].name);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load author data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newAuthorName.trim() || selectedAuthor.trim();
    if (!finalName) {
      setError('Please provide an author name for this code');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const code = await createInviteCode(finalName, codeRole, codeNotes.trim());
      setGeneratedCode(code);
      setNewAuthorName('');
      setCodeNotes('');
      await loadData();
      onAuthorsUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to generate invite code');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to revoke this code?')) return;
    try {
      await deleteInviteCode(codeId);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete code');
    }
  };

  const handleAddDirectAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directAuthorName.trim()) return;

    try {
      await saveAuthor({
        id: slugify(directAuthorName.trim()),
        name: directAuthorName.trim(),
        bio: directBio.trim(),
        validatedBy: 'Admin Direct'
      });
      setDirectAuthorName('');
      setDirectBio('');
      await loadData();
      onAuthorsUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to save author');
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    try {
      await deleteAuthor(authorId);
      await loadData();
      onAuthorsUpdated();
    } catch (e: any) {
      setError(e.message || 'Failed to delete author');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] rounded-sm shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal mb-1">Access & Authors</h2>
            <p className="font-mono text-[8px] uppercase tracking-widest opacity-40">
              Passcode Generation & Typist Registry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-charcoal/5 rounded-full transition-colors opacity-60 hover:opacity-100"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[var(--border-color)] px-6 bg-[var(--bg-page)]">
          <button
            onClick={() => setActiveTab('codes')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'codes'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Single-Use Codes ({inviteCodes.filter((c) => !c.isUsed).length} Active)
          </button>
          <button
            onClick={() => setActiveTab('authors')}
            className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'authors'
                ? 'border-charcoal opacity-100 font-bold'
                : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Validated Authors ({authors.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-[var(--bg-page)] border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px]">{error}</span>
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="space-y-6">
              {/* Generator Card */}
              <div className="p-5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 block font-bold">
                  Generate New Single-Use Passcode
                </span>

                <form onSubmit={handleGenerateCode} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        placeholder="e.g. Arthur, Jordan, Alice"
                        className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                        Role Privileges
                      </label>
                      <select
                        value={codeRole}
                        onChange={(e) => setCodeRole(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none font-mono rounded-sm transition-colors"
                      >
                        <option value="author">Author (Create & edit analyses)</option>
                        <option value="admin">Admin (Full administrative rights)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                      Memo / Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={codeNotes}
                      onChange={(e) => setCodeNotes(e.target.value)}
                      placeholder="e.g. For Cyberpunk 2077 typings"
                      className="w-full px-3 py-1.5 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={generating}
                      className="px-5 py-2 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                    >
                      {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Generate Passcode
                    </button>
                  </div>
                </form>

                {/* Generated Code Alert */}
                {generatedCode && (
                  <div className="mt-4 p-4 border border-emerald-500/40 bg-[var(--bg-card)] rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                        Passcode Issued For {generatedCode.authorName}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider opacity-50">
                        Single-Use
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 font-mono text-sm font-bold border border-[var(--border-color)] bg-[var(--bg-page)] text-charcoal tracking-widest select-all rounded-sm">
                        {generatedCode.code}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(generatedCode.code)}
                        className="px-4 py-2 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-wider opacity-50">
                      Share this code with {generatedCode.authorName}. They can open the Menu, click "Login", and activate their account.
                    </p>
                  </div>
                )}
              </div>

              {/* Codes Table */}
              <div className="space-y-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 block font-bold">
                  Issued Passcodes ({inviteCodes.length})
                </span>

                {loading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin opacity-40" />
                  </div>
                ) : inviteCodes.length === 0 ? (
                  <div className="p-6 text-center font-mono text-[10px] uppercase tracking-widest opacity-40 border border-dashed border-[var(--border-color)] rounded-sm">
                    No passcodes generated yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-sm overflow-hidden">
                    {inviteCodes.map((code) => (
                      <div
                        key={code.id}
                        className="p-3.5 bg-[var(--bg-card)] flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider rounded-sm ${
                              code.isUsed
                                ? 'opacity-30 line-through bg-[var(--bg-page)] text-charcoal'
                                : 'bg-charcoal text-beige'
                            }`}
                          >
                            {code.code}
                          </span>
                          <div>
                            <div className="font-serif font-bold text-sm">{code.authorName}</div>
                            <div className="font-mono text-[9px] uppercase tracking-wider opacity-50 flex items-center gap-2">
                              <span>Role: {code.role}</span>
                              {code.notes && <span>• {code.notes}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border rounded-sm ${
                              code.isUsed
                                ? 'border-[var(--border-color)] opacity-40'
                                : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {code.isUsed ? `Used (${new Date(code.usedAt || '').toLocaleDateString()})` : 'Active'}
                          </span>

                          {!code.isUsed && (
                            <button
                              onClick={() => handleCopyCode(code.code)}
                              className="p-1.5 opacity-40 hover:opacity-100 transition-opacity"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="p-1.5 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                            title="Revoke code"
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
          )}

          {activeTab === 'authors' && (
            <div className="space-y-6">
              {/* Direct Add Author */}
              <form onSubmit={handleAddDirectAuthor} className="p-5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-sm space-y-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60 block font-bold">
                  Register Typist Profile Directly
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={directAuthorName}
                      onChange={(e) => setDirectAuthorName(e.target.value)}
                      placeholder="Osakpolor"
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-1.5 font-semibold">
                      Bio / Description
                    </label>
                    <input
                      type="text"
                      value={directBio}
                      onChange={(e) => setDirectBio(e.target.value)}
                      placeholder="e.g. Cognitive Typology Analyst"
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none rounded-sm transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Author
                  </button>
                </div>
              </form>

              {/* Authors List */}
              <div className="space-y-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 block font-bold">
                  Existing Authors ({authors.length})
                </span>

                <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-sm overflow-hidden">
                  {authors.map((author) => (
                    <div
                      key={author.id}
                      className="p-3.5 bg-[var(--bg-card)] flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-serif font-bold text-sm">{author.name}</div>
                        {author.bio && <div className="font-mono text-[10px] opacity-50 mt-0.5">{author.bio}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-[var(--border-color)] opacity-60 rounded-sm">
                          Validated
                        </span>
                        <button
                          onClick={() => handleDeleteAuthor(author.id)}
                          className="p-1.5 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                          title="Delete author"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {authors.length === 0 && (
                    <div className="p-6 text-center font-mono text-[10px] uppercase tracking-widest opacity-40">
                      No authors in database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
