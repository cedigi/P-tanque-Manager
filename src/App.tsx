import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TournamentSetup } from './components/TournamentSetup';
import { TabNavigation } from './components/TabNavigation';
import { TeamsTab } from './components/TeamsTab';
import { MatchesTab } from './components/MatchesTab';
import { StandingsTab } from './components/StandingsTab';
import { useTournament } from './hooks/useTournament';
import { RotateCcw } from 'lucide-react';

function App() {
  const [cyberTheme, setCyberTheme] = useState(false);
  const [activeTab, setActiveTab] = useState('teams');
  const {
    tournament,
    createTournament,
    addTeam,
    removeTeam,
    generateRound,
    updateMatchScore,
    updateMatchCourt,
    resetTournament,
  } = useTournament();

  useEffect(() => {
    const savedCyberTheme = localStorage.getItem('cyberTheme') === 'true';
    setCyberTheme(savedCyberTheme);
    if (savedCyberTheme) {
      document.documentElement.classList.add('cyber');
    }
  }, []);

  const toggleCyberTheme = () => {
    const newCyberTheme = !cyberTheme;
    setCyberTheme(newCyberTheme);
    localStorage.setItem('cyberTheme', String(newCyberTheme));
    if (newCyberTheme) {
      document.documentElement.classList.add('cyber');
    } else {
      document.documentElement.classList.remove('cyber');
    }
  };


  const content = !tournament ? (
    <TournamentSetup onCreateTournament={createTournament} />
  ) : (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {tournament.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tournament.type.charAt(0).toUpperCase() +
                tournament.type.slice(1)} • {tournament.courts} terrain
              {tournament.courts > 1 ? 's' : ''} • Tour {tournament.currentRound}
            </p>
          </div>
          <button
            onClick={resetTournament}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Nouveau tournoi"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nouveau tournoi</span>
          </button>
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main>
        {activeTab === 'teams' && (
          <TeamsTab
            teams={tournament.teams}
            tournamentType={tournament.type}
            onAddTeam={addTeam}
            onRemoveTeam={removeTeam}
          />
        )}
        {activeTab === 'matches' && (
          <MatchesTab
            matches={tournament.matches}
            teams={tournament.teams}
            currentRound={tournament.currentRound}
            courts={tournament.courts}
            onGenerateRound={generateRound}
            onUpdateScore={updateMatchScore}
            onUpdateCourt={updateMatchCourt}
          />
        )}
        {activeTab === 'standings' && (
          <StandingsTab teams={tournament.teams} />
        )}
      </main>
    </>
  );

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <Header
          cyberTheme={cyberTheme}
          onToggleCyberTheme={toggleCyberTheme}
        />
        {content}
      </div>
    </div>
  );
}

export default App;
