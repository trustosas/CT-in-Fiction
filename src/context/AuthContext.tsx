import React, { createContext, useContext, useEffect, useState } from 'react';
import { redeemInviteCode } from '../services/firestoreService';

export interface AuthorSession {
  authorName: string;
  role: 'admin' | 'author';
  token?: string;
  loginTime: string;
}

interface AuthContextType {
  session: AuthorSession | null;
  authorName: string | null;
  isAdmin: boolean;
  isAuthor: boolean;
  loading: boolean;
  loginWithCode: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  authorName: null,
  isAdmin: false,
  isAuthor: false,
  loading: true,
  loginWithCode: async () => ({ success: false, message: '' }),
  logout: () => {}
});

const SESSION_KEY = 'ct_author_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthorSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthorSession;
        if (parsed.authorName && (parsed.role === 'admin' || parsed.role === 'author')) {
          setSession(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse author session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const result = await redeemInviteCode(code);
    if (result.success && result.authorName && result.role) {
      const newSession: AuthorSession = {
        authorName: result.authorName,
        role: result.role,
        token: code.trim().toUpperCase(),
        loginTime: new Date().toISOString()
      };
      setSession(newSession);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } catch (e) {}
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  };

  const isAdmin = session?.role === 'admin';
  const isAuthor = !!session?.authorName;

  return (
    <AuthContext.Provider
      value={{
        session,
        authorName: session?.authorName || null,
        isAdmin,
        isAuthor,
        loading,
        loginWithCode,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
