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
          <title>Matchs Tour ${round} - Pétanque Manager</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 15px;
              display: block;
            }
            .round-info {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background: #f1f5f9; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background: #f8fafc;
            }
            .status-completed { 
              color: #059669; 
              font-weight: bold;
            }
            .status-pending { 
              color: #d97706; 
              font-weight: bold;
            }
            .score { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: center;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo1.png" alt="Pétanque Manager" class="logo" />
            <h1>🏆 Matchs - Tour ${round}</h1>
            <p>Tournoi de Pétanque - ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="round-info">
            <strong>Tour:</strong> ${round} • 
            <strong>Nombre de matchs:</strong> ${roundMatches.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Terrain</th>
                <th>${isSolo ? 'Joueur 1' : 'Équipe 1'}</th>
                <th>Score</th>
                <th>${isSolo ? 'Joueur 2' : 'Équipe 2'}</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${roundMatches.map(match => `
                <tr>
                  <td>${match.isBye ? '-' : (match.court <= courts ? match.court : 'Libre ' + (match.court - courts))}</td>
                  <td>
                    ${match.team1Ids ? getGroupLabel(match.team1Ids) : getTeamName(match.team1Id)}
                    ${!match.team1Ids ? `<br/><small>${getTeamPlayers(match.team1Id)}</small>` : ''}
                  </td>
                  <td class="score">${match.completed || match.isBye ? `${match.team1Score} - ${match.team2Score}` : '- - -'}</td>
                  <td>
                    ${match.isBye ? 'BYE' : match.team2Ids ? getGroupLabel(match.team2Ids) : `${getTeamName(match.team2Id)}<br/><small>${getTeamPlayers(match.team2Id)}</small>`}
                  </td>
                  <td class="${match.completed || match.isBye ? 'status-completed' : 'status-pending'}">
                    ${match.completed || match.isBye ? 'Terminé' : 'En cours'}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Matchs</h2>
        <button
          onClick={onGenerateRound}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          disabled={teams.length < 2}
        >
          <Play className="w-4 h-4" />
          <span>Générer tour {currentRound + 1}</span>
        </button>
      </div>

      {teams.length < 2 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Vous devez inscrire au moins 2 {isSolo ? 'joueurs' : 'équipes'} pour générer des matchs.
          </p>
        </div>
      )}

      {/* Menu déroulant pour sélectionner le tour */}
      {sortedRounds.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sélectionner un tour à afficher :
          </label>
          <div className="relative inline-block">
            <select
              value={selectedRound || ''}
              onChange={(e) => setSelectedRound(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les tours</option>
              {sortedRounds.map(round => (
                <option key={round} value={round}>Tour {round}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="space-y-8">
        {sortedRounds
          .filter(round => selectedRound === null || round === selectedRound)
          .map(round => (
          <div key={round} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tour {round}
              </h3>
              <button
                onClick={() => handlePrintRound(round)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Terrain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isSolo ? 'Joueur 1' : 'Équipe 1'}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isSolo ? 'Joueur 2' : 'Équipe 2'}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupedMatches[round].map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.isBye ? (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {match.court > courts ? (
                              <select
                                value={match.court}
                                onChange={(e) => onUpdateCourt(match.id, Number(e.target.value))}
                                className="text-sm border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0"
                              >
                                <option value={match.court}>{`Libre ${match.court - courts}`}</option>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(court => (
                                  <option key={court} value={court}>{court}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={match.court}
                                onChange={(e) => onUpdateCourt(match.id, Number(e.target.value))}
                                className="text-sm border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0"
                              >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(court => (
                                  <option key={court} value={court}>{court}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {match.team1Ids ? (
                          getGroupLabel(match.team1Ids)
                        ) : (
                          <>
                            {getTeamName(match.team1Id)}
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {getTeamPlayers(match.team1Id)}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingMatch === match.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="13"
                              value={editScores.team1}
                              onChange={(e) => setEditScores({ ...editScores, team1: Number(e.target.value) })}
                              className="w-12 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                            <input
                              type="number"
                              min="0"
                              max="13"
                              value={editScores.team2}
                              onChange={(e) => setEditScores({ ...editScores, team2: Number(e.target.value) })}
                              className="w-12 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            {match.completed || match.isBye ? `${match.team1Score} - ${match.team2Score}` : '- - -'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {match.isBye ? (
                          <span className="text-gray-500 dark:text-gray-400 italic">BYE</span>
                        ) : match.team2Ids ? (
                          getGroupLabel(match.team2Ids)
                        ) : (
                          <>
                            {getTeamName(match.team2Id)}
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {getTeamPlayers(match.team2Id)}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          match.completed || match.isBye
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {match.completed || match.isBye ? 'Terminé' : 'En cours'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {!match.isBye && (
                          <div className="flex justify-center space-x-2">
                            {editingMatch === match.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveScore(match.id)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="Sauvegarder"
                                >
                                  <Trophy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-500 hover:text-gray-700 transition-colors"
                                  title="Annuler"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditScore(match)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Modifier le score"
                              >
                                <Edit3 className="w-4 h-4" />
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
        <div className="text-center py-12">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun match généré
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Générez le premier tour pour commencer le tournoi
          </p>
        </div>
      )}
    </div>
  );
}
