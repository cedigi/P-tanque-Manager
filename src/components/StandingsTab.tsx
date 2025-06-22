import React from 'react';
import { Team } from '../types/tournament';
import { Trophy, TrendingUp, TrendingDown, Printer } from 'lucide-react';

interface StandingsTabProps {
  teams: Team[];
}

export function StandingsTab({ teams }: StandingsTabProps) {
  const isSolo = teams.every(t => t.players.length === 1);
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.performance - a.performance;
  });

  const getPositionIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-gray-300 drop-shadow-lg" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-orange-400 drop-shadow-lg" />;
    return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-cyan-400">{index + 1}</span>;
  };

  const getPerformanceIcon = (performance: number) => {
    if (performance > 0) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (performance < 0) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <div className="w-5 h-5" />;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Résultats</title>
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
              text-align: left;
              border: 1px solid rgba(0, 212, 255, 0.3);
            }
            th { 
              background: rgba(0, 212, 255, 0.2);
              font-weight: bold;
              color: #00d4ff;
            }
            tr:nth-child(even) { 
              background: rgba(0, 212, 255, 0.05);
            }
            .podium { 
              background: linear-gradient(to right, rgba(0, 212, 255, 0.1), transparent);
            }
            .position { 
              font-weight: bold; 
              text-align: center;
            }
            .team-name { 
              font-weight: bold;
              color: #00d4ff;
            }
            .wins { 
              color: #00ff00; 
              font-weight: bold; 
              text-align: center;
            }
            .losses { 
              color: #ff4444; 
              font-weight: bold; 
              text-align: center;
            }
            .performance-positive { 
              color: #00ff00; 
              font-weight: bold;
            }
            .performance-negative { 
              color: #ff4444; 
              font-weight: bold;
            }
            .performance-neutral { 
              color: #b3e5fc;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>RÉSULTATS</h1>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">POSITION</th>
                <th>${isSolo ? 'JOUEUR' : 'ÉQUIPE'}</th>
                <th style="text-align: center;">V</th>
                <th style="text-align: center;">D</th>
                <th style="text-align: center;">+</th>
                <th style="text-align: center;">-</th>
                <th style="text-align: center;">DIFFÉRENTIEL</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTeams.map((team, index) => `
                <tr class="${index < 3 ? 'podium' : ''}">
                  <td class="position">${index + 1}</td>
                  <td class="team-name">
                    ${team.name} - ${team.players.map(player => `${player.label ? `[${player.label}] ` : ''}${player.name}`).join(', ')}
                  </td>
                  <td class="wins">${team.wins}</td>
                  <td class="losses">${team.losses}</td>
                  <td style="text-align: center;">${team.pointsFor}</td>
                  <td style="text-align: center;">${team.pointsAgainst}</td>
                  <td class="performance-${team.performance > 0 ? 'positive' : team.performance < 0 ? 'negative' : 'neutral'}" style="text-align: center;">
                    ${team.performance > 0 ? '+' : ''}${team.performance}
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
        <h2 className="text-3xl font-bold neon-text tracking-wider">CLASSEMENT</h2>
        <div className="flex items-center space-x-6">
          <div className="text-lg text-cyan-300/80 font-medium">
            {teams.length} {isSolo ? 'joueur' : 'équipe'}{teams.length > 1 ? 's' : ''} inscrit{teams.length > 1 ? 's' : ''}
          </div>
          {teams.length > 0 && (
            <button
              onClick={handlePrint}
              className="cyber-button flex items-center space-x-2 px-4 py-2 rounded-lg font-bold tracking-wide hover:scale-105 transition-all duration-300"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMER</span>
            </button>
          )}
        </div>
      </div>

      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cyber-table w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  POSITION
                </th>
                <th className="px-6 py-4 text-left font-bold tracking-wider">
                  {isSolo ? 'JOUEUR' : 'ÉQUIPE'}
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  V
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  D
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  +
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  -
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wider">
                  DIFFÉRENTIEL
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={team.id} className={`hover:bg-cyan-400/10 transition-colors ${
                  index < 3 ? 'bg-gradient-to-r from-cyan-400/10 to-transparent' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      {getPositionIcon(index)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-cyan-200 text-lg">{team.name}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {team.players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2 text-sm text-cyan-400/80 font-medium">
                          {player.label && (
                            <span className="w-5 h-5 bg-cyan-400/20 border border-cyan-400 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
                              {player.label}
                            </span>
                          )}
                          <span>{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-2xl font-bold text-green-400">{team.wins}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-2xl font-bold text-red-400">{team.losses}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-cyan-200">{team.pointsFor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-cyan-200">{team.pointsAgainst}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {getPerformanceIcon(team.performance)}
                      <span className={`text-lg font-bold ${
                        team.performance > 0 ? 'text-green-400' :
                        team.performance < 0 ? 'text-red-400' :
                        'text-cyan-400/60'
                      }`}>
                        {team.performance > 0 ? '+' : ''}{team.performance}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
          <h3 className="text-2xl font-bold neon-text mb-4 tracking-wide">
            AUCUN CLASSEMENT DISPONIBLE
          </h3>
          <p className="text-cyan-300/60 text-lg font-medium">
            Le classement apparaîtra une fois que {isSolo ? 'des joueurs' : 'des équipes'} seront inscrits
          </p>
        </div>
      )}
    </div>
  );
}