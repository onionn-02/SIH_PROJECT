"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/client";
import type { Profile } from "@/types/firestore";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  /** True until the initial auth + profile state has resolved. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileState {
  uid: string;
  profile: Profile | null;
}

/**
 * Tracks the signed-in Firebase user and their profile/role. Profile is
 * read live (onSnapshot) so a role or name change takes effect without a
 * re-login. `profileState` is tagged with the uid it was loaded for, so
 * "is the profile for the *current* user loaded yet" is a plain render-time
 * comparison instead of a separate reset-on-user-change effect.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthResolved(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const unsubscribe = onSnapshot(
      doc(db, "profiles", uid),
      (snapshot) => {
        setProfileState({ uid, profile: snapshot.exists() ? (snapshot.data() as Profile) : null });
      },
      () => {
        setProfileState({ uid, profile: null });
      }
    );
    return unsubscribe;
  }, [user]);

  const profile = user && profileState?.uid === user.uid ? profileState.profile : null;
  const profileLoading = !!user && (!profileState || profileState.uid !== user.uid);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading: !authResolved || profileLoading,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOutUser: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, profile, authResolved, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
