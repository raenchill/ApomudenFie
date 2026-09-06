import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { createActionCodeSettings } from '../../utils/firebaseAuthUtils';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = createActionCodeSettings();

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess(true);
      setEmailSent(true);
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many password reset attempts. Please try again later');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('Failed to send password reset email. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setSuccess(false);
    setError('');
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success Message */}
        {success && emailSent && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-violet-600" />
              <h3 className="text-lg font-semibold text-violet-800">Email Sent!</h3>
            </div>
            <p className="text-violet-700 mb-4">
              We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
            </p>
            <p className="text-sm text-violet-600 mb-4">
              <strong>Note:</strong> If the link doesn't work, copy and paste the entire URL from your email into your browser's address bar.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-violet-600">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-sm text-violet-600 space-y-1 ml-4">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Wait a few minutes for the email to arrive</li>
              </ul>
              <button
                onClick={handleResendEmail}
                className="text-violet-700 hover:text-violet-900 font-medium text-sm transition-colors"
              >
                Resend email
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Reset Password Form */}
        {!emailSent && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Reset Link
                  </>
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
          <p>Your email address is secure and will only be used for password reset</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 