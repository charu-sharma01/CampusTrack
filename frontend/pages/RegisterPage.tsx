
import React, { useState } from 'react';
import { useAppState } from '../store/AppContext';
import { UserRole } from '../types';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { setCurrentUser } = useAppState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: UserRole.STUDENT
        })
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
        onNavigate('dashboard');
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Backend server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-12">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-8">
            <div className="bg-blue-600 p-2 rounded-xl mr-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-none">CampusTrack</h2>
              <p className="text-slate-500 text-sm mt-1">Student Registration</p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Create Account</h1>
          <p className="text-slate-500 mb-8">Join Campus Track to start reporting and tracking lost items.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                placeholder="John Doe"
                required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                placeholder="student@university.edu"
                required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                  placeholder="Create password"
                  required
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                  placeholder="Confirm password"
                  required
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-6 disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-600">
            Already have an account? <button onClick={() => onNavigate('login')} className="text-blue-600 font-bold hover:underline">Sign In</button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 text-white max-w-md text-center">
           <h2 className="text-4xl font-extrabold mb-12">Why Join Campus Track?</h2>
           <ul className="space-y-8 text-left">
             <li className="flex items-center text-xl">
               <div className="bg-white/20 p-2 rounded-full mr-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
               Quick reporting
             </li>
             <li className="flex items-center text-xl">
               <div className="bg-white/20 p-2 rounded-full mr-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
               Real-time tracking
             </li>
             <li className="flex items-center text-xl">
               <div className="bg-white/20 p-2 rounded-full mr-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
               Instant match alerts
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
