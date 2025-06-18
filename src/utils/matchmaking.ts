import { Tournament, Match, Team } from '../types/tournament';

export function generateMatches(tournament: Tournament): Match[] {
  switch (tournament.type) {
    case 'quadrette':
      return generateQuadretteMatches(tournament);
    case 'melee':
      return generateMeleeMatches(tournament);
    default:
      return generateStandardMatches(tournament);
  }
}

function generateStandardMatches(tournament: Tournament): Match[] {
  const { teams, matches, currentRound, courts } = tournament;
  const round = currentRound + 1;

  // Sort teams by performance (best to worst)
  const sortedTeams = [...teams].sort((a, b) => b.performance - a.performance);

  const remainingTeams = [...sortedTeams];
  const newMatches: Match[] = [];

  // Handle BYE if odd number of teams
  if (remainingTeams.length % 2 === 1) {
    let byeTeam: Team;
    if (round === 1) {
      // Random team for first round
      const randomIndex = Math.floor(Math.random() * remainingTeams.length);
      byeTeam = remainingTeams[randomIndex];
    } else {
      // Worst performing team
      byeTeam = remainingTeams[remainingTeams.length - 1];
    }

    newMatches.push({
      id: crypto.randomUUID(),
      round,
      court: 0,
      team1Id: byeTeam.id,
      team2Id: byeTeam.id,
      team1Score: 13,
      team2Score: 7,
      completed: true,
      isBye: true,
    });

    remainingTeams.splice(remainingTeams.findIndex(t => t.id === byeTeam.id), 1);
  }

  // Pair remaining teams ensuring everyone gets an opponent
  let courtIndex = 1;
  while (remainingTeams.length > 1) {
    const team1 = remainingTeams.shift() as Team;

    let opponentIndex = remainingTeams.findIndex(
      team => !havePlayedBefore(team1.id, team.id, matches)
    );

    if (opponentIndex === -1) {
      opponentIndex = 0;
    }

    const [team2] = remainingTeams.splice(opponentIndex, 1);

    newMatches.push({
      id: crypto.randomUUID(),
      round,
      court: ((courtIndex - 1) % courts) + 1,
      team1Id: team1.id,
      team2Id: team2.id,
      completed: false,
      isBye: false,
    });

    courtIndex++;
  }

  return newMatches;
}

function generateQuadretteMatches(tournament: Tournament): Match[] {
  const { teams, currentRound, courts } = tournament;
  const round = currentRound + 1;

  // Quadrette schedule for 7 rounds
  const schedule: { [key: number]: string[][] } = {
    1: [['ABC'], ['D']],
    2: [['AB'], ['CD']],
    3: [['ABD'], ['C']],
    4: [['AC'], ['BD']],
    5: [['ACD'], ['B']],
    6: [['AD'], ['BC']],
    7: [['BCD'], ['A']],
  };

  if (round > 7) return [];

  const roundSchedule = schedule[round];
  const newMatches: Match[] = [];

  // Group teams by original quadrette teams
  const quadretteTeams: { [teamId: string]: { [label: string]: string } } = {};
  
  teams.forEach(team => {
    team.players.forEach(player => {
      if (player.label) {
        const baseTeamId = team.id.split('-')[0]; // Assuming sub-teams have IDs like "teamId-pattern"
        if (!quadretteTeams[baseTeamId]) {
          quadretteTeams[baseTeamId] = {};
        }
        quadretteTeams[baseTeamId][player.label] = team.id;
      }
    });
  });

  let courtIndex = 1;
  Object.keys(quadretteTeams).forEach(baseTeamId => {
    const teamLabels = quadretteTeams[baseTeamId];
    
    roundSchedule.forEach((patterns) => {
      const pattern = patterns[0];
      
      if (pattern.length > 1) {
        // Create matches between sub-teams
        const subTeamIds = pattern.split('').map(label => teamLabels[label]).filter(Boolean);
        
        for (let i = 0; i < subTeamIds.length - 1; i += 2) {
          if (subTeamIds[i + 1]) {
            newMatches.push({
              id: crypto.randomUUID(),
              round,
              court: ((courtIndex - 1) % courts) + 1,
              team1Id: subTeamIds[i],
              team2Id: subTeamIds[i + 1],
              completed: false,
              isBye: false,
            });
            courtIndex++;
          }
        }
      }
    });
  });

  return newMatches;
}

function generateMeleeMatches(tournament: Tournament): Match[] {
  const { teams, currentRound, courts } = tournament;
  const round = currentRound + 1;
  
  // Shuffle teams randomly for mêlée
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const newMatches: Match[] = [];

  // Create matches for available courts
  let courtIndex = 1;
  for (let i = 0; i < shuffledTeams.length - 1 && courtIndex <= courts; i += 2) {
    const team1 = shuffledTeams[i];
    const team2 = shuffledTeams[i + 1];

    if (team2) {
      newMatches.push({
        id: crypto.randomUUID(),
        round,
        court: courtIndex,
        team1Id: team1.id,
        team2Id: team2.id,
        completed: false,
        isBye: false,
      });
      courtIndex++;
    }
  }

  return newMatches;
}

function havePlayedBefore(team1Id: string, team2Id: string, matches: Match[]): boolean {
  return matches.some(match => 
    (match.team1Id === team1Id && match.team2Id === team2Id) ||
    (match.team1Id === team2Id && match.team2Id === team1Id)
  );
}