import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Pool, Team, Tournament } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin, Crown, Zap, Star, Check, Edit3, Target, Award } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
}

interface MatchResult {
  poolId: string;
  matchId: string;
  winnerId: string;
  loserId: string;
  phase: number;
}

interface EliminationMatch {
  id: string;
  team1: Team | null;
  team2: Team | null;
  winner: string | null;
  phase: string;
  description: string;
  round: number;
}

interface EliminationPhase {
  name: string;
  matches: EliminationMatch[];
  round: number;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools }: PoolsTabProps) {
  const isSolo = tournament.type === 'melee' || tournament.type === 'tete-a-tete';
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [eliminationResults, setEliminationResults] = useState<{[matchId: string]: string}>({});

  // Fonction pour enregistrer le résultat d'un match
  const recordMatchResult = useCallback((poolId: string, matchId: string, winnerId: string, loserId: string, phase: number) => {
    setMatchResults(prev => {
      const filtered = prev.filter(r => r.matchId !== matchId);
      return [...filtered, { poolId, matchId, winnerId, loserId, phase }];
    });
  }, []);

  // Fonction pour enregistrer le résultat d'un match d'élimination
  const recordEliminationResult = useCallback((matchId: string, winnerId: string) => {
    setEliminationResults(prev => ({
      ...prev,
      [matchId]: winnerId
    }));
  }, []);

  // Fonction pour obtenir le gagnant d'un match
  const getMatchWinner = useCallback((matchId: string): string | null => {
    const result = matchResults.find(r => r.matchId === matchId);
    return result?.winnerId || null;
  }, [matchResults]);

  // Fonction pour obtenir le perdant d'un match
  const getMatchLoser = useCallback((matchId: string): string | null => {
    const result = matchResults.find(r => r.matchId === matchId);
    return result?.loserId || null;
  }, [matchResults]);

  // Obtenir les équipes qualifiées de chaque poule
  const getQualifiedTeams = useMemo((): Team[] => {
    const qualified: Team[] = [];
    
    pools.forEach(pool => {
      const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
      const phases = generateTournamentPhases(pool, poolTeams, getMatchWinner, getMatchLoser, teams);
      
      if (poolTeams.length === 3) {
        // Pour une poule de 3 : le gagnant de la finale (Phase 2) + le gagnant du barrage (Phase 3)
        const finaleMatch = phases.phase2[0];
        const barrageMatch = phases.phase3[0];
        
        if (finaleMatch) {
          const winner = getMatchWinner(finaleMatch.id);
          if (winner) {
            const winnerTeam = teams.find(t => t.id === winner);
            if (winnerTeam) qualified.push(winnerTeam);
          }
        }
        
        if (barrageMatch) {
          const barrageWinner = getMatchWinner(barrageMatch.id);
          if (barrageWinner) {
            const team = teams.find(t => t.id === barrageWinner);
            if (team) qualified.push(team);
          }
        }
      } else if (poolTeams.length === 4) {
        // Pour une poule de 4 : l'équipe avec 2 victoires + le gagnant du barrage
        const winnersMatch = phases.phase2.find(m => m.type === 'match-gagnants');
        const barrageMatch = phases.phase3[0];
        
        if (winnersMatch) {
          const directQualified = getMatchWinner(winnersMatch.id);
          if (directQualified) {
            const team = teams.find(t => t.id === directQualified);
            if (team) qualified.push(team);
          }
        }
        
        if (barrageMatch) {
          const barrageWinner = getMatchWinner(barrageMatch.id);
          if (barrageWinner) {
            const team = teams.find(t => t.id === barrageWinner);
            if (team) qualified.push(team);
          }
        }
      }
    });
    
    return qualified;
  }, [pools, teams, getMatchWinner, getMatchLoser]);

  // Calculer les phases d'élimination dynamiquement
  const calculateEliminationPhases = useMemo(() => (qualifiedCount: number): string[] => {
    if (qualifiedCount <= 2) return ['finale'];
    if (qualifiedCount <= 4) return ['demi-finale', 'finale'];
    if (qualifiedCount <= 8) return ['quart-de-finale', 'demi-finale', 'finale'];
    if (qualifiedCount <= 16) return ['8eme-de-finale', 'quart-de-finale', 'demi-finale', 'finale'];
    if (qualifiedCount <= 32) return ['16eme-de-finale', '8eme-de-finale', 'quart-de-finale', 'demi-finale', 'finale'];
    if (qualifiedCount <= 64) return ['32eme-de-finale', '16eme-de-finale', '8eme-de-finale', 'quart-de-finale', 'demi-finale', 'finale'];
    
    // Pour plus de 64 équipes, on continue la progression
    const phases = ['finale', 'demi-finale', 'quart-de-finale', '8eme-de-finale', '16eme-de-finale', '32eme-de-finale'];
    let currentSize = 64;
    
    while (currentSize < qualifiedCount) {
      currentSize *= 2;
      const phaseName = `${currentSize}eme-de-finale`;
      phases.push(phaseName);
    }
    
    return phases.reverse();
  }, []);

  // Générer les matchs d'élimination dynamiquement (version pure)
  const generateEliminationMatchesPure = useMemo(() => {
    const qualifiedTeams = getQualifiedTeams;
    const totalQualified = pools.length * 2; // 2 qualifiés par poule
    const phaseNames = calculateEliminationPhases(totalQualified);
    
    const phases: EliminationPhase[] = [];
    const byeWinners: {[matchId: string]: string} = {};
    let currentTeams = [...qualifiedTeams];
    
    // Compléter avec des équipes vides si nécessaire
    while (currentTeams.length < totalQualified) {
      currentTeams.push(null as any);
    }

    phaseNames.forEach((phaseName, phaseIndex) => {
      const isFirstPhase = phaseIndex === 0;
      const matchCount = Math.ceil(currentTeams.length / 2);
      const matches: EliminationMatch[] = [];

      for (let i = 0; i < matchCount; i++) {
        const team1Index = i * 2;
        const team2Index = i * 2 + 1;
        
        let team1: Team | null = null;
        let team2: Team | null = null;

        if (isFirstPhase) {
          // Première phase : utiliser les équipes qualifiées
          team1 = currentTeams[team1Index] || null;
          team2 = currentTeams[team2Index] || null;
        } else {
          // Phases suivantes : utiliser les gagnants de la phase précédente
          const prevPhase = phases[phaseIndex - 1];
          const prevMatch1 = prevPhase.matches[team1Index / 2];
          const prevMatch2 = prevPhase.matches[team2Index / 2];
          
          if (prevMatch1?.winner) {
            team1 = teams.find(t => t.id === prevMatch1.winner) || null;
          }
          if (prevMatch2?.winner) {
            team2 = teams.find(t => t.id === prevMatch2.winner) || null;
          }
        }

        const matchId = `${phaseName}-match-${i + 1}`;
        
        // Gestion des BYE automatiques
        let winner = eliminationResults[matchId] || null;
        if (team1 && !team2) {
          // Team1 passe automatiquement
          winner = team1.id;
          byeWinners[matchId] = team1.id;
        } else if (!team1 && team2) {
          // Team2 passe automatiquement
          winner = team2.id;
          byeWinners[matchId] = team2.id;
        }

        matches.push({
          id: matchId,
          team1,
          team2,
          winner,
          phase: phaseName,
          description: `${getPhaseDisplayName(phaseName)} - Match ${i + 1}`,
          round: phaseIndex + 1
        });
      }

      phases.push({
        name: phaseName,
        matches,
        round: phaseIndex + 1
      });

      // Préparer les équipes pour la phase suivante
      currentTeams = matches.map(match => {
        if (match.winner) {
          return teams.find(t => t.id === match.winner) || null;
        }
        return null;
      }).filter(Boolean) as Team[];
    });

    return { phases, byeWinners };
  }, [getQualifiedTeams, pools.length, calculateEliminationPhases, teams, eliminationResults]);

  // Effect to handle BYE winners
  useEffect(() => {
    const { byeWinners } = generateEliminationMatchesPure;
    if (Object.keys(byeWinners).length > 0) {
      setEliminationResults(prev => {
        const newResults = { ...prev };
        let hasChanges = false;
        
        Object.entries(byeWinners).forEach(([matchId, winnerId]) => {
          if (!newResults[matchId]) {
            newResults[matchId] = winnerId;
            hasChanges = true;
          }
        });
        
        return hasChanges ? newResults : prev;
      });
    }
  }, [generateEliminationMatchesPure]);

  // Obtenir le nom d'affichage d'une phase
  const getPhaseDisplayName = useCallback((phaseName: string): string => {
    const phaseNames: { [key: string]: string } = {
      '128eme-de-finale': '128èmes de finale',
      '64eme-de-finale': '64èmes de finale',
      '32eme-de-finale': '32èmes de finale',
      '16eme-de-finale': '16èmes de finale',
      '8eme-de-finale': '8èmes de finale',
      'quart-de-finale': 'Quarts de finale',
      'demi-finale': 'Demi-finales',
      'finale': 'Finale'
    };
    return phaseNames[phaseName] || phaseName;
  }, []);

  // Générer les phases du tournoi pour chaque poule avec progression automatique (version pure)
  const generateTournamentPhases = useCallback((
    pool: Pool, 
    poolTeams: Team[], 
    getMatchWinner: (matchId: string) => string | null,
    getMatchLoser: (matchId: string) => string | null,
    teams: Team[]
  ) => {
    if (poolTeams.length < 3) return { phase1: [], phase2: [], phase3: [] };

    // Poule de 3 équipes
    if (poolTeams.length === 3) {
      const phase1Match = `phase1-match-${pool.id}`;
      const phase1 = [
        {
          id: `phase1-bye-${pool.id}`,
          team1: poolTeams[0]!,
          team2: null,
          type: 'bye-automatique' as const,
          description: 'BYE automatique'
        },
        {
          id: phase1Match,
          team1: poolTeams[1]!,
          team2: poolTeams[2]!,
          type: 'premier-match' as const,
          description: 'Match unique'
        }
      ];

      const phase1Winner = getMatchWinner(phase1Match);
      const phase1Loser = getMatchLoser(phase1Match);
      const winnerTeam = phase1Winner ? teams.find(t => t.id === phase1Winner) : null;
      
      const phase2MatchId = `phase2-finale-${pool.id}`;
      const phase2 = [
        {
          id: phase2MatchId,
          team1: poolTeams[0]!,
          team2: winnerTeam || { name: 'Gagnant du match', players: [] } as Team,
          type: 'finale-poule-3' as const,
          description: 'Finale de poule',
          canPlay: !!phase1Winner
        }
      ];

      // Phase 3 : Match de barrage entre le perdant de la finale et le perdant de la phase 1
      const phase2Loser = getMatchLoser(phase2MatchId);
      const phase1LoserTeam = phase1Loser ? teams.find(t => t.id === phase1Loser) : null;
      const phase2LoserTeam = phase2Loser ? teams.find(t => t.id === phase2Loser) : null;

      const phase3 = [{
        id: `phase3-barrage-${pool.id}`,
        team1: phase1LoserTeam || { name: 'Perdant Phase 1', players: [] } as Team,
        team2: phase2LoserTeam || { name: 'Perdant finale', players: [] } as Team,
        type: 'match-barrage-3' as const,
        description: 'Match de barrage',
        canPlay: !!(phase1Loser && phase2Loser)
      }];

      return { phase1, phase2, phase3 };
    }

    // Poule de 4 équipes
    if (poolTeams.length === 4) {
      const match1Id = `phase1-match1-${pool.id}`;
      const match2Id = `phase1-match2-${pool.id}`;
      
      const phase1 = [
        {
          id: match1Id,
          team1: poolTeams[0]!,
          team2: poolTeams[2]!,
          type: 'premier-match' as const,
          description: 'Match 1'
        },
        {
          id: match2Id,
          team1: poolTeams[1]!,
          team2: poolTeams[3]!,
          type: 'premier-match' as const,
          description: 'Match 2'
        }
      ];

      const match1Winner = getMatchWinner(match1Id);
      const match1Loser = getMatchLoser(match1Id);
      const match2Winner = getMatchWinner(match2Id);
      const match2Loser = getMatchLoser(match2Id);

      const winnerTeam1 = match1Winner ? teams.find(t => t.id === match1Winner) : null;
      const winnerTeam2 = match2Winner ? teams.find(t => t.id === match2Winner) : null;
      const loserTeam1 = match1Loser ? teams.find(t => t.id === match1Loser) : null;
      const loserTeam2 = match2Loser ? teams.find(t => t.id === match2Loser) : null;

      const winnersMatchId = `phase2-winners-${pool.id}`;
      const losersMatchId = `phase2-losers-${pool.id}`;

      const phase2 = [
        {
          id: winnersMatchId,
          team1: winnerTeam1 || { name: 'Gagnant Match 1', players: [] } as Team,
          team2: winnerTeam2 || { name: 'Gagnant Match 2', players: [] } as Team,
          type: 'match-gagnants' as const,
          description: 'Match des gagnants',
          canPlay: !!(match1Winner && match2Winner)
        },
        {
          id: losersMatchId,
          team1: loserTeam1 || { name: 'Perdant Match 1', players: [] } as Team,
          team2: loserTeam2 || { name: 'Perdant Match 2', players: [] } as Team,
          type: 'match-perdants' as const,
          description: 'Match des perdants',
          canPlay: !!(match1Loser && match2Loser)
        }
      ];

      const winnersWinner = getMatchWinner(winnersMatchId);
      const winnersLoser = getMatchLoser(winnersMatchId);
      const losersWinner = getMatchWinner(losersMatchId);

      const winnersLoserTeam = winnersLoser ? teams.find(t => t.id === winnersLoser) : null;
      const losersWinnerTeam = losersWinner ? teams.find(t => t.id === losersWinner) : null;

      const phase3 = [{
        id: `phase3-barrage-${pool.id}`,
        team1: losersWinnerTeam || { name: 'Gagnant match perdants', players: [] } as Team,
        team2: winnersLoserTeam || { name: 'Perdant match gagnants', players: [] } as Team,
        type: 'match-barrage' as const,
        description: 'Match de barrage',
        canPlay: !!(losersWinner && winnersLoser)
      }];

      return { phase1, phase2, phase3 };
    }

    return { phase1: [], phase2: [], phase3: [] };
  }, []);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const eliminationPhases = generateEliminationMatchesPure.phases;
    const qualifiedTeams = getQualifiedTeams;
    const totalQualified = pools.length * 2;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournoi Complet - ${tournament.name}</title>
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
            .section {
              margin-bottom: 40px;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .section-header { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 15px 20px;
              text-align: center;
              font-weight: bold; 
              font-size: 20px;
            }
            .pools-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              padding: 20px;
            }
            .pool-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .pool-header {
              background: #f3f4f6;
              padding: 10px;
              font-weight: bold;
              text-align: center;
            }
            .elimination-section {
              padding: 20px;
            }
            .phase-section {
              margin-bottom: 30px;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
            }
            .phase-header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 12px 20px;
              font-weight: bold;
              text-align: center;
            }
            .matches-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              padding: 20px;
            }
            .match-card {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .final-card {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: white;
            }
            .team-name {
              font-weight: bold;
              margin: 5px 0;
            }
            .winner-badge {
              background: #10b981;
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              margin-left: 5px;
            }
            .bye-badge {
              background: #f59e0b;
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
            }
            @media print { 
              body { margin: 0; background: white; } 
            }
          </style>
        </head>
        <body>
          <h1>🏆 Tournoi Complet - ${tournament.name}</h1>
          
          <div class="section">
            <div class="section-header">Phase de Poules</div>
            <div class="pools-grid">
              ${pools.map((pool, index) => {
                const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
                return `
                  <div class="pool-card">
                    <div class="pool-header">Poule ${index + 1} (${poolTeams.length} équipes)</div>
                    <div style="padding: 10px;">
                      ${poolTeams.map(team => `
                        <div style="margin: 5px 0; padding: 5px; background: #f9fafb; border-radius: 4px;">
                          <strong>${team.name}</strong><br>
                          <small>${team.players.map(p => p.name).join(', ')}</small>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-header">Phase Éliminatoire (${totalQualified} qualifiés)</div>
            <div class="elimination-section">
              <h3 style="text-align: center; margin-bottom: 20px;">Équipes Qualifiées (${qualifiedTeams.length}/${totalQualified})</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 30px;">
                ${Array.from({ length: totalQualified }, (_, index) => {
                  const team = qualifiedTeams[index];
                  return `
                    <div style="background: ${team ? '#ecfdf5; border: 2px solid #10b981' : '#f3f4f6; border: 2px solid #d1d5db'}; border-radius: 8px; padding: 10px; text-align: center;">
                      ${team ? `
                        <strong>${team.name}</strong><br>
                        <small>${team.players.map(p => p.name).join(', ')}</small>
                      ` : `
                        <strong style="color: #9ca3af;">En attente</strong><br>
                        <small style="color: #9ca3af;">Qualification #${index + 1}</small>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>

              ${eliminationPhases.map(phase => `
                <div class="phase-section">
                  <div class="phase-header">
                    ${getPhaseDisplayName(phase.name)} (${phase.matches.length} match${phase.matches.length > 1 ? 's' : ''})
                  </div>
                  <div class="matches-grid">
                    ${phase.matches.map(match => `
                      <div class="match-card ${phase.name === 'finale' ? 'final-card' : ''}">
                        <h4>${match.description}</h4>
                        <div class="team-name">
                          ${match.team1?.name || 'En attente'}
                          ${match.winner === match.team1?.id ? '<span class="winner-badge">GAGNANT</span>' : ''}
                          ${match.team1 && !match.team2 ? '<span class="bye-badge">BYE</span>' : ''}
                        </div>
                        <div style="margin: 10px 0; font-weight: bold;">VS</div>
                        <div class="team-name">
                          ${match.team2?.name || 'En attente'}
                          ${match.winner === match.team2?.id ? '<span class="winner-badge">GAGNANT</span>' : ''}
                          ${!match.team1 && match.team2 ? '<span class="bye-badge">BYE</span>' : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const eliminationPhases = generateEliminationMatchesPure.phases;
  const qualifiedTeams = getQualifiedTeams;
  const totalQualified = pools.length * 2;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-wider">Tournoi Complet</h2>
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
          {/* Phase de Poules - Version Compacte */}
          <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/80 to-blue-700/80 backdrop-filter backdrop-blur-10 px-6 py-4 border-b border-white/20">
              <div className="flex items-center justify-center space-x-3">
                <Grid3X3 className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white tracking-wide">Phase de Poules</h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                  {pools.length} poule{pools.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pools.map((pool, index) => {
                  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
                  const phases = generateTournamentPhases(pool, poolTeams, getMatchWinner, getMatchLoser, teams);
                  
                  return (
                    <div key={pool.id} className="glass-card p-4">
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-bold text-white">Poule {index + 1}</h4>
                        <p className="text-white/70 text-sm">{poolTeams.length} équipes • 2 terrains</p>
                      </div>

                      {/* Phase 1 Compacte */}
                      {phases.phase1.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-bold text-white/90 mb-2 text-center">Phase 1</h5>
                          <div className="space-y-2">
                            {phases.phase1.map((match, index) => (
                              <CompactMatchCard
                                key={match.id}
                                match={match}
                                courtNumber={match.type === 'bye-automatique' ? 'BYE' : `T${index + 1}`}
                                winner={getMatchWinner(match.id)}
                                onSelectWinner={(winnerId, loserId) => recordMatchResult(pool.id, match.id, winnerId, loserId, 1)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Phase 2 Compacte */}
                      {phases.phase2.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-bold text-white/90 mb-2 text-center">Phase 2</h5>
                          <div className="space-y-2">
                            {phases.phase2.map((match, index) => (
                              <CompactMatchCard
                                key={match.id}
                                match={match}
                                courtNumber={`T${(index % 2) + 1}`}
                                winner={getMatchWinner(match.id)}
                                onSelectWinner={(winnerId, loserId) => recordMatchResult(pool.id, match.id, winnerId, loserId, 2)}
                                disabled={!match.canPlay}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Phase 3 Compacte */}
                      {phases.phase3.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-white/90 mb-2 text-center">Phase 3 - Barrage</h5>
                          <div className="space-y-2">
                            {phases.phase3.map((match) => (
                              <CompactMatchCard
                                key={match.id}
                                match={match}
                                courtNumber="T1"
                                winner={getMatchWinner(match.id)}
                                onSelectWinner={(winnerId, loserId) => recordMatchResult(pool.id, match.id, winnerId, loserId, 3)}
                                disabled={!match.canPlay}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Phase Éliminatoire Dynamique */}
          <div className="glass-card overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
            <div className="bg-gradient-to-r from-yellow-600/80 to-orange-600/80 backdrop-filter backdrop-blur-10 px-6 py-4 border-b border-white/20">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white tracking-wide">Phase Éliminatoire</h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                  {qualifiedTeams.length}/{totalQualified} qualifiés
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Équipes Qualifiées */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-4 text-center">🌟 Équipes Qualifiées</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {Array.from({ length: totalQualified }, (_, index) => {
                    const team = qualifiedTeams[index];
                    return (
                      <div key={index} className={`glass-card p-3 text-center text-sm ${team ? 'bg-green-500/20 border-green-400/40' : 'bg-gray-500/20 border-gray-400/40'}`}>
                        {team ? (
                          <>
                            <div className="font-bold text-white">{team.name}</div>
                            <div className="mt-1">
                              <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-white/50">En attente</div>
                            <div className="text-white/30 text-xs">#{index + 1}</div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phases d'Élimination Dynamiques */}
              {eliminationPhases.map((phase, phaseIndex) => (
                <div key={phase.name} className="mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    {phase.name === 'finale' ? (
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <Target className="w-6 h-6 text-white" />
                    )}
                    <h4 className="text-xl font-bold text-white text-center">
                      {getPhaseDisplayName(phase.name)}
                    </h4>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                      {phase.matches.length} match{phase.matches.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className={`grid gap-4 ${
                    phase.name === 'finale' ? 'grid-cols-1 max-w-md mx-auto' :
                    phase.matches.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                    phase.matches.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {phase.matches.map((match, matchIndex) => (
                      <EliminationMatchCard
                        key={match.id}
                        match={match}
                        courtNumber={`T${(matchIndex % 2) + 1}`}
                        onSelectWinner={(winnerId) => recordEliminationResult(match.id, winnerId)}
                        isFinale={phase.name === 'finale'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Statistiques du Tournoi</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-blue-400">{pools.length}</div>
                <div className="text-white/70 text-sm">Poules</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-green-400">{qualifiedTeams.length}</div>
                <div className="text-white/70 text-sm">Qualifiés</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-purple-400">{matchResults.length}</div>
                <div className="text-white/70 text-sm">Matchs joués</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-orange-400">{eliminationPhases.length}</div>
                <div className="text-white/70 text-sm">Phases élim.</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-yellow-400">{eliminationPhases.reduce((acc, phase) => acc + phase.matches.length, 0)}</div>
                <div className="text-white/70 text-sm">Matchs élim.</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-white">{teams.length}</div>
                <div className="text-white/70 text-sm">Équipes</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Grid3X3 className="w-16 h-16 text-white/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
            Aucune poule générée
          </h3>
          <p className="text-white/60 text-lg font-medium">
            Générez les poules pour organiser le tournoi complet
          </p>
        </div>
      )}
    </div>
  );
}

// Composant compact pour les matchs de poules
interface CompactMatchCardProps {
  match: any;
  courtNumber: string;
  winner: string | null;
  onSelectWinner: (winnerId: string, loserId: string) => void;
  disabled?: boolean;
}

function CompactMatchCard({ match, courtNumber, winner, onSelectWinner, disabled = false }: CompactMatchCardProps) {
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);

  if (match.type === 'bye-automatique') {
    return (
      <div className="grid grid-cols-[60px_1fr] gap-3 items-center">
        <div className="bg-yellow-500 text-white rounded-lg p-2 text-center text-sm font-bold">
          BYE
        </div>
        <div className="glass-card p-3 bg-yellow-500/10 border-yellow-400/30">
          <div className="text-center">
            <div className="font-bold text-white text-sm">🌟 {match.team1.name}</div>
            <div className="text-yellow-200 text-xs">Qualifié automatiquement</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[60px_1fr_auto] gap-3 items-center">
      <div className="bg-blue-500 text-white rounded-lg p-2 text-center text-sm font-bold">
        {courtNumber}
      </div>
      <div className={`glass-card p-3 ${disabled ? 'opacity-50' : ''}`}>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-center">
          <div>
            <div className={`font-bold text-sm ${winner === match.team1.id ? 'text-green-400' : 'text-white'}`}>
              {match.team1.name}
              {winner === match.team1.id && <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />}
            </div>
          </div>
          <div className="text-white/70 text-xs font-bold">VS</div>
          <div>
            <div className={`font-bold text-sm ${winner === match.team2?.id ? 'text-green-400' : 'text-white'}`}>
              {match.team2?.name}
              {winner === match.team2?.id && <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />}
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        {!disabled && match.team2 && match.team2.players.length > 0 && (
          <>
            <button
              onClick={() => setShowWinnerSelection(true)}
              className={`p-2 rounded-lg transition-all duration-300 ${winner ? 'glass-button-secondary' : 'glass-button'}`}
              title={winner ? "Modifier le gagnant" : "Sélectionner le gagnant"}
            >
              {winner ? <Edit3 className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
            </button>
            
            {showWinnerSelection && (
              <div 
                className="fixed bg-slate-900/95 backdrop-blur-sm border border-white/30 rounded-lg p-2 shadow-2xl min-w-[120px] z-[9999]"
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '200px'
                }}
              >
                <div className="text-white font-bold mb-2 text-center text-xs">Gagnant ?</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectWinner(match.team1.id, match.team2.id);
                      setShowWinnerSelection(false);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs font-medium transition-colors"
                  >
                    {match.team1.name.length > 12 ? match.team1.name.substring(0, 12) + '...' : match.team1.name}
                  </button>
                  <button
                    onClick={() => {
                      onSelectWinner(match.team2.id, match.team1.id);
                      setShowWinnerSelection(false);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs font-medium transition-colors"
                  >
                    {match.team2.name.length > 12 ? match.team2.name.substring(0, 12) + '...' : match.team2.name}
                  </button>
                  <button
                    onClick={() => setShowWinnerSelection(false)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white p-1 rounded text-xs font-medium transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Composant pour les matchs d'élimination
interface EliminationMatchCardProps {
  match: EliminationMatch;
  courtNumber: string;
  onSelectWinner: (winnerId: string) => void;
  isFinale?: boolean;
}

function EliminationMatchCard({ match, courtNumber, onSelectWinner, isFinale = false }: EliminationMatchCardProps) {
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);

  const canPlay = match.team1 && match.team2;
  const isBye = (match.team1 && !match.team2) || (!match.team1 && match.team2);

  return (
    <div className={`glass-card p-4 ${isFinale ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/40' : ''}`}>
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {isFinale ? <Trophy className="w-5 h-5 text-yellow-400" /> : <Target className="w-5 h-5 text-white" />}
          <h4 className="font-bold text-white text-sm">{match.description}</h4>
        </div>
        <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${isFinale ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}`}>
          {courtNumber}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        <div className="text-center">
          <div className={`font-bold text-sm ${match.winner === match.team1?.id ? 'text-green-400' : 'text-white'}`}>
            {match.team1?.name || 'En attente'}
            {match.winner === match.team1?.id && <Crown className="w-4 h-4 inline ml-1 text-yellow-400" />}
            {match.team1 && !match.team2 && <span className="ml-1 text-xs bg-yellow-500 text-white px-1 rounded">BYE</span>}
          </div>
        </div>

        <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-sm ${isFinale ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
          VS
        </div>

        <div className="text-center">
          <div className={`font-bold text-sm ${match.winner === match.team2?.id ? 'text-green-400' : 'text-white'}`}>
            {match.team2?.name || 'En attente'}
            {match.winner === match.team2?.id && <Crown className="w-4 h-4 inline ml-1 text-yellow-400" />}
            {!match.team1 && match.team2 && <span className="ml-1 text-xs bg-yellow-500 text-white px-1 rounded">BYE</span>}
          </div>
        </div>
      </div>

      {canPlay && !match.winner && (
        <div className="text-center relative">
          <button
            onClick={() => setShowWinnerSelection(true)}
            className={`px-4 py-2 text-sm ${isFinale ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'glass-button'}`}
            title="Sélectionner le gagnant"
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            {isFinale ? 'Couronner' : 'Gagnant'}
          </button>
          
          {showWinnerSelection && (
            <div 
              className="fixed bg-slate-900/95 backdrop-blur-sm border border-white/30 rounded-lg p-3 shadow-2xl min-w-[160px] z-[9999]"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                maxWidth: '250px'
              }}
            >
              <div className="text-white font-bold mb-3 text-center text-sm">
                {isFinale ? '🏆 Champion ?' : 'Gagnant ?'}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onSelectWinner(match.team1!.id);
                    setShowWinnerSelection(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  {match.team1!.name}
                </button>
                <button
                  onClick={() => {
                    onSelectWinner(match.team2!.id);
                    setShowWinnerSelection(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  {match.team2!.name}
                </button>
                <button
                  onClick={() => setShowWinnerSelection(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {match.winner && (
        <div className="text-center">
          <button
            onClick={() => setShowWinnerSelection(true)}
            className="glass-button-secondary px-4 py-2 text-sm"
            title="Modifier le gagnant"
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Modifier
          </button>
          
          {showWinnerSelection && (
            <div 
              className="fixed bg-slate-900/95 backdrop-blur-sm border border-white/30 rounded-lg p-3 shadow-2xl min-w-[160px] z-[9999]"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                maxWidth: '250px'
              }}
            >
              <div className="text-white font-bold mb-3 text-center text-sm">
                Modifier le gagnant
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onSelectWinner(match.team1!.id);
                    setShowWinnerSelection(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  {match.team1!.name}
                </button>
                <button
                  onClick={() => {
                    onSelectWinner(match.team2!.id);
                    setShowWinnerSelection(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  {match.team2!.name}
                </button>
                <button
                  onClick={() => setShowWinnerSelection(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isBye && (
        <div className="text-center">
          <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-400 px-3 py-2 rounded-lg text-sm font-bold">
            🌟 Qualifié automatiquement
          </div>
        </div>
      )}
    </div>
  );
}