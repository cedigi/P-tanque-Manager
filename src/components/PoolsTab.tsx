import React, { useState } from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, Edit3, Crown, Target } from 'lucide-react';

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
            .pools-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .pool { border: 2px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .pool-title { font-weight: bold; font-size: 18px; margin-bottom: 15px; text-align: center; background: #f0f0f0; padding: 10px; border-radius: 4px; }
            .match-box { border: 1px solid #ddd; padding: 8px; margin: 4px 0; background: #f9f9f9; border-radius: 4px; text-align: center; }
            .team-name { font-weight: bold; }
            .score { font-weight: bold; }
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
                  ${generatePoolHTML(poolTeams, poolMatches)}
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

  const generatePoolHTML = (poolTeams: Team[], poolMatches: Match[]) => {
    if (poolTeams.length === 4) {
      const [team1, team2, team3, team4] = poolTeams;
      
      const match1vs4 = poolMatches.find(m => 
        (m.team1Id === team1.id && m.team2Id === team4.id) ||
        (m.team1Id === team4.id && m.team2Id === team1.id)
      );
      const match2vs3 = poolMatches.find(m => 
        (m.team1Id === team2.id && m.team2Id === team3.id) ||
        (m.team1Id === team3.id && m.team2Id === team2.id)
      );

      return `
        <div class="match-box">T${match1vs4?.court || '-'} | ${team1.name} ${match1vs4?.completed ? `${match1vs4.team1Id === team1.id ? match1vs4.team1Score : match1vs4.team2Score} - ${match1vs4.team1Id === team1.id ? match1vs4.team2Score : match1vs4.team1Score}` : '- - -'} ${team4.name}</div>
        <div class="match-box">T${match2vs3?.court || '-'} | ${team2.name} ${match2vs3?.completed ? `${match2vs3.team1Id === team2.id ? match2vs3.team1Score : match2vs3.team2Score} - ${match2vs3.team1Id === team2.id ? match2vs3.team2Score : match2vs3.team1Score}` : '- - -'} ${team3.name}</div>
        <div class="match-box">V vs V : - - -</div>
        <div class="match-box">D vs D : - - -</div>
        <div class="match-box">Barrage : - - -</div>
      `;
    } else if (poolTeams.length === 3) {
      const [team1, team2, team3] = poolTeams;
      
      const match1vs2 = poolMatches.find(m => 
        m.round === 1 && !m.isBye &&
        ((m.team1Id === team1.id && m.team2Id === team2.id) ||
         (m.team1Id === team2.id && m.team2Id === team1.id))
      );

      return `
        <div class="match-box">T${match1vs2?.court || '-'} | ${team1.name} ${match1vs2?.completed ? `${match1vs2.team1Id === team1.id ? match1vs2.team1Score : match1vs2.team2Score} - ${match1vs2.team1Id === team1.id ? match1vs2.team2Score : match1vs2.team1Score}` : '- - -'} ${team2.name}</div>
        <div class="match-box">${team3.name} - Qualifié d'office</div>
        <div class="match-box">V vs Qualifié : - - -</div>
        <div class="match-box">Perdant éliminé</div>
        <div class="match-box">Pas de barrage</div>
      `;
    } else {
      return '<p>Poule incomplète</p>';
    }
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
          {/* Affichage des poules avec exactement 5 cases - Layout plus compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {pools.map((pool) => (
              <CompactFiveBoxPool 
                key={pool.id} 
                pool={pool} 
                teams={teams} 
                matches={tournament.matches}
                onUpdateScore={onUpdateScore}
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

// Composant compact avec exactement 5 cases qui se remplissent automatiquement
interface CompactFiveBoxPoolProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}

function CompactFiveBoxPool({ pool, teams, matches, onUpdateScore }: CompactFiveBoxPoolProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  if (poolTeams.length === 4) {
    return <FourTeamPool poolTeams={poolTeams} poolMatches={poolMatches} pool={pool} onUpdateScore={onUpdateScore} />;
  } else if (poolTeams.length === 3) {
    return <ThreeTeamPool poolTeams={poolTeams} poolMatches={poolMatches} pool={pool} onUpdateScore={onUpdateScore} />;
  } else {
    return (
      <div className="glass-card p-3 min-w-[280px]">
        <h3 className="text-sm font-bold text-white mb-2">{pool.name}</h3>
        <p className="text-white/70 text-xs">Poule incomplète ({poolTeams.length}/4 équipes)</p>
      </div>
    );
  }
}

// Composant pour poules de 4 équipes
function FourTeamPool({ poolTeams, poolMatches, pool, onUpdateScore }: {
  poolTeams: Team[];
  poolMatches: Match[];
  pool: Pool;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}) {
  const [team1, team2, team3, team4] = poolTeams;

  // Case 1 : Match 1 vs 4
  const match1vs4 = poolMatches.find(m => 
    (m.team1Id === team1.id && m.team2Id === team4.id) ||
    (m.team1Id === team4.id && m.team2Id === team1.id)
  );
  
  // Case 2 : Match 2 vs 3
  const match2vs3 = poolMatches.find(m => 
    (m.team1Id === team2.id && m.team2Id === team3.id) ||
    (m.team1Id === team3.id && m.team2Id === team2.id)
  );

  // Déterminer automatiquement les gagnants et perdants
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

  // Case 3 : Gagnants vs Gagnants
  const winnersMatch = poolMatches.find(m => {
    if (!result1vs4.winner || !result2vs3.winner) return false;
    return (
      (m.team1Id === result1vs4.winner.id && m.team2Id === result2vs3.winner.id) ||
      (m.team1Id === result2vs3.winner.id && m.team2Id === result1vs4.winner.id)
    );
  });

  // Case 4 : Perdants vs Perdants
  const losersMatch = poolMatches.find(m => {
    if (!result1vs4.loser || !result2vs3.loser) return false;
    return (
      (m.team1Id === result1vs4.loser.id && m.team2Id === result2vs3.loser.id) ||
      (m.team1Id === result2vs3.loser.id && m.team2Id === result1vs4.loser.id)
    );
  });

  // Calculer qui a besoin d'un match de barrage
  const getTeamStats = (team: Team) => {
    const teamMatches = poolMatches.filter(m => 
      m.completed && (m.team1Id === team.id || m.team2Id === team.id)
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

  const allStats = poolTeams.map(team => ({
    team,
    ...getTeamStats(team)
  }));

  const teamsWithOneWin = allStats.filter(stat => stat.wins === 1 && stat.matches >= 2);

  // Case 5 : Match de barrage
  const barrageMatch = poolMatches.find(m => 
    m.round === 3 && 
    teamsWithOneWin.some(stat => stat.team.id === m.team1Id) &&
    teamsWithOneWin.some(stat => stat.team.id === m.team2Id)
  );

  return (
    <div className="glass-card overflow-hidden min-w-[300px] max-w-[350px]">
      <div className="px-3 py-2 border-b border-white/20 bg-white/5">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
          <Grid3X3 className="w-3 h-3" />
          <span>{pool.name}</span>
        </h3>
      </div>
      
      <div className="p-3 space-y-3">
        <CompactMatchBox 
          team1={team1} 
          team2={team4} 
          match={match1vs4}
          onUpdateScore={onUpdateScore}
        />
        
        <CompactMatchBox 
          team1={team2} 
          team2={team3} 
          match={match2vs3}
          onUpdateScore={onUpdateScore}
        />

        <CompactMatchBox 
          team1={result1vs4.winner} 
          team2={result2vs3.winner} 
          match={winnersMatch}
          label="V vs V"
          bgColor="bg-green-500/10 border-green-400/30"
          onUpdateScore={onUpdateScore}
        />

        <CompactMatchBox 
          team1={result1vs4.loser} 
          team2={result2vs3.loser} 
          match={losersMatch}
          label="D vs D"
          bgColor="bg-orange-500/10 border-orange-400/30"
          onUpdateScore={onUpdateScore}
        />

        <CompactMatchBox 
          team1={teamsWithOneWin[0]?.team} 
          team2={teamsWithOneWin[1]?.team} 
          match={barrageMatch}
          label="Barrage"
          bgColor="bg-red-500/10 border-red-400/30"
          onUpdateScore={onUpdateScore}
          showOnlyIfNeeded={teamsWithOneWin.length === 2}
        />
      </div>
    </div>
  );
}

// Composant pour poules de 3 équipes
function ThreeTeamPool({ poolTeams, poolMatches, pool, onUpdateScore }: {
  poolTeams: Team[];
  poolMatches: Match[];
  pool: Pool;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}) {
  const [team1, team2, team3] = poolTeams;

  // Case 1 : Match entre team1 et team2
  const firstRoundMatch = poolMatches.find(m => 
    m.round === 1 && !m.isBye &&
    ((m.team1Id === team1.id && m.team2Id === team2.id) ||
     (m.team1Id === team2.id && m.team2Id === team1.id))
  );

  // Déterminer le gagnant et le perdant du premier match
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

  const firstRoundResult = getWinnerLoser(firstRoundMatch, team1, team2);

  // Case 3 : Match gagnant vs team3 (qualifiée d'office)
  const finalMatch = poolMatches.find(m => {
    if (!firstRoundResult.winner) return false;
    return m.round === 2 && !m.isBye &&
      ((m.team1Id === firstRoundResult.winner.id && m.team2Id === team3.id) ||
       (m.team1Id === team3.id && m.team2Id === firstRoundResult.winner.id));
  });

  return (
    <div className="glass-card overflow-hidden min-w-[300px] max-w-[350px]">
      <div className="px-3 py-2 border-b border-white/20 bg-white/5">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
          <Grid3X3 className="w-3 h-3" />
          <span>{pool.name} (3 équipes)</span>
        </h3>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Case 1 : Premier match */}
        <CompactMatchBox 
          team1={team1} 
          team2={team2} 
          match={firstRoundMatch}
          onUpdateScore={onUpdateScore}
        />
        
        {/* Case 2 : Team3 qualifiée d'office */}
        <div className="glass-card p-3 bg-blue-500/10 border-blue-400/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 text-center">
              <div className="text-xs font-bold text-blue-400">-</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-bold text-white text-sm">
                {team3.name}
              </div>
              <div className="text-xs text-blue-400 mt-1">Qualifié d'office</div>
            </div>
          </div>
        </div>

        {/* Case 3 : Gagnant vs Qualifié d'office */}
        <CompactMatchBox 
          team1={firstRoundResult.winner} 
          team2={team3} 
          match={finalMatch}
          label="V vs Qualifié"
          bgColor="bg-green-500/10 border-green-400/30"
          onUpdateScore={onUpdateScore}
        />

        {/* Case 4 : Perdant éliminé */}
        <div className="glass-card p-3 bg-red-500/10 border-red-400/30 opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-8 text-center">
              <div className="text-xs font-bold text-red-400">-</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-bold text-white text-sm">
                {firstRoundResult.loser?.name || "Perdant"}
              </div>
              <div className="text-xs text-red-400 mt-1">Éliminé</div>
            </div>
          </div>
        </div>

        {/* Case 5 : Pas de barrage */}
        <div className="glass-card p-3 bg-gray-500/10 border-gray-400/30 opacity-40">
          <div className="text-center text-white/60 text-sm">
            Pas de barrage
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant compact pour chaque case de match
interface CompactMatchBoxProps {
  team1?: Team | null;
  team2?: Team | null;
  match?: Match;
  label?: string;
  bgColor?: string;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
  showOnlyIfNeeded?: boolean;
}

function CompactMatchBox({ team1, team2, match, label, bgColor = "bg-white/5", onUpdateScore, showOnlyIfNeeded = true }: CompactMatchBoxProps) {
  const [editingScore, setEditingScore] = useState(false);
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [showWinnerSelector, setShowWinnerSelector] = useState(false);

  // Si showOnlyIfNeeded est true et qu'il n'y a pas d'équipes, ne pas afficher
  if (showOnlyIfNeeded && (!team1 || !team2)) {
    return (
      <div className={`glass-card p-3 ${bgColor} opacity-50`}>
        <div className="text-center text-white/60 text-sm">
          {label || "En attente..."}
        </div>
      </div>
    );
  }

  const getTeamScore = (team: Team | null | undefined) => {
    if (!team || !match?.completed) return '-';
    const isTeam1 = match.team1Id === team.id;
    return isTeam1 ? match.team1Score : match.team2Score;
  };

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

  const handleQuickWin = (winnerTeam: 'team1' | 'team2') => {
    if (!match || !onUpdateScore) return;
    const winnerScore = 13;
    const loserScore = Math.floor(Math.random() * 12); // Score aléatoire entre 0 et 11
    
    if (winnerTeam === 'team1') {
      onUpdateScore(match.id, winnerScore, loserScore);
    } else {
      onUpdateScore(match.id, loserScore, winnerScore);
    }
    setShowWinnerSelector(false);
  };

  return (
    <div className={`glass-card p-3 ${bgColor} transition-all duration-300`}>
      {/* Ligne 1: Terrain */}
      <div className="flex items-center justify-center mb-2">
        <div className="text-sm font-bold text-blue-400">
          Terrain {match?.court ? match.court : '-'}
        </div>
      </div>

      {/* Ligne 2: Équipes et score */}
      <div className="flex items-center justify-between mb-3">
        {/* Équipe 1 */}
        <div className="flex-1 text-left">
          <div className="font-bold text-white text-sm truncate">
            {team1?.name || "..."}
          </div>
        </div>

        {/* Score central */}
        <div className="mx-3 text-center min-w-[80px]">
          {editingScore && match ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                max="13"
                value={scores.team1}
                onChange={(e) => setScores({ ...scores, team1: Number(e.target.value) })}
                className="w-8 px-1 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm font-bold"
              />
              <span className="text-white text-sm">-</span>
              <input
                type="number"
                min="0"
                max="13"
                value={scores.team2}
                onChange={(e) => setScores({ ...scores, team2: Number(e.target.value) })}
                className="w-8 px-1 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm font-bold"
              />
            </div>
          ) : (
            <div className="text-lg font-bold text-white">
              {getTeamScore(team1)} - {getTeamScore(team2)}
            </div>
          )}
          {label && (
            <div className="text-xs text-white/60 mt-1">{label}</div>
          )}
        </div>

        {/* Équipe 2 */}
        <div className="flex-1 text-right">
          <div className="font-bold text-white text-sm truncate">
            {team2?.name || "..."}
          </div>
        </div>
      </div>

      {/* Ligne 3: Boutons d'action */}
      {match && onUpdateScore && team1 && team2 && (
        <div className="flex justify-center space-x-2">
          {editingScore ? (
            <>
              <button
                onClick={handleSaveScore}
                className="px-3 py-1 bg-green-500/80 text-white rounded text-sm font-bold hover:bg-green-500 transition-colors"
              >
                ✓ Valider
              </button>
              <button
                onClick={() => setEditingScore(false)}
                className="px-3 py-1 bg-red-500/80 text-white rounded text-sm font-bold hover:bg-red-500 transition-colors"
              >
                ✕ Annuler
              </button>
            </>
          ) : showWinnerSelector ? (
            <>
              <button
                onClick={() => handleQuickWin('team1')}
                className="px-3 py-1 bg-green-500/80 text-white rounded text-sm font-bold hover:bg-green-500 transition-colors flex items-center space-x-1"
                title={`${team1.name} gagne`}
              >
                <Crown className="w-3 h-3" />
                <span>{team1.name.substring(0, 6)}...</span>
              </button>
              <button
                onClick={() => handleQuickWin('team2')}
                className="px-3 py-1 bg-green-500/80 text-white rounded text-sm font-bold hover:bg-green-500 transition-colors flex items-center space-x-1"
                title={`${team2.name} gagne`}
              >
                <Crown className="w-3 h-3" />
                <span>{team2.name.substring(0, 6)}...</span>
              </button>
              <button
                onClick={() => setShowWinnerSelector(false)}
                className="px-2 py-1 bg-red-500/80 text-white rounded text-sm font-bold hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditScore}
                className="px-3 py-1 bg-blue-500/80 text-white rounded text-sm font-bold hover:bg-blue-500 transition-colors flex items-center space-x-1"
                title="Modifier le score"
              >
                <Edit3 className="w-3 h-3" />
                <span>Score</span>
              </button>
              <button
                onClick={() => setShowWinnerSelector(true)}
                className="px-3 py-1 bg-yellow-500/80 text-white rounded text-sm font-bold hover:bg-yellow-500 transition-colors flex items-center space-x-1"
                title="Définir le gagnant rapidement"
              >
                <Target className="w-3 h-3" />
                <span>Gagnant</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}