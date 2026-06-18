import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pill, Mail, Lock, ArrowLeft, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

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
      
      // Update lastLogin timestamp in Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User exists in Firestore, update lastLogin and set as active
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp(),
            isActive: true
          });
          
          // Get user data from Firestore
          const userData = userDoc.data();
          const firestoreUser: UserType = {
            id: user.uid,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            prescriptions: userData.prescriptions || [],
            isNewUser: false // Returning user
          };
          onLogin(firestoreUser);
        } else {
          // User doesn't exist in Firestore, create basic user object
          const basicUser: UserType = {
            id: user.uid,
            name: user.displayName || user.email || 'User',
            email: user.email || '',
            phone: user.phoneNumber || '',
            address: '',
            prescriptions: [],
            isNewUser: false // Assume returning user if no Firestore data
          };
          onLogin(basicUser);
        }
              } catch (firestoreError) {
          console.error('Error updating lastLogin:', firestoreError);
          // Still login the user even if Firestore update fails
          const fallbackUser: UserType = {
            id: user.uid,
            name: user.displayName || user.email || 'User',
            email: user.email || '',
            phone: user.phoneNumber || '',
            address: '',
            prescriptions: [],
            isNewUser: false // Assume returning user
          };
          onLogin(fallbackUser);
        }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      let result: any;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        // If popup is blocked or closed, fall back to redirect
        console.warn('Popup signin failed, falling back to redirect:', popupErr);
        await signInWithRedirect(auth, provider);
        setIsLoading(false);
        return;
      }
      const user = result.user;

      if (user && user.email && user.displayName) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User exists, update lastLogin and set as active
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
            isNewUser: false // Returning user
          };
          onLogin(firestoreUser);
        } else {
          // New Google user, save to Firestore
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
            isNewUser: true // New Google user
          };
          onLogin(newUser);
        }
      } else {
        setError('Failed to retrieve user information from Google.');
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setError('Google sign-in failed. Please try again. If your browser blocks popups, enable them or use redirect sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle redirect result (in case we used signInWithRedirect fallback)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (!res || !res.user) return;
        const user = res.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, { lastLogin: serverTimestamp(), isActive: true });
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
          if (mounted) onLogin(firestoreUser);
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
          if (mounted) onLogin(newUser);
        }
      } catch (e) {
        // ignore no-redirect result
      }
    })();
    return () => { mounted = false; };
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute -left-16 -top-16 w-72 h-72 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-30 filter blur-3xl transform rotate-12"></div>
      <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-gradient-to-br from-amber-200 to-red-200 rounded-full opacity-30 filter blur-3xl transform -rotate-12"></div>

      <div className="max-w-4xl w-full flex items-center justify-center">
        <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Back
        </Link>

        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-0 transform translate-y-2 -z-10 rounded-3xl bg-gradient-to-tr from-white/30 to-white/10 shadow-2xl" />

          <div className="backdrop-blur-lg bg-white/40 border border-white/30 rounded-3xl p-8 shadow-2xl flex overflow-hidden" style={{ boxShadow: '0 20px 50px rgba(13, 47, 78, 0.12)' }}>
            <div className="w-1/2 hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-sky-500 text-white p-8 rounded-l-2xl">
              <div className="p-4 rounded-xl bg-white/10 shadow-lg mb-4">
                <Pill className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Apomudenfie</h2>
              <p className="text-sm opacity-90 text-white/90 text-center">Your trusted e-pharmacy platform</p>
            </div>

            <div className="flex-1 px-6 py-4">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
                <p className="text-sm text-gray-600 mt-1">Sign in to manage orders and medicines</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot?</Link>
                </div>

                <div className="pt-2">
                  <button type="button" onClick={handleLogin} disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transform transition">
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>

              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-400">or continue with</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div>
                <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
