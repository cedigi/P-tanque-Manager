import React from 'react';
import { Users, Gamepad2, Trophy } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'teams', label: 'Équipes / Joueurs', icon: Users },
    { id: 'matches', label: 'Matchs', icon: Gamepad2 },
    { id: 'standings', label: 'Classement', icon: Trophy },
  ];

  return (
    <div className="border-b border-cyan-400/30">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-3 py-4 px-2 border-b-2 font-bold text-sm transition-all duration-300 tracking-wide ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 neon-text'
                  : 'border-transparent text-cyan-300/60 hover:text-cyan-300 hover:border-cyan-400/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label.toUpperCase()}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}