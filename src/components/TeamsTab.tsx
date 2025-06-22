import React, { useState } from 'react';
import { Player, Team, TournamentType } from '../types/tournament';
import { Plus, Trash2, Users, Printer } from 'lucide-react';

interface TeamsTabProps {
  teams: Team[];
  tournamentType: TournamentType;
  onAddTeam: (players: Player[]) => void;
  onRemoveTeam: (teamId: string) => void;
}

export function TeamsTab({ teams, tournamentType, onAddTeam, onRemoveTeam }: TeamsTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);

  const isSolo = tournamentType === 'melee' || tournamentType === 'tete-a-tete';

  const getPlayersPerTeam = () => {
    switch (tournamentType) {
      case 'tete-a-tete': return 1;
      case 'doublette': return 2;
      case 'triplette': return 3;
      case 'quadrette': return 4;
      case 'melee': return 1;
      default: return 2;
    }
  };

  const initializeForm = () => {
    const playersCount = getPlayersPerTeam();
    const newPlayers: Player[] = Array.from({ length: playersCount }, (_, index) => ({
      id: crypto.randomUUID(),
      name: '',
      label: tournamentType === 'quadrette' ? ['A', 'B', 'C', 'D'][index] : undefined,
    }));
    setPlayers(newPlayers);
    setShowForm(true);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], name };
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPlayers = players.filter(player => player.name.trim());
    if (validPlayers.length === getPlayersPerTeam()) {
      onAddTeam(validPlayers);
      setShowForm(false);
      setPlayers([]);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setPlayers([]);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des équipes</title>
          <style>
            body {
              font-family: 'Orbitron', monospace;
              margin: 10px;
              color: #00d4ff;
              background: #0a0a0a;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
              color: #00d4ff;
              text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
            }
            .team-list {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .team-item {
              padding: 8px 0;
              border-bottom: 1px solid #00d4ff;
            }
            .team-item:last-child {
              border-bottom: none;
            }
            .team-name {
              font-weight: bold;
              font-size: 16px;
              color: #00d4ff;
              margin-bottom: 8px;
            }
            .player-list {
              display: flex;
              flex-wrap: wrap;
              gap: 4px 12px;
            }
            .player {
              display: inline-flex;
              align-items: center;
              font-size: 12px;
              color: #b3e5fc;
            }
            .player-label {
              display: inline-block;
              width: 20px;
              height: 20px;
              background: rgba(0, 212, 255, 0.2);
              color: #00d4ff;
              border: 1px solid #00d4ff;
              border-radius: 50%;
              text-align: center;
              line-height: 18px;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            @media print {
              body { margin: 0; }
              .team-item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>LISTE DES ÉQUIPES</h1>
          <div class="team-list">
            ${teams.map(team => `
              <div class="team-item">
                <div class="team-name">${team.name}</div>
                ${!isSolo
                  ? `<div class="player-list">${team.players
                      .map((player: Player) => `
                        <div class="player">
                          ${player.label ? `<span class="player-label">${player.label}</span>` : ''}
                          ${player.name}
                        </div>
                      `)
                      .join('')}</div>`
                  : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold neon-text tracking-wider">
          {isSolo ? 'JOUEURS' : 'ÉQUIPES'}
        </h2>
        <div className="flex space-x-4">
          {teams.length > 0 && (
            <button
              onClick={handlePrint}
              className="cyber-button flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMER</span>
            </button>
          )}
          <button
            onClick={initializeForm}
            className="cyber-button flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>AJOUTER {isSolo ? 'JOUEUR' : 'ÉQUIPE'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="cyber-card p-6 rounded-xl mb-8 cyber-glow">
          <h3 className="text-xl font-bold text-cyan-300 mb-6 tracking-wide">
            {isSolo ? 'NOUVEAU JOUEUR' : `NOUVELLE ÉQUIPE (${getPlayersPerTeam()} joueur${getPlayersPerTeam() > 1 ? 's' : ''})`}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center space-x-4">
                {tournamentType === 'quadrette' && (
                  <div className="w-10 h-10 bg-cyan-400/20 border border-cyan-400 text-cyan-400 rounded-full flex items-center justify-center font-bold text-lg">
                    {player.label}
                  </div>
                )}
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Nom du joueur ${tournamentType === 'quadrette' ? player.label : index + 1}`}
                  className="cyber-input flex-1 px-4 py-3 rounded-lg font-medium tracking-wide"
                  required
                />
              </div>
            ))}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="cyber-button px-6 py-3 rounded-lg font-bold tracking-wide hover:scale-105 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 200, 0, 0.2) 100%)', borderColor: '#00ff00' }}
              >
                AJOUTER
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cyber-button px-6 py-3 rounded-lg font-bold tracking-wide hover:scale-105 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(200, 0, 0, 0.2) 100%)', borderColor: '#ff0000', color: '#ff6666' }}
              >
                ANNULER
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="cyber-card p-4 rounded-lg hover:cyber-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <h3 className="font-bold text-cyan-200 text-lg tracking-wide">{team.name}</h3>
                </div>
                {!isSolo && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {team.players.map((player: Player) => (
                      <div
                        key={player.id}
                        className="flex items-center space-x-2 text-sm text-cyan-300/80 font-medium"
                      >
                        {player.label && (
                          <span className="w-6 h-6 bg-cyan-400/20 border border-cyan-400 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
                            {player.label}
                          </span>
                        )}
                        <span>{player.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemoveTeam(team.id)}
                className="text-red-400 hover:text-red-300 transition-colors ml-4 p-2 rounded-lg hover:bg-red-400/10"
                title={isSolo ? 'Supprimer le joueur' : "Supprimer l'équipe"}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && !showForm && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold neon-text mb-4 tracking-wide">
            {isSolo ? 'AUCUN JOUEUR INSCRIT' : 'AUCUNE ÉQUIPE INSCRITE'}
          </h3>
          <p className="text-cyan-300/60 text-lg font-medium">
            {isSolo
              ? 'Commencez par ajouter des joueurs pour votre tournoi'
              : 'Commencez par ajouter des équipes pour votre tournoi'}
          </p>
        </div>
      )}
    </div>
  );
}