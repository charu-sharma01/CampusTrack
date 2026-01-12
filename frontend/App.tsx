
import React, { useState } from 'react';
import { AppProvider, useAppState } from './store/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportItemPage from './pages/ReportItemPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MessagesPage from './pages/MessagesPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { isServerOffline, refreshItems, setDemoMode, demoMode } = useAppState();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'admin-login':
        return <LoginPage onNavigate={setCurrentPage} isAdmin />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'report':
        return <ReportItemPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'messages':
        return <MessagesPage />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isServerOffline && !demoMode && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-bold flex flex-wrap items-center justify-center animate-pulse sticky top-0 z-[60]">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Backend Server Offline (localhost:5000). 
          <button onClick={refreshItems} className="ml-4 underline hover:no-underline font-bold">Retry Connection</button>
          <span className="mx-2">or</span>
          <button onClick={() => setDemoMode(true)} className="bg-white text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition font-bold">Enter Demo Mode</button>
        </div>
      )}
      {demoMode && (
        <div className="bg-amber-500 text-white text-center py-1 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-[60]">
          Running in Demo Mode (Mock Data Only) 
          <button onClick={() => setDemoMode(false)} className="ml-4 underline">Exit Demo</button>
        </div>
      )}
      {currentPage !== 'login' && currentPage !== 'admin-login' && currentPage !== 'register' && (
        <Navbar onNavigate={setCurrentPage} />
      )}
      <main className="flex-grow">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
