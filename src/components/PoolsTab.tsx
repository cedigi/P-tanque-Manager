import React from 'react';
import { Pool, Team, Tournament } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools }: PoolsTabProps) {
  const isSolo = tournament.type === 'melee' || tournament.type === 'tete-a-tete';

  // Générer les matchs pour chaque poule
  const generatePoolMatches = (pool: Pool) => {
    const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
    const matches: Array<{team1: Team, team2: Team}> = [];
    
    // Générer tous les matchs possibles (round robin)
    for (let i = 0; i < poolTeams.length; i++) {
      for (let j = i + 1; j < poolTeams.length; j++) {
        matches.push({
          team1: poolTeams[i]!,
          team2: poolTeams[j]!
        });
      }
    }
    
    return matches;
  };

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
            .pool-section {
              margin-bottom: 40px;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .pool-header { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 20px;
              text-align: center;
              font-weight: bold; 
              font-size: 24px;
            }
            .pool-content {
              padding: 25px;
            }
            .matches-grid {
              display: grid;
              gap: 15px;
            }
            .match-row {
              display: grid;
              grid-template-columns: 80px 1fr;
              gap: 15px;
              align-items: center;
            }
            .court-number {
              background: #2563eb;
              color: white;
              padding: 12px;
              border-radius: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 16px;
            }
            .match-card {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .team-info {
              flex: 1;
              text-align: center;
            }
            .team-name {
              font-weight: bold;
              font-size: 16px;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .team-players {
              font-size: 12px;
              color: #6b7280;
            }
            .vs-divider {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin: 0 15px;
            }
            @media print { 
              body { margin: 0; background: white; } 
              .pool-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>🏆 Poules - ${tournament.name}</h1>
          ${pools.map((pool, poolIndex) => {
            const matches = generatePoolMatches(pool);
            return `
              <div class="pool-section">
                <div class="pool-header">${pool.name}</div>
                <div class="pool-content">
                  <div class="matches-grid">
                    ${matches.map((match, matchIndex) => `
                      <div class="match-row">
                        <div class="court-number">T${poolIndex * 3 + matchIndex + 1}</div>
                        <div class="match-card">
                          <div class="team-info">
                            <div class="team-name">${match.team1.name}</div>
                            <div class="team-players">${match.team1.players.map(p => p.name).join(', ')}</div>
                          </div>
                          <div class="vs-divider">VS</div>
                          <div class="team-info">
                            <div class="team-name">${match.team2.name}</div>
                            <div class="team-players">${match.team2.players.map(p => p.name).join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
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
        <div className="space-y-8">
          {pools.map((pool, poolIndex) => {
            const matches = generatePoolMatches(pool);
            
            return (
              <div key={pool.id} className="glass-card overflow-hidden">
                {/* En-tête de la poule */}
                <div className="bg-gradient-to-r from-blue-600/80 to-blue-700/80 backdrop-filter backdrop-blur-10 px-8 py-6 border-b border-white/20">
                  <div className="flex items-center justify-center space-x-3">
                    <Grid3X3 className="w-8 h-8 text-white" />
                    <h3 className="text-3xl font-bold text-white tracking-wide">{pool.name}</h3>
                  </div>
                  <div className="text-center text-white/90 mt-2 font-medium">
                    {pool.teamIds.length} {isSolo ? 'joueur' : 'équipe'}{pool.teamIds.length > 1 ? 's' : ''} • {matches.length} match{matches.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Grille des matchs */}
                <div className="p-8">
                  <div className="space-y-4">
                    {matches.map((match, matchIndex) => (
                      <div key={`${match.team1.id}-${match.team2.id}`} className="grid grid-cols-[100px_1fr] gap-6 items-center">
                        {/* Numéro de terrain */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center shadow-lg">
                          <div className="flex items-center justify-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span className="font-bold text-lg">T{poolIndex * 3 + matchIndex + 1}</span>
                          </div>
                        </div>

                        {/* Match horizontal */}
                        <div className="glass-card p-6 bg-white/5 hover:bg-white/10 transition-all duration-300">
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                            {/* Équipe 1 */}
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <h4 className="font-bold text-white text-lg">{match.team1.name}</h4>
                              </div>
                              <div className="space-y-1">
                                {match.team1.players.map((player) => (
                                  <div key={player.id} className="flex items-center justify-center space-x-2 text-sm text-white/80">
                                    {player.label && (
                                      <span className="w-5 h-5 bg-blue-400/20 border border-blue-400 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                                        {player.label}
                                      </span>
                                    )}
                                    <span>{player.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* VS */}
                            <div className="text-center">
                              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg">
                                VS
                              </div>
                            </div>

                            {/* Équipe 2 */}
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-3">
                                <Users className="w-5 h-5 text-green-400" />
                                <h4 className="font-bold text-white text-lg">{match.team2.name}</h4>
                              </div>
                              <div className="space-y-1">
                                {match.team2.players.map((player) => (
                                  <div key={player.id} className="flex items-center justify-center space-x-2 text-sm text-white/80">
                                    {player.label && (
                                      <span className="w-5 h-5 bg-green-400/20 border border-green-400 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                                        {player.label}
                                      </span>
                                    )}
                                    <span>{player.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
                {pools.reduce((total, pool) => total + generatePoolMatches(pool).length, 0)}
              </div>
              <div className="text-white/70 text-sm">Matchs total</div>
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