import React, { useState } from 'react';
import { Player, Team, TournamentType } from '../types/tournament';
import { Plus, Trash2, Users, Printer, Zap, Eye, Brain, Cpu } from 'lucide-react';
import { CyberPlayerForm } from './CyberPlayerForm';

interface TeamsTabProps {
  teams: Team[];
  tournamentType: TournamentType;
  onAddTeam: (players: Player[]) => void;
  onRemoveTeam: (teamId: string) => void;
}

export function TeamsTab({ teams, tournamentType, onAddTeam, onRemoveTeam }: TeamsTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

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
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setShowForm(true);
  };

  const handleAddPlayer = (player: Player) => {
    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);

    if (updatedPlayers.length === getPlayersPerTeam()) {
      onAddTeam(updatedPlayers);
      setShowForm(false);
      setPlayers([]);
      setCurrentPlayerIndex(0);
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setPlayers([]);
    setCurrentPlayerIndex(0);
  };

  const getImplantIcon = (type: string) => {
    switch (type) {
      case 'neural': return <Brain className="w-4 h-4" />;
      case 'ocular': return <Eye className="w-4 h-4" />;
      case 'motor': return <Zap className="w-4 h-4" />;
      case 'tactical': return <Cpu className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cyber-Équipes</title>
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
              gap: 8px;
            }
            .team-item {
              padding: 12px;
              border: 1px solid #00d4ff;
              border-radius: 8px;
              background: rgba(0, 212, 255, 0.05);
            }
            .team-name {
              font-weight: bold;
              font-size: 18px;
              color: #00d4ff;
              margin-bottom: 8px;
            }
            .player {
              margin: 8px 0;
              padding: 8px;
              border-left: 3px solid #00ff88;
              background: rgba(0, 255, 136, 0.1);
            }
            .player-name {
              font-weight: bold;
              color: #00ff88;
            }
            .implants {
              margin-top: 4px;
              font-size: 12px;
              color: #b3e5fc;
            }
            .stats {
              margin-top: 4px;
              font-size: 11px;
              color: #00d4ff;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>CYBER-ÉQUIPES</h1>
          <div class="team-list">
            ${teams.map(team => `
              <div class="team-item">
                <div class="team-name">${team.name}</div>
                <div class="stats">Rating: ${team.teamRating} | Synchro: ${team.synchroLevel}%</div>
                ${team.players.map(player => `
                  <div class="player">
                    <div class="player-name">${player.name} ${player.label ? `[${player.label}]` : ''}</div>
                    <div class="implants">
                      Implants: ${player.cyberImplants.map(i => i.name).join(', ')}
                    </div>
                    <div class="stats">
                      Combat: ${player.combatRating} | Neural: ${player.neuralScore} | Hack: Lv.${player.hackingLevel}
                    </div>
                  </div>
                `).join('')}
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
          {isSolo ? 'CYBER-JOUEURS' : 'CYBER-ÉQUIPES'}
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
            <span>AJOUTER {isSolo ? 'CYBER-JOUEUR' : 'CYBER-ÉQUIPE'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <div className="mb-4">
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-cyan-300 font-bold">
                Joueur {currentPlayerIndex + 1}/{getPlayersPerTeam()}
              </span>
              {players.length > 0 && (
                <div className="flex space-x-2">
                  {players.map((player, index) => (
                    <div key={player.id} className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  ))}
                  {Array.from({ length: getPlayersPerTeam() - players.length }, (_, index) => (
                    <div key={`empty-${index}`} className="w-3 h-3 border border-cyan-400 rounded-full"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <CyberPlayerForm
            onAddPlayer={handleAddPlayer}
            onCancel={handleCancel}
            playerLabel={tournamentType === 'quadrette' ? ['A', 'B', 'C', 'D'][currentPlayerIndex] : undefined}
          />
        </div>
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="cyber-card p-6 rounded-xl hover:cyber-glow transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <h3 className="font-bold text-cyan-200 text-xl tracking-wide">{team.name}</h3>
                </div>
                <div className="flex space-x-6 text-sm text-cyan-300/80 mb-4">
                  <span>Rating: <span className="text-cyan-200 font-bold">{team.teamRating}</span></span>
                  <span>Synchro: <span className="text-cyan-200 font-bold">{team.synchroLevel}%</span></span>
                </div>
              </div>
              <button
                onClick={() => onRemoveTeam(team.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                title={isSolo ? 'Supprimer le cyber-joueur' : "Supprimer la cyber-équipe"}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {!isSolo && (
              <div className="space-y-3">
                {team.players.map((player: Player) => (
                  <div
                    key={player.id}
                    className="cyber-border p-4 rounded-lg"
                    style={{ borderColor: '#00ff88' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {player.label && (
                          <span className="w-8 h-8 bg-cyan-400/20 border border-cyan-400 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                            {player.label}
                          </span>
                        )}
                        <span className="font-bold text-cyan-200 text-lg">{player.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-cyan-300">Combat: <span className="text-cyan-200 font-bold">{player.combatRating}</span></div>
                        <div className="text-cyan-300">Neural: <span className="text-cyan-200 font-bold">{player.neuralScore}</span></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-bold text-cyan-400 mb-2">IMPLANTS CYBERNÉTIQUES:</h5>
                      <div className="flex flex-wrap gap-2">
                        {player.cyberImplants.map((implant) => (
                          <div
                            key={implant.id}
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border"
                            style={{ 
                              borderColor: implant.color, 
                              color: implant.color,
                              background: `${implant.color}20`
                            }}
                          >
                            {getImplantIcon(implant.type)}
                            <span>{implant.name}</span>
                            <span className="text-cyan-300">+{implant.boost}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-cyan-400/70">
                      <span>Hacking: Niveau {player.hackingLevel}</span>
                      <span>Augmentation: Niveau {player.augmentationLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {teams.length === 0 && !showForm && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold neon-text mb-4 tracking-wide">
            {isSolo ? 'AUCUN CYBER-JOUEUR INSCRIT' : 'AUCUNE CYBER-ÉQUIPE INSCRITE'}
          </h3>
          <p className="text-cyan-300/60 text-lg font-medium">
            {isSolo
              ? 'Commencez par créer des cyber-joueurs avec leurs implants'
              : 'Commencez par créer des cyber-équipes avec leurs augmentations'}
          </p>
        </div>
      )}
    </div>
  );
}