import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import { User as UserType } from '../../types';
import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import logoImg from '/src/assets/Aidfidelis logo background.png';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

const getFriendlyLoginErrorMessage = (errorText: string): string => {
  if (errorText.includes('auth/invalid-credential') || errorText.includes('auth/wrong-password') || errorText.includes('auth/user-not-found')) {
    return 'Invalid email address or password.';
  }
  if (errorText.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (errorText.includes('auth/network-request-failed')) {
    return 'Connection failed. Please check your internet connection.';
  }
  return errorText;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp(),
            isActive: true
          });
          
          const userData = userDoc.data();
          const firestoreUser: UserType = {
            id: user.uid,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            prescriptions: userData.prescriptions || [],
            isNewUser: false 
          };
          onLogin(firestoreUser);
        } else {
          const basicUser: UserType = {
            id: user.uid,
            name: user.displayName || user.email || 'User',
            email: user.email || '',
            phone: user.phoneNumber || '',
            address: '',
            prescriptions: [],
            isNewUser: false 
          };
          onLogin(basicUser);
        }
      } catch (firestoreError) {
        console.error('Error updating lastLogin:', firestoreError);
        const fallbackUser: UserType = {
          id: user.uid,
          name: user.displayName || user.email || 'User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          address: '',
          prescriptions: [],
          isNewUser: false 
        };
        onLogin(fallbackUser);
      }
    } catch (err: any) {
      setError(getFriendlyLoginErrorMessage(err.message || 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email && user.displayName) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp(),
            isActive: true
          });
          
          const userData = userDoc.data();
          const firestoreUser: UserType = {
            id: user.uid,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || user.phoneNumber || '',
            address: userData.address || '',
            prescriptions: userData.prescriptions || [],
            isNewUser: false 
          };
          onLogin(firestoreUser);
        } else {
          const newUserData = {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber || '',
            address: '',
            prescriptions: [],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isActive: true
          };
          
          await setDoc(userDocRef, newUserData);
          
          const newUser: UserType = {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber || '',
            address: '',
            prescriptions: [],
            isNewUser: true 
          };
          onLogin(newUser);
        }
      } else {
        setError('Failed to retrieve user information from Google.');
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased">
      
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[70%] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[40%] -left-[20%] w-[50%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Back to Landing */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Floating Glassmorphism Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-5">
              <img 
                src={logoImg} 
                alt="AidFidelis Logo" 
                className="w-16 h-16 object-contain" 
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium text-sm">Sign in to your AidFidelis account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
              <Activity className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500/30 border-slate-300 rounded transition-all cursor-pointer"
                />
                <span className="ml-2 text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600 disabled:bg-slate-300 disabled:text-slate-500 transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 font-bold text-slate-700 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 mt-8 font-medium text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-600 hover:text-violet-700 font-extrabold transition-colors">
              Create one now
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400/80">
          <ShieldCheck className="w-4 h-4" />
          <p>Protected by 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;