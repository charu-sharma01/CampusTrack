
import React from 'react';
import { useAppState } from '../store/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { currentUser, setCurrentUser } = useAppState();

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-600 p-2 rounded-lg mr-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              CampusTrack
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-blue-600 font-medium transition">Home</button>
            <button onClick={() => onNavigate('report')} className="text-slate-600 hover:text-blue-600 font-medium transition">Report Item</button>
            {currentUser && (
               <button onClick={() => onNavigate('messages')} className="text-slate-600 hover:text-blue-600 font-medium transition flex items-center">
                 Messages
               </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">Hi, {currentUser.name}</span>
                <button 
                  onClick={() => onNavigate(currentUser.role === UserRole.ADMIN ? 'admin' : 'dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { setCurrentUser(null); onNavigate('home'); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => onNavigate('admin-login')} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition">Admin Access</button>
                <span className="text-slate-200">|</span>
                <button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-700 hover:text-blue-600">Login</button>
                <button onClick={() => onNavigate('register')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
