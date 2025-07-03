import React from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, Play, Clock, CheckCircle, MapPin, Edit3 } from 'lucide-react';

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
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 30px; }
            .pools-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
            .pool { border: 2px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .pool-title { font-weight: bold; font-size: 18px; margin-bottom: 15px; text-align: center; background: #f0f0f0; padding: 10px; border-radius: 4px; }
            .bracket { border: 1px solid #ddd; margin: 10px 0; }
            .match-row { display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
            .team { flex: 1; padding: 5px; }
            .score { text-align: center; font-weight: bold; min-width: 60px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Poules - ${tournament.name}</h1>
          <div class="pools-container">
            ${pools.map(pool => {
              const poolMatches = tournament.matches.filter(m => m.poolId === pool.id);
              return `
                <div class="pool">
                  <div class="pool-title">${pool.name}</div>
                  <div class="bracket">
                    ${poolMatches.map(match => {
                      const team1 = teams.find(t => t.id === match.team1Id);
                      const team2 = teams.find(t => t.id === match.team2Id);
                      return `
                        <div class="match-row">
                          <div class="team">${team1?.name || 'Équipe 1'}</div>
                          <div class="score">${match.completed ? `${match.team1Score} - ${match.team2Score}` : '- -'}</div>
                          <div class="team">${team2?.name || 'Équipe 2'}</div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
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
        <>
          {/* Affichage des poules avec tableaux classiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {pools.map((pool) => (
              <ClassicPoolBracket 
                key={pool.id} 
                pool={pool} 
                teams={teams} 
                matches={tournament.matches}
                isSolo={isSolo}
              />
            ))}
          </div>

          {/* Statistiques des poules */}
          <div className="glass-card p-6">
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
        </>
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
    </div>
  );
}

// Composant pour afficher une poule avec tableau classique de pétanque
interface ClassicPoolBracketProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  isSolo: boolean;
}

function ClassicPoolBracket({ pool, teams, matches, isSolo }: ClassicPoolBracketProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Équipe inconnue';
  };

  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return '';
    return team.players
      .map(player => (player.label ? `[${player.label}] ${player.name}` : player.name))
      .join(', ');
  };

  // Organiser les matchs selon le système classique de pétanque
  const organizeMatches = () => {
    if (poolTeams.length === 4) {
      // Poule de 4 : système classique
      // 1er tour : A vs C, B vs D
      // 2ème tour : Gagnants ensemble, Perdants ensemble  
      // 3ème tour : Match de barrage si nécessaire
      
      const team1 = poolTeams[0]; // A
      const team2 = poolTeams[1]; // B  
      const team3 = poolTeams[2]; // C
      const team4 = poolTeams[3]; // D

      return {
        firstRound: [
          { team1: team1, team2: team3, label: "Match 1" },
          { team1: team2, team2: team4, label: "Match 2" }
        ],
        secondRound: [
          { team1: null, team2: null, label: "Gagnants", dependency: "winners" },
          { team1: null, team2: null, label: "Perdants", dependency: "losers" }
        ],
        thirdRound: [
          { team1: null, team2: null, label: "Barrage", dependency: "playoff" }
        ]
      };
    } else if (poolTeams.length === 3) {
      // Poule de 3 : tous contre tous
      const team1 = poolTeams[0];
      const team2 = poolTeams[1]; 
      const team3 = poolTeams[2];

      return {
        firstRound: [
          { team1: team1, team2: team2, label: "Match 1" },
          { team1: team1, team2: team3, label: "Match 2" },
          { team1: team2, team2: team3, label: "Match 3" }
        ]
      };
    }
    
    return { firstRound: [] };
  };

  const matchStructure = organizeMatches();

  // Trouver le match correspondant dans les données
  const findMatch = (team1: Team | null, team2: Team | null) => {
    if (!team1 || !team2) return null;
    return poolMatches.find(m => 
      (m.team1Id === team1.id && m.team2Id === team2.id) ||
      (m.team1Id === team2.id && m.team2Id === team1.id)
    );
  };

  // Calculer les statistiques pour déterminer les gagnants/perdants
  const calculateStats = () => {
    const stats = poolTeams.map(team => {
      const teamMatches = poolMatches.filter(m => 
        m.completed && (m.team1Id === team.id || m.team2Id === team.id)
      );

      let wins = 0;
      let losses = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      teamMatches.forEach(match => {
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? (match.team1Score || 0) : (match.team2Score || 0);
        const opponentScore = isTeam1 ? (match.team2Score || 0) : (match.team1Score || 0);

        pointsFor += teamScore;
        pointsAgainst += opponentScore;

        if (teamScore > opponentScore) {
          wins++;
        } else {
          losses++;
        }
      });

      return {
        team,
        wins,
        losses,
        pointsFor,
        pointsAgainst,
        performance: pointsFor - pointsAgainst
      };
    });

    return stats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.performance - a.performance;
    });
  };

  const stats = calculateStats();

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/20 bg-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5" />
            <span>{pool.name}</span>
          </h3>
          <div className="text-sm text-white/70">
            {poolMatches.filter(m => m.completed).length}/{poolMatches.length} matchs
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Tableau classique de pétanque */}
        <div className="space-y-6">
          
          {/* Premier tour */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              {poolTeams.length === 4 ? "1er Tour" : "Matchs"}
            </h4>
            <div className="space-y-3">
              {matchStructure.firstRound.map((matchInfo, index) => {
                const match = findMatch(matchInfo.team1, matchInfo.team2);
                return (
                  <div key={index} className="glass-card border-2 border-white/20">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Équipe 1 */}
                        <div className="flex-1 text-center">
                          <div className="font-bold text-white text-lg">
                            {matchInfo.team1?.name}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            {matchInfo.team1 ? getTeamPlayers(matchInfo.team1.id) : ''}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="mx-6 text-center">
                          {match?.completed ? (
                            <div className="text-2xl font-bold text-white">
                              {match.team1Id === matchInfo.team1?.id 
                                ? `${match.team1Score} - ${match.team2Score}`
                                : `${match.team2Score} - ${match.team1Score}`
                              }
                            </div>
                          ) : (
                            <div className="text-white/50 text-lg">- - -</div>
                          )}
                          <div className="text-xs text-white/60 mt-1">
                            {matchInfo.label}
                          </div>
                        </div>

                        {/* Équipe 2 */}
                        <div className="flex-1 text-center">
                          <div className="font-bold text-white text-lg">
                            {matchInfo.team2?.name}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            {matchInfo.team2 ? getTeamPlayers(matchInfo.team2.id) : ''}
                          </div>
                        </div>
                      </div>

                      {/* Terrain */}
                      {match && (
                        <div className="mt-3 text-center">
                          <span className="px-2 py-1 bg-blue-500/30 border border-blue-400 text-blue-400 rounded text-xs font-bold">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            Terrain {match.court}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deuxième tour pour poules de 4 */}
          {poolTeams.length === 4 && matchStructure.secondRound && (
            <div>
              <h4 className="text-lg font-bold text-white mb-4">2ème Tour</h4>
              <div className="space-y-3">
                {matchStructure.secondRound.map((matchInfo, index) => (
                  <div key={index} className="glass-card border-2 border-white/20">
                    <div className="p-4">
                      <div className="text-center">
                        <div className="font-bold text-white text-lg mb-2">
                          {matchInfo.label}
                        </div>
                        <div className="text-white/70 text-sm">
                          {matchInfo.dependency === 'winners' 
                            ? "Gagnants du 1er tour"
                            : "Perdants du 1er tour"
                          }
                        </div>
                        <div className="mt-2 text-white/50">
                          À déterminer selon les résultats
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troisième tour (barrage) pour poules de 4 */}
          {poolTeams.length === 4 && matchStructure.thirdRound && (
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Match de barrage</h4>
              <div className="glass-card border-2 border-orange-400/40 bg-orange-500/10">
                <div className="p-4">
                  <div className="text-center">
                    <div className="font-bold text-white text-lg mb-2">
                      Match de barrage
                    </div>
                    <div className="text-orange-200 text-sm">
                      Si deux équipes ont 1 victoire chacune
                    </div>
                    <div className="mt-2 text-white/50">
                      À jouer si nécessaire
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classement actuel */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Classement provisoire</h4>
            <div className="space-y-2">
              {stats.map((stat, index) => (
                <div key={stat.team.id} className="glass-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{stat.team.name}</div>
                        <div className="text-xs text-white/70">
                          {stat.team.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">{stat.wins}V - {stat.losses}D</div>
                      <div className="text-white/70 text-xs">+{stat.performance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}