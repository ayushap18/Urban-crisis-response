import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

const AuthButton: React.FC = () => {
  const { user, signIn, signOut, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (e) {
      alert("Login failed. Check console.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-800 p-1 pl-3 rounded-full border border-slate-700">
        <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-200">{user.displayName}</span>
            <span className="text-[9px] text-green-400">Dispatcher Online</span>
        </div>
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-600" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
             <UserIcon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <button
          onClick={signOut}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isSigningIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
      Sign In with Google
    </button>
  );
};

export default AuthButton;