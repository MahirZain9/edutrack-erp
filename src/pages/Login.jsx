import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import { Mail, Lock, Phone, Hash, Sparkles, LogIn } from 'lucide-react';

const Login = () => {
  const { loginWithEmail, loginParent } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');

  // Staff inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Parent inputs
  const [mobile, setMobile] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!rollNumber) {
      setError("Please enter your child's roll number.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginParent(mobile, rollNumber);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-900">

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md space-y-8 p-8 bg-white/95 rounded-3xl shadow-2xl border border-white/20 glass-card">

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 p-3 bg-rose-50 rounded-2xl shadow-inner flex items-center justify-center mb-4 border border-rose-100 hover-scale">
            <img src={logo} alt="Era Campus Logo" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Era Campus</h2>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">Unified School ERP Portal</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => { setActiveTab('staff'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'staff' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Login
          </button>
          <button
            onClick={() => { setActiveTab('parent'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'parent' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Parent Login
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl animate-fade-in flex gap-2">
            <span className="shrink-0 flex items-center justify-center w-4 h-4 bg-rose-200 text-rose-700 rounded-full font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'staff' ? (
          <form className="mt-6 space-y-5" onSubmit={handleStaffLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
                <div className="relative mt-1">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                    placeholder="admin@eracampus.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Password</label>
                <div className="relative mt-1">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold text-white school-gradient rounded-xl shadow-md hover:shadow-lg focus:outline-none transition-all duration-200 hover-scale disabled:opacity-50">
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-4 w-4 text-rose-200 group-hover:text-white" />
                </span>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-normal">
              <p className="font-bold text-slate-600 mb-0.5 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Sandbox Login Hints:
              </p>
              <p>• <b>Admin</b>: admin@edutrack.com | admin123</p>
              <p className="mt-0.5">• <b>Teacher</b>: teacher@edutrack.com | teacher123</p>
            </div>
          </form>

        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleParentLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel" required maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Child's Roll Number</label>
                <div className="relative mt-1">
                  <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold text-white school-gradient rounded-xl shadow-md hover:shadow-lg focus:outline-none transition-all duration-200 hover-scale disabled:opacity-50">
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-4 w-4 text-rose-200 group-hover:text-white" />
                </span>
                {loading ? 'Signing In...' : 'Login'}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-normal">
              <p className="font-bold text-slate-600 mb-0.5 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Note:
              </p>
              <p>Apna registered mobile number aur bachhe ka roll number dalein.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
