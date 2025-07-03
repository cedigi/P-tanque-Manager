import React from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin } from 'lucide-react';

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
            .pools-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .pool { border: 2px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .pool-title { font-weight: bold; font-size: 18px; margin-bottom: 15px; text-align: center; background: #f0f0f0; padding: 10px; border-radius: 4px; }
            .team { padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px; background: #f9f9f9; }
            .team-name { font-weight: bold; margin-bottom: 5px; }
            .team-players { font-size: 14px; color: #666; }
            .match { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ddd; margin: 4px 0; background: #f9f9f9; }
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
                  ${pool.teamIds.map(teamId => {
                    const team = teams.find(t => t.id === teamId);
                    return team ? `
                      <div class="team">
                        <div class="team-name">${team.name}</div>
                        <div class="team-players">${team.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}</div>
                      </div>
                    ` : '';
                  }).join('')}
                  
                  <h4>Matchs</h4>
                  ${poolMatches.map(match => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    return `
                      <div class="match">
                        <span>${team1?.name || 'Équipe 1'}</span>
                        <span>${match.completed ? `${match.team1Score} - ${match.team2Score}` : '- -'}</span>
                        <span>${team2?.name || 'Équipe 2'}</span>
                      </div>
                    `;
                  }).join('')}
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
          {/* Affichage compact des poules avec matchs intégrés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pools.map((pool) => (
              <CompactPoolCard 
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

// Composant compact pour afficher une poule avec ses matchs
interface CompactPoolCardProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  isSolo: boolean;
}

function CompactPoolCard({ pool, teams, matches, isSolo }: CompactPoolCardProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Équipe inconnue';
  };

  // Calculer les statistiques pour le classement
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
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5" />
          <span>{pool.name}</span>
        </h3>
        <div className="text-sm text-white/70 mt-1">
          {poolMatches.filter(m => m.completed).length}/{poolMatches.length} matchs joués
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Équipes de la poule */}
        <div>
          <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Équipes</h4>
          <div className="space-y-2">
            {stats.map((stat, index) => (
              <div key={stat.team.id} className="glass-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{stat.team.name}</div>
                      <div className="text-xs text-white/70">
                        {stat.team.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xs">{stat.wins}V-{stat.losses}D</div>
                    <div className="text-white/70 text-xs">+{stat.performance}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matchs de la poule */}
        <div>
          <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Matchs</h4>
          <div className="space-y-2">
            {poolMatches.map((match) => (
              <div key={match.id} className="glass-card p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex-1 text-white font-medium">
                    {getTeamName(match.team1Id)}
                  </div>
                  <div className="mx-3 text-center">
                    {match.completed ? (
                      <span className="text-white font-bold">
                        {match.team1Score} - {match.team2Score}
                      </span>
                    ) : (
                      <span className="text-white/50">- -</span>
                    )}
                  </div>
                  <div className="flex-1 text-right text-white font-medium">
                    {getTeamName(match.team2Id)}
                  </div>
                </div>
                {match.court && (
                  <div className="mt-2 text-center">
                    <span className="px-2 py-1 bg-blue-500/30 border border-blue-400 text-blue-400 rounded text-xs font-bold">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      T{match.court}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}