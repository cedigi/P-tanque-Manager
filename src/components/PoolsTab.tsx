import React from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin, Edit3 } from 'lucide-react';

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
            .bracket { margin: 10px 0; }
            .match-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ddd; margin: 4px 0; background: #f9f9f9; }
            .team-name { font-weight: bold; }
            .score { font-weight: bold; text-align: center; min-width: 60px; }
            .round-title { font-weight: bold; margin: 15px 0 5px 0; color: #333; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Poules - ${tournament.name}</h1>
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
    const match1 = poolMatches.find(m => 
      (m.team1Id === team1.id && m.team2Id === team4.id) ||
      (m.team1Id === team4.id && m.team2Id === team1.id)
    );
    const match2 = poolMatches.find(m => 
      (m.team1Id === team2.id && m.team2Id === team3.id) ||
      (m.team1Id === team3.id && m.team2Id === team2.id)
    );

    return `
      <div class="bracket">
        <div class="round-title">Premier tour</div>
        <div class="match-row">
          <span class="team-name">${team1.name}</span>
          <span class="score">${match1?.completed ? `${match1.team1Id === team1.id ? match1.team1Score : match1.team2Score} - ${match1.team1Id === team1.id ? match1.team2Score : match1.team1Score}` : '- -'}</span>
          <span class="team-name">${team4.name}</span>
        </div>
        <div class="match-row">
          <span class="team-name">${team2.name}</span>
          <span class="score">${match2?.completed ? `${match2.team1Id === team2.id ? match2.team1Score : match2.team2Score} - ${match2.team1Id === team2.id ? match2.team2Score : match2.team1Score}` : '- -'}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {pools.map((pool) => (
              <AutomaticBracketPool 
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

// Composant pour le système de bracket automatique
interface AutomaticBracketPoolProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  isSolo: boolean;
}

function AutomaticBracketPool({ pool, teams, matches, isSolo }: AutomaticBracketPoolProps) {
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

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/20 bg-white/5">
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5" />
          <span>{pool.name}</span>
        </h3>
        <div className="text-sm text-white/70 mt-1">
          Système de bracket automatique
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Premier tour */}
        <div>
          <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
            🥇 Premier tour
          </h4>
          <div className="space-y-3">
            {/* Match 1 vs 4 */}
            <BracketMatchRow 
              team1={team1} 
              team2={team4} 
              match={match1vs4}
              label="Match 1"
            />
            
            {/* Match 2 vs 3 */}
            <BracketMatchRow 
              team1={team2} 
              team2={team3} 
              match={match2vs3}
              label="Match 2"
            />
          </div>
        </div>

        {/* Deuxième tour - Gagnants */}
        {(result1vs4.winner && result2vs3.winner) && (
          <div>
            <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider">
              🏆 Finale (Gagnants vs Gagnants)
            </h4>
            <BracketMatchRow 
              team1={result1vs4.winner} 
              team2={result2vs3.winner} 
              match={winnersMatch}
              label="Finale"
              isWinnersMatch={true}
            />
          </div>
        )}

        {/* Deuxième tour - Perdants */}
        {(result1vs4.loser && result2vs3.loser) && (
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wider">
              🥉 Petite finale (Perdants vs Perdants)
            </h4>
            <BracketMatchRow 
              team1={result1vs4.loser} 
              team2={result2vs3.loser} 
              match={losersMatch}
              label="3e place"
              isLosersMatch={true}
            />
          </div>
        )}

        {/* Match de barrage (si nécessaire) */}
        {/* TODO: Logique pour détecter si un match de barrage est nécessaire */}
      </div>
    </div>
  );
}

// Composant pour afficher une ligne de match dans le bracket
interface BracketMatchRowProps {
  team1: Team;
  team2: Team;
  match?: Match;
  label: string;
  isWinnersMatch?: boolean;
  isLosersMatch?: boolean;
}

function BracketMatchRow({ team1, team2, match, label, isWinnersMatch, isLosersMatch }: BracketMatchRowProps) {
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

  return (
    <div className={`glass-card p-4 ${
      isWinnersMatch ? 'border-green-400/40 bg-green-500/10' :
      isLosersMatch ? 'border-red-400/40 bg-red-500/10' :
      'border-white/20'
    }`}>
      <div className="flex items-center justify-between">
        {/* Équipe 1 */}
        <div className={`flex-1 text-center p-3 rounded-lg ${
          winner === team1.id ? 'bg-green-500/20 border border-green-400' : 'bg-white/5'
        }`}>
          <div className="font-bold text-white">{team1.name}</div>
          <div className="text-xs text-white/70 mt-1">
            {team1.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
          </div>
        </div>

        {/* Score central */}
        <div className="mx-4 text-center">
          <div className="text-2xl font-bold text-white">
            {getTeamScore(team1)} - {getTeamScore(team2)}
          </div>
          <div className="text-xs text-white/60 mt-1">{label}</div>
          {match?.court && (
            <div className="mt-1">
              <span className="px-2 py-1 bg-blue-500/30 border border-blue-400 text-blue-400 rounded text-xs font-bold">
                <MapPin className="w-3 h-3 inline mr-1" />
                T{match.court}
              </span>
            </div>
          )}
        </div>

        {/* Équipe 2 */}
        <div className={`flex-1 text-center p-3 rounded-lg ${
          winner === team2.id ? 'bg-green-500/20 border border-green-400' : 'bg-white/5'
        }`}>
          <div className="font-bold text-white">{team2.name}</div>
          <div className="text-xs text-white/70 mt-1">
            {team2.players.map(p => `${p.label ? `[${p.label}] ` : ''}${p.name}`).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}