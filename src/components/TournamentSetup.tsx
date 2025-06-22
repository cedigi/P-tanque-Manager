import React, { useState } from 'react';
import { TournamentType } from '../types/tournament';
import { Users, Target, Trophy, Shield, Wifi, Lock } from 'lucide-react';
import { Logo } from './Logo';

interface TournamentSetupProps {
  onCreateTournament: (type: TournamentType, courts: number) => void;
}

export function TournamentSetup({ onCreateTournament }: TournamentSetupProps) {
  const [type, setType] = useState<TournamentType>('doublette');
  const [courts, setCourts] = useState(4);
  const [securityLevel, setSecurityLevel] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTournament(type, courts);
  };

  const tournamentTypes = [
    { 
      value: 'tete-a-tete', 
      label: 'Duel Cybernétique', 
      icon: Target, 
      players: '1 cyber-joueur par équipe',
      description: 'Combat singulier avec implants'
    },
    { 
      value: 'doublette', 
      label: 'Binôme Tactique', 
      icon: Users, 
      players: '2 cyber-joueurs par équipe',
      description: 'Synchronisation neurale à deux'
    },
    { 
      value: 'triplette', 
      label: 'Triade Augmentée', 
      icon: Users, 
      players: '3 cyber-joueurs par équipe',
      description: 'Formation triangulaire optimisée'
    },
    { 
      value: 'quadrette', 
      label: 'Escouade Cyber', 
      icon: Users, 
      players: '4 cyber-joueurs par équipe',
      description: 'Unité tactique complète'
    },
    { 
      value: 'melee', 
      label: 'Chaos Neural', 
      icon: Trophy, 
      players: 'Cyber-joueurs individuels',
      description: 'Bataille royale cybernétique'
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Logo className="w-24 h-24 drop-shadow-2xl" />
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-cyan-400/30 blur-2xl animate-pulse"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl font-bold neon-text mb-4 tracking-wider">
            NOUVEAU TOURNOI CYBERNÉTIQUE
          </h1>
          <p className="text-cyan-300/80 text-lg font-medium tracking-wide mb-2">
            Configurez votre arène de combat cyber-augmentée
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-green-400">
              <Wifi className="w-4 h-4" />
              <span>RÉSEAU SÉCURISÉ</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-400">
              <Shield className="w-4 h-4" />
              <span>PROTOCOLE ACTIF</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Lock className="w-4 h-4" />
              <span>CHIFFREMENT QUANTIQUE</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="cyber-card p-8 rounded-xl">
            <label className="block text-xl font-bold text-cyan-300 mb-6 tracking-wide">
              TYPE DE COMBAT CYBERNÉTIQUE
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournamentTypes.map((tournamentType) => {
                const Icon = tournamentType.icon;
                return (
                  <label
                    key={tournamentType.value}
                    className={`cyber-border flex flex-col p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      type === tournamentType.value
                        ? 'cyber-glow bg-cyan-400/10 border-cyan-400'
                        : 'hover:bg-cyan-400/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={tournamentType.value}
                      checked={type === tournamentType.value}
                      onChange={(e) => setType(e.target.value as TournamentType)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-8 h-8 text-cyan-400" />
                      <div className="font-bold text-cyan-200 text-lg tracking-wide">
                        {tournamentType.label}
                      </div>
                    </div>
                    <div className="text-sm text-cyan-400/70 font-medium mb-2">
                      {tournamentType.players}
                    </div>
                    <div className="text-xs text-cyan-300/60 italic">
                      {tournamentType.description}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cyber-card p-6 rounded-xl">
              <label className="block text-lg font-bold text-cyan-300 mb-4 tracking-wide">
                ARÈNES DE COMBAT
              </label>
              <select
                value={courts}
                onChange={(e) => setCourts(Number(e.target.value))}
                className="cyber-select w-full px-4 py-3 rounded-lg text-lg font-medium tracking-wide focus:outline-none"
              >
                {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num} className="bg-slate-800">
                    {num} arène{num > 1 ? 's' : ''} de combat
                  </option>
                ))}
              </select>
            </div>

            <div className="cyber-card p-6 rounded-xl">
              <label className="block text-lg font-bold text-cyan-300 mb-4 tracking-wide">
                NIVEAU DE SÉCURITÉ
              </label>
              <select
                value={securityLevel}
                onChange={(e) => setSecurityLevel(Number(e.target.value))}
                className="cyber-select w-full px-4 py-3 rounded-lg text-lg font-medium tracking-wide focus:outline-none"
              >
                <option value={1} className="bg-slate-800">Niveau 1 - Basique</option>
                <option value={2} className="bg-slate-800">Niveau 2 - Renforcé</option>
                <option value={3} className="bg-slate-800">Niveau 3 - Militaire</option>
                <option value={4} className="bg-slate-800">Niveau 4 - Corporatif</option>
                <option value={5} className="bg-slate-800">Niveau 5 - Quantique</option>
              </select>
            </div>
          </div>

          <div className="cyber-card p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 102, 204, 0.1) 100%)' }}>
            <h3 className="text-lg font-bold text-cyan-300 mb-4 tracking-wide">PARAMÈTRES SYSTÈME:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-cyan-400">Arènes</div>
                <div className="text-cyan-200 font-bold text-lg">{courts}</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400">Sécurité</div>
                <div className="text-cyan-200 font-bold text-lg">Niv.{securityLevel}</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400">Chiffrement</div>
                <div className="text-green-400 font-bold text-lg">ACTIF</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400">IA Arbitre</div>
                <div className="text-green-400 font-bold text-lg">EN LIGNE</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="cyber-button w-full py-4 px-6 rounded-xl text-xl font-bold tracking-wider hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-6 h-6" />
              <span>INITIALISER LE TOURNOI CYBERNÉTIQUE</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}