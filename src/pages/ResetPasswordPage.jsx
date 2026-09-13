import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { supabase, isUserAdmin } from '../lib/supabase';
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
  const [isUserAnAdmin, setIsUserAnAdmin] = useState(false);

  useEffect(() => {
    // Check if authentic recovery session or token is active
    const checkSession = async () => {
      const hash = window.location.hash || '';
      const hasRecoveryToken =
        hash.includes('access_token') ||
        hash.includes('type=recovery') ||
        hash.includes('type=invite') ||
        window.location.search.includes('type=recovery');

      if (!supabase) {
        // In local mock mode, require hash or existing auth
        if (hasRecoveryToken || user) {
          setHasValidRecoverySession(true);
        } else {
          setHasValidRecoverySession(false);
        }
        setSessionChecked(true);
        return;
      }

      // Check real Supabase recovery session
      const { data } = await supabase.auth.getSession();
      if (data?.session && (hasRecoveryToken || data.session.user)) {
        setHasValidRecoverySession(true);
        if (data.session.user) {
          const admin = await isUserAdmin(data.session.user.id, data.session.user.email);
          setIsUserAnAdmin(admin);
        }
      } else if (hasRecoveryToken) {
        setHasValidRecoverySession(true);
      } else {
        // STRICT SECURITY GATE: No recovery token or recovery session found!
        setHasValidRecoverySession(false);
      }
      setSessionChecked(true);
    };

    checkSession();

    // Listen for auth state change recovery event
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setHasValidRecoverySession(true);
          if (session?.user) {
            const admin = await isUserAdmin(session.user.id, session.user.email);
            setIsUserAnAdmin(admin);
          }
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
      let currentUserEmail = null;
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw error;
        }

        const { data: userData } = await supabase.auth.getUser();
        currentUserEmail = userData?.user?.email;
        if (userData?.user) {
          const admin = await isUserAdmin(userData.user.id, userData.user.email);
          setIsUserAnAdmin(admin);
        }
      }

      // STRICT SECURITY: ONLY update the authenticated user's record in local storage
      try {
        const registered = JSON.parse(localStorage.getItem('aalaya_registered_users') || '[]');
        if (registered.length > 0 && currentUserEmail) {
          const updated = registered.map((u) =>
            u.email && u.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
              ? { ...u, password: newPassword }
              : u
          );
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

  // STRICT SECURITY GATE: Block direct unauthenticated access to reset password
  if (!hasValidRecoverySession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:py-16 bg-[#FAF5EE]">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#6B1518] text-white p-8 sm:p-10 text-center sm:text-left">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Security Guard
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mt-1">
              Valid email recovery token required to set a new password.
            </p>
          </div>

          <div className="p-7 sm:p-10 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Invalid or Missing Reset Link
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                For your account security, passwords can only be changed by clicking the official recovery link sent to your registered email address.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <p className="font-bold">🔒 Protected Action:</p>
              <p>Direct access to this page without clicking an authentic email recovery link is forbidden. Please request a new reset link below.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/forgot-password"
                className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md text-center transition-all flex items-center justify-center gap-1.5"
              >
                <span>REQUEST RESET LINK</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl text-center transition-all flex items-center justify-center"
              >
                <span>RETURN TO LOGIN</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D3923A]" /> 100% Encrypted &amp; Secure
              </span>
            </div>
          </div>
        </div>
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
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  {isUserAnAdmin ? 'Admin Password Changed!' : 'Password Changed!'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                  {isUserAnAdmin
                    ? 'Your administrator password has been updated securely. You can now access the CMS dashboard.'
                    : 'Your password has been saved. You can now sign in to your Aalaya Vastra account.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isUserAnAdmin ? (
                  <>
                    <button
                      onClick={() => navigate('/admin/login')}
                      className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>SIGN IN TO ADMIN PANEL</span>
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>GO TO STOREFRONT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>CUSTOMER LOGIN</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate('/shop')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>CONTINUE SHOPPING</span>
                    </button>
                  </>
                )}
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
