import { Wifi, WifiOff, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="cyber-card border-b border-cyan-400/30 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Logo className="w-12 h-12 drop-shadow-lg" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-400/20 blur-xl animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold neon-text tracking-wider">
              CYBER-PÉTANQUE MANAGER
            </h1>
            <p className="text-sm text-cyan-300/80 tracking-wide font-medium">
              SYSTÈME DE GESTION CYBERNÉTIQUE v3.7.2
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <Wifi className="w-4 h-4" />
            <span className="font-bold">RÉSEAU SÉCURISÉ</span>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400 text-sm">
            <Shield className="w-4 h-4" />
            <span className="font-bold">PROTOCOLE ACTIF</span>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="cyber-button p-3 rounded-lg transition-all duration-300 hover:scale-110"
            title="Paramètres système"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}