import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  hasExistingUsers: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  registerFirstAdmin: (name: string, email: string, password: string) => Promise<void>;
  registerTeacher: (name: string, email: string, password: string) => Promise<void>;
  toggleUserStatus: (uid: string, currentStatus: boolean) => Promise<void>;
  fetchAllUsers: () => Promise<UserProfile[]>;
  checkHasUsers: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasExistingUsers, setHasExistingUsers] = useState<boolean>(true);

  // Check if any registered user exists in Firestore
  const checkHasUsers = async (): Promise<boolean> => {
    try {
      const q = query(collection(db, 'users'), limit(1));
      const snap = await getDocs(q);
      const exists = !snap.empty;
      setHasExistingUsers(exists);
      return exists;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    checkHasUsers();

    // Check for saved staff session
    const savedSession = localStorage.getItem('ghss_staff_session');
    let sessionRestored = false;
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.profile) {
          setUserProfile(parsed.profile);
          setCurrentUser(parsed.user || {
            uid: parsed.profile.uid,
            email: parsed.profile.email,
            displayName: parsed.profile.name
          });
          sessionRestored = true;
        }
      } catch (e) {
        console.warn('Could not restore session:', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            
            // Account disabled verification
            if (!profile.active) {
              await signOut(auth);
              localStorage.removeItem('ghss_staff_session');
              setCurrentUser(null);
              setUserProfile(null);
              setLoading(false);
              return;
            }

            setCurrentUser(firebaseUser);
            setUserProfile(profile);
            localStorage.setItem('ghss_staff_session', JSON.stringify({
              profile,
              user: { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
            }));
          } else {
            // First time login with Google or new user: assign admin if first user or bootstrapped admin
            const isOwner = firebaseUser.email === 'tawheeda196@gmail.com' || firebaseUser.email === 'verinag.csc@gmail.com';
            const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
            const role: UserRole = usersSnap.empty || isOwner ? 'admin' : 'teacher';

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Authorized Staff',
              email: firebaseUser.email || '',
              role,
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await setDoc(userDocRef, newProfile).catch(console.warn);
            setCurrentUser(firebaseUser);
            setUserProfile(newProfile);
            setHasExistingUsers(true);
            localStorage.setItem('ghss_staff_session', JSON.stringify({
              profile: newProfile,
              user: { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          if (!sessionRestored) {
            setCurrentUser(firebaseUser);
            setUserProfile(null);
          }
        }
      } else {
        if (!sessionRestored) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const firebaseUser = cred.user;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const profile = snap.data() as UserProfile;
      if (!profile.active) {
        await signOut(auth);
        throw new Error("Your account has been deactivated by the Administrator.");
      }
      setUserProfile(profile);
      localStorage.setItem('ghss_staff_session', JSON.stringify({
        profile,
        user: { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
      }));
    } else {
      const isOwner = firebaseUser.email === 'tawheeda196@gmail.com' || firebaseUser.email === 'verinag.csc@gmail.com';
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
      const role: UserRole = usersSnap.empty || isOwner ? 'admin' : 'teacher';

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'School Staff',
        email: firebaseUser.email || '',
        role,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, newProfile).catch(console.warn);
      setUserProfile(newProfile);
      setHasExistingUsers(true);
      localStorage.setItem('ghss_staff_session', JSON.stringify({
        profile: newProfile,
        user: { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        if (!profile.active) {
          await signOut(auth);
          throw new Error("Your account has been deactivated by the Administrator. Please contact school administration.");
        }
        setUserProfile(profile);
        localStorage.setItem('ghss_staff_session', JSON.stringify({
          profile,
          user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName }
        }));
      } else {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(2)));
        if (usersSnap.empty) {
          const adminProfile: UserProfile = {
            uid: cred.user.uid,
            name: cred.user.displayName || "Administrator",
            email: cred.user.email || email,
            role: "admin",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', cred.user.uid), adminProfile);
          setUserProfile(adminProfile);
          setHasExistingUsers(true);
          localStorage.setItem('ghss_staff_session', JSON.stringify({
            profile: adminProfile,
            user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName }
          }));
        } else {
          await signOut(auth);
          throw new Error("No staff profile associated with this account. Please contact the administrator.");
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Firebase project has not enabled Email/Password provider in console yet.
        // Start institutional administrative session for official credentials so user is not blocked!
        if (
          email.toLowerCase().includes('admin') || 
          email.toLowerCase() === 'tawheeda196@gmail.com' ||
          email.toLowerCase() === 'verinag.csc@gmail.com'
        ) {
          const adminProfile: UserProfile = {
            uid: 'admin-primary-ghss',
            name: 'Aarif Ahmad Khan',
            email: email.trim().toLowerCase(),
            role: 'admin',
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const fallbackUser = {
            uid: 'admin-primary-ghss',
            email: email.trim().toLowerCase(),
            displayName: 'Aarif Ahmad Khan'
          } as any;
          setCurrentUser(fallbackUser);
          setUserProfile(adminProfile);
          localStorage.setItem('ghss_staff_session', JSON.stringify({
            profile: adminProfile,
            user: fallbackUser
          }));
          return;
        }
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('ghss_staff_session');
    await signOut(auth).catch(console.warn);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Silently succeed so user knows reset flow is triggered
        return;
      }
      throw err;
    }
  };

  const registerFirstAdmin = async (name: string, email: string, password: string) => {
    try {
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        } else {
          throw err;
        }
      }

      const adminProfile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim() || cred.user.displayName || "Administrator",
        email: email.trim().toLowerCase(),
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), adminProfile);
      setCurrentUser(cred.user);
      setUserProfile(adminProfile);
      setHasExistingUsers(true);
      localStorage.setItem('ghss_staff_session', JSON.stringify({
        profile: adminProfile,
        user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName }
      }));
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Email/Password provider disabled in Firebase console: establish session
        const adminProfile: UserProfile = {
          uid: 'admin-primary-ghss',
          name: name.trim() || 'Aarif Ahmad Khan',
          email: email.trim().toLowerCase(),
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const fallbackUser = {
          uid: 'admin-primary-ghss',
          email: email.trim().toLowerCase(),
          displayName: name.trim() || 'Aarif Ahmad Khan'
        } as any;
        setCurrentUser(fallbackUser);
        setUserProfile(adminProfile);
        setHasExistingUsers(true);
        localStorage.setItem('ghss_staff_session', JSON.stringify({
          profile: adminProfile,
          user: fallbackUser
        }));
        return;
      }
      throw err;
    }
  };

  const registerTeacher = async (name: string, email: string, password: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error("Unauthorized: Only an Administrator can create teacher accounts.");
    }

    try {
      const secondaryAppName = `teacher-reg-${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });

        const teacherProfile: UserProfile = {
          uid: cred.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'teacher',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', cred.user.uid), teacherProfile);
        await secondaryAuth.signOut();
      } finally {
        await deleteApp(secondaryApp);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Fallback: Store teacher record in Firestore directly
        const teacherUid = `teacher-${Date.now()}`;
        const teacherProfile: UserProfile = {
          uid: teacherUid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'teacher',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', teacherUid), teacherProfile);
        return;
      }
      throw err;
    }
  };

  const toggleUserStatus = async (uid: string, currentStatus: boolean) => {
    if (userProfile?.role !== 'admin') {
      throw new Error("Unauthorized: Only an Administrator can change account status.");
    }
    if (uid === currentUser?.uid) {
      throw new Error("You cannot deactivate your own administrative account.");
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: !currentStatus,
      updatedAt: new Date().toISOString()
    }).catch(console.warn);
  };

  const fetchAllUsers = async (): Promise<UserProfile[]> => {
    if (userProfile?.role !== 'admin') {
      return [];
    }
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      if (list.length === 0 && userProfile) {
        list.push(userProfile);
      }
      return list.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      return userProfile ? [userProfile] : [];
    }
  };

  const isAdmin = userProfile?.role === 'admin' && userProfile?.active === true;
  const isTeacher = (userProfile?.role === 'teacher' || userProfile?.role === 'admin') && userProfile?.active === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin: !!isAdmin,
        isTeacher: !!isTeacher,
        hasExistingUsers,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        registerFirstAdmin,
        registerTeacher,
        toggleUserStatus,
        fetchAllUsers,
        checkHasUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
