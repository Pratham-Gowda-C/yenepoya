import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Check for local development mock session
      const savedUser = localStorage.getItem('agripulse_dev_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setSession({ access_token: 'dev-token-xyz' });
        } catch {
          // ignore
        }
      } else {
        // Automatically provide default dev user so application is immediately usable
        const defaultDevUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'farmer@agripulse.ai',
          user_metadata: { full_name: 'Kisan Patel' },
        };
        setUser(defaultDevUser);
        setSession({ access_token: 'dev-token-xyz' });
        localStorage.setItem('agripulse_dev_user', JSON.stringify(defaultDevUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      return data;
    } else {
      const devUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(devUser);
      setSession({ access_token: 'dev-token-xyz' });
      localStorage.setItem('agripulse_dev_user', JSON.stringify(devUser));
      return { user: devUser };
    }
  };

  const register = async (email, password, fullName, language = 'en') => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            preferred_language: language,
          },
        },
      });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      return data;
    } else {
      const devUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        user_metadata: { full_name: fullName, preferred_language: language },
      };
      setUser(devUser);
      setSession({ access_token: 'dev-token-xyz' });
      localStorage.setItem('agripulse_dev_user', JSON.stringify(devUser));
      return { user: devUser };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('agripulse_dev_user');
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`,
      });
      if (error) throw error;
      return data;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        logout,
        resetPassword,
        isAuthenticated: Boolean(user),
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
