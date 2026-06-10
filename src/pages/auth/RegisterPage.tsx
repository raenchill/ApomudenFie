import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pill, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../../types';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface RegisterPageProps {
  onRegister: (user: UserType) => void;
}

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

  // Firebase Email/Password registration logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    // Check all required fields
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }
    }

    // Firebase registration
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
      // Save user data to Firestore
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
      
      // Only call onRegister after successful Firebase registration
      const newUser: UserType = {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        prescriptions: [],
        isNewUser: true // Mark as new user
      };
      onRegister(newUser);
      setIsLoading(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Registration failed');
      setIsLoading(false);
    }
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

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up transition-all duration-500">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-green-700 p-3 rounded-xl inline-block mb-4">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join MediCare+ for better healthcare</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-green-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

              <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:text-green-900 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🔒 Your data is protected with 256-bit SSL encryption</p>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-500 scale-90 opacity-0 animate-modal-in">
              <div className="text-green-600 text-4xl mb-4 animate-bounceIn">✔️</div>
              <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
              <p className="text-gray-700 mb-4">Your account was created successfully.</p>
              <button
                className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-all"
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/login');
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;