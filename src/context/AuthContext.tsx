import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  AppUserSession,
  getCurrentSession,
  saveCurrentSession,
  registerLocalAccount,
  authenticateLocalAccount,
  resetLocalUserPassword,
} from '../utils/localAuth';

interface AuthContextType {
  user: (User | AppUserSession) | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with existing active local session if any for zero-flicker UX
  const [user, setUser] = useState<(User | AppUserSession) | null>(() => getCurrentSession());
  const [loading, setLoading] = useState(true);

  const syncUserProfile = async (u: { uid: string; email?: string | null; displayName?: string | null }, customName?: string) => {
    try {
      const userRef = doc(db, 'users', u.uid);
      await setDoc(
        userRef,
        {
          uid: u.uid,
          email: u.email || '',
          displayName: customName || u.displayName || '',
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not sync user profile to Firestore (using local persistence):', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        saveCurrentSession({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
        });
        syncUserProfile(currentUser);
      } else {
        // If Firebase does not have an active session, verify local session
        const local = getCurrentSession();
        if (local) {
          setUser(local);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        setUser(cred.user);
        saveCurrentSession({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          emailVerified: cred.user.emailVerified,
        });
        await syncUserProfile(cred.user);
        return;
      }
    } catch (err: any) {
      console.warn('Firebase loginWithEmail failed, verifying local authentication fallback:', err);
      const code = err?.code || '';
      const msg = err?.message || '';
      const fullError = `${code} ${msg}`.toLowerCase();

      // If wrong password was explicitly verified by Firebase, throw it directly
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        // Try local account check first just in case user was registered locally
        try {
          const session = await authenticateLocalAccount(cleanEmail, pass);
          setUser(session);
          await syncUserProfile(session);
          return;
        } catch {
          throw err;
        }
      }

      // If Firebase blocked the referer or provider is disabled or user not found in Firebase:
      // Authenticate against local accounts!
      if (
        fullError.includes('requests-from-referer') ||
        code === 'auth/operation-not-allowed' ||
        code === 'auth/user-not-found' ||
        code === 'auth/network-request-failed' ||
        fullError.includes('network')
      ) {
        const session = await authenticateLocalAccount(cleanEmail, pass);
        setUser(session);
        await syncUserProfile(session);
        return;
      }

      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName && cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
      }
      if (cred.user) {
        setUser(cred.user);
        saveCurrentSession({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanName || cred.user.displayName,
          photoURL: cred.user.photoURL,
          emailVerified: true,
        });
        await syncUserProfile(cred.user, cleanName);
        return;
      }
    } catch (err: any) {
      console.warn('Firebase registerWithEmail failed, creating resilient local account:', err);
      const code = err?.code || '';

      // If user provided a password under 6 chars or invalid email syntax, let standard validation handle it
      if (code === 'auth/weak-password' || code === 'auth/invalid-email') {
        throw err;
      }

      // If provider is disabled, referer blocked, or any external restriction:
      // Register seamlessly with local encrypted account!
      const session = await registerLocalAccount(cleanEmail, pass, cleanName);
      setUser(session);
      await syncUserProfile(session, cleanName);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        setUser(cred.user);
        saveCurrentSession({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          emailVerified: cred.user.emailVerified,
        });
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.warn('Google sign-in attempt:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err) {
      console.warn('Firebase sendPasswordResetEmail failed, checking local registry:', err);
      const ok = await resetLocalUserPassword(cleanEmail);
      if (!ok) {
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    saveCurrentSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
