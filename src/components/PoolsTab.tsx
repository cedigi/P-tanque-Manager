import React, { useState } from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, Crown, X } from 'lucide-react';

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
        <div class="match-box">Finale : - - -</div>
        <div class="match-box">Petite finale : - - -</div>
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
        <div class="match-box">Finale : - - -</div>
        <div class="match-box">Perdant éliminé</div>
        <div class="match-box">Match de barrage : - - -</div>
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
          {/* Affichage des poules compactes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {pools.map((pool) => (
              <CompactPool 
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

// Composant de poule compacte avec 5 cases
interface CompactPoolProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}

function CompactPool({ pool, teams, matches, onUpdateScore }: CompactPoolProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  if (poolTeams.length === 4) {
    return <CompactFourTeamPool poolTeams={poolTeams} poolMatches={poolMatches} pool={pool} onUpdateScore={onUpdateScore} />;
  } else if (poolTeams.length === 3) {
    return <CompactThreeTeamPool poolTeams={poolTeams} poolMatches={poolMatches} pool={pool} onUpdateScore={onUpdateScore} />;
  } else {
    return (
      <div className="glass-card p-3">
        <h3 className="text-sm font-bold text-white mb-2">{pool.name}</h3>
        <p className="text-white/70 text-xs">Poule incomplète</p>
      </div>
    );
  }
}

// Composant pour poules de 4 équipes - Version compacte
function CompactFourTeamPool({ poolTeams, poolMatches, pool, onUpdateScore }: {
  poolTeams: Team[];
  poolMatches: Match[];
  pool: Pool;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}) {
  const [team1, team2, team3, team4] = poolTeams;

  // Logique des matchs (identique à avant)
  const match1vs4 = poolMatches.find(m => 
    (m.team1Id === team1.id && m.team2Id === team4.id) ||
    (m.team1Id === team4.id && m.team2Id === team1.id)
  );
  
  const match2vs3 = poolMatches.find(m => 
    (m.team1Id === team2.id && m.team2Id === team3.id) ||
    (m.team1Id === team3.id && m.team2Id === team2.id)
  );

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

  const barrageMatch = poolMatches.find(m => 
    m.round === 3 && 
    teamsWithOneWin.some(stat => stat.team.id === m.team1Id) &&
    teamsWithOneWin.some(stat => stat.team.id === m.team2Id)
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-3 py-2 border-b border-white/20 bg-white/5">
        <h3 className="text-sm font-bold text-white">{pool.name}</h3>
      </div>
      
      <div className="p-2 space-y-1">
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
          bgColor="bg-green-500/10"
          onUpdateScore={onUpdateScore}
        />

        <CompactMatchBox 
          team1={result1vs4.loser} 
          team2={result2vs3.loser} 
          match={losersMatch}
          bgColor="bg-orange-500/10"
          onUpdateScore={onUpdateScore}
        />

        <CompactMatchBox 
          team1={teamsWithOneWin[0]?.team} 
          team2={teamsWithOneWin[1]?.team} 
          match={barrageMatch}
          bgColor="bg-red-500/10"
          onUpdateScore={onUpdateScore}
          showOnlyIfNeeded={teamsWithOneWin.length === 2}
        />
      </div>
    </div>
  );
}

// Composant pour poules de 3 équipes - Version CORRIGÉE
function CompactThreeTeamPool({ poolTeams, poolMatches, pool, onUpdateScore }: {
  poolTeams: Team[];
  poolMatches: Match[];
  pool: Pool;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
}) {
  const [team1, team2, team3] = poolTeams;

  const firstRoundMatch = poolMatches.find(m => 
    m.round === 1 && !m.isBye &&
    ((m.team1Id === team1.id && m.team2Id === team2.id) ||
     (m.team1Id === team2.id && m.team2Id === team1.id))
  );

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

  const finalMatch = poolMatches.find(m => {
    if (!firstRoundResult.winner) return false;
    return m.round === 2 && !m.isBye &&
      ((m.team1Id === firstRoundResult.winner.id && m.team2Id === team3.id) ||
       (m.team1Id === team3.id && m.team2Id === firstRoundResult.winner.id));
  });

  // LOGIQUE CORRIGÉE pour le barrage dans une poule de 3
  // Calculer les statistiques de chaque équipe
  const getTeamStats = (team: Team) => {
    const teamMatches = poolMatches.filter(m => 
      m.completed && !m.isBye && (m.team1Id === team.id || m.team2Id === team.id)
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

  // Trouver les équipes avec exactement 1 victoire
  const teamsWithOneWin = allStats.filter(stat => stat.wins === 1);

  const barrageMatch = poolMatches.find(m => 
    m.round === 3 && 
    teamsWithOneWin.some(stat => stat.team.id === m.team1Id) &&
    teamsWithOneWin.some(stat => stat.team.id === m.team2Id)
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-3 py-2 border-b border-white/20 bg-white/5">
        <h3 className="text-sm font-bold text-white">{pool.name} (3)</h3>
      </div>
      
      <div className="p-2 space-y-1">
        <CompactMatchBox 
          team1={team1} 
          team2={team2} 
          match={firstRoundMatch}
          onUpdateScore={onUpdateScore}
        />
        
        <div className="glass-card p-2 bg-blue-500/10 text-center">
          <div className="text-xs font-bold text-white flex items-center justify-center space-x-1">
            <span>T-</span>
            <span>{team3.name}</span>
            <Crown className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="text-xs text-blue-400">Qualifié</div>
        </div>

        <CompactMatchBox 
          team1={firstRoundResult.winner} 
          team2={team3} 
          match={finalMatch}
          bgColor="bg-green-500/10"
          onUpdateScore={onUpdateScore}
        />

        <div className="glass-card p-2 bg-red-500/10 text-center opacity-60">
          <div className="text-xs font-bold text-white">
            T- {firstRoundResult.loser?.name || "Perdant"}
          </div>
          <div className="text-xs text-red-400">
            {teamsWithOneWin.length === 2 ? "En attente" : "Éliminé"}
          </div>
        </div>

        <CompactMatchBox 
          team1={teamsWithOneWin[0]?.team} 
          team2={teamsWithOneWin[1]?.team} 
          match={barrageMatch}
          bgColor="bg-red-500/10"
          onUpdateScore={onUpdateScore}
          showOnlyIfNeeded={teamsWithOneWin.length === 2}
        />
      </div>
    </div>
  );
}

// Modal de sélection du gagnant
interface WinnerModalProps {
  team1: Team;
  team2: Team;
  onSelectWinner: (winner: 'team1' | 'team2') => void;
  onClose: () => void;
}

function WinnerModal({ team1, team2, onSelectWinner, onClose }: WinnerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Qui a gagné ?</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelectWinner('team1')}
            className="w-full glass-button p-4 text-left hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="font-bold text-lg">{team1.name}</span>
            </div>
          </button>

          <button
            onClick={() => onSelectWinner('team2')}
            className="w-full glass-button p-4 text-left hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="font-bold text-lg">{team2.name}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant de case de match compacte CORRIGÉ - Les noms ne disparaissent plus
interface CompactMatchBoxProps {
  team1?: Team | null;
  team2?: Team | null;
  match?: Match;
  bgColor?: string;
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void;
  showOnlyIfNeeded?: boolean;
}

function CompactMatchBox({ team1, team2, match, bgColor = "bg-white/5", onUpdateScore, showOnlyIfNeeded = true }: CompactMatchBoxProps) {
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  if (showOnlyIfNeeded && (!team1 || !team2)) {
    return (
      <div className={`glass-card p-2 ${bgColor} opacity-50 text-center`}>
        <div className="text-xs text-white/60">En attente...</div>
      </div>
    );
  }

  const getWinner = () => {
    if (!match?.completed || !team1 || !team2) return null;
    
    const isTeam1First = match.team1Id === team1.id;
    const team1Score = isTeam1First ? match.team1Score! : match.team2Score!;
    const team2Score = isTeam1First ? match.team2Score! : match.team1Score!;
    
    return team1Score > team2Score ? team1 : team2;
  };

  const winner = getWinner();

  const handleQuickWin = (winnerTeam: 'team1' | 'team2') => {
    if (!match || !onUpdateScore) return;
    const winnerScore = 13;
    const loserScore = Math.floor(Math.random() * 12);
    
    if (winnerTeam === 'team1') {
      onUpdateScore(match.id, winnerScore, loserScore);
    } else {
      onUpdateScore(match.id, loserScore, winnerScore);
    }
    setShowWinnerModal(false);
  };

  // CORRECTION : Toujours afficher les noms même si pas d'équipes définies
  const displayTeam1Name = team1?.name || "En attente...";
  const displayTeam2Name = team2?.name || "En attente...";

  return (
    <>
      <div className={`glass-card p-2 ${bgColor} transition-all duration-300 relative`}>
        {/* Terrain en haut à gauche */}
        <div className="absolute top-1 left-1">
          <span className="text-xs font-bold text-blue-400">T{match?.court || '-'}</span>
        </div>

        {/* Bouton Trophée en haut à droite */}
        {match && onUpdateScore && team1 && team2 && !match.completed && (
          <div className="absolute top-1 right-1">
            <button
              onClick={() => setShowWinnerModal(true)}
              className="p-1 bg-yellow-500/80 text-white rounded hover:bg-yellow-500 transition-colors"
              title="Sélectionner le gagnant"
            >
              <Trophy className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Équipes centrées SANS SCORES mais avec couronnes - NOMS TOUJOURS VISIBLES */}
        <div className="flex items-center justify-center text-xs pt-4 pb-1">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-white truncate">
              {displayTeam1Name}
            </span>
            {winner?.id === team1?.id && (
              <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          
          <span className="mx-2 text-white/60 text-xs">vs</span>
          
          <div className="flex items-center space-x-1">
            {winner?.id === team2?.id && (
              <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
            <span className="font-bold text-white truncate">
              {displayTeam2Name}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de sélection du gagnant */}
      {showWinnerModal && team1 && team2 && (
        <WinnerModal
          team1={team1}
          team2={team2}
          onSelectWinner={handleQuickWin}
          onClose={() => setShowWinnerModal(false)}
        />
      )}
    </>
  );
}