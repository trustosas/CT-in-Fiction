import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Info } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  selected: number[];
  options: { id: number; title: string; description: string }[];
  onChange: (val: number[]) => void;
  onHoverMotif: (desc: string | null, id: string | null, anchor: any) => void;
}

export function MultiSelect({ 
  label, 
  selected, 
  options, 
  onChange,
  onHoverMotif
}: MultiSelectProps) {
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

  const toggleOption = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter(i => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <span className="font-mono text-[9px] uppercase tracking-widest opacity-40 px-1">{label}</span>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 bg-[#1a1a1a]/5 hover:bg-[#1a1a1a]/10 rounded-sm transition-all group text-left ${isOpen ? 'ring-1 ring-[#1a1a1a]/20' : ''}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider truncate mr-2">
            {selected.length === 0 ? 'None' : `${selected.length} Selected`}
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
              {options.map((opt) => (
                <div 
                  key={opt.id}
                  className="flex items-center group/item"
                >
                  <button 
                    onClick={() => toggleOption(opt.id)}
                    className={`flex-1 flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-[#1a1a1a]/5 transition-colors ${selected.includes(opt.id) ? 'bg-[#1a1a1a]/5 font-bold' : ''}`}
                  >
                    {opt.title}
                    {selected.includes(opt.id) && <Check className="w-3 h-3" />}
                  </button>
                  <button 
                    className="px-2 py-2 opacity-20 hover:opacity-100 transition-opacity"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onHoverMotif(opt.description, opt.id.toString(), {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                      });
                    }}
                    onMouseLeave={() => onHoverMotif(null, null, null)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
