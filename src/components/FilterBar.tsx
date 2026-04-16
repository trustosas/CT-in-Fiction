import { motion, AnimatePresence } from 'motion/react';
import { Search, Compass } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';
import { MultiSelect } from './ui/MultiSelect';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  options: any;
  filters: any;
  setters: any;
  onHoverMotif: (desc: string | null, id: string | null, anchor: any) => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  options,
  filters,
  setters,
  onHoverMotif
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-6 w-full md:w-auto">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input 
            type="text"
            placeholder="Search subjects..."
            className="bg-transparent border-b border-[#1a1a1a]/20 py-2 pl-10 pr-4 focus:outline-none focus:border-[#1a1a1a] transition-colors w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-mono text-[10px] uppercase tracking-widest ${
            showFilters ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="z-50"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 pt-4">
              <CustomSelect 
                label="Quadra"
                value={filters.quadra}
                options={options.quadras}
                onChange={setters.setSelectedQuadra}
                placeholder="All"
              />
              <CustomSelect 
                label="Qualia"
                value={filters.behaviourQualia}
                options={options.behaviourQualias}
                onChange={setters.setSelectedBehaviourQualia}
                placeholder="All"
              />
              <CustomSelect 
                label="Lead Energetic"
                value={filters.leadEnergetic}
                options={options.energetics}
                onChange={setters.setSelectedLeadEnergetic}
                placeholder="All"
              />
              <CustomSelect 
                label="Auxiliary Energetic"
                value={filters.auxEnergetic}
                options={options.auxEnergetics}
                onChange={setters.setSelectedAuxEnergetic}
                placeholder="All"
              />
              <CustomSelect 
                label="Judgement Axis"
                value={filters.judgmentAxis}
                options={options.judgmentAxes}
                onChange={setters.setSelectedJudgmentAxis}
                placeholder="All"
              />
              <CustomSelect 
                label="Perception Axis"
                value={filters.perceptionAxis}
                options={options.perceptionAxes}
                onChange={setters.setSelectedPerceptionAxis}
                placeholder="All"
              />
              <CustomSelect 
                label="Development"
                value={filters.development}
                options={options.developments}
                onChange={setters.setSelectedDevelopment}
                placeholder="All"
                selectedBehaviourQualia={filters.behaviourQualia}
              />
              <CustomSelect 
                label="Subtype"
                value={filters.subtype}
                options={options.subtypes}
                onChange={setters.setSelectedSubtype}
                placeholder="All"
              />
              <CustomSelect 
                label="Emotional Attitude"
                value={filters.emotionalAttitude}
                options={options.emotionalAttitudes}
                onChange={setters.setSelectedEmotionalAttitude}
                placeholder="All"
              />
              <MultiSelect 
                label="Motifs"
                selected={filters.motifs}
                options={options.availableMotifs}
                onChange={setters.setSelectedMotifs}
                onHoverMotif={onHoverMotif}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
