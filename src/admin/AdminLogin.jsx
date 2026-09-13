import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { sendPasswordResetEmailToSupabase } from '../lib/supabase';
import { BRAND } from '../config/brand';

export default function AdminLogin() {
  const { session, signIn } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');

  if (session) {
    const redirectTo = location.state?.from?.pathname || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(cleanEmail, cleanPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Sign in failed. Check your email and password.');
      return;
    }
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setResetError('');
    const cleanEmail = (resetEmail || email).trim().toLowerCase();

    if (!cleanEmail) {
      setResetError('Please enter your admin email address.');
      return;
    }

    setResetSubmitting(true);
    const result = await sendPasswordResetEmailToSupabase(cleanEmail);
    setResetSubmitting(false);

    if (!result.success) {
      setResetError(result.message || 'Could not send recovery link. Ensure this email is registered in Supabase.');
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl p-7 sm:p-8 space-y-6">
        {mode === 'login' ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#6B1518] text-[#D3923A] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                {BRAND.name?.slice(0, 2)?.toUpperCase() || 'AV'}
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#6B1518]">Admin Sign In</h1>
              <p className="text-[11px] text-gray-500">{BRAND.name} Store CMS — Authorized access only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aalayavastra2026@gmail.com"
                    className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-800">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setError('');
                      setResetError('');
                      setResetSent(false);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-[#6B1518] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl animate-fadeIn">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{submitting ? 'Signing In...' : 'Sign In as Admin'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D3923A]" />
                Protected by Supabase 256-bit Encrypted Authentication
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Forgot Password Mode */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#D3923A] flex items-center justify-center mx-auto shadow-xs border border-amber-100">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#6B1518]">Reset Admin Password</h1>
              <p className="text-[11px] text-gray-500">
                {resetSent
                  ? 'Check your inbox for the recovery link'
                  : 'Enter your admin email to receive a password recovery link'}
              </p>
            </div>

            {resetSent ? (
              <div className="space-y-5 text-center py-2 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <p className="font-bold text-gray-900">Recovery Email Dispatched</p>
                  <p className="text-[11px] leading-relaxed">
                    A secure reset link has been sent to <strong className="text-gray-900">{resetEmail || email}</strong>.
                    Click the link in your email to set your new admin password.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    (Be sure to check your Spam or Junk folder if you don't see it within a minute.)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetSent(false);
                    setError('');
                  }}
                  className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Return to Admin Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Registered Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={resetEmail || email}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setEmail(e.target.value);
                      }}
                      placeholder="aalayavastra2026@gmail.com"
                      className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl animate-fadeIn">
                    {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
                >
                  {resetSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>{resetSubmitting ? 'Sending Recovery Link...' : 'Send Recovery Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetError('');
                  }}
                  className="w-full text-center text-xs font-bold text-gray-600 hover:text-gray-900 py-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
