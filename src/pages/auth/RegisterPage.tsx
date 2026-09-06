import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, ShieldCheck, Activity, CheckCircle } from 'lucide-react';
import { User as UserType } from '../../types';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import logoImg from '/src/assets/Aidfidelis logo background.png';

interface RegisterPageProps {
  onRegister: (user: UserType) => void;
}

const getFriendlyErrorMessage = (errorText: string): string => {
  if (errorText.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists.';
  }
  if (errorText.includes('auth/weak-password')) {
    return 'Your password is too weak. Please use at least 6 characters.';
  }
  if (errorText.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (errorText.includes('auth/network-request-failed')) {
    return 'Connection failed. Please check your internet connection.';
  }
  return errorText;
};

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError('Please fill in all fields');
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
      const userData = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: '',
        address: '',
        prescriptions: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      const newUser: UserType = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        prescriptions: [],
        isNewUser: true 
      };
      onRegister(newUser);
      setIsLoading(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      const friendlyMessage = getFriendlyErrorMessage(error.message || 'Registration failed');
      setError(friendlyMessage);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased py-12">
      
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[60%] h-[70%] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[460px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Back to Landing */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Floating Glassmorphism Register Card */}
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-500 font-medium text-sm">Join AidFidelis to access premium health services</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
              <Activity className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Create a password (min. 6 chars)"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-2">
              <label className="flex items-start cursor-pointer group">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-violet-600 focus:ring-violet-500/30 border-slate-300 rounded transition-all cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-slate-500 leading-snug group-hover:text-slate-700 transition-colors">
                  I agree to the{' '}
                  <a href="#" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600 disabled:bg-slate-300 disabled:text-slate-500 transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Initializing Profile...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-slate-500 mt-8 font-medium text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 hover:text-violet-700 font-extrabold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400/80">
          <ShieldCheck className="w-4 h-4" />
          <p>Protected by 256-bit SSL encryption</p>
        </div>

        {/* Premium Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 px-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-violet-100">
                <CheckCircle className="w-10 h-10 text-violet-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Account Created!</h2>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Welcome to AidFidelis. Your clinical profile has been successfully initialized.
              </p>
              <button
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600 transition-all duration-300 shadow-md active:scale-95"
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/login');
                }}
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;