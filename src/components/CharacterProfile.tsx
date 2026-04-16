import { motion } from 'motion/react';
import { ChevronLeft, Zap, Activity, Compass, Layers, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Character } from '../data';
import { 
  formatTypeDisplay, 
  normalizeFunctionCode, 
  FUNCTION_ORDER, 
  FUNCTION_NAMES, 
  ENERGETIC_NAMES, 
  getDevelopmentName, 
  getSubtypeName, 
  getEmotionalDescriptor, 
  getStructuredMotifs 
} from '../lib/ct-logic';

interface CharacterProfileProps {
  char: Character;
  onBack: () => void;
  analysisMarkdown: string;
  onHoverMotif: (desc: string | null, id: string | null, anchor: any) => void;
  formatDate: (date: string) => string;
  getRelativeTime: (date: string) => string;
}

function MarkdownAnalysis({ markdown }: { markdown: string }) {
  return (
    <div className="mb-8 relative group">
      <div className="prose prose-sm max-w-none prose-neutral opacity-90 leading-relaxed font-serif text-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function CharacterProfile({ 
  char, 
  onBack, 
  analysisMarkdown, 
  onHoverMotif,
  formatDate,
  getRelativeTime
}: CharacterProfileProps) {
  const functions = [
    normalizeFunctionCode(char.leadFunction),
    normalizeFunctionCode(char.auxiliaryFunction),
    normalizeFunctionCode(char.tertiaryFunction),
    normalizeFunctionCode(char.polarFunction)
  ];

  const structuredMotifs = getStructuredMotifs(char.motifValues || []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all mb-12"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Index
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        <div className="md:col-span-8">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-30">{char.source}</span>
              <div className="h-px flex-1 bg-[#1a1a1a]/5" />
            </div>
            <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tighter mb-8">
              {char.name}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-[#1a1a1a] text-white rounded-sm font-mono text-xs uppercase tracking-[0.2em]">
                {formatTypeDisplay(char.type)}
              </div>
              <div className="px-4 py-2 border border-[#1a1a1a]/10 rounded-sm font-mono text-xs uppercase tracking-[0.2em] opacity-60">
                {char.quadra}
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">Cognitive Analysis</h2>
                <div className="h-px flex-1 bg-[#1a1a1a]/5" />
              </div>
              
              {analysisMarkdown ? (
                <MarkdownAnalysis markdown={analysisMarkdown} />
              ) : (
                <div className="flex items-center gap-3 font-mono text-xs opacity-40 py-12">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading deep analysis...
                </div>
              )}
            </section>

            {char.publishedDate && (
              <section className="pt-8 border-t border-[#1a1a1a]/5">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest opacity-30">Indexing Date</span>
                  <span className="font-mono text-[10px] opacity-60">
                    {formatDate(char.publishedDate)} <span className="opacity-40">{getRelativeTime(char.publishedDate)}</span>
                  </span>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="md:col-span-4 space-y-12">
          <div className="sticky top-12 space-y-12">
            <div className="p-8 bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/5 rounded-sm">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Hierarchy
              </h3>
              <div className="space-y-6">
                {FUNCTION_ORDER.map((pos, idx) => (
                  <div key={pos} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">{pos}</span>
                      <span className="font-serif italic text-lg">{functions[idx]}</span>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-tighter opacity-20 group-hover:opacity-40 transition-opacity">
                      {FUNCTION_NAMES[functions[idx]]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border border-[#1a1a1a]/5 rounded-sm">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Energetics
              </h3>
              <div className="space-y-8">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">Lead</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif italic text-xl">{char.leadEnergetic}</span>
                    <span className="font-mono text-[9px] opacity-40">{ENERGETIC_NAMES[char.leadEnergetic]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">Auxiliary</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif italic text-xl">{char.auxiliaryEnergetic}</span>
                    <span className="font-mono text-[9px] opacity-40">{ENERGETIC_NAMES[char.auxiliaryEnergetic]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-[#1a1a1a]/5 rounded-sm">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-2">
                <Compass className="w-3 h-3" /> Development
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">Stage</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans tracking-[0.2em] text-xl">{char.finalDevelopment || char.initialDevelopment}</span>
                    <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter">
                      {getDevelopmentName(char.finalDevelopment || char.initialDevelopment, '', char.behaviourQualia || undefined)}
                    </span>
                  </div>
                </div>
                {char.subtype && (
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">Subtype</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif italic text-xl">{char.subtype}</span>
                      <span className="font-mono text-[9px] opacity-40 uppercase tracking-tighter">{getSubtypeName(char.subtype)}</span>
                    </div>
                  </div>
                )}
                {char.emotionalAttitude && (
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">Emotional Attitude</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif italic text-xl">{getEmotionalDescriptor(char.emotionalAttitude, char.judgmentAxis) || char.emotionalAttitude}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {structuredMotifs.length > 0 && (
              <div className="p-8 border border-[#1a1a1a]/5 rounded-sm">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Motifs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {structuredMotifs.map((group) => (
                    group.motifs.filter(m => m.value).map((motif) => (
                      <div 
                        key={motif.index}
                        className="group/motif relative"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          onHoverMotif(motif.label, motif.index.toString(), {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                          });
                        }}
                        onMouseLeave={() => onHoverMotif(null, null, null)}
                      >
                        <div className="px-3 py-1.5 bg-[#1a1a1a]/5 hover:bg-[#1a1a1a]/10 rounded-sm font-mono text-[9px] uppercase tracking-widest transition-colors cursor-help flex items-center gap-2">
                          <span className="opacity-40">{group.function}</span>
                          {motif.label.split(':')[0].trim()}
                          <Info className="w-2.5 h-2.5 opacity-20 group-hover/motif:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
