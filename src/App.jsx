import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmergencyPanel from './pages/EmergencyPanel';
import Analytics from './pages/Analytics';
import About from './pages/About';
import MapView from './pages/MapView';
import Login from './pages/Login';
import Register from './pages/Register';
import AIAgent from './pages/AIAgent';
import AIChatbot from './pages/AIChatbot';
import CCTVFeeds from './pages/CCTVFeeds';
import EChallan from './pages/EChallan';
import OfficerMobileApp from './pages/OfficerMobileApp';
import NotificationCenter from './pages/NotificationCenter';
import AIPrediction from './pages/AIPrediction';
import EnterpriseSecurity from './pages/EnterpriseSecurity';
import { logoutUser } from './services/securityService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('itms_auth');
    return saved !== null ? saved === 'true' : true;
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activePage, setActivePage] = useState('cameras');

  // Enterprise Idle Session Timeout Handler (15 minutes = 900,000 ms)
  React.useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Auto logout after 15 minutes of inactivity
      timeoutId = setTimeout(() => {
        logoutUser();
        setIsAuthenticated(false);
        setAuthMode('login');
      }, 15 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated]);

  const handleLogin = () => {
    localStorage.setItem('itms_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setAuthMode('login');
  };

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <Login
        onLogin={handleLogin}
        onNavigateToRegister={() => setAuthMode('register')}
      />
    ) : (
      <Register
        onBackToLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <Navbar
        onLogout={handleLogout}
        onOpenNotifications={() => setActivePage('notifications')}
        onOpenSecurity={() => setActivePage('security')}
      />
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8">
          {activePage === 'dashboard' && <Dashboard onNavigate={(page) => setActivePage(page)} />}
          {activePage === 'security' && <EnterpriseSecurity />}
          {activePage === 'ai-prediction' && <AIPrediction />}
          {activePage === 'emergency' && <EmergencyPanel />}
          {activePage === 'analytics' && <Analytics />}
          {activePage === 'about' && <About />}
          {activePage === 'map' && <MapView />}
          {activePage === 'ai-agent' && <AIAgent />}
          {activePage === 'ai-chatbot' && <AIChatbot />}
          {activePage === 'cameras' && <CCTVFeeds />}
          {activePage === 'echallan' && <EChallan />}
          {activePage === 'officer-mobile' && <OfficerMobileApp />}
          {activePage === 'notifications' && <NotificationCenter />}

          {!['dashboard', 'security', 'ai-prediction', 'emergency', 'analytics', 'about', 'map', 'ai-agent', 'ai-chatbot', 'cameras', 'echallan', 'officer-mobile', 'notifications'].includes(activePage) && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-white/20">
              <p className="text-4xl font-bold uppercase tracking-widest">System Operational</p>
              <p className="mt-2">Accessing {activePage} panel...</p>
            </div>
          )}
        </div>
      </main>

      {/* Global Alerts Overlay */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-4 max-w-md w-full">
        {/* Placeholder for real-time alerts */}
      </div>
    </div>
  );
}

export default App;

