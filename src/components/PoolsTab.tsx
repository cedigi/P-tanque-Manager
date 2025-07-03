import React, { useState } from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin, Edit3, Crown, Medal, Target, Zap } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools, onUpdateScore }: PoolsTabProps) {
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
            .pools-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; }
            .pool { border: 2px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .pool-title { font-weight: bold; font-size: 18px; margin-bottom: 15px; text-align: center; background: #f0f0f0; padding: 10px; border-radius: 4px; }
            .bracket-section { margin: 15px 0; }
            .section-title { font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .match-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; margin: 5px 0; background: #f9f9f9; border-radius: 4px; }
            .team-name { font-weight: bold; flex: 1; }
            .score { font-weight: bold; text-align: center; min-width: 80px; font-size: 16px; }
            .winner { background: #d4edda; border-color: #c3e6cb; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Brackets des Poules - ${tournament.name}</h1>
          <div class="pools-container">
            ${pools.map(pool => {
              const poolMatches = tournament.matches.filter(m => m.poolId === pool.id);
              const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
              
              return `
                <div class="pool">
                  <div class="pool-title">${pool.name}</div>
                  ${generateBracketHTML(poolTeams, poolMatches)}
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

  const generateBracketHTML = (poolTeams: Team[], poolMatches: Match[]) => {
    if (poolTeams.length !== 4) return '<p>Poule incomplète</p>';

    const [team1, team2, team3, team4] = poolTeams;
    
    // Matchs du premier tour
    const match1vs4 = poolMatches.find(m => 
      (m.team1Id === team1.id && m.team2Id === team4.id) ||
      (m.team1Id === team4.id && m.team2Id === team1.id)
    );
    const match2vs3 = poolMatches.find(m => 
      (m.team1Id === team2.id && m.team2Id === team3.id) ||
      (m.team1Id === team3.id && m.team2Id === team2.id)
    );

    return `
      <div class="bracket-section">
        <div class="section-title">🥇 Premier Tour</div>
        <div class="match-row">
          <span class="team-name">${team1.name}</span>
          <span class="score">${match1vs4?.completed ? `${match1vs4.team1Id === team1.id ? match1vs4.team1Score : match1vs4.team2Score} - ${match1vs4.team1Id === team1.id ? match1vs4.team2Score : match1vs4.team1Score}` : '- - -'}</span>
          <span class="team-name">${team4.name}</span>
        </div>
        <div class="match-row">
          <span class="team-name">${team2.name}</span>
          <span class="score">${match2vs3?.completed ? `${match2vs3.team1Id === team2.id ? match2vs3.team1Score : match2vs3.team2Score} - ${match2vs3.team1Id === team2.id ? match2vs3.team2Score : match2vs3.team1Score}` : '- - -'}</span>
          <span class="team-name">${team3.name}</span>
        </div>
      </div>
    `;
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
          {/* Affichage des poules avec système de bracket automatique */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {pools.map((pool) => (
              <AutomaticBracketPool 
                key={pool.id} 
                pool={pool} 
                teams={teams} 
                matches={tournament.matches}
                onUpdateScore={onUpdateScore}
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

// Composant pour le système de bracket automatique
interface AutomaticBracketPoolProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
  isSolo: boolean;
}

function AutomaticBracketPool({ pool, teams, matches, onUpdateScore, isSolo }: AutomaticBracketPoolProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  if (poolTeams.length !== 4) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">{pool.name}</h3>
        <p className="text-white/70">Poule incomplète ({poolTeams.length}/4 équipes)</p>
      </div>
    );
  }

  const [team1, team2, team3, team4] = poolTeams;

  // Matchs du premier tour (1 vs 4, 2 vs 3)
  const match1vs4 = poolMatches.find(m => 
    (m.team1Id === team1.id && m.team2Id === team4.id) ||
    (m.team1Id === team4.id && m.team2Id === team1.id)
  );
  
  const match2vs3 = poolMatches.find(m => 
    (m.team1Id === team2.id && m.team2Id === team3.id) ||
    (m.team1Id === team3.id && m.team2Id === team2.id)
  );

  // Déterminer les gagnants et perdants automatiquement
  const getWinnerLoser = (match: Match | undefined, teamA: Team, teamB: Team) => {
    if (!match?.completed) return { winner: null, loser: null };
    
    const isTeamAFirst = match.team1Id === teamA.id;
    const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
    const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
    
    if (teamAScore > teamBScore) {
      return { winner: teamA, loser: teamB };
    } else {
      return { winner: teamB, loser: teamA };
    }
  };

  const result1vs4 = getWinnerLoser(match1vs4, team1, team4);
  const result2vs3 = getWinnerLoser(match2vs3, team2, team3);

  // Matchs du deuxième tour (automatiquement remplis)
  const winnersMatch = poolMatches.find(m => {
    if (!result1vs4.winner || !result2vs3.winner) return false;
    return (
      (m.team1Id === result1vs4.winner.id && m.team2Id === result2vs3.winner.id) ||
      (m.team1Id === result2vs3.winner.id && m.team2Id === result1vs4.winner.id)
    );
  });

  const losersMatch = poolMatches.find(m => {
    if (!result1vs4.loser || !result2vs3.loser) return false;
    return (
      (m.team1Id === result1vs4.loser.id && m.team2Id === result2vs3.loser.id) ||
      (m.team1Id === result2vs3.loser.id && m.team2Id === result1vs4.loser.id)
    );
  });

  // Déterminer qui a besoin d'un match de barrage
  const getTeamStats = (team: Team) => {
    const teamMatches = poolMatches.filter(m => 
      m.completed && (
        m.team1Id === team.id || m.team2Id === team.id
      )
    );

    let wins = 0;
    teamMatches.forEach(match => {
      const isTeam1 = match.team1Id === team.id;
      const teamScore = isTeam1 ? match.team1Score! : match.team2Score!;
      const opponentScore = isTeam1 ? match.team2Score! : match.team1Score!;
      
      if (teamScore > opponentScore) wins++;
    });

    return { wins, matches: teamMatches.length };
  };

  // Calculer les statistiques pour déterminer le barrage
  const allStats = poolTeams.map(team => ({
    team,
    ...getTeamStats(team)
  }));

  const teamsWithOneWin = allStats.filter(stat => stat.wins === 1 && stat.matches >= 2);
  const needsBarrage = teamsWithOneWin.length === 2;

  // Match de barrage
  const barrageMatch = poolMatches.find(m => 
    m.round === 3 && 
    teamsWithOneWin.some(stat => stat.team.id === m.team1Id) &&
    teamsWithOneWin.some(stat => stat.team.id === m.team2Id)
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5" />
          <span>{pool.name}</span>
        </h3>
        <div className="text-sm text-white/70 mt-1 flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Bracket automatique • 4 équipes</span>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Premier tour */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-bold text-white tracking-wide">
              Premier Tour
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Match 1 vs 4 */}
            <BracketMatchCard 
              team1={team1} 
              team2={team4} 
              match={match1vs4}
              label="Match 1"
              onUpdateScore={onUpdateScore}
            />
            
            {/* Match 2 vs 3 */}
            <BracketMatchCard 
              team1={team2} 
              team2={team3} 
              match={match2vs3}
              label="Match 2"
              onUpdateScore={onUpdateScore}
            />
          </div>
        </div>

        {/* Deuxième tour - Gagnants */}
        {(result1vs4.winner && result2vs3.winner) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-bold text-green-400 tracking-wide">
                🏆 Finale (Gagnants vs Gagnants)
              </h4>
              {winnersMatch && (
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-green-500/20 border border-green-400 text-green-400 rounded text-xs font-bold">
                    AUTO-GÉNÉRÉ
                  </span>
                </div>
              )}
            </div>
            
            <BracketMatchCard 
              team1={result1vs4.winner} 
              team2={result2vs3.winner} 
              match={winnersMatch}
              label="Finale"
              isWinnersMatch={true}
              onUpdateScore={onUpdateScore}
            />
          </div>
        )}

        {/* Deuxième tour - Perdants */}
        {(result1vs4.loser && result2vs3.loser) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Medal className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold text-orange-400 tracking-wide">
                🥉 Petite Finale (Perdants vs Perdants)
              </h4>
              {losersMatch && (
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-orange-500/20 border border-orange-400 text-orange-400 rounded text-xs font-bold">
                    AUTO-GÉNÉRÉ
                  </span>
                </div>
              )}
            </div>
            
            <BracketMatchCard 
              team1={result1vs4.loser} 
              team2={result2vs3.loser} 
              match={losersMatch}
              label="3e place"
              isLosersMatch={true}
              onUpdateScore={onUpdateScore}
            />
          </div>
        )}

        {/* Match de barrage */}
        {needsBarrage && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-red-400" />
              <h4 className="text-lg font-bold text-red-400 tracking-wide">
                ⚔️ Match de Barrage (1 victoire chacun)
              </h4>
              {barrageMatch && (
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-red-500/20 border border-red-400 text-red-400 rounded text-xs font-bold">
                    AUTO-GÉNÉRÉ
                  </span>
                </div>
              )}
            </div>
            
            {barrageMatch ? (
              <BracketMatchCard 
                team1={teamsWithOneWin[0].team} 
                team2={teamsWithOneWin[1].team} 
                match={barrageMatch}
                label="Barrage"
                isBarrageMatch={true}
                onUpdateScore={onUpdateScore}
              />
            ) : (
              <div className="glass-card p-4 bg-red-500/10 border-red-400/40">
                <div className="text-center">
                  <div className="text-white font-bold mb-2">
                    {teamsWithOneWin[0].team.name} vs {teamsWithOneWin[1].team.name}
                  </div>
                  <div className="text-sm text-white/70">
                    Match de barrage sera généré automatiquement
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Résumé des victoires */}
        <div className="glass-card p-4 bg-white/5">
          <h5 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
            📊 Résumé des victoires
          </h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {allStats.map(stat => (
              <div key={stat.team.id} className="flex justify-between items-center">
                <span className="text-white font-medium">{stat.team.name}</span>
                <span className={`font-bold ${
                  stat.wins === 2 ? 'text-green-400' :
                  stat.wins === 1 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {stat.wins} victoire{stat.wins > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une carte de match dans le bracket
interface BracketMatchCardProps {
  team1: Team;
  team2: Team;
  match?: Match;
  label: string;
  isWinnersMatch?: boolean;
  isLosersMatch?: boolean;
  isBarrageMatch?: boolean;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}

function BracketMatchCard({ team1, team2, match, label, isWinnersMatch, isLosersMatch, isBarrageMatch, onUpdateScore }: BracketMatchCardProps) {
  const [editingScore, setEditingScore] = useState(false);
  const [scores, setScores] = useState({ team1: 0, team2: 0 });

  const getTeamScore = (team: Team) => {
    if (!match?.completed) return '-';
    const isTeam1 = match.team1Id === team.id;
    return isTeam1 ? match.team1Score : match.team2Score;
  };

  const getWinner = () => {
    if (!match?.completed) return null;
    const team1Score = getTeamScore(team1);
    const team2Score = getTeamScore(team2);
    if (team1Score > team2Score) return team1.id;
    if (team2Score > team1Score) return team2.id;
    return null;
  };

  const winner = getWinner();

  const handleEditScore = () => {
    if (!match) return;
    setScores({
      team1: match.team1Score || 0,
      team2: match.team2Score || 0
    });
    setEditingScore(true);
  };

  const handleSaveScore = () => {
    if (!match || !onUpdateScore) return;
    onUpdateScore(match.id, scores.team1, scores.team2);
    setEditingScore(false);
  };

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 ${
      isWinnersMatch ? 'border-green-400/40 bg-green-500/10' :
      isLosersMatch ? 'border-orange-400/40 bg-orange-500/10' :
      isBarrageMatch ? 'border-red-400/40 bg-red-500/10' :
      'border-white/20 hover:border-blue-400/40'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Équipe 1 */}
          <div className={`flex-1 text-center p-3 rounded-lg transition-all duration-300 ${
            winner === team1.id ? 'bg-green-500/20 border border-green-400 scale-105 shadow-lg' : 'bg-white/5'
          }`}>
            <div className="font-bold text-white text-lg">{team1.name}</div>
            <div className="text-xs text-white/70 mt-1">
              {team1.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
            </div>
            {winner === team1.id && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-green-500/30 border border-green-400 text-green-400 rounded text-xs font-bold">
                  🏆 GAGNANT
                </span>
              </div>
            )}
          </div>

          {/* Score central */}
          <div className="mx-6 text-center">
            {editingScore && match ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="13"
                    value={scores.team1}
                    onChange={(e) => setScores({ ...scores, team1: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white font-bold"
                  />
                  <span className="text-white font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    max="13"
                    value={scores.team2}
                    onChange={(e) => setScores({ ...scores, team2: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white font-bold"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveScore}
                    className="px-3 py-1 bg-green-500/80 text-white rounded text-xs font-bold hover:bg-green-500"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingScore(false)}
                    className="px-3 py-1 bg-red-500/80 text-white rounded text-xs font-bold hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {getTeamScore(team1)} - {getTeamScore(team2)}
                </div>
                <div className="text-xs text-white/60 mb-2">{label}</div>
                {match?.court && (
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-blue-500/30 border border-blue-400 text-blue-400 rounded text-xs font-bold">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      T{match.court}
                    </span>
                  </div>
                )}
                {match && onUpdateScore && (
                  <button
                    onClick={handleEditScore}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                    title="Modifier le score"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Équipe 2 */}
          <div className={`flex-1 text-center p-3 rounded-lg transition-all duration-300 ${
            winner === team2.id ? 'bg-green-500/20 border border-green-400 scale-105 shadow-lg' : 'bg-white/5'
          }`}>
            <div className="font-bold text-white text-lg">{team2.name}</div>
            <div className="text-xs text-white/70 mt-1">
              {team2.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
            </div>
            {winner === team2.id && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-green-500/30 border border-green-400 text-green-400 rounded text-xs font-bold">
                  🏆 GAGNANT
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}