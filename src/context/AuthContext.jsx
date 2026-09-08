import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  signUpCustomer,
  signInCustomer,
  sendPasswordResetEmailToSupabase,
  updateCustomerPasswordInSupabase,
} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_registered_users');
      return saved ? JSON.parse(saved) : [
        {
          id: 'usr_harini',
          name: 'Harini Jupudy',
          email: 'harini@aalayavastra.com',
          phone: '9390299611',
          password: 'password123',
          addresses: [
            {
              id: 'addr_1',
              type: 'Home',
              name: 'Harini Jupudy',
              phone: '9390299611',
              addressLine: 'Door No 4-12, Main Bazaar Road',
              city: 'Rajahmundry',
              state: 'Andhra Pradesh',
              pincode: '533101',
              isDefault: true,
            }
          ],
          createdAt: '2026-01-15T10:00:00.000Z',
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('aalaya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aalaya_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aalaya_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active via Supabase auth link.');
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const hydrated = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            addresses: [],
          };
          setUser(hydrated);
        } catch (e) {
          console.warn('Profile fetch error:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 1. Sign Up / Create Account
  const signup = async ({ name, email, password, phone = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    // Call real Supabase Auth Sign Up first
    let supabaseUserId = null;
    try {
      const supaRes = await signUpCustomer({
        email: cleanEmail,
        password,
        name: name.trim(),
        phone: cleanPhone,
      });

      if (!supaRes.success) {
        // If error contains user already registered
        if (supaRes.message && (supaRes.message.includes('already') || supaRes.message.includes('registered'))) {
          return { success: false, error: 'An account with this email address already exists. Please Log In.' };
        }
      } else if (supaRes.data?.user?.id) {
        supabaseUserId = supaRes.data.user.id;
      }
    } catch (e) {
      console.warn('Supabase signup notice:', e);
    }

    const newUser = {
      id: supabaseUserId || `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      addresses: [
        {
          id: `addr_${Date.now()}`,
          type: 'Home',
          name: name.trim(),
          phone: cleanPhone || '9390299611',
          addressLine: 'Main Bazaar',
          city: 'Rajahmundry',
          state: 'Andhra Pradesh',
          pincode: '533101',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev.filter((u) => u.email !== cleanEmail), newUser]);
    setUser(newUser);

    return { success: true, user: newUser };
  };

  // 2. Login with Email & Password
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both Email and Password.' };
    }

    // Try Supabase Auth First
    try {
      const supaRes = await signInCustomer({ email: cleanEmail, password });
      if (supaRes.success && supaRes.data?.user) {
        const u = supaRes.data.user;
        const loggedUser = {
          id: u.id,
          name: u.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: u.email,
          phone: u.user_metadata?.phone || '',
          addresses: [],
        };
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      } else if (supaRes.message && !supaRes.message.includes('fetch')) {
        // Return clear Supabase message
        if (supaRes.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check and try again.' };
        }
      }
    } catch (e) {
      console.warn('Supabase login error check:', e);
    }

    // Fallback: Check local registered users
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'No account found with this email address. Please Create an Account first.',
      };
    }

    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again or click Forgot Password.' };
    }

    setUser(found);
    return { success: true, user: found };
  };

  // 3. Send Password Reset Email
  const sendPasswordResetEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    try {
      const supaRes = await sendPasswordResetEmailToSupabase(cleanEmail);
      if (!supaRes.success) {
        return {
          success: false,
          error: supaRes.message || 'Failed to send reset link via Supabase.',
        };
      }

      return {
        success: true,
        email: cleanEmail,
        message: `Password reset link sent to ${cleanEmail}`,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'Error communicating with Supabase auth service.',
      };
    }
  };

  // 4. Update Password
  const updatePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const supaRes = await updateCustomerPasswordInSupabase(newPassword);
      if (!supaRes.success) {
        return { success: false, error: supaRes.message || 'Failed to update password.' };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // 5. Update Profile
  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // 6. Add Address (Saves to user profile and localStorage, syncing to Account page)
  const addAddress = (address) => {
    let createdAddr = null;
    setUser((prev) => {
      const baseUser = prev || {
        id: `usr_${Date.now()}`,
        name: address.name || 'Customer',
        phone: address.phone || '',
        email: address.email || '',
        addresses: [],
      };
      createdAddr = {
        ...address,
        id: address.id || `addr_${Date.now()}`,
        isDefault: (baseUser.addresses || []).length === 0,
      };
      const newAddresses = [...(baseUser.addresses || []), createdAddr];
      const updated = { ...baseUser, addresses: newAddresses };
      try {
        localStorage.setItem('aalaya_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      if (prev?.id) {
        setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      }
      return updated;
    });
    return createdAddr;
  };

  // 7. Logout
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('aalaya_user');
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signup,
        login,
        sendPasswordResetEmail,
        updatePassword,
        updateProfile,
        addAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
