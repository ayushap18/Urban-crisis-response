import { signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { analyticsService } from './analyticsService';

export const authService = {
  signInWithGoogle: async (): Promise<User | undefined> => {
    if (!auth) {
      console.warn("Authentication unavailable: Missing Firebase config");
      alert("Authentication is disabled because Firebase is not configured.");
      return undefined;
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      analyticsService.logEvent('login', { method: 'google' });
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    if (!auth) return;
    
    try {
      await firebaseSignOut(auth);
      analyticsService.logEvent('logout');
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    return auth?.currentUser || null;
  }
};