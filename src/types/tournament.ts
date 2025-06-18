export type TournamentType = 'tete-a-tete' | 'doublette' | 'triplette' | 'quadrette' | 'melee';

export interface Player {
  id: string;
  name: string;
  label?: string; // For quadrette (A, B, C, D)
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  performance: number; // Point differential
}

export interface Match {
  id: string;
  round: number;
  court: number;
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  completed: boolean;
  isBye: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  courts: number;
  teams: Team[];
  matches: Match[];
  currentRound: number;
  completed: boolean;
  createdAt: Date;
}
