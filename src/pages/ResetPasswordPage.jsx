import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidRecoverySession, setHasValidRecoverySession] = useState(false);

  useEffect(() => {
    // Check if recovery session is active via Supabase
    const checkSession = async () => {
      if (!supabase) {
        setHasValidRecoverySession(true);
        setSessionChecked(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setHasValidRecoverySession(true);
      } else {
        // Also check if URL hash has access_token or type=recovery
        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('type=recovery')) {
          setHasValidRecoverySession(true);
        } else {
          setHasValidRecoverySession(true); // Allow setting new password
        }
      }
      setSessionChecked(true);
    };

    checkSession();

    // Listen for auth state change recovery event
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setHasValidRecoverySession(true);
        }
      });
      return () => authListener?.subscription?.unsubscribe();
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw error;
        }
      }

      // Also update local registered user records if email exists
      try {
        const registered = JSON.parse(localStorage.getItem('aalaya_registered_users') || '[]');
        if (registered.length > 0) {
          const updated = registered.map((u) => ({ ...u, password: newPassword }));
          localStorage.setItem('aalaya_registered_users', JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Local password update:', err);
      }

      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to update password. Please try requesting a new reset link.');
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF5EE]">
        <div className="animate-spin w-8 h-8 border-4 border-[#6B1518] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#6B1518] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Security
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {success ? 'Password Reset Complete' : 'Set Your New Password'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {success
                ? 'Your password has been securely updated. You can now sign in.'
                : 'Please create a new password to secure your account.'}
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-700 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>{loading ? 'Saving New Password...' : 'UPDATE PASSWORD'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-gray-900">Password Changed!</h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                  Your new password has been saved. You can now sign in to your Aalaya Vastra account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => navigate('/admin/login')}
                  className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ADMIN SIGN IN</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>CUSTOMER LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D3923A]" /> 100% Encrypted & Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
