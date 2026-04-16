import { Menu, X } from 'lucide-react';
import { slugify } from '../lib/ct-logic';

interface HeaderProps {
  media: string[];
  activeMedium: string | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  navigateToMedium: (medium: string) => void;
  navigateToHome: () => void;
}

export function Header({
  media,
  activeMedium,
  isMenuOpen,
  setIsMenuOpen,
  navigateToMedium,
  navigateToHome
}: HeaderProps) {
  return (
    <header className="border-b border-[#1a1a1a]/10 sticky top-0 bg-[#f5f2ed]/80 backdrop-blur-md z-[60]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={navigateToHome}
            className="font-serif text-2xl tracking-tighter hover:italic transition-all"
          >
            CT in Fiction
          </button>
          
          <nav className="hidden lg:flex items-center gap-8">
            {media.map((m) => (
              <button 
                key={m}
                onClick={() => navigateToMedium(m)}
                className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all hover:opacity-100 ${
                  activeMedium === m ? 'opacity-100 font-bold' : 'opacity-30'
                }`}
              >
                {m}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-[#f5f2ed] z-[70] p-6">
          <nav className="flex flex-col gap-6">
            {media.map((m) => (
              <button 
                key={m}
                onClick={() => {
                  navigateToMedium(m);
                  setIsMenuOpen(false);
                }}
                className={`font-serif text-4xl text-left ${
                  activeMedium === m ? 'italic underline' : ''
                }`}
              >
                {m}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
