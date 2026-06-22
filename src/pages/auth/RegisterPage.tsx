import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pill, Mail, Lock, User as UserIcon, ArrowLeft, X, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // Automatically clear error pop-up after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

    // Check all required fields first
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError('Please fill in all fields before submitting');
        setIsLoading(false);
        return;
      }
    }

    // Validation
    if (!acceptTerms) {
      setError('Please accept the terms and conditions to proceed');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('The passwords you entered do not match');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Your password must be at least 6 characters long');
      setIsLoading(false);
      return;
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
      setIsLoading(false);
      
      // Check for the specific duplicate email error code from Firebase
      if (error.code === 'auth/email-already-in-use') {
        setError('The email has already been used');
      } else {
        setError(error.message || 'An unexpected error occurred during registration');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Premium Top-Centered Floating Notification */}
      {error && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4 animate-slide-down">
          <div className="bg-white border border-red-200 shadow-xl rounded-xl p-4 flex items-center justify-between gap-3 backend-error-ui">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-lg text-red-600 flex-shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">Registration Notice</p>
                <p className="text-xs text-gray-500 mt-0.5">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        {/* Back to Landing */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-green-700 p-3 rounded-xl inline-block mb-4">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join AidFidelis for better healthcare</p>
          </div>

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
                <a href="#" className="text-green-600 hover:text-green-700 transition-colors underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 transition-colors underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
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
          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:text-green-900 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <span>Your data is safely protected with industry-standard 256-bit encryption</span>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 transform transition-all duration-300">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-14 w-14 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created</h2>
              <p className="text-gray-600 mb-6 text-sm">Your secure healthcare account was created successfully.</p>
              <button
                className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200"
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