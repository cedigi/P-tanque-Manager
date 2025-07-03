import React from 'react';
import { Pool, Team, Tournament } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, MapPin, Crown, Zap, Star } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools }: PoolsTabProps) {
  const isSolo = tournament.type === 'melee' || tournament.type === 'tete-a-tete';

  // Générer les phases du tournoi pour chaque poule
  const generateTournamentPhases = (pool: Pool) => {
    const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
    
    if (poolTeams.length < 3) return { phase1: [], phase2: [], phase3: [] };

    // Poule de 3 équipes
    if (poolTeams.length === 3) {
      // Phase 1: Une équipe seule (BYE automatique) et un match entre les 2 autres
      const phase1 = [
        {
          id: `phase1-bye-${pool.id}`,
          team1: poolTeams[0]!, // Équipe 1 - BYE automatique
          team2: null,
          type: 'bye-automatique' as const,
          description: 'BYE automatique'
        },
        {
          id: `phase1-match-${pool.id}`,
          team1: poolTeams[1]!, // Équipe 2
          team2: poolTeams[2]!, // Équipe 3
          type: 'premier-match' as const,
          description: 'Match unique'
        }
      ];

      // Phase 2: L'équipe en BYE joue contre le gagnant du match
      const phase2 = [
        {
          id: `phase2-finale-${pool.id}`,
          team1: poolTeams[0]!, // Équipe qui avait le BYE
          team2: { name: 'Gagnant du match', players: [] } as Team,
          type: 'finale-poule-3' as const,
          description: 'Finale de poule'
        }
      ];

      return { phase1, phase2, phase3: [] };
    }

    // Poule de 4 équipes (logique existante)
    if (poolTeams.length === 4) {
      // Phase 1: Tous les matchs simultanés (équipe 1 vs 3, équipe 2 vs 4)
      const phase1 = [
        {
          id: `phase1-match1-${pool.id}`,
          team1: poolTeams[0]!, // Équipe 1
          team2: poolTeams[2]!, // Équipe 3
          type: 'premier-match' as const,
          description: 'Match 1'
        },
        {
          id: `phase1-match2-${pool.id}`,
          team1: poolTeams[1]!, // Équipe 2
          team2: poolTeams[3]!, // Équipe 4
          type: 'premier-match' as const,
          description: 'Match 2'
        }
      ];

      // Phase 2: Gagnants vs Gagnants et Perdants vs Perdants
      const phase2 = [
        {
          id: `phase2-winners-${pool.id}`,
          team1: { name: 'Gagnant Match 1', players: [] } as Team,
          team2: { name: 'Gagnant Match 2', players: [] } as Team,
          type: 'match-gagnants' as const,
          description: 'Match des gagnants'
        },
        {
          id: `phase2-losers-${pool.id}`,
          team1: { name: 'Perdant Match 1', players: [] } as Team,
          team2: { name: 'Perdant Match 2', players: [] } as Team,
          type: 'match-perdants' as const,
          description: 'Match des perdants'
        }
      ];

      // Phase 3: Match de barrage (équipes à 1 victoire)
      const phase3 = [{
        id: `phase3-barrage-${pool.id}`,
        team1: { name: 'Gagnant match perdants', players: [] } as Team,
        team2: { name: 'Perdant match gagnants', players: [] } as Team,
        type: 'match-barrage' as const,
        description: 'Match de barrage'
      }];

      return { phase1, phase2, phase3 };
    }

    return { phase1: [], phase2: [], phase3: [] };
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'premier-match': return 'from-blue-500 to-blue-600';
      case 'match-gagnants': return 'from-green-500 to-green-600';
      case 'match-perdants': return 'from-orange-500 to-orange-600';
      case 'match-barrage': return 'from-purple-500 to-purple-600';
      case 'bye-automatique': return 'from-yellow-500 to-yellow-600';
      case 'finale-poule-3': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'premier-match': return <Users className="w-5 h-5" />;
      case 'match-gagnants': return <Crown className="w-5 h-5" />;
      case 'match-perdants': return <Users className="w-5 h-5" />;
      case 'match-barrage': return <Zap className="w-5 h-5" />;
      case 'bye-automatique': return <Star className="w-5 h-5" />;
      case 'finale-poule-3': return <Trophy className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournoi par Élimination - ${tournament.name}</title>
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
              margin-bottom: 50px;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .pool-header { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 20px;
              text-align: center;
              font-weight: bold; 
              font-size: 24px;
            }
            .phase-section {
              padding: 25px;
              border-bottom: 2px solid #e5e7eb;
            }
            .phase-section:last-child {
              border-bottom: none;
            }
            .phase-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 20px;
              text-align: center;
              padding: 10px;
              background: #f3f4f6;
              border-radius: 8px;
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
            .bye-badge {
              background: #f59e0b;
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
            .bye-card {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 12px;
              padding: 15px;
              text-align: center;
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
            .qualification-info {
              background: #ecfdf5;
              border: 2px solid #10b981;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
              text-align: center;
            }
            .qualification-title {
              font-weight: bold;
              color: #065f46;
              margin-bottom: 10px;
            }
            .qualification-text {
              color: #047857;
              font-size: 14px;
            }
            @media print { 
              body { margin: 0; background: white; } 
              .pool-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>🏆 Tournoi par Élimination - ${tournament.name}</h1>
          ${pools.map((pool, poolIndex) => {
            const phases = generateTournamentPhases(pool);
            const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
            let courtCounter = 1;
            
            return `
              <div class="pool-section">
                <div class="pool-header">${pool.name} (${poolTeams.length} équipes)</div>
                
                ${phases.phase1.length > 0 ? `
                  <div class="phase-section">
                    <div class="phase-title">
                      ${poolTeams.length === 3 ? '🌟 Phase 1 - BYE Automatique + Match' : '🎯 Phase 1 - Premiers Matchs (Simultanés)'}
                    </div>
                    <div class="matches-grid">
                      ${phases.phase1.map((match) => {
                        if (match.type === 'bye-automatique') {
                          return `
                            <div class="match-row">
                              <div class="bye-badge">BYE</div>
                              <div class="bye-card">
                                <div class="team-name">🌟 ${match.team1.name} - Qualification automatique</div>
                                <div class="team-players">${match.team1.players.map(p => p.name).join(', ')}</div>
                              </div>
                            </div>
                          `;
                        } else {
                          return `
                            <div class="match-row">
                              <div class="court-number">T${courtCounter++}</div>
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
                          `;
                        }
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${phases.phase2.length > 0 ? `
                  <div class="phase-section">
                    <div class="phase-title">
                      ${poolTeams.length === 3 ? '🏆 Phase 2 - Finale de Poule' : '⚔️ Phase 2 - Gagnants vs Gagnants / Perdants vs Perdants'}
                    </div>
                    <div class="matches-grid">
                      ${phases.phase2.map((match) => {
                        courtCounter = 1;
                        return `
                        <div class="match-row">
                          <div class="court-number">T${courtCounter++}</div>
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
                      `;}).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${phases.phase3.length > 0 ? `
                  <div class="phase-section">
                    <div class="phase-title">⚡ Phase 3 - Match de Barrage (Équipes à 1 victoire)</div>
                    <div class="matches-grid">
                      ${phases.phase3.map((match) => {
                        courtCounter = 1;
                        return `
                        <div class="match-row">
                          <div class="court-number">T${courtCounter++}</div>
                          <div class="match-card">
                            <div class="team-info">
                              <div class="team-name">${match.team1.name}</div>
                            </div>
                            <div class="vs-divider">VS</div>
                            <div class="team-info">
                              <div class="team-name">${match.team2.name}</div>
                            </div>
                          </div>
                        </div>
                      `;}).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <div class="qualification-info">
                  <div class="qualification-title">🏆 Règles de Qualification</div>
                  <div class="qualification-text">
                    ${poolTeams.length === 3 ? 
                      '• Une équipe a un BYE automatique en Phase 1<br/>• Elle joue ensuite contre le gagnant du match<br/>• Le gagnant de cette finale est qualifié pour le tour suivant' :
                      '• Le gagnant avec 2 victoires est automatiquement qualifié<br/>• Le gagnant du match de barrage (1 victoire chacun) est également qualifié<br/>• 2 équipes par poule accèdent au tour suivant<br/>• Les terrains sont réutilisés après chaque phase'
                    }
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
        <h2 className="text-3xl font-bold text-white tracking-wider">Tournoi par Élimination</h2>
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
            const phases = generateTournamentPhases(pool);
            const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
            let courtCounter = 1;
            
            return (
              <div key={pool.id} className="glass-card overflow-hidden">
                {/* En-tête de la poule */}
                <div className="bg-gradient-to-r from-blue-600/80 to-blue-700/80 backdrop-filter backdrop-blur-10 px-8 py-6 border-b border-white/20">
                  <div className="flex items-center justify-center space-x-3">
                    <Grid3X3 className="w-8 h-8 text-white" />
                    <h3 className="text-3xl font-bold text-white tracking-wide">{pool.name}</h3>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                      {poolTeams.length} équipe{poolTeams.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-center text-white/90 mt-2 font-medium">
                    {poolTeams.length === 3 ? 'Système BYE + Finale' : 'Système d\'élimination'} • 2 terrains max
                  </div>
                </div>

                {/* Phase 1 */}
                {phases.phase1.length > 0 && (
                  <div className="p-8 border-b border-white/10">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {poolTeams.length === 3 ? '🌟 Phase 1 - BYE Automatique + Match' : '🎯 Phase 1 - Premiers Matchs (Simultanés)'}
                      </h4>
                      <p className="text-white/70">
                        {poolTeams.length === 3 ? 
                          'Une équipe a un BYE automatique, les 2 autres s\'affrontent' : 
                          'Équipe 1 vs Équipe 3 et Équipe 2 vs Équipe 4'
                        }
                      </p>
                    </div>
                    <div className="space-y-4">
                      {phases.phase1.map((match) => (
                        <div key={match.id} className="grid grid-cols-[100px_1fr] gap-6 items-center">
                          {match.type === 'bye-automatique' ? (
                            <>
                              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 text-center shadow-lg">
                                <div className="flex items-center justify-center space-x-2">
                                  <Star className="w-5 h-5" />
                                  <span className="font-bold text-lg">BYE</span>
                                </div>
                              </div>
                              <div className="glass-card p-6 bg-yellow-500/10 border-yellow-400/30">
                                <div className="text-center">
                                  <div className="flex items-center justify-center space-x-2 mb-3">
                                    <Star className="w-6 h-6 text-yellow-400" />
                                    <h4 className="font-bold text-white text-xl">🌟 {match.team1.name}</h4>
                                  </div>
                                  <div className="text-yellow-200 font-bold text-lg mb-2">Qualification automatique !</div>
                                  <div className="space-y-1">
                                    {match.team1.players.map((player) => (
                                      <div key={player.id} className="text-sm text-white/80">{player.name}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={`bg-gradient-to-br ${getMatchTypeColor(match.type)} text-white rounded-xl p-4 text-center shadow-lg`}>
                                <div className="flex items-center justify-center space-x-2">
                                  <MapPin className="w-5 h-5" />
                                  <span className="font-bold text-lg">T{courtCounter++}</span>
                                </div>
                              </div>
                              <div className="glass-card p-6 bg-white/5 hover:bg-white/10 transition-all duration-300">
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                      <Users className="w-5 h-5 text-blue-400" />
                                      <h4 className="font-bold text-white text-lg">{match.team1.name}</h4>
                                    </div>
                                    <div className="space-y-1">
                                      {match.team1.players.map((player) => (
                                        <div key={player.id} className="text-sm text-white/80">{player.name}</div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg">
                                    VS
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                      <Users className="w-5 h-5 text-green-400" />
                                      <h4 className="font-bold text-white text-lg">{match.team2?.name}</h4>
                                    </div>
                                    <div className="space-y-1">
                                      {match.team2?.players.map((player) => (
                                        <div key={player.id} className="text-sm text-white/80">{player.name}</div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 2 */}
                {phases.phase2.length > 0 && (
                  <div className="p-8 border-b border-white/10">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {poolTeams.length === 3 ? '🏆 Phase 2 - Finale de Poule' : '⚔️ Phase 2 - Gagnants vs Gagnants / Perdants vs Perdants'}
                      </h4>
                      <p className="text-white/70">
                        {poolTeams.length === 3 ? 
                          'L\'équipe en BYE joue contre le gagnant du match' : 
                          'Les gagnants s\'affrontent et les perdants aussi (terrains réutilisés)'
                        }
                      </p>
                    </div>
                    <div className="space-y-4">
                      {phases.phase2.map((match, index) => {
                        const terrainNumber = poolTeams.length === 3 ? 1 : (index % 2) + 1;
                        return (
                          <div key={match.id} className="grid grid-cols-[100px_1fr] gap-6 items-center">
                            <div className={`bg-gradient-to-br ${getMatchTypeColor(match.type)} text-white rounded-xl p-4 text-center shadow-lg`}>
                              <div className="flex items-center justify-center space-x-2">
                                <MapPin className="w-5 h-5" />
                                <span className="font-bold text-lg">T{terrainNumber}</span>
                              </div>
                            </div>
                            <div className="glass-card p-6 bg-white/5 hover:bg-white/10 transition-all duration-300">
                              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                                <div className="text-center">
                                  <div className="flex items-center justify-center space-x-2 mb-3">
                                    {getMatchTypeIcon(match.type)}
                                    <h4 className="font-bold text-white text-lg">{match.team1.name}</h4>
                                  </div>
                                  {match.team1.players.length > 0 && (
                                    <div className="space-y-1">
                                      {match.team1.players.map((player) => (
                                        <div key={player.id} className="text-sm text-white/80">{player.name}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className={`bg-gradient-to-r ${getMatchTypeColor(match.type)} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg`}>
                                  VS
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center space-x-2 mb-3">
                                    {getMatchTypeIcon(match.type)}
                                    <h4 className="font-bold text-white text-lg">{match.team2.name}</h4>
                                  </div>
                                  {match.team2.players.length > 0 && (
                                    <div className="space-y-1">
                                      {match.team2.players.map((player) => (
                                        <div key={player.id} className="text-sm text-white/80">{player.name}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Phase 3 - Seulement pour les poules de 4 */}
                {phases.phase3.length > 0 && (
                  <div className="p-8 border-b border-white/10">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-white mb-2">⚡ Phase 3 - Match de Barrage</h4>
                      <p className="text-white/70">Match décisif entre les équipes à 1 victoire (terrain réutilisé)</p>
                    </div>
                    <div className="space-y-4">
                      {phases.phase3.map((match) => (
                        <div key={match.id} className="grid grid-cols-[100px_1fr] gap-6 items-center">
                          <div className={`bg-gradient-to-br ${getMatchTypeColor(match.type)} text-white rounded-xl p-4 text-center shadow-lg`}>
                            <div className="flex items-center justify-center space-x-2">
                              <MapPin className="w-5 h-5" />
                              <span className="font-bold text-lg">T1</span>
                            </div>
                          </div>
                          <div className="glass-card p-6 bg-white/5 hover:bg-white/10 transition-all duration-300">
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                  <Zap className="w-5 h-5 text-purple-400" />
                                  <h4 className="font-bold text-white text-lg">{match.team1.name}</h4>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg">
                                VS
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                  <Zap className="w-5 h-5 text-purple-400" />
                                  <h4 className="font-bold text-white text-lg">{match.team2.name}</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Règles de qualification */}
                <div className="p-8 bg-gradient-to-r from-green-500/20 to-blue-500/20">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
                      <Trophy className="w-6 h-6" />
                      <span>Règles de Qualification</span>
                    </h4>
                    {poolTeams.length === 3 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/90">
                        <div className="glass-card p-4">
                          <div className="font-bold text-yellow-400 mb-2">🌟 BYE Automatique</div>
                          <div>Une équipe qualifiée d'office</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="font-bold text-red-400 mb-2">🏆 Finale</div>
                          <div>BYE vs Gagnant du match</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="font-bold text-blue-400 mb-2">🎯 Résultat</div>
                          <div>1 qualifié par poule</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-white/90">
                        <div className="glass-card p-4">
                          <div className="font-bold text-green-400 mb-2">🏆 Qualification Directe</div>
                          <div>Équipe avec 2 victoires</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="font-bold text-purple-400 mb-2">⚡ Match de Barrage</div>
                          <div>Entre les équipes à 1 victoire</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="font-bold text-blue-400 mb-2">🎯 Résultat</div>
                          <div>2 qualifiés par poule</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="font-bold text-orange-400 mb-2">🏟️ Terrains</div>
                          <div>2 terrains réutilisés</div>
                        </div>
                      </div>
                    )}
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
            Générez les poules pour organiser le tournoi par élimination
          </p>
        </div>
      )}

      {pools.length > 0 && (
        <div className="mt-8 glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 tracking-wide flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Statistiques du Tournoi</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-blue-400">{pools.length}</div>
              <div className="text-white/70 text-sm">Poules</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-green-400">
                {pools.reduce((total, pool) => {
                  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
                  return total + (poolTeams.length === 3 ? 1 : 2);
                }, 0)}
              </div>
              <div className="text-white/70 text-sm">Qualifiés</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-purple-400">
                {pools.reduce((total, pool) => {
                  const phases = generateTournamentPhases(pool);
                  return total + phases.phase1.length + phases.phase2.length + phases.phase3.length;
                }, 0)}
              </div>
              <div className="text-white/70 text-sm">Matchs total</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-orange-400">2</div>
              <div className="text-white/70 text-sm">Terrains/Poule</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-white">{teams.length}</div>
              <div className="text-white/70 text-sm">Équipes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}