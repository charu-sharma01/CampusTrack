
import React, { useState } from 'react';
import { useAppState } from '../store/AppContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, isAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAppState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          campusVerified: true,
          createdAt: new Date().toISOString(),
          ...data // Include token
        });
        onNavigate(data.role === UserRole.ADMIN ? 'admin' : 'dashboard');
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Backend server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-12 relative">
        <button onClick={() => onNavigate('home')} className="absolute top-8 left-8 flex items-center text-slate-500 hover:text-blue-600 transition">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </button>

        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-8">
            <div className="bg-blue-600 p-2 rounded-xl mr-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-none">CampusTrack</h2>
              <p className="text-slate-500 text-sm mt-1">{isAdmin ? 'Admin Portal' : 'Student Portal'}</p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Welcome Back!</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to report or track items.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition pl-12"
                  placeholder="name@campus.edu"
                  required
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition pl-12"
                  placeholder="••••••••"
                  required
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-600">
            New user? <button onClick={() => onNavigate('register')} className="text-blue-600 font-bold hover:underline">Register Here</button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 text-center text-white px-20">
          <div className="bg-white/10 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/20">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
          </div>
          <h2 className="text-4xl font-extrabold mb-6">{isAdmin ? 'Administrator Access' : 'Student Access'}</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            {isAdmin ? 'Manage campus reports, verify item claims, and facilitate the return of belongings to their rightful owners.' : 'Report lost items, browse found items, and track your recovery requests in real-time.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
