import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Pill } from 'lucide-react';

const PharmacyLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/pharmacy/dashboard');
    } catch (err: any) {
      setError('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -left-24 -top-24 w-72 h-72 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-30 filter blur-3xl transform rotate-12"></div>
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-gradient-to-br from-amber-200 to-red-200 rounded-full opacity-30 filter blur-3xl transform -rotate-12"></div>

      <div className="max-w-3xl w-full flex items-center bg-transparent rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 to-sky-500 p-8 flex-col items-center justify-center text-white">
          <div className="p-3 rounded-xl bg-white/10 mb-4">
            <Pill className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Pharmacy Portal</h2>
          <p className="text-sm opacity-90 mt-2 text-center">Manage inventory, orders and deliveries</p>
        </div>

        <div className="w-full md:w-1/2 bg-white/40 backdrop-blur-lg border border-white/30 p-8 rounded-r-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Sign in to your pharmacy</h3>
          <p className="text-sm text-gray-600 mb-4">Enter your pharmacy credentials to continue</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="pharmacy@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link to="/pharmacy/forgot" className="text-sm text-green-600">Forgot?</Link>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow hover:scale-[1.01] transition">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;
