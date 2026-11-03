import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import {
  CloudUserSession,
  getCachedCloudSession,
  saveCachedCloudSession,
  cloudLogin,
  cloudRegister,
  cloudResetPassword,
  CloudUserData,
} from '../services/cloudApi';

interface AuthContextType {
  user: (User | CloudUserSession) | null;
  loading: boolean;
  initialCloudData: CloudUserData | null;
  loginWithEmail: (email: string, pass: string) => Promise<CloudUserData | null>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<CloudUserData | null>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User | CloudUserSession) | null>(() => getCachedCloudSession());
  const [initialCloudData, setInitialCloudData] = useState<CloudUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase session if user signs in with Google
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const session: CloudUserSession = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
        };
        setUser(session);
        saveCachedCloudSession(session);
      } else {
        const cached = getCachedCloudSession();
        if (cached) {
          setUser(cached);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<CloudUserData | null> => {
    const cleanEmail = email.trim();
    // Primary: Cloud server authentication shared across PC and Mobile
    const result = await cloudLogin(cleanEmail, pass);
    setUser(result.user);
    saveCachedCloudSession(result.user);
    if (result.data) {
      setInitialCloudData(result.data);
    }
    return result.data || null;
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string
  ): Promise<CloudUserData | null> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    // Primary: Cloud server registration shared across PC and Mobile
    const result = await cloudRegister(cleanEmail, pass, cleanName);
    setUser(result.user);
    saveCachedCloudSession(result.user);
    if (result.data) {
      setInitialCloudData(result.data);
    }
    return result.data || null;
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const session: CloudUserSession = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          emailVerified: cred.user.emailVerified,
        };
        setUser(session);
        saveCachedCloudSession(session);
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim();
    await cloudResetPassword(cleanEmail);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    saveCachedCloudSession(null);
    setUser(null);
    setInitialCloudData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialCloudData,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
