import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Routes, Route } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CharacterCard } from './components/CharacterCard';
import { CharacterProfile } from './components/CharacterProfile';
import { useCharacterData } from './hooks/useCharacterData';
import { useCharacterFilters } from './hooks/useCharacterFilters';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useMediaData } from './hooks/useMediaData';
import { useMotifHover } from './hooks/useMotifHover';
import { useExpandedSections } from './hooks/useExpandedSections';
import { formatDate, getRelativeTime, pluralize } from './lib/utils';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/:mediumSlug" element={<AppContent />} />
      <Route path="/:mediumSlug/:workSlug" element={<AppContent />} />
      <Route path="/:mediumSlug/:workSlug/:subjectSlug" element={<AppContent />} />
    </Routes>
  );
}

function AppContent() {
  const {
    characters,
    isLoading,
    error,
    latestCommitSha,
    analysisMarkdown,
    loadData,
    fetchAnalysisMarkdown
  } = useCharacterData();

  const { publishedCharacters, media, works } = useMediaData(characters);
  
  const {
    mediumSlug,
    workSlug,
    subjectSlug,
    activeMedium,
    activeWork,
    activeSubject,
    currentView,
    navigateToFeed,
    navigateToMedium,
    navigateToWork,
    navigateToSubject
  } = useAppNavigation(publishedCharacters);

  const worksInMedium = works.filter(w => {
    const char = publishedCharacters.find(c => c.source === w.title);
    return char && char.medium === activeMedium;
  });

  const viewFilteredCharacters = publishedCharacters.filter(char => {
    if (currentView === 'work' && activeWork && char.source !== activeWork) return false;
    if (currentView === 'medium' && activeMedium && char.medium !== activeMedium) return false;
    return true;
  });

  const {
    filters,
    setters,
    options,
    filteredCharacters,
    hasActiveFilters,
    searchQuery,
    resetFilters
  } = useCharacterFilters(viewFilteredCharacters);

  const {
    activeMotifDesc,
    activeMotifId,
    motifAnchor,
    bubbleRef,
    onHoverMotif
  } = useMotifHover();

  const { expandedSections, toggleSection } = useExpandedSections();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData(false, subjectSlug);
  }, [loadData, subjectSlug]);

  const currentWorkData = activeWork ? works.find(w => w.title === activeWork) : null;

  if (isLoading && !characters.length) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin opacity-20" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">Synchronizing Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-white">
      <Header 
        media={media}
        activeMedium={activeMedium}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navigateToMedium={navigateToMedium}
        navigateToHome={navigateToFeed}
      />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {activeSubject ? (
            <CharacterProfile 
              key="profile"
              char={activeSubject}
              onBack={() => {
                if (activeWork) navigateToWork(activeMedium!, activeWork);
                else if (activeMedium) navigateToMedium(activeMedium);
                else navigateToFeed();
              }}
              analysisMarkdown={analysisMarkdown}
              onHoverMotif={onHoverMotif}
              formatDate={formatDate}
              getRelativeTime={getRelativeTime}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div className="max-w-2xl">
                  {currentView === 'feed' ? (
                    <>
                      <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tighter mb-6">
                        The Index
                      </h1>
                      <p className="text-lg opacity-70 leading-relaxed">
                        A curated database of cognitive type analyses across literature, cinema, and digital media. 
                        Currently tracking {publishedCharacters.length} subjects across {works.length} works.
                      </p>
                    </>
                  ) : currentView === 'medium' ? (
                    <>
                      <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tighter mb-6">
                        {activeMedium}
                      </h1>
                      <p className="text-lg opacity-70 leading-relaxed">
                        Exploring {worksInMedium.length} {pluralize(worksInMedium.length, 'work')} within the {activeMedium} medium.
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      {currentWorkData && (
                        <div className="w-48 aspect-video bg-[#1a1a1a]/5 rounded-sm flex items-center justify-center p-4">
                          <img 
                            src={currentWorkData.imageUrl} 
                            alt={currentWorkData.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <h1 className="font-serif text-5xl md:text-7xl leading-none tracking-tight mb-4">
                          {activeWork}
                        </h1>
                        <p className="font-mono text-xs uppercase tracking-widest opacity-50">
                          Release Year: {currentWorkData?.year} • {filteredCharacters.length} Indexed {pluralize(filteredCharacters.length, 'Subject')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <FilterBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setters.setSearchQuery}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  options={options}
                  filters={filters}
                  setters={setters}
                  onHoverMotif={onHoverMotif}
                />
              </div>

              {hasActiveFilters && (
                <div className="mb-8">
                  <button 
                    onClick={resetFilters}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {currentView === 'medium' && !hasActiveFilters ? (
                    worksInMedium.map((work) => (
                      <motion.div
                        key={work.title}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group cursor-pointer bg-white border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 p-6 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                        onClick={() => navigateToWork(activeMedium!, work.title)}
                      >
                        <div className="aspect-video mb-6 bg-[#1a1a1a]/5 p-8 flex items-center justify-center overflow-hidden">
                          <img 
                            src={work.imageUrl} 
                            alt={work.title}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="font-serif text-3xl mb-1 group-hover:italic transition-all">{work.title}</h3>
                            <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
                              {work.year} • {publishedCharacters.filter(c => c.source === work.title).length} {pluralize(publishedCharacters.filter(c => c.source === work.title).length, 'Subject')}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    filteredCharacters.length > 0 ? (
                      filteredCharacters.map((char) => (
                        <CharacterCard 
                          key={char.id}
                          char={char}
                          onClick={() => navigateToSubject(char.medium, char.source, char.name)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-32 text-center">
                        <div className="max-w-md mx-auto">
                          <AlertCircle className="w-12 h-12 mx-auto mb-6 opacity-20" />
                          <h2 className="font-serif text-3xl mb-4">No subjects found</h2>
                          <p className="text-sm opacity-50 leading-relaxed">
                            No subjects match your current search or filter criteria.
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Motif Tooltip */}
      <AnimatePresence>
        {activeMotifDesc && motifAnchor && (() => {
          const bubbleWidth = Math.min(320, window.innerWidth - 32);
          const leftPos = Math.max(16, Math.min(motifAnchor.left + motifAnchor.width / 2 - bubbleWidth / 2, window.innerWidth - bubbleWidth - 16));
          const showAbove = motifAnchor.top + motifAnchor.height + 150 > window.innerHeight;
          const tailLeft = motifAnchor.left + motifAnchor.width / 2 - leftPos;

          return (
            <motion.div
              ref={bubbleRef}
              initial={{ opacity: 0, scale: 0.9, y: showAbove ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: showAbove ? 10 : -10 }}
              className="fixed z-[100] bg-[#1a1a1a] text-white p-4 rounded-xl shadow-2xl border border-white/10"
              style={{
                width: bubbleWidth,
                left: leftPos,
                top: showAbove ? 'auto' : motifAnchor.top + motifAnchor.height + 12,
                bottom: showAbove ? (window.innerHeight - motifAnchor.top) + 12 : 'auto',
              }}
            >
              <div 
                className={`absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${
                  showAbove 
                    ? 'border-t-[8px] border-t-[#1a1a1a] -bottom-2' 
                    : 'border-b-[8px] border-b-[#1a1a1a] -top-2'
                }`}
                style={{ left: Math.max(12, Math.min(tailLeft - 8, bubbleWidth - 24)) }}
              />
              <p className="font-mono text-[8px] uppercase tracking-widest opacity-40 mb-2">Motif Definition</p>
              <p className="text-[11px] leading-relaxed italic opacity-90 pr-4">
                {activeMotifDesc}
              </p>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <footer className="mt-32 pt-12 border-t border-[#1a1a1a]/10 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto px-6 pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
          © 2026 CT in Fiction. All rights reserved.
        </p>
        <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest opacity-40">
          <a href="https://docs.google.com/spreadsheets/d/1IQxu5vK1Zr4twJ1rcxVgDiS-EnhoKj79K9thuOtdpic/edit?usp=drivesdk" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Database</a>
          <a href="https://app.trakt.tv/profile/trust02" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Trakt</a>
          <a href="mailto:osayandeosas1000@gmail.com" className="hover:opacity-100 transition-opacity">Contact</a>
        </div>
      </footer>
    </div>
  );
}
