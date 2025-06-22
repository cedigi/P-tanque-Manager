import React, { useState } from 'react';
import { Match, Team } from '../types/tournament';
import { Play, Edit3, MapPin, Trophy, Printer, ChevronDown } from 'lucide-react';

interface MatchesTabProps {
  matches: Match[];
  teams: Team[];
  currentRound: number;
  courts: number;
  onGenerateRound: () => void;
  onUpdateScore: (matchId: string, team1Score: number, team2Score: number) => void;
  onUpdateCourt: (matchId: string, court: number) => void;
}

export function MatchesTab({
  matches,
  teams,
  currentRound,
  courts,
  onGenerateRound,
  onUpdateScore,
  onUpdateCourt
}: MatchesTabProps) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<{ team1: number; team2: number }>({ team1: 0, team2: 0 });
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const isSolo = teams.every(t => t.players.length === 1);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || (isSolo ? 'Joueur inconnu' : 'Équipe inconnue');
  };

  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return '';
    return team.players
      .map(player => (player.label ? `[${player.label}] ${player.name}` : player.name))
      .join(', ');
  };

  const getGroupLabel = (ids: string[]) => {
    const labels = ids.map(id => {
      const team = teams.find(t => t.id === id);
      return team?.name || team?.players[0]?.name || 'Inconnu';
    });
    return labels.join(' + ');
  };

  const handleEditScore = (match: Match) => {
    setEditingMatch(match.id);
    setEditScores({
      team1: match.team1Score || 0,
      team2: match.team2Score || 0,
    });
  };

  const handleSaveScore = (matchId: string) => {
    onUpdateScore(matchId, editScores.team1, editScores.team2);
    setEditingMatch(null);
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const groupedMatches = matches.reduce((acc: { [round: number]: Match[] }, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {});

  const sortedRounds = Object.keys(groupedMatches).map(Number).sort((a, b) => b - a);

  const handlePrintRound = (round: number) => {
    const roundMatches = groupedMatches[round];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tour ${round}</title>
          <style>
            body {
              font-family: 'Orbitron', monospace;
              margin: 10px;
              color: #00d4ff;
              background: #0a0a0a;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
              color: #00d4ff;
              text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              border: 1px solid #00d4ff;
            }
            th, td {
              padding: 8px;
              text-align: center;
              border: 1px solid rgba(0, 212, 255, 0.3);
            }
            th:first-child,
            td:first-child {
              text-align: left;
              width: 60px;
            }
            th { 
              background: rgba(0, 212, 255, 0.2);
              font-weight: bold;
              color: #00d4ff;
            }
            tr:nth-child(even) { 
              background: rgba(0, 212, 255, 0.05);
            }
            .score {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              color: #00ff00;
            }
            .team-right {
              padding-left: 20px;
              text-align: center;
            }
            .team {
              text-align: center;
              color: #b3e5fc;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>TOUR ${round}</h1>
          <table>
            <thead>
              <tr>
                <th>TERRAIN</th>
                <th class="team">${isSolo ? 'JOUEUR' : 'ÉQUIPE'}</th>
                <th>SCORE</th>
                <th class="team">${isSolo ? 'JOUEUR' : 'ÉQUIPE'}</th>
              </tr>
            </thead>
            <tbody>
              ${roundMatches.map(match => `
                <tr>
                  <td>${match.isBye ? '-' : (match.court <= courts ? match.court : 'Libre ' + (match.court - courts))}</td>
                  <td class="team">
                    ${match.team1Ids ? getGroupLabel(match.team1Ids) : getTeamName(match.team1Id)}
                    ${!match.team1Ids ? `<br/><small>${getTeamPlayers(match.team1Id)}</small>` : ''}
                  </td>
                  <td class="score">${match.completed || match.isBye ? `${match.team1Score} - ${match.team2Score}` : '- - -'}</td>
                  <td class="team-right team">
                    ${match.isBye ? 'BYE' : match.team2Ids ? getGroupLabel(match.team2Ids) : `${getTeamName(match.team2Id)}<br/><small>${getTeamPlayers(match.team2Id)}</small>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
        <h2 className="text-3xl font-bold neon-text tracking-wider">MATCHS</h2>
        <button
          onClick={onGenerateRound}
          className="cyber-button flex items-center space-x-2 px-6 py-3 rounded-lg font-bold tracking-wide hover:scale-105 transition-all duration-300"
          disabled={teams.length < 2}
          style={{ background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 200, 0, 0.2) 100%)', borderColor: '#00ff00' }}
        >
          <Play className="w-5 h-5" />
          <span>GÉNÉRER TOUR {currentRound + 1}</span>
        </button>
      </div>

      {teams.length < 2 && (
        <div className="cyber-card p-6 rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 140, 0, 0.2) 100%)', borderColor: '#ffa500' }}>
          <p className="text-orange-300 font-medium text-lg">
            Vous devez inscrire au moins 2 {isSolo ? 'joueurs' : 'équipes'} pour générer des matchs.
          </p>
        </div>
      )}

      {sortedRounds.length > 0 && (
        <div className="mb-8">
          <label className="block text-lg font-bold text-cyan-300 mb-4 tracking-wide">
            SÉLECTIONNER UN TOUR À AFFICHER :
          </label>
          <div className="relative inline-block">
            <select
              value={selectedRound || ''}
              onChange={(e) => setSelectedRound(e.target.value ? Number(e.target.value) : null)}
              className="cyber-select appearance-none px-4 py-3 pr-10 rounded-lg font-medium tracking-wide"
            >
              <option value="">TOUS LES TOURS</option>
              {sortedRounds.map(round => (
                <option key={round} value={round} className="bg-slate-800">TOUR {round}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="space-y-8">
        {sortedRounds
          .filter(round => selectedRound === null || round === selectedRound)
          .map(round => (
          <div key={round} className="cyber-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-cyan-400/30 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 102, 204, 0.2) 100%)' }}>
              <h3 className="text-xl font-bold neon-text tracking-wide">
                TOUR {round}
              </h3>
              <button
                onClick={() => handlePrintRound(round)}
                className="cyber-button flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:scale-105 transition-all duration-300"
              >
                <Printer className="w-4 h-4" />
                <span>IMPRIMER</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="cyber-table w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left font-bold tracking-wider">
                      TERRAIN
                    </th>
                    <th className="px-6 py-4 text-center font-bold tracking-wider">
                      {isSolo ? 'JOUEUR' : 'ÉQUIPE'}
                    </th>
                    <th className="px-4 py-4 text-center font-bold tracking-wider">
                      SCORE
                    </th>
                    <th className="px-6 py-4 text-center font-bold tracking-wider">
                      {isSolo ? 'JOUEUR' : 'ÉQUIPE'}
                    </th>
                    <th className="px-4 py-4 text-center font-bold tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMatches[round].map((match) => (
                    <tr key={match.id} className="hover:bg-cyan-400/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.isBye ? (
                          <span className="text-cyan-400/50">-</span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            {match.court > courts ? (
                              <select
                                value={match.court}
                                onChange={(e) => onUpdateCourt(match.id, Number(e.target.value))}
                                className="cyber-select text-sm border-0 rounded font-medium"
                              >
                                <option value={match.court}>{`Libre ${match.court - courts}`}</option>
                                {Array.from({ length: courts }, (_, i) => i + 1).map(court => (
                                  <option key={court} value={court} className="bg-slate-800">{court}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={match.court}
                                onChange={(e) => onUpdateCourt(match.id, Number(e.target.value))}
                                className="cyber-select text-sm border-0 rounded font-medium"
                              >
                                {Array.from({ length: courts }, (_, i) => i + 1).map(court => (
                                  <option key={court} value={court} className="bg-slate-800">{court}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {match.team1Ids ? (
                          <span className="font-bold text-cyan-200">{getGroupLabel(match.team1Ids)}</span>
                        ) : (
                          <>
                            <span className="font-bold text-cyan-200">{getTeamName(match.team1Id)}</span>
                            <div className="mt-1 text-xs text-cyan-400/70">
                              {getTeamPlayers(match.team1Id)}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {editingMatch === match.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="13"
                              value={editScores.team1}
                              onChange={(e) => setEditScores({ ...editScores, team1: Number(e.target.value) })}
                              className="cyber-input w-16 px-2 py-1 text-center rounded font-bold"
                            />
                            <span className="text-cyan-400 font-bold">-</span>
                            <input
                              type="number"
                              min="0"
                              max="13"
                              value={editScores.team2}
                              onChange={(e) => setEditScores({ ...editScores, team2: Number(e.target.value) })}
                              className="cyber-input w-16 px-2 py-1 text-center rounded font-bold"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl font-bold neon-text">
                            {match.completed || match.isBye ? `${match.team1Score} - ${match.team2Score}` : '- - -'}
                          </span>
                        )}
                      </td>
                      <td className="pl-8 pr-6 py-4 whitespace-nowrap text-center">
                        {match.isBye ? (
                          <span className="text-cyan-400/50 italic font-bold">BYE</span>
                        ) : match.team2Ids ? (
                          <span className="font-bold text-cyan-200">{getGroupLabel(match.team2Ids)}</span>
                        ) : (
                          <>
                            <span className="font-bold text-cyan-200">{getTeamName(match.team2Id)}</span>
                            <div className="mt-1 text-xs text-cyan-400/70">
                              {getTeamPlayers(match.team2Id)}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {!match.isBye && (
                          <div className="flex justify-center space-x-2">
                            {editingMatch === match.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveScore(match.id)}
                                  className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-400/10"
                                  title="Sauvegarder"
                                >
                                  <Trophy className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10 text-xl font-bold"
                                  title="Annuler"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditScore(match)}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-cyan-400/10"
                                title="Modifier le score"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16">
          <Play className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold neon-text mb-4 tracking-wide">
            AUCUN MATCH GÉNÉRÉ
          </h3>
          <p className="text-cyan-300/60 text-lg font-medium">
            Générez le premier tour pour commencer le tournoi
          </p>
        </div>
      )}
    </div>
  );
}