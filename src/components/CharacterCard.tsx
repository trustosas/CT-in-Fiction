import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Character } from '../data';
import { formatTypeDisplay, ENERGETIC_NAMES, FUNCTION_NAMES, getEmotionalDescriptor } from '../lib/ct-logic';

interface CharacterCardProps {
  char: Character;
  onClick: () => void;
}

export function CharacterCard({ char, onClick }: CharacterCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer bg-white border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 p-6 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a1a1a]/[0.02] rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
            {char.source}
          </div>
          <div className="w-8 h-px bg-[#1a1a1a]/10 group-hover:w-12 transition-all duration-500" />
        </div>

        <h3 className="font-serif text-3xl leading-tight mb-4 group-hover:text-[#1a1a1a] transition-colors">
          {char.name}
        </h3>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-[#1a1a1a]/5 rounded-sm font-mono text-[9px] uppercase tracking-widest">
              {formatTypeDisplay(char.type)}
            </span>
            <span className="px-2 py-1 bg-[#1a1a1a]/5 rounded-sm font-mono text-[9px] uppercase tracking-widest opacity-60">
              {char.quadra}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1a1a1a]/5">
            <div>
              <span className="block font-mono text-[8px] uppercase tracking-widest opacity-30 mb-1">Energetics</span>
              <span className="block font-serif italic text-xs opacity-70">
                {ENERGETIC_NAMES[char.leadEnergetic]} / {ENERGETIC_NAMES[char.auxiliaryEnergetic]}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[8px] uppercase tracking-widest opacity-30 mb-1">Functions</span>
              <span className="block font-serif italic text-xs opacity-70">
                {FUNCTION_NAMES[char.leadFunction]} / {FUNCTION_NAMES[char.auxiliaryFunction]}
              </span>
            </div>
          </div>

          {char.emotionalAttitude && (
            <div className="pt-2">
              <span className="block font-mono text-[8px] uppercase tracking-widest opacity-30 mb-1">Attitude</span>
              <span className="inline-block font-serif italic text-xs opacity-70 px-2 py-0.5 bg-[#1a1a1a]/[0.03] rounded-full">
                {getEmotionalDescriptor(char.emotionalAttitude, char.judgmentAxis) || char.emotionalAttitude}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
          View Analysis <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}
