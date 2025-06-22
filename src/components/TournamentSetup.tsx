import React, { useState } from 'react';
import { TournamentType } from '../types/tournament';
import { Users, Target, Trophy } from 'lucide-react';
import { Logo } from './Logo';

interface TournamentSetupProps {
  onCreateTournament: (type: TournamentType, courts: number) => void;
}

export function TournamentSetup({ onCreateTournament }: TournamentSetupProps) {
  const [type, setType] = useState<TournamentType>('doublette');
  const [courts, setCourts] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTournament(type, courts);
  };

  const tournamentTypes = [
    { value: 'tete-a-tete', label: 'Tête-à-tête', icon: Target, players: '1 joueur par équipe' },
    { value: 'doublette', label: 'Doublette', icon: Users, players: '2 joueurs par équipe' },
    { value: 'triplette', label: 'Triplette', icon: Users, players: '3 joueurs par équipe' },
    { value: 'quadrette', label: 'Quadrette', icon: Users, players: '4 joueurs par équipe' },
    { value: 'melee', label: 'Mêlée', icon: Trophy, players: 'Joueurs individuels' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Logo className="w-20 h-20 drop-shadow-2xl" />
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-cyan-400/30 blur-2xl animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold neon-text mb-4 tracking-wider">
            NOUVEAU TOURNOI DE PÉTANQUE
          </h1>
          <p className="text-cyan-300/80 text-lg font-medium tracking-wide">
            Configurez votre tournoi et commencez à organiser les matchs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="cyber-card p-8 rounded-xl">
            <label className="block text-lg font-bold text-cyan-300 mb-6 tracking-wide">
              TYPE DE TOURNOI
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournamentTypes.map((tournamentType) => {
                const Icon = tournamentType.icon;
                return (
                  <label
                    key={tournamentType.value}
                    className={`cyber-border flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
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
                    <Icon className="w-6 h-6 text-cyan-400 mr-4" />
                    <div>
                      <div className="font-bold text-cyan-200 text-lg tracking-wide">
                        {tournamentType.label}
                      </div>
                      <div className="text-sm text-cyan-400/70 font-medium">
                        {tournamentType.players}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="cyber-card p-8 rounded-xl">
            <label className="block text-lg font-bold text-cyan-300 mb-4 tracking-wide">
              NOMBRE DE TERRAINS
            </label>
            <select
              value={courts}
              onChange={(e) => setCourts(Number(e.target.value))}
              className="cyber-select w-full px-4 py-3 rounded-lg text-lg font-medium tracking-wide focus:outline-none"
            >
              {Array.from({ length: 150 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num} className="bg-slate-800">
                  {num} terrain{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="cyber-button w-full py-4 px-6 rounded-xl text-xl font-bold tracking-wider hover:scale-105 transition-all duration-300"
          >
            CRÉER LE TOURNOI
          </button>
        </form>
      </div>
    </div>
  );
}