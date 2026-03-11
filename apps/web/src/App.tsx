import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LeadProfile from './components/LeadProfile';
import { ConfigProvider } from './contexts/ConfigContext';
import type { Lead, RecommendationSuggestion } from '@leadloop/shared';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RecommendationSuggestion | null>(null);

  const handleLeadSelect = (lead: Lead, suggestion?: RecommendationSuggestion) => {
    setSelectedLead(lead);
    setSelectedSuggestion(suggestion ?? null);
  };

  const handleBackToDashboard = () => {
    setSelectedLead(null);
    setSelectedSuggestion(null);
  };

  const renderMainContent = () => {
    if (selectedLead) {
      return (
        <LeadProfile
          lead={selectedLead}
          onBack={handleBackToDashboard}
          suggestion={selectedSuggestion}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onLeadSelect={handleLeadSelect} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onLeadSelect={handleLeadSelect} />;
    }
  };

  return (
    <ConfigProvider>
      <div className="ll-shell">
        <Navbar activeView={activeView} onViewChange={setActiveView} />
        <main className="ll-main">{renderMainContent()}</main>
      </div>
    </ConfigProvider>
  );
}

export default App;
