import React, { useMemo } from 'react';
import { Pool, Team, Tournament, Match } from '../types/tournament';
import { Grid3X3, Users, Trophy, Shuffle, Printer, Play, Clock, CheckCircle } from 'lucide-react';

interface PoolsTabProps {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  onGeneratePools: () => void;
}

export function PoolsTab({ tournament, teams, pools, onGeneratePools }: PoolsTabProps) {
  const isSolo = tournament.type === 'melee' || tournament.type === 'tete-a-tete';

  // Calculer les équipes qualifiées et les phases d'élimination
  const eliminationData = useMemo(() => {
    if (pools.length === 0) return null;

    const qualifiedTeams = getQualifiedTeams(pools, teams, tournament.matches);
    const totalQualified = pools.length * 2; // 2 qualifiés par poule
    const eliminationPhases = generateEliminationPhases(totalQualified, qualifiedTeams, pools, teams);

    return {
      qualifiedTeams,
      totalQualified,
      eliminationPhases,
      currentQualified: qualifiedTeams.length
    };
  }, [pools, teams, tournament.matches]);

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
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Poules - ${tournament.name}</h1>
          <div class="pools-container">
            ${pools.map(pool => `
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
        <>
          {/* Affichage des poules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pools.map((pool) => (
              <PoolCard 
                key={pool.id} 
                pool={pool} 
                teams={teams} 
                matches={tournament.matches}
                isSolo={isSolo}
              />
            ))}
          </div>

          {/* Statistiques des poules */}
          <div className="glass-card p-6 mb-8">
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

          {/* Phase d'élimination - Seulement si il y a des équipes qualifiées */}
          {eliminationData && eliminationData.currentQualified > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 tracking-wide flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Phase finale</span>
              </h3>

              {/* Progression des qualifications */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">
                    Équipes qualifiées : {eliminationData.currentQualified} / {eliminationData.totalQualified}
                  </span>
                  <span className="text-white/70 text-sm">
                    {Math.round((eliminationData.currentQualified / eliminationData.totalQualified) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(eliminationData.currentQualified / eliminationData.totalQualified) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Phases d'élimination */}
              <div className="space-y-6">
                {eliminationData.eliminationPhases.map((phase, phaseIndex) => (
                  <div key={phaseIndex} className="glass-card p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-white">
                        {getPhaseDisplayName(phase.name)}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {phase.matches.every(m => m.team1 && m.team2) ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : phase.matches.some(m => m.team1 || m.team2) ? (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Play className="w-5 h-5 text-white/50" />
                        )}
                        <span className="text-sm text-white/70">
                          {phase.matches.filter(m => m.team1 && m.team2).length} / {phase.matches.length} matchs prêts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phase.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="glass-card p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                              {match.team1 ? (
                                <div className="text-white font-medium">{match.team1.name}</div>
                              ) : (
                                <div className="text-white/50 italic">En attente...</div>
                              )}
                            </div>
                            <div className="mx-4 text-white/70 font-bold">VS</div>
                            <div className="text-center flex-1">
                              {match.team2 ? (
                                <div className="text-white font-medium">{match.team2.name}</div>
                              ) : (
                                <div className="text-white/50 italic">En attente...</div>
                              )}
                            </div>
                          </div>
                          {match.team1 && match.team2 && (
                            <div className="mt-2 text-center">
                              <span className="px-2 py-1 bg-green-500/30 border border-green-400 text-green-400 rounded text-xs">
                                Prêt à jouer
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

// Composant pour afficher une poule individuelle
interface PoolCardProps {
  pool: Pool;
  teams: Team[];
  matches: Match[];
  isSolo: boolean;
}

function PoolCard({ pool, teams, matches, isSolo }: PoolCardProps) {
  const poolMatches = matches.filter(m => m.poolId === pool.id);
  const completedMatches = poolMatches.filter(m => m.completed);
  const totalMatches = pool.teamIds.length === 4 ? 6 : 3; // 4 équipes = 6 matchs, 3 équipes = 3 matchs
  
  const poolStandings = calculatePoolStandings(pool, teams, poolMatches);
  
  // Une poule est terminée seulement si TOUS les matchs sont joués
  const isPoolCompleted = completedMatches.length === totalMatches && completedMatches.length > 0;
  const qualifiedTeams = isPoolCompleted ? poolStandings.slice(0, 2) : []; // Top 2 qualifiés seulement si poule terminée

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/20 bg-white/5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5" />
            <span>{pool.name}</span>
          </h3>
          <div className="text-sm text-white/70">
            {completedMatches.length}/{totalMatches} matchs
          </div>
        </div>
        {isPoolCompleted && (
          <div className="mt-2">
            <span className="px-2 py-1 bg-green-500/30 border border-green-400 text-green-400 rounded text-xs font-bold">
              Poule terminée
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        {poolStandings.map((team, index) => {
          const isQualified = isPoolCompleted && index < 2;
          return (
            <div key={team.id} className={`glass-card p-4 ${isQualified ? 'border-green-400/40 bg-green-500/10' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    isQualified ? 'bg-green-500 text-white' : 'bg-white/20 text-white/70'
                  }`}>
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-white text-lg">{team.name}</h4>
                  {isQualified && (
                    <span className="px-2 py-1 bg-green-500/30 border border-green-400 text-green-400 rounded text-xs font-bold">
                      Qualifié
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{team.wins}V - {team.losses}D</div>
                  <div className="text-white/70 text-sm">+{team.performance}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {team.players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2 text-sm text-white/80">
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
          );
        })}
      </div>
    </div>
  );
}

// Fonction pour calculer le classement d'une poule
function calculatePoolStandings(pool: Pool, teams: Team[], matches: Match[]): Team[] {
  const poolTeams = pool.teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
  
  return poolTeams.map(team => {
    const teamMatches = matches.filter(m => 
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
      ...team,
      wins,
      losses,
      pointsFor,
      pointsAgainst,
      performance: pointsFor - pointsAgainst
    };
  }).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.performance - a.performance;
  });
}

// Fonction pour obtenir les équipes qualifiées - CORRIGÉE
function getQualifiedTeams(pools: Pool[], teams: Team[], matches: Match[]): Team[] {
  const qualified: Team[] = [];
  
  pools.forEach(pool => {
    const poolMatches = matches.filter(m => m.poolId === pool.id);
    const totalMatches = pool.teamIds.length === 4 ? 6 : 3;
    const completedMatches = poolMatches.filter(m => m.completed);
    
    // CORRECTION : Vérifier qu'il y a vraiment des matchs joués ET que tous sont terminés
    if (completedMatches.length === totalMatches && completedMatches.length > 0) {
      const standings = calculatePoolStandings(pool, teams, poolMatches);
      qualified.push(...standings.slice(0, 2));
    }
  });
  
  return qualified;
}

// Fonction pour générer les phases d'élimination
function generateEliminationPhases(totalQualified: number, qualifiedTeams: Team[], pools: Pool[], allTeams: Team[]) {
  const phases = [];
  let currentTeamCount = totalQualified;
  let phaseTeams = [...qualifiedTeams];
  
  // Déterminer la première phase en fonction du nombre total de qualifiés
  const getFirstPhase = (count: number) => {
    if (count <= 2) return 'finale';
    if (count <= 4) return 'demi-finale';
    if (count <= 8) return 'quart-de-finale';
    if (count <= 16) return 'huitieme-de-finale';
    if (count <= 32) return 'seizieme-de-finale';
    return 'trente-deuxieme-de-finale';
  };

  const phaseNames = [
    'trente-deuxieme-de-finale',
    'seizieme-de-finale', 
    'huitieme-de-finale',
    'quart-de-finale',
    'demi-finale',
    'finale'
  ];

  let startPhaseIndex = phaseNames.indexOf(getFirstPhase(totalQualified));

  while (currentTeamCount > 1 && startPhaseIndex < phaseNames.length) {
    const phaseName = phaseNames[startPhaseIndex];
    const matchCount = Math.floor(currentTeamCount / 2);
    const matches = [];

    // Créer les matchs pour cette phase
    for (let i = 0; i < matchCount; i++) {
      const team1Index = i * 2;
      const team2Index = i * 2 + 1;
      
      const team1 = team1Index < phaseTeams.length ? phaseTeams[team1Index] : null;
      const team2 = team2Index < phaseTeams.length ? phaseTeams[team2Index] : null;

      // Vérifier qu'ils ne viennent pas de la même poule
      if (team1 && team2) {
        const team1Pool = pools.find(p => p.teamIds.includes(team1.id));
        const team2Pool = pools.find(p => p.teamIds.includes(team2.id));
        
        // Si ils sont de la même poule, essayer de réorganiser
        if (team1Pool?.id === team2Pool?.id && phaseTeams.length > 2) {
          // Chercher une équipe d'une autre poule pour team2
          for (let j = team2Index + 1; j < phaseTeams.length; j++) {
            const alternativeTeam = phaseTeams[j];
            const alternativePool = pools.find(p => p.teamIds.includes(alternativeTeam.id));
            
            if (alternativePool?.id !== team1Pool?.id) {
              // Échanger les équipes
              phaseTeams[team2Index] = alternativeTeam;
              phaseTeams[j] = team2;
              break;
            }
          }
        }
      }

      matches.push({
        team1: team1Index < phaseTeams.length ? phaseTeams[team1Index] : null,
        team2: team2Index < phaseTeams.length ? phaseTeams[team2Index] : null
      });
    }

    phases.push({
      name: phaseName,
      matches
    });

    // Préparer pour la phase suivante
    currentTeamCount = matchCount;
    phaseTeams = []; // Les gagnants seront déterminés plus tard
    startPhaseIndex++;
  }

  return phases;
}

// Fonction pour obtenir le nom d'affichage d'une phase
function getPhaseDisplayName(phaseName: string): string {
  const names: { [key: string]: string } = {
    'trente-deuxieme-de-finale': '32èmes de finale',
    'seizieme-de-finale': '16èmes de finale',
    'huitieme-de-finale': '8èmes de finale',
    'quart-de-finale': 'Quarts de finale',
    'demi-finale': 'Demi-finales',
    'finale': 'Finale'
  };
  return names[phaseName] || phaseName;
}