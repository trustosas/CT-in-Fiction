import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { getDevelopmentName, getSubtypeName, ENERGETIC_NAMES, FUNCTION_NAMES } from '../../lib/ct-logic';

interface CustomSelectProps {
  label: string;
  value: string | null;
  options: string[];
  onChange: (val: string | null) => void;
  placeholder?: string;
  selectedBehaviourQualia?: string | null;
}

export function CustomSelect({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "All",
  selectedBehaviourQualia
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <span className="font-mono text-[9px] uppercase tracking-widest opacity-40 px-1">{label}</span>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 bg-[#1a1a1a]/5 hover:bg-[#1a1a1a]/10 rounded-sm transition-all group text-left ${isOpen ? 'ring-1 ring-[#1a1a1a]/20' : ''}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider truncate mr-2">
            {label === 'Development' && value ? (
              <span className="flex items-center gap-3">
                <span className="font-sans tracking-[0.2em] whitespace-nowrap">{value}</span>
                <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{getDevelopmentName(value, '', selectedBehaviourQualia || undefined)}</span>
              </span>
            ) : label === 'Subtype' && value ? (
              <span className="flex items-center gap-3">
                <span className="font-serif italic text-sm whitespace-nowrap">{value}</span>
                <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{getSubtypeName(value)}</span>
              </span>
            ) : (label === 'Lead Energetic' || label === 'Auxiliary Energetic') && value ? (
              <span className="flex items-center gap-3">
                <span className="font-serif italic text-sm whitespace-nowrap">{value}</span>
                <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{ENERGETIC_NAMES[value]}</span>
              </span>
            ) : (label === 'Lead Function' || label === 'Auxiliary Function') && value ? (
              <span className="flex items-center gap-3">
                <span className="font-serif italic text-sm whitespace-nowrap">{value}</span>
                <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{FUNCTION_NAMES[value]}</span>
              </span>
            ) : label === 'Emotional Attitude' && value ? (
              <span className="flex items-center gap-3">
                <span className="font-serif italic text-sm whitespace-nowrap">{value}</span>
              </span>
            ) : (value || placeholder)}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 pointer-events-none ${isOpen ? 'rotate-180' : 'opacity-50 group-hover:opacity-100'}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1a1a1a]/10 shadow-xl rounded-sm z-[100] max-h-64 overflow-y-auto py-1 scrollbar-hide"
            >
              <button 
                onClick={() => { onChange(null); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-[#1a1a1a]/5 transition-colors ${!value ? 'bg-[#1a1a1a]/5 font-bold' : ''}`}
              >
                {placeholder}
                {!value && <Check className="w-3 h-3" />}
              </button>
              {options.map((opt) => (
                <button 
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-[#1a1a1a]/5 transition-colors ${value === opt ? 'bg-[#1a1a1a]/5 font-bold' : ''}`}
                >
                  {label === 'Development' ? (
                    <span className="flex items-center gap-3">
                      <span className="font-sans tracking-[0.2em] whitespace-nowrap">{opt}</span>
                      <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{getDevelopmentName(opt, '', selectedBehaviourQualia || undefined)}</span>
                    </span>
                  ) : label === 'Subtype' ? (
                    <span className="flex items-center gap-3">
                      <span className="font-serif italic text-sm whitespace-nowrap">{opt}</span>
                      <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{getSubtypeName(opt)}</span>
                    </span>
                  ) : (label === 'Lead Energetic' || label === 'Auxiliary Energetic') ? (
                    <span className="flex items-center gap-3">
                      <span className="font-serif italic text-sm whitespace-nowrap">{opt}</span>
                      <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{ENERGETIC_NAMES[opt]}</span>
                    </span>
                  ) : (label === 'Lead Function' || label === 'Auxiliary Function') ? (
                    <span className="flex items-center gap-3">
                      <span className="font-serif italic text-sm whitespace-nowrap">{opt}</span>
                      <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter font-normal">{FUNCTION_NAMES[opt]}</span>
                    </span>
                  ) : (
                    opt
                  )}
                  {value === opt && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
