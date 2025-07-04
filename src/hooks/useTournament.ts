import { useState, useEffect } from 'react';
import { Tournament, TournamentType, Team, Player, Pool, Match } from '../types/tournament';
import { generateMatches } from '../utils/matchmaking';
import { generatePools, generatePoolMatches } from '../utils/poolGeneration';

const STORAGE_KEY = 'petanque-tournament';

export function useTournament() {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.createdAt = new Date(parsed.createdAt);
      // Ensure pools array exists for backward compatibility
      if (!parsed.pools) {
        parsed.pools = [];
        parsed.poolsGenerated = false;
      }
      setTournament(parsed);
    }
  }, []);

  const saveTournament = (tournament: Tournament) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
    setTournament(tournament);
  };

  const createTournament = (type: TournamentType, courts: number) => {
    const defaultName = `Tournoi ${new Date().toLocaleDateString()}`;
    const newTournament: Tournament = {
      id: crypto.randomUUID(),
      name: defaultName,
      type,
      courts,
      teams: [],
      matches: [],
      pools: [],
      currentRound: 0,
      completed: false,
      createdAt: new Date(),
      securityLevel: 1,
      networkStatus: 'online',
      poolsGenerated: false,
    };
    saveTournament(newTournament);
  };

  const addTeam = (players: Player[]) => {
    if (!tournament) return;

    const teamNumber = tournament.teams.length + 1;
    const teamName =
      tournament.type === 'melee' || tournament.type === 'tete-a-tete'
        ? `${teamNumber} - ${players[0].name}`
        : `Équipe ${teamNumber}`;

    const team: Team = {
      id: crypto.randomUUID(),
      name: teamName,
      players,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      performance: 0,
      teamRating: 100,
      synchroLevel: 100,
    };

    const updatedTournament = {
      ...tournament,
      teams: [...tournament.teams, team],
    };
    saveTournament(updatedTournament);
  };

  const removeTeam = (teamId: string) => {
    if (!tournament) return;

    const updatedTeams = tournament.teams.filter(team => team.id !== teamId);
    // Renumber teams
    const renumberedTeams = updatedTeams.map((team, index) => ({
      ...team,
      name:
        tournament.type === 'melee' || tournament.type === 'tete-a-tete'
          ? `${index + 1} - ${team.players[0].name}`
          : `Équipe ${index + 1}`,
    }));

    const updatedTournament = {
      ...tournament,
      teams: renumberedTeams,
      // Reset pools if teams change
      pools: [],
      poolsGenerated: false,
    };
    saveTournament(updatedTournament);
  };

  const generateTournamentPools = () => {
    if (!tournament) return;

    const pools = generatePools(tournament.teams);
    
    // Assign pool IDs to teams
    const updatedTeams = tournament.teams.map(team => {
      const pool = pools.find(p => p.teamIds.includes(team.id));
      return {
        ...team,
        poolId: pool?.id
      };
    });

    // Generate initial matches for each pool
    const allMatches: Match[] = [];
    let courtIndex = 1;
    
    pools.forEach(pool => {
      const poolTeams = pool.teamIds.map(id => tournament.teams.find(t => t.id === id)).filter(Boolean);
      
      if (poolTeams.length === 4) {
        const [team1, team2, team3, team4] = poolTeams;
        
        // Match 1 vs 4
        allMatches.push({
          id: crypto.randomUUID(),
          round: 1,
          court: courtIndex,
          team1Id: team1!.id,
          team2Id: team4!.id,
          completed: false,
          isBye: false,
          poolId: pool.id,
          battleIntensity: Math.floor(Math.random() * 50) + 25,
          hackingAttempts: 0,
        });
        
        courtIndex = (courtIndex % tournament.courts) + 1;
        
        // Match 2 vs 3
        allMatches.push({
          id: crypto.randomUUID(),
          round: 1,
          court: courtIndex,
          team1Id: team2!.id,
          team2Id: team3!.id,
          completed: false,
          isBye: false,
          poolId: pool.id,
          battleIntensity: Math.floor(Math.random() * 50) + 25,
          hackingAttempts: 0,
        });
        
        courtIndex = (courtIndex % tournament.courts) + 1;
      } else if (poolTeams.length === 3) {
        // Pour une poule de 3 : créer un seul match entre 2 équipes
        // La 3ème équipe est automatiquement qualifiée pour la phase 2
        const [team1, team2, team3] = poolTeams;
        
        // Match entre les 2 premières équipes
        allMatches.push({
          id: crypto.randomUUID(),
          round: 1,
          court: courtIndex,
          team1Id: team1!.id,
          team2Id: team2!.id,
          completed: false,
          isBye: false,
          poolId: pool.id,
          battleIntensity: Math.floor(Math.random() * 50) + 25,
          hackingAttempts: 0,
        });
        
        courtIndex = (courtIndex % tournament.courts) + 1;
        
        // L'équipe 3 reçoit un BYE automatique (1 victoire)
        allMatches.push({
          id: crypto.randomUUID(),
          round: 1,
          court: 0, // Court 0 = match virtuel
          team1Id: team3!.id,
          team2Id: team3!.id, // Match contre elle-même
          team1Score: 13,
          team2Score: 0,
          completed: true,
          isBye: true,
          poolId: pool.id,
          battleIntensity: 0,
          hackingAttempts: 0,
        });
      }
    });

    const updatedTournament = {
      ...tournament,
      teams: updatedTeams,
      pools,
      matches: allMatches,
      poolsGenerated: true,
      currentRound: 1,
    };
    saveTournament(updatedTournament);
  };

  const generateRound = () => {
    if (!tournament) return;

    const isPoolTournament = tournament.type === 'doublette-poule' || tournament.type === 'triplette-poule';
    
    if (isPoolTournament && tournament.pools.length > 0) {
      // Generate second round matches (winners vs winners, losers vs losers)
      const allMatches: Match[] = [...tournament.matches];
      let courtIndex = 1;
      
      tournament.pools.forEach(pool => {
        const poolMatches = tournament.matches.filter(m => m.poolId === pool.id);
        const poolTeams = pool.teamIds.map(id => tournament.teams.find(t => t.id === id)).filter(Boolean);
        
        if (poolTeams.length === 4) {
          const [team1, team2, team3, team4] = poolTeams;
          
          // Find first round matches
          const match1vs4 = poolMatches.find(m => 
            (m.team1Id === team1!.id && m.team2Id === team4!.id) ||
            (m.team1Id === team4!.id && m.team2Id === team1!.id)
          );
          
          const match2vs3 = poolMatches.find(m => 
            (m.team1Id === team2!.id && m.team2Id === team3!.id) ||
            (m.team1Id === team3!.id && m.team2Id === team2!.id)
          );
          
          // Only generate second round if first round is complete
          if (match1vs4?.completed && match2vs3?.completed) {
            // Determine winners and losers
            const getWinner = (match: Match, teamA: Team, teamB: Team) => {
              const isTeamAFirst = match.team1Id === teamA.id;
              const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
              const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
              return teamAScore > teamBScore ? teamA : teamB;
            };
            
            const getLoser = (match: Match, teamA: Team, teamB: Team) => {
              const isTeamAFirst = match.team1Id === teamA.id;
              const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
              const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
              return teamAScore < teamBScore ? teamA : teamB;
            };
            
            const winner1vs4 = getWinner(match1vs4, team1!, team4!);
            const winner2vs3 = getWinner(match2vs3, team2!, team3!);
            const loser1vs4 = getLoser(match1vs4, team1!, team4!);
            const loser2vs3 = getLoser(match2vs3, team2!, team3!);
            
            // Check if winners match already exists
            const winnersMatchExists = allMatches.some(m => 
              m.poolId === pool.id &&
              ((m.team1Id === winner1vs4.id && m.team2Id === winner2vs3.id) ||
               (m.team1Id === winner2vs3.id && m.team2Id === winner1vs4.id))
            );
            
            // Check if losers match already exists
            const losersMatchExists = allMatches.some(m => 
              m.poolId === pool.id &&
              ((m.team1Id === loser1vs4.id && m.team2Id === loser2vs3.id) ||
               (m.team1Id === loser2vs3.id && m.team2Id === loser1vs4.id))
            );
            
            // Generate winners match
            if (!winnersMatchExists) {
              allMatches.push({
                id: crypto.randomUUID(),
                round: 2,
                court: courtIndex,
                team1Id: winner1vs4.id,
                team2Id: winner2vs3.id,
                completed: false,
                isBye: false,
                poolId: pool.id,
                battleIntensity: Math.floor(Math.random() * 50) + 25,
                hackingAttempts: 0,
              });
              
              courtIndex = (courtIndex % tournament.courts) + 1;
            }
            
            // Generate losers match
            if (!losersMatchExists) {
              allMatches.push({
                id: crypto.randomUUID(),
                round: 2,
                court: courtIndex,
                team1Id: loser1vs4.id,
                team2Id: loser2vs3.id,
                completed: false,
                isBye: false,
                poolId: pool.id,
                battleIntensity: Math.floor(Math.random() * 50) + 25,
                hackingAttempts: 0,
              });
              
              courtIndex = (courtIndex % tournament.courts) + 1;
            }
          }
        }
      });

      const updatedTournament = {
        ...tournament,
        matches: allMatches,
      };
      saveTournament(updatedTournament);
    } else {
      // Standard tournament logic
      const newMatches = generateMatches(tournament);
      const updatedTournament = {
        ...tournament,
        matches: [...tournament.matches, ...newMatches],
        currentRound: tournament.currentRound + 1,
      };
      saveTournament(updatedTournament);
    }
  };

  // Fonction pour générer automatiquement les phases finales
  const generateFinalPhases = (updatedTournament: Tournament) => {
    const isPoolTournament = updatedTournament.type === 'doublette-poule' || updatedTournament.type === 'triplette-poule';
    
    if (!isPoolTournament || updatedTournament.pools.length === 0) {
      return updatedTournament;
    }

    // Vérifier si toutes les poules sont terminées
    const allPoolsCompleted = updatedTournament.pools.every(pool => {
      const poolMatches = updatedTournament.matches.filter(m => m.poolId === pool.id);
      const poolTeams = pool.teamIds.map(id => updatedTournament.teams.find(t => t.id === id)).filter(Boolean);
      
      if (poolTeams.length === 4) {
        // Pour une poule de 4, il faut au moins 4 matchs terminés (2 premiers tours + éventuellement barrage)
        const completedMatches = poolMatches.filter(m => m.completed);
        return completedMatches.length >= 3; // Au minimum finale et petite finale
      } else if (poolTeams.length === 3) {
        // Pour une poule de 3, il faut au moins 2 matchs terminés
        const completedMatches = poolMatches.filter(m => m.completed && !m.isBye);
        return completedMatches.length >= 2; // Premier match + finale
      }
      
      return false;
    });

    if (!allPoolsCompleted) {
      return updatedTournament;
    }

    // Calculer les équipes qualifiées
    const qualifiedTeams: Team[] = [];
    
    updatedTournament.pools.forEach(pool => {
      const poolMatches = updatedTournament.matches.filter(m => m.poolId === pool.id && m.completed);
      const poolTeams = pool.teamIds.map(id => updatedTournament.teams.find(t => t.id === id)).filter(Boolean) as Team[];
      
      // Calculer les statistiques de chaque équipe dans la poule
      const teamStats = poolTeams.map(team => {
        const teamMatches = poolMatches.filter(m => 
          !m.isBye && (m.team1Id === team.id || m.team2Id === team.id)
        );

        let wins = 0;
        let pointsFor = 0;
        let pointsAgainst = 0;

        teamMatches.forEach(match => {
          const isTeam1 = match.team1Id === team.id;
          const teamScore = isTeam1 ? match.team1Score! : match.team2Score!;
          const opponentScore = isTeam1 ? match.team2Score! : match.team1Score!;
          
          pointsFor += teamScore;
          pointsAgainst += opponentScore;
          
          if (teamScore > opponentScore) wins++;
        });

        // CORRECTION : Ajouter les victoires BYE
        const byeMatches = poolMatches.filter(m => 
          m.isBye && (m.team1Id === team.id || m.team2Id === team.id)
        );
        wins += byeMatches.length;

        return { 
          team, 
          wins, 
          pointsFor, 
          pointsAgainst, 
          performance: pointsFor - pointsAgainst,
          matches: teamMatches.length + byeMatches.length
        };
      });

      // Trier par victoires puis par performance
      teamStats.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.performance - a.performance;
      });

      // CORRECTION : Pour les poules de 3, on prend les 2 premiers (après barrage éventuel)
      if (poolTeams.length === 4) {
        // Pour une poule de 4, on prend les 2 premiers
        qualified.push(...teamStats.slice(0, 2).map(stat => stat.team));
      } else if (poolTeams.length === 3) {
        // Pour une poule de 3, on prend les 2 premiers (le gagnant + le vainqueur du barrage)
        qualified.push(...teamStats.slice(0, 2).map(stat => stat.team));
      }
    });

    // Générer les matchs des phases finales si pas déjà fait
    const finalMatches = updatedTournament.matches.filter(m => !m.poolId);
    
    if (finalMatches.length === 0 && qualifiedTeams.length >= 2) {
      const newFinalMatches: Match[] = [];
      let courtIndex = Math.max(...updatedTournament.matches.map(m => m.court), 0) + 1;
      
      // Déterminer la phase de départ
      const teamCount = qualifiedTeams.length;
      let currentPhaseTeams = [...qualifiedTeams];
      let phaseRound = 100; // 100+ pour les phases finales
      
      // Mélanger les équipes qualifiées
      currentPhaseTeams.sort(() => Math.random() - 0.5);
      
      // Générer les matchs jusqu'à la finale
      while (currentPhaseTeams.length > 1) {
        const phaseMatches: Match[] = [];
        const nextPhaseTeams: string[] = [];
        
        // Créer les matchs de cette phase
        for (let i = 0; i < currentPhaseTeams.length; i += 2) {
          if (i + 1 < currentPhaseTeams.length) {
            const match: Match = {
              id: crypto.randomUUID(),
              round: phaseRound,
              court: courtIndex,
              team1Id: currentPhaseTeams[i].id,
              team2Id: currentPhaseTeams[i + 1].id,
              completed: false,
              isBye: false,
              battleIntensity: Math.floor(Math.random() * 50) + 25,
              hackingAttempts: 0,
            };
            
            phaseMatches.push(match);
            courtIndex = (courtIndex % updatedTournament.courts) + 1;
          } else {
            // Équipe qualifiée d'office (nombre impair)
            nextPhaseTeams.push(currentPhaseTeams[i].id);
          }
        }
        
        newFinalMatches.push(...phaseMatches);
        
        // Préparer la phase suivante (on ne peut pas déterminer les gagnants maintenant)
        // On s'arrête ici et on laissera la logique de mise à jour des scores gérer la suite
        break;
      }
      
      return {
        ...updatedTournament,
        matches: [...updatedTournament.matches, ...newFinalMatches],
      };
    }

    return updatedTournament;
  };

  // Fonction pour générer automatiquement les matchs suivants quand on met à jour un score
  const autoGenerateNextMatches = (updatedTournament: Tournament) => {
    const isPoolTournament = updatedTournament.type === 'doublette-poule' || updatedTournament.type === 'triplette-poule';
    
    if (!isPoolTournament || updatedTournament.pools.length === 0) {
      return updatedTournament;
    }

    const allMatches: Match[] = [...updatedTournament.matches];
    let courtIndex = Math.max(...allMatches.map(m => m.court), 0) + 1;
    let hasNewMatches = false;

    updatedTournament.pools.forEach(pool => {
      const poolMatches = allMatches.filter(m => m.poolId === pool.id);
      const poolTeams = pool.teamIds.map(id => updatedTournament.teams.find(t => t.id === id)).filter(Boolean);
      
      if (poolTeams.length === 4) {
        const [team1, team2, team3, team4] = poolTeams;
        
        // Find first round matches
        const match1vs4 = poolMatches.find(m => 
          (m.team1Id === team1!.id && m.team2Id === team4!.id) ||
          (m.team1Id === team4!.id && m.team2Id === team1!.id)
        );
        
        const match2vs3 = poolMatches.find(m => 
          (m.team1Id === team2!.id && m.team2Id === team3!.id) ||
          (m.team1Id === team3!.id && m.team2Id === team2!.id)
        );
        
        // Si les deux matchs du premier tour sont terminés, générer les matchs du deuxième tour
        if (match1vs4?.completed && match2vs3?.completed) {
          // Determine winners and losers
          const getWinner = (match: Match, teamA: Team, teamB: Team) => {
            const isTeamAFirst = match.team1Id === teamA.id;
            const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
            const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
            return teamAScore > teamBScore ? teamA : teamB;
          };
          
          const getLoser = (match: Match, teamA: Team, teamB: Team) => {
            const isTeamAFirst = match.team1Id === teamA.id;
            const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
            const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
            return teamAScore < teamBScore ? teamA : teamB;
          };
          
          const winner1vs4 = getWinner(match1vs4, team1!, team4!);
          const winner2vs3 = getWinner(match2vs3, team2!, team3!);
          const loser1vs4 = getLoser(match1vs4, team1!, team4!);
          const loser2vs3 = getLoser(match2vs3, team2!, team3!);
          
          // Check if winners match already exists
          const winnersMatchExists = allMatches.some(m => 
            m.poolId === pool.id &&
            ((m.team1Id === winner1vs4.id && m.team2Id === winner2vs3.id) ||
             (m.team1Id === winner2vs3.id && m.team2Id === winner1vs4.id))
          );
          
          // Check if losers match already exists
          const losersMatchExists = allMatches.some(m => 
            m.poolId === pool.id &&
            ((m.team1Id === loser1vs4.id && m.team2Id === loser2vs3.id) ||
             (m.team1Id === loser2vs3.id && m.team2Id === loser1vs4.id))
          );
          
          // Generate winners match (Finale)
          if (!winnersMatchExists) {
            allMatches.push({
              id: crypto.randomUUID(),
              round: 2,
              court: courtIndex,
              team1Id: winner1vs4.id,
              team2Id: winner2vs3.id,
              completed: false,
              isBye: false,
              poolId: pool.id,
              battleIntensity: Math.floor(Math.random() * 50) + 25,
              hackingAttempts: 0,
            });
            
            courtIndex = (courtIndex % updatedTournament.courts) + 1;
            hasNewMatches = true;
          }
          
          // Generate losers match (Petite finale)
          if (!losersMatchExists) {
            allMatches.push({
              id: crypto.randomUUID(),
              round: 2,
              court: courtIndex,
              team1Id: loser1vs4.id,
              team2Id: loser2vs3.id,
              completed: false,
              isBye: false,
              poolId: pool.id,
              battleIntensity: Math.floor(Math.random() * 50) + 25,
              hackingAttempts: 0,
            });
            
            courtIndex = (courtIndex % updatedTournament.courts) + 1;
            hasNewMatches = true;
          }
        }

        // Vérifier s'il faut un match de barrage
        const allPoolMatches = allMatches.filter(m => m.poolId === pool.id && m.completed);
        if (allPoolMatches.length >= 3) { // Au moins 3 matchs terminés (2 premiers + 1 du deuxième tour)
          // Calculer les statistiques de chaque équipe
          const teamStats = poolTeams.map(team => {
            const teamMatches = allPoolMatches.filter(m => 
              m.team1Id === team!.id || m.team2Id === team!.id
            );

            let wins = 0;
            teamMatches.forEach(match => {
              const isTeam1 = match.team1Id === team!.id;
              const teamScore = isTeam1 ? match.team1Score! : match.team2Score!;
              const opponentScore = isTeam1 ? match.team2Score! : match.team1Score!;
              
              if (teamScore > opponentScore) wins++;
            });

            return { team: team!, wins, matches: teamMatches.length };
          });

          // Vérifier s'il y a exactement 2 équipes avec 1 victoire chacune
          const teamsWithOneWin = teamStats.filter(stat => stat.wins === 1 && stat.matches >= 2);
          
          if (teamsWithOneWin.length === 2) {
            // Vérifier si le match de barrage n'existe pas déjà
            const barrageExists = allMatches.some(m => 
              m.poolId === pool.id &&
              ((m.team1Id === teamsWithOneWin[0].team.id && m.team2Id === teamsWithOneWin[1].team.id) ||
               (m.team1Id === teamsWithOneWin[1].team.id && m.team2Id === teamsWithOneWin[0].team.id)) &&
              m.round === 3
            );

            if (!barrageExists) {
              allMatches.push({
                id: crypto.randomUUID(),
                round: 3,
                court: courtIndex,
                team1Id: teamsWithOneWin[0].team.id,
                team2Id: teamsWithOneWin[1].team.id,
                completed: false,
                isBye: false,
                poolId: pool.id,
                battleIntensity: Math.floor(Math.random() * 50) + 25,
                hackingAttempts: 0,
              });
              
              courtIndex = (courtIndex % updatedTournament.courts) + 1;
              hasNewMatches = true;
            }
          }
        }
      } else if (poolTeams.length === 3) {
        // LOGIQUE CORRIGÉE pour les poules de 3 équipes
        const [team1, team2, team3] = poolTeams;
        
        // Trouver le match du premier tour (entre team1 et team2)
        const firstRoundMatch = poolMatches.find(m => 
          m.round === 1 && !m.isBye &&
          ((m.team1Id === team1!.id && m.team2Id === team2!.id) ||
           (m.team1Id === team2!.id && m.team2Id === team1!.id))
        );
        
        // Si le premier match est terminé, générer les matchs de phase 2
        if (firstRoundMatch?.completed) {
          const getWinner = (match: Match, teamA: Team, teamB: Team) => {
            const isTeamAFirst = match.team1Id === teamA.id;
            const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
            const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
            return teamAScore > teamBScore ? teamA : teamB;
          };
          
          const getLoser = (match: Match, teamA: Team, teamB: Team) => {
            const isTeamAFirst = match.team1Id === teamA.id;
            const teamAScore = isTeamAFirst ? match.team1Score! : match.team2Score!;
            const teamBScore = isTeamAFirst ? match.team2Score! : match.team1Score!;
            return teamAScore < teamBScore ? teamA : teamB;
          };
          
          const winner = getWinner(firstRoundMatch, team1!, team2!);
          const loser = getLoser(firstRoundMatch, team1!, team2!);
          
          // Match gagnant vs team3 (qui était qualifiée d'office)
          const winnersMatchExists = allMatches.some(m => 
            m.poolId === pool.id && m.round === 2 &&
            ((m.team1Id === winner.id && m.team2Id === team3!.id) ||
             (m.team1Id === team3!.id && m.team2Id === winner.id))
          );
          
          if (!winnersMatchExists) {
            allMatches.push({
              id: crypto.randomUUID(),
              round: 2,
              court: courtIndex,
              team1Id: winner.id,
              team2Id: team3!.id,
              completed: false,
              isBye: false,
              poolId: pool.id,
              battleIntensity: Math.floor(Math.random() * 50) + 25,
              hackingAttempts: 0,
            });
            
            courtIndex = (courtIndex % updatedTournament.courts) + 1;
            hasNewMatches = true;
          }
          
          // CORRECTION : Le perdant du premier match reçoit automatiquement un BYE (1 victoire)
          const loserByeExists = allMatches.some(m => 
            m.poolId === pool.id && m.round === 2 && m.isBye &&
            m.team1Id === loser.id && m.team2Id === loser.id
          );
          
          if (!loserByeExists) {
            allMatches.push({
              id: crypto.randomUUID(),
              round: 2,
              court: 0, // Court 0 = match virtuel
              team1Id: loser.id,
              team2Id: loser.id,
              team1Score: 13,
              team2Score: 0,
              completed: true,
              isBye: true,
              poolId: pool.id,
              battleIntensity: 0,
              hackingAttempts: 0,
            });
            hasNewMatches = true;
          }

          // NOUVEAU : Vérifier s'il faut un barrage dans une poule de 3
          // Si le match final (winner vs team3) est terminé, calculer les statistiques
          const finalMatch = allMatches.find(m => 
            m.poolId === pool.id && m.round === 2 && !m.isBye &&
            ((m.team1Id === winner.id && m.team2Id === team3!.id) ||
             (m.team1Id === team3!.id && m.team2Id === winner.id))
          );

          if (finalMatch?.completed) {
            // Calculer les statistiques de chaque équipe
            const getTeamStats = (team: Team) => {
              const teamMatches = allMatches.filter(m => 
                m.poolId === pool.id && m.completed && !m.isBye && 
                (m.team1Id === team.id || m.team2Id === team.id)
              );

              let wins = 0;
              teamMatches.forEach(match => {
                const isTeam1 = match.team1Id === team.id;
                const teamScore = isTeam1 ? match.team1Score! : match.team2Score!;
                const opponentScore = isTeam1 ? match.team2Score! : match.team1Score!;
                
                if (teamScore > opponentScore) wins++;
              });

              // Ajouter les victoires BYE
              const byeMatches = allMatches.filter(m => 
                m.poolId === pool.id && m.completed && m.isBye && 
                (m.team1Id === team.id || m.team2Id === team.id)
              );
              wins += byeMatches.length;

              return { wins, matches: teamMatches.length + byeMatches.length };
            };

            const team1Stats = getTeamStats(team1!);
            const team2Stats = getTeamStats(team2!);
            const team3Stats = getTeamStats(team3!);

            // Trouver les équipes avec exactement 1 victoire
            const allStats = [
              { team: team1!, ...team1Stats },
              { team: team2!, ...team2Stats },
              { team: team3!, ...team3Stats }
            ];

            const teamsWithOneWin = allStats.filter(stat => stat.wins === 1);

            // S'il y a exactement 2 équipes avec 1 victoire, créer un barrage
            if (teamsWithOneWin.length === 2) {
              const barrageExists = allMatches.some(m => 
                m.poolId === pool.id && m.round === 3 &&
                ((m.team1Id === teamsWithOneWin[0].team.id && m.team2Id === teamsWithOneWin[1].team.id) ||
                 (m.team1Id === teamsWithOneWin[1].team.id && m.team2Id === teamsWithOneWin[0].team.id))
              );

              if (!barrageExists) {
                allMatches.push({
                  id: crypto.randomUUID(),
                  round: 3,
                  court: courtIndex,
                  team1Id: teamsWithOneWin[0].team.id,
                  team2Id: teamsWithOneWin[1].team.id,
                  completed: false,
                  isBye: false,
                  poolId: pool.id,
                  battleIntensity: Math.floor(Math.random() * 50) + 25,
                  hackingAttempts: 0,
                });
                
                courtIndex = (courtIndex % updatedTournament.courts) + 1;
                hasNewMatches = true;
              }
            }
          }
        }
      }
    });

    let result = {
      ...updatedTournament,
      matches: allMatches,
    };

    // Générer les phases finales si toutes les poules sont terminées
    result = generateFinalPhases(result);

    return result;
  };

  const updateMatchScore = (matchId: string, team1Score: number, team2Score: number) => {
    if (!tournament) return;

    const updatedMatches = tournament.matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          team1Score,
          team2Score,
          completed: true,
          battleIntensity: 50,
          hackingAttempts: 0,
        };
      }
      return match;
    });

    // Update team statistics
    const updatedTeams = tournament.teams.map(team => {
      const teamMatches = updatedMatches.filter(
        match =>
          match.completed &&
          (
            match.team1Id === team.id ||
            match.team2Id === team.id ||
            (match.team1Ids && match.team1Ids.includes(team.id)) ||
            (match.team2Ids && match.team2Ids.includes(team.id))
          )
      );

      let wins = 0;
      let losses = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      teamMatches.forEach(match => {
        if (match.isBye && (match.team1Id === team.id || match.team2Id === team.id)) {
          wins += 1;
          pointsFor += 13;
          pointsAgainst += 7;
          return;
        }

        const isTeam1 = match.team1Id === team.id || (match.team1Ids && match.team1Ids.includes(team.id));
        const isTeam2 = match.team2Id === team.id || (match.team2Ids && match.team2Ids.includes(team.id));

        if (isTeam1) {
          pointsFor += match.team1Score || 0;
          pointsAgainst += match.team2Score || 0;
          if ((match.team1Score || 0) > (match.team2Score || 0)) {
            wins += 1;
          } else {
            losses += 1;
          }
        } else if (isTeam2) {
          pointsFor += match.team2Score || 0;
          pointsAgainst += match.team1Score || 0;
          if ((match.team2Score || 0) > (match.team1Score || 0)) {
            wins += 1;
          } else {
            losses += 1;
          }
        }
      });

      return {
        ...team,
        wins,
        losses,
        pointsFor,
        pointsAgainst,
        performance: pointsFor - pointsAgainst,
      };
    });

    let updatedTournament = {
      ...tournament,
      matches: updatedMatches,
      teams: updatedTeams,
    };

    // Générer automatiquement les matchs suivants
    updatedTournament = autoGenerateNextMatches(updatedTournament);

    saveTournament(updatedTournament);
  };

  const updateMatchCourt = (matchId: string, court: number) => {
    if (!tournament) return;

    const updatedMatches = tournament.matches.map(match => {
      if (match.id === matchId) {
        return { ...match, court };
      }
      return match;
    });

    const updatedTournament = {
      ...tournament,
      matches: updatedMatches,
    };
    saveTournament(updatedTournament);
  };

  const resetTournament = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTournament(null);
  };

  return {
    tournament,
    createTournament,
    addTeam,
    removeTeam,
    generateTournamentPools,
    generateRound,
    updateMatchScore,
    updateMatchCourt,
    resetTournament,
  };
}