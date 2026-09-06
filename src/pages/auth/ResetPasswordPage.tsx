import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { auth } from '../../firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { extractActionCodeFromURL, cleanupResetURL } from '../../utils/firebaseAuthUtils';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(true);

  // Extract action code from URL using utility function
  const oobCode = extractActionCodeFromURL();

  useEffect(() => {
    const verifyCode = async () => {
      console.log('Checking for action code in URL...');
      console.log('Current URL:', window.location.href);
      console.log('Extracted action code:', oobCode);
      
      if (!oobCode) {
        setError('Invalid password reset link. Please request a new one.');
        setIsCheckingCode(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch (error: any) {
        console.error('Code verification error:', error);
        switch (error.code) {
          case 'auth/invalid-action-code':
            setError('This password reset link has expired or is invalid. Please request a new one.');
            break;
          case 'auth/expired-action-code':
            setError('This password reset link has expired. Please request a new one.');
            break;
          default:
            setError('Invalid password reset link. Please request a new one.');
        }
      } finally {
        setIsCheckingCode(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!oobCode) {
      setError('Invalid password reset link');
      setIsLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      // Clean up the URL after successful reset
      cleanupResetURL();
    } catch (error: any) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/invalid-action-code':
          setError('This password reset link has expired or is invalid. Please request a new one.');
          break;
        case 'auth/expired-action-code':
          setError('This password reset link has expired. Please request a new one.');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (isCheckingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
          <p className="text-gray-600">Please wait while we verify your password reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-violet-600" />
              <h3 className="text-lg font-semibold text-violet-800">Password Reset Successful!</h3>
            </div>
            <p className="text-violet-700 mb-4">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-700">{error}</p>
                {error.includes('expired') || error.includes('invalid') ? (
                  <Link 
                    to="/forgot-password" 
                    className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                  >
                    Request new reset link
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Form */}
        {isValidCode && !success && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-violet-600 hover:text-violet-800 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Your new password will be securely encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 