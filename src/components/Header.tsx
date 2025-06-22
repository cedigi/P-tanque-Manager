import { Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="cyber-card border-b border-cyan-400/30 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo + titre */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Logo className="w-12 h-12 drop-shadow-lg" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-400/20 blur-xl"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold neon-text tracking-wider">
              PÉTANQUE MANAGER
            </h1>
            <p className="text-sm text-cyan-300/80 tracking-wide font-medium">
              GESTIONNAIRE DE TOURNOIS PROFESSIONNEL
            </p>
          </div>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="cyber-button p-3 rounded-lg transition-all duration-300 hover:scale-110"
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}