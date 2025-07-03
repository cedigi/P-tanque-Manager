import React from 'react';
import { Pool, Team, Tournament } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools }: PoolsTabProps) {
  const isSolo = tournament.type === 'melee' || tournament.type === 'tete-a-tete';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Poules - ${tournament.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: #f5f5f5;
            }
            h1 { 
              text-align: center; 
              margin-bottom: 30px; 
              color: #333;
              font-size: 28px;
            }
            .pools-container { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
              gap: 25px; 
              max-width: 1200px;
              margin: 0 auto;
            }
            .pool { 
              border: 3px solid #2563eb; 
              border-radius: 12px; 
              background: white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .pool-header { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 15px;
              text-align: center;
              font-weight: bold; 
              font-size: 20px;
              letter-spacing: 1px;
            }
            .pool-content {
              padding: 20px;
            }
            .team { 
              padding: 12px 15px; 
              border: 2px solid #e5e7eb; 
              border-radius: 8px; 
              margin-bottom: 12px; 
              background: #f9fafb;
              transition: all 0.2s ease;
            }
            .team:hover {
              border-color: #2563eb;
              background: #eff6ff;
            }
            .team:last-child {
              margin-bottom: 0;
            }
            .team-name { 
              font-weight: bold; 
              font-size: 16px;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .team-players { 
              font-size: 14px; 
              color: #6b7280;
              line-height: 1.4;
            }
            .player-label {
              display: inline-block;
              width: 20px;
              height: 20px;
              background: #2563eb;
              color: white;
              border-radius: 50%;
              text-align: center;
              line-height: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
              vertical-align: middle;
            }
            @media print { 
              body { margin: 0; background: white; } 
              .pool { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>🏆 Poules - ${tournament.name}</h1>
          <div class="pools-container">
            ${pools.map(pool => `
              <div class="pool">
                <div class="pool-header">${pool.name}</div>
                <div class="pool-content">
                  ${pool.teamIds.map(teamId => {
                    const team = teams.find(t => t.id === teamId);
                    return team ? `
                      <div class="team">
                        <div class="team-name">${team.name}</div>
                        <div class="team-players">
                          ${team.players.map(p => `
                            ${p.label ? `<span class="player-label">${p.label}</span>` : ''}${p.name}
                          `).join('<br>')}
                        </div>
                      </div>
                    ` : '';
                  }).join('')}
                </div>
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
        <h2 className="text-3xl font-bold text-white tracking-wider">Poules</h2>
        <div className="flex space-x-4">
          {pools.length > 0 && (
            <button
              onClick={handlePrint}
              className="glass-button-secondary flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          )}
          <button
            onClick={onGeneratePools}
            className="glass-button flex items-center space-x-2 px-6 py-3 font-bold tracking-wide hover:scale-105 transition-all duration-300"
            disabled={teams.length < 4}
          >
            <Shuffle className="w-5 h-5" />
            <span>Générer les poules</span>
          </button>
        </div>
      </div>

      {teams.length < 4 && (
        <div className="glass-card p-6 mb-8 bg-orange-500/20 border-orange-400/40">
          <p className="text-orange-200 font-medium text-lg">
            Vous devez inscrire au moins 4 {isSolo ? 'joueurs' : 'équipes'} pour générer des poules.
          </p>
        </div>
      )}

      {pools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {pools.map((pool) => (
            <div key={pool.id} className="pool-card">
              {/* En-tête de la poule */}
              <div className="pool-header">
                <div className="flex items-center justify-center space-x-3">
                  <Grid3X3 className="w-6 h-6" />
                  <h3 className="text-2xl font-bold tracking-wide">{pool.name}</h3>
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {pool.teamIds.length} {isSolo ? 'joueur' : 'équipe'}{pool.teamIds.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Contenu de la poule */}
              <div className="pool-content">
                {pool.teamIds.map((teamId, index) => {
                  const team = teams.find(t => t.id === teamId);
                  if (!team) return null;
                  
                  return (
                    <div key={teamId} className="team-card">
                      {/* Numéro de position dans la poule */}
                      <div className="team-position">
                        {index + 1}
                      </div>
                      
                      {/* Informations de l'équipe */}
                      <div className="team-info">
                        <div className="flex items-center space-x-3 mb-3">
                          <Users className="w-5 h-5 text-blue-400" />
                          <h4 className="font-bold text-white text-lg">{team.name}</h4>
                        </div>
                        
                        {/* Liste des joueurs */}
                        <div className="players-list">
                          {team.players.map((player) => (
                            <div key={player.id} className="player-item">
                              {player.label && (
                                <span className="player-label">
                                  {player.label}
                                </span>
                              )}
                              <span className="player-name">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Grid3X3 className="w-16 h-16 text-white/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
            Aucune poule générée
          </h3>
          <p className="text-white/60 text-lg font-medium">
            Générez les poules pour organiser le tournoi
          </p>
        </div>
      )}

      {pools.length > 0 && (
        <div className="mt-8 glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 tracking-wide flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Répartition des poules</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-blue-400">{pools.length}</div>
              <div className="text-white/70 text-sm">Poules créées</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-green-400">
                {pools.filter(p => p.teamIds.length === 4).length}
              </div>
              <div className="text-white/70 text-sm">Poules de 4</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {pools.filter(p => p.teamIds.length === 3).length}
              </div>
              <div className="text-white/70 text-sm">Poules de 3</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-white">{teams.length}</div>
              <div className="text-white/70 text-sm">Total équipes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}