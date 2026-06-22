import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pill, Mail, Lock, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../../types';
import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
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
      const result = await signInWithPopup(auth, provider);
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
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        const mockUser: UserType = {
          id: '1',
          name: 'John Doe',
          email: email,
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, State 12345',
          prescriptions: []
        };
        onLogin(mockUser);
      } else {
        setError('Please fill in all fields');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Landing */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-green-700 p-3 rounded-xl inline-block mb-4">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your AidFidelis account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-700 hover:text-green-900 transition-colors">
                Forgot password?
              </Link>
            </div>

              <button onClick={handleLogin}
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-green-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-green-200"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 hover:text-green-900 font-semibold transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🔒 Your data is protected with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
