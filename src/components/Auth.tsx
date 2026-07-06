/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Gift, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { simDb } from '../utils/simDb';
import { User as UserType } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserType) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [referral, setReferral] = useState('');
  
  // Forgot Password Interactive States
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const result = simDb.login(email, password);
        if (result.success && result.user) {
          onAuthSuccess(result.user);
        } else {
          setError(result.error || "Login failed.");
          setLoading(false);
        }
      } else if (mode === 'register') {
        if (!name || !email || !password || !whatsapp) {
          setError("All fields (except referral) are required.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        
        const signupResult = simDb.signup({ name, email, whatsapp, referral });
        if (signupResult.success && signupResult.user) {
          // Store password
          const result = simDb.login(email, password);
          if (result.success && result.user) {
            onAuthSuccess(result.user);
          }
        } else {
          setError(signupResult.error || "Registration failed.");
          setLoading(false);
        }
      } else {
        // Forgot password flow
        if (forgotStep === 'request') {
          if (!email) {
            setError("Please enter your email address.");
            setLoading(false);
            return;
          }
          
          // Verify user exists in sim database
          const users = JSON.parse(localStorage.getItem('sim_users') || '[]');
          const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
          
          if (user) {
            // Generate a random 6-digit verification code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedCode(code);
            setSuccess(`SIMULATED EMAIL SENT! A secure 6-digit Reset Code (${code}) has been simulated to your email. Please enter this code and your new password below.`);
            setForgotStep('reset');
          } else {
            setError("No registered account found with this email address.");
          }
          setLoading(false);
        } else {
          // Verification and reset step
          if (!verificationCode) {
            setError("Please enter the 6-digit reset code.");
            setLoading(false);
            return;
          }
          if (verificationCode !== expectedCode) {
            setError("Incorrect simulated reset code. Please check the code provided in the green box above.");
            setLoading(false);
            return;
          }
          if (!newPassword || newPassword.length < 6) {
            setError("New Password must be at least 6 characters long.");
            setLoading(false);
            return;
          }

          // Reset password in local sim database
          const resetResult = simDb.resetPassword(email, newPassword);
          if (resetResult.success) {
            setSuccess("SUCCESS! Your password has been successfully reset. You can now log in with your new password.");
            setMode('login');
            setForgotStep('request');
            setVerificationCode('');
            setNewPassword('');
            setPassword(newPassword); // Pre-fill password on login screen
          } else {
            setError(resetResult.error || "Failed to reset password.");
          }
          setLoading(false);
        }
      }
    }, 800); // Small realistic network delay
  };

  const handleDemoFill = () => {
    setEmail('demo@example.com');
    setPassword('password');
    setMode('login');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden" id="auth-page">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden relative p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center text-white shadow-lg shadow-blue-200 mb-4 animate-bounce">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">RupeeGrow</h2>
          <p className="text-slate-500 text-sm mt-1">Pakistan's Premier Ad & Task Earning Portal</p>
        </div>

        {/* Demo filler helper */}
        {mode === 'login' && (
          <div className="mb-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-blue-700 font-medium">
              Want a quick test?{' '}
              <button 
                type="button" 
                onClick={handleDemoFill}
                className="underline font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Use Demo Account (Credits included)
              </button>
            </p>
          </div>
        )}

        {/* Form Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-100 text-sm flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-600" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                disabled={mode === 'forgot' && forgotStep === 'reset'}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all ${
                  mode === 'forgot' && forgotStep === 'reset' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">WhatsApp Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MessageSquare size={18} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03363135004"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && forgotStep === 'reset' && (
            <>
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">6-Digit Reset Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep('request');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1">
                <Gift size={13} className="text-blue-500" />
                Referral Code <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DEMO786"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Sign In To Account' : mode === 'register' ? 'Create Free Account' : forgotStep === 'request' ? 'Send Reset Code' : 'Reset Password & Login'}
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <p className="text-sm text-slate-500 font-medium">
            {mode === 'login' ? "Don't have an account?" : mode === 'register' ? "Already registered?" : "Remembered your password?"}{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setForgotStep('request');
                setVerificationCode('');
                setNewPassword('');
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
