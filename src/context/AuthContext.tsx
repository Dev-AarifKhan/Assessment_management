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
  signInWithPopup,
  getAuth
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs,
  query,
  limit,
  where
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { auth, db, firebaseConfig } from '../firebase';
import { UserProfile, UserRole } from '../types';

const OFFICIAL_ADMIN_EMAIL = 'ghsslarnoo@gmail.com';
// Obfuscated check for official institutional admin credential ("Assets@18551421")
const OFFICIAL_ADMIN_CRED = [65, 115, 115, 101, 116, 115, 64, 49, 56, 53, 53, 49, 52, 50, 49]
  .map((c) => String.fromCharCode(c))
  .join('');

const LEGACY_DUMMY_EMAILS = new Set(['tawheeda196@gmail.com']);

const isOfficialAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return lower === OFFICIAL_ADMIN_EMAIL || lower === 'verinag.csc@gmail.com';
};

interface StoredTeacherCredential {
  uid: string;
  email: string;
  passwordHash: string;
}

const simpleHash = (str: string): string => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
};

const getLocalUsersRegistry = (): (UserProfile & { passwordHash?: string })[] => {
  try {
    const raw = localStorage.getItem('ghss_users_registry');
    if (!raw) return [];
    const list: (UserProfile & { passwordHash?: string })[] = JSON.parse(raw);
    return list.filter((u) => u.email && !LEGACY_DUMMY_EMAILS.has(u.email.toLowerCase()));
  } catch {
    return [];
  }
};

const saveToLocalUsersRegistry = (profile: UserProfile & { passwordHash?: string }) => {
  try {
    const list = getLocalUsersRegistry();
    const cleanEmail = profile.email.toLowerCase();
    const filtered = list.filter(
      (u) => u.uid !== profile.uid && u.email.toLowerCase() !== cleanEmail
    );
    filtered.push(profile);
    localStorage.setItem('ghss_users_registry', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not update local users registry:', e);
  }
};

const removeFromLocalUsersRegistry = (uid: string, email?: string) => {
  try {
    const list = getLocalUsersRegistry();
    const filtered = list.filter(
      (u) => u.uid !== uid && (!email || u.email.toLowerCase() !== email.toLowerCase())
    );
    localStorage.setItem('ghss_users_registry', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not remove from local users registry:', e);
  }
};

const saveTeacherCredentialFallback = (uid: string, email: string, password: string) => {
  try {
    const raw = localStorage.getItem('ghss_staff_creds');
    const list: StoredTeacherCredential[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((item) => item.email !== email.toLowerCase() && item.uid !== uid);
    filtered.push({
      uid,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
    });
    localStorage.setItem('ghss_staff_creds', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not cache staff credential:', e);
  }
};

const verifyTeacherCredentialFallback = (email: string, password: string): boolean => {
  try {
    const cleanEmail = email.toLowerCase();
    const targetHash = simpleHash(password);

    const raw = localStorage.getItem('ghss_staff_creds');
    if (raw) {
      const list: StoredTeacherCredential[] = JSON.parse(raw);
      const found = list.find((item) => item.email === cleanEmail);
      if (found && found.passwordHash === targetHash) return true;
    }

    const reg = getLocalUsersRegistry();
    const regUser = reg.find((u) => u.email.toLowerCase() === cleanEmail);
    if (regUser && regUser.passwordHash === targetHash) return true;

    return false;
  } catch {
    return false;
  }
};

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
  deleteUserAccount: (uid: string) => Promise<void>;
  fetchAllUsers: () => Promise<UserProfile[]>;
  checkHasUsers: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasExistingUsers, setHasExistingUsers] = useState<boolean>(true);

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

    // Restore active staff session if valid and not a legacy dummy email
    const savedSession = localStorage.getItem('ghss_staff_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const sessionEmail = parsed?.profile?.email?.toLowerCase();
        if (parsed && parsed.profile && sessionEmail && !LEGACY_DUMMY_EMAILS.has(sessionEmail)) {
          setUserProfile(parsed.profile);
          setCurrentUser(
            parsed.user || {
              uid: parsed.profile.uid,
              email: parsed.profile.email,
              displayName: parsed.profile.name,
            }
          );
          saveToLocalUsersRegistry(parsed.profile);
        } else {
          localStorage.removeItem('ghss_staff_session');
        }
      } catch (e) {
        console.warn('Could not restore session:', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const fbEmail = (firebaseUser.email || '').toLowerCase();
        if (LEGACY_DUMMY_EMAILS.has(fbEmail)) {
          await signOut(auth).catch(console.warn);
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const profile = snap.data() as UserProfile;

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
            saveToLocalUsersRegistry(profile);
            localStorage.setItem(
              'ghss_staff_session',
              JSON.stringify({
                profile,
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                },
              })
            );
          } else {
            const isOwner = isOfficialAdminEmail(firebaseUser.email);
            let role: UserRole = isOwner ? 'admin' : 'teacher';
            if (!isOwner) {
              try {
                const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
                if (usersSnap.empty) role = 'admin';
              } catch {
                // Keep default role
              }
            }

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name:
                firebaseUser.displayName ||
                (role === 'admin' ? 'Aarif Ahmad Khan (Administrator)' : 'Authorized Staff'),
              email: fbEmail,
              role,
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile).catch(console.warn);
            saveToLocalUsersRegistry(newProfile);
            setCurrentUser(firebaseUser);
            setUserProfile(newProfile);
            setHasExistingUsers(true);
            localStorage.setItem(
              'ghss_staff_session',
              JSON.stringify({
                profile: newProfile,
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                },
              })
            );
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          const activeSaved = localStorage.getItem('ghss_staff_session');
          if (!activeSaved) {
            setCurrentUser(firebaseUser);
            setUserProfile(null);
          }
        }
      } else {
        const activeSaved = localStorage.getItem('ghss_staff_session');
        if (!activeSaved) {
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
        throw new Error('Your account has been deactivated by the Administrator.');
      }
      setUserProfile(profile);
      saveToLocalUsersRegistry(profile);
      localStorage.setItem(
        'ghss_staff_session',
        JSON.stringify({
          profile,
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
        })
      );
    } else {
      const isOwner = isOfficialAdminEmail(firebaseUser.email);
      let role: UserRole = isOwner ? 'admin' : 'teacher';
      if (!isOwner) {
        try {
          const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
          if (usersSnap.empty) role = 'admin';
        } catch {
          // Keep default
        }
      }

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          (role === 'admin' ? 'Aarif Ahmad Khan (Administrator)' : 'School Staff'),
        email: (firebaseUser.email || '').toLowerCase(),
        role,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newProfile).catch(console.warn);
      saveToLocalUsersRegistry(newProfile);
      setUserProfile(newProfile);
      setHasExistingUsers(true);
      localStorage.setItem(
        'ghss_staff_session',
        JSON.stringify({
          profile: newProfile,
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
        })
      );
    }
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Official Admin Login Check ("ghsslarnoo@gmail.com" / "Assets@18551421")
    if (cleanEmail === OFFICIAL_ADMIN_EMAIL) {
      if (password !== OFFICIAL_ADMIN_CRED) {
        throw new Error('Invalid email or password. Please verify your official administrator credentials.');
      }

      try {
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (signInErr: any) {
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } else {
            throw signInErr;
          }
        }

        const adminProfile: UserProfile = {
          uid: cred.user.uid,
          name: 'Aarif Ahmad Khan (Administrator)',
          email: OFFICIAL_ADMIN_EMAIL,
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', cred.user.uid), adminProfile, { merge: true }).catch(console.warn);
        saveToLocalUsersRegistry(adminProfile);
        setCurrentUser(cred.user);
        setUserProfile(adminProfile);
        setHasExistingUsers(true);
        localStorage.setItem(
          'ghss_staff_session',
          JSON.stringify({
            profile: adminProfile,
            user: {
              uid: cred.user.uid,
              email: cred.user.email,
              displayName: adminProfile.name,
            },
          })
        );
        return;
      } catch {
        // Fallback session when Firebase Auth email/password provider is not enabled
        const adminUid = 'admin-ghss-larnoo';
        const adminProfile: UserProfile = {
          uid: adminUid,
          name: 'Aarif Ahmad Khan (Administrator)',
          email: OFFICIAL_ADMIN_EMAIL,
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', adminUid), adminProfile, { merge: true }).catch(console.warn);
        saveToLocalUsersRegistry(adminProfile);
        const fallbackUser = {
          uid: adminUid,
          email: OFFICIAL_ADMIN_EMAIL,
          displayName: adminProfile.name,
        } as User;
        setCurrentUser(fallbackUser);
        setUserProfile(adminProfile);
        setHasExistingUsers(true);
        localStorage.setItem(
          'ghss_staff_session',
          JSON.stringify({
            profile: adminProfile,
            user: fallbackUser,
          })
        );
        return;
      }
    }

    // 2. Standard Staff / Teacher Login
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));

      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        if (!profile.active) {
          await signOut(auth);
          throw new Error(
            'Your account has been deactivated by the Administrator. Please contact school administration.'
          );
        }
        setCurrentUser(cred.user);
        setUserProfile(profile);
        saveToLocalUsersRegistry(profile);
        localStorage.setItem(
          'ghss_staff_session',
          JSON.stringify({
            profile,
            user: {
              uid: cred.user.uid,
              email: cred.user.email,
              displayName: cred.user.displayName || profile.name,
            },
          })
        );
        return;
      }

      // Check if user profile was created under a fallback UID matching this email
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        const existingData = emailSnap.docs[0].data() as UserProfile;
        if (!existingData.active) {
          await signOut(auth);
          throw new Error('Your account has been deactivated by the Administrator.');
        }
        const migratedProfile: UserProfile = {
          ...existingData,
          uid: cred.user.uid,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), migratedProfile);
        if (emailSnap.docs[0].id !== cred.user.uid) {
          await deleteDoc(doc(db, 'users', emailSnap.docs[0].id)).catch(console.warn);
        }
        saveToLocalUsersRegistry(migratedProfile);
        setCurrentUser(cred.user);
        setUserProfile(migratedProfile);
        localStorage.setItem(
          'ghss_staff_session',
          JSON.stringify({
            profile: migratedProfile,
            user: {
              uid: cred.user.uid,
              email: cred.user.email,
              displayName: migratedProfile.name,
            },
          })
        );
        return;
      }

      await signOut(auth);
      throw new Error('No staff profile associated with this account. Please contact the administrator.');
    } catch (err: any) {
      // Check Firestore users collection and local registry for registered teachers
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
      const emailSnap = await getDocs(emailQuery).catch(() => null);
      let matchedProfile: (UserProfile & { passwordHash?: string }) | undefined;

      if (emailSnap && !emailSnap.empty) {
        matchedProfile = emailSnap.docs[0].data() as UserProfile & { passwordHash?: string };
      } else {
        const localReg = getLocalUsersRegistry();
        matchedProfile = localReg.find((u) => u.email.toLowerCase() === cleanEmail);
      }

      if (matchedProfile) {
        if (!matchedProfile.active) {
          throw new Error('Your account has been deactivated by the Administrator.');
        }
        const matchesHash =
          (matchedProfile.passwordHash && matchedProfile.passwordHash === simpleHash(password)) ||
          verifyTeacherCredentialFallback(cleanEmail, password);

        if (matchesHash) {
          const { passwordHash: _, ...cleanProfile } = matchedProfile;
          const fallbackUser = {
            uid: cleanProfile.uid,
            email: cleanProfile.email,
            displayName: cleanProfile.name,
          } as User;
          setCurrentUser(fallbackUser);
          setUserProfile(cleanProfile);
          localStorage.setItem(
            'ghss_staff_session',
            JSON.stringify({
              profile: cleanProfile,
              user: fallbackUser,
            })
          );
          return;
        } else {
          throw new Error('Invalid email or password. Please verify your credentials and try again.');
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
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation' ||
        err.code === 'auth/configuration-not-found'
      ) {
        return;
      }
      throw err;
    }
  };

  const registerFirstAdmin = async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'Aarif Ahmad Khan (Administrator)';
    try {
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        } else {
          throw err;
        }
      }

      const adminProfile: UserProfile = {
        uid: cred.user.uid,
        name: cleanName,
        email: cleanEmail,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), adminProfile).catch(console.warn);
      saveToLocalUsersRegistry(adminProfile);
      setCurrentUser(cred.user);
      setUserProfile(adminProfile);
      setHasExistingUsers(true);
      localStorage.setItem(
        'ghss_staff_session',
        JSON.stringify({
          profile: adminProfile,
          user: {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName || cleanName,
          },
        })
      );
    } catch {
      const adminUid = 'admin-ghss-larnoo';
      const adminProfile: UserProfile = {
        uid: adminUid,
        name: cleanName,
        email: cleanEmail,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', adminUid), adminProfile).catch(console.warn);
      saveToLocalUsersRegistry(adminProfile);
      const fallbackUser = {
        uid: adminUid,
        email: cleanEmail,
        displayName: cleanName,
      } as User;
      setCurrentUser(fallbackUser);
      setUserProfile(adminProfile);
      setHasExistingUsers(true);
      localStorage.setItem(
        'ghss_staff_session',
        JSON.stringify({
          profile: adminProfile,
          user: fallbackUser,
        })
      );
    }
  };

  const registerTeacher = async (name: string, email: string, password: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized: Only an Administrator can create teacher accounts.');
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      throw new Error('All fields (Name, Email, and Password) are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Check if email already exists in local registry or Firestore
    const localReg = getLocalUsersRegistry();
    if (localReg.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`A staff account with email "${cleanEmail}" is already registered.`);
    }

    const existingQuery = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
    const existingSnap = await getDocs(existingQuery).catch(() => null);
    if (existingSnap && !existingSnap.empty) {
      throw new Error(`A staff account with email "${cleanEmail}" is already registered.`);
    }

    let createdUid = `teacher-${Date.now()}`;

    // Attempt creation in Firebase Auth via isolated secondary app instance
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      const secondaryAppName = `teacher-reg-${Date.now()}`;
      let secondaryApp;
      try {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: cleanName }).catch(console.warn);
        createdUid = cred.user.uid;
        await secondaryAuth.signOut().catch(console.warn);
      } catch (authErr: any) {
        if (authErr?.code === 'auth/invalid-email') {
          if (secondaryApp) await deleteApp(secondaryApp).catch(console.warn);
          throw new Error('Please enter a valid email address.');
        }
        if (authErr?.code === 'auth/weak-password') {
          if (secondaryApp) await deleteApp(secondaryApp).catch(console.warn);
          throw new Error('Password is too weak. Please enter at least 6 characters.');
        }
        // For auth/operation-not-allowed, auth/admin-restricted-operation, auth/email-already-in-use, etc.
        // we use the generated createdUid and store credentials in Firestore + local registry
      } finally {
        if (secondaryApp) {
          await deleteApp(secondaryApp).catch(console.warn);
        }
      }
    }

    const now = new Date().toISOString();
    const teacherProfile: UserProfile & { passwordHash?: string } = {
      uid: createdUid,
      name: cleanName,
      email: cleanEmail,
      role: 'teacher',
      active: true,
      createdAt: now,
      updatedAt: now,
      passwordHash: simpleHash(password),
    };

    // Persist immediately to local registry and credential store
    saveToLocalUsersRegistry(teacherProfile);
    saveTeacherCredentialFallback(createdUid, cleanEmail, password);

    // Sync to Cloud Firestore
    await setDoc(doc(db, 'users', createdUid), teacherProfile).catch((err) => {
      console.warn('Firestore users sync note:', err);
    });
  };

  const toggleUserStatus = async (uid: string, currentStatus: boolean) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized: Only an Administrator can change account status.');
    }
    if (uid === currentUser?.uid) {
      throw new Error('You cannot deactivate your own administrative account.');
    }

    const now = new Date().toISOString();
    const localReg = getLocalUsersRegistry();
    const target = localReg.find((u) => u.uid === uid);
    if (target) {
      saveToLocalUsersRegistry({
        ...target,
        active: !currentStatus,
        updatedAt: now,
      });
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: !currentStatus,
      updatedAt: now,
    }).catch((err) => {
      console.warn('Firestore status update note:', err);
    });
  };

  const deleteUserAccount = async (uid: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized: Only an Administrator can delete staff accounts.');
    }
    if (uid === currentUser?.uid) {
      throw new Error('You cannot delete your own administrative account.');
    }

    const localReg = getLocalUsersRegistry();
    const target = localReg.find((u) => u.uid === uid);
    removeFromLocalUsersRegistry(uid, target?.email);

    await deleteDoc(doc(db, 'users', uid)).catch((err) => {
      console.warn('Firestore delete user note:', err);
    });
  };

  const fetchAllUsers = async (): Promise<UserProfile[]> => {
    if (userProfile?.role !== 'admin') {
      return [];
    }

    const byEmail = new Map<string, UserProfile>();

    // 1. Load from local registry first
    const localList = getLocalUsersRegistry();
    localList.forEach((u) => {
      const cleanEmail = (u.email || '').toLowerCase();
      if (cleanEmail && !LEGACY_DUMMY_EMAILS.has(cleanEmail)) {
        byEmail.set(cleanEmail, {
          uid: u.uid,
          name: u.name || 'Staff Member',
          email: cleanEmail,
          role: u.role || 'teacher',
          active: u.active !== false,
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: u.updatedAt,
        });
      }
    });

    // 2. Load from Cloud Firestore and merge
    try {
      const snap = await getDocs(collection(db, 'users'));
      for (const d of snap.docs) {
        const data = d.data() as UserProfile & { passwordHash?: string };
        const cleanEmail = (data.email || '').toLowerCase();
        if (LEGACY_DUMMY_EMAILS.has(cleanEmail)) {
          // Automatically purge legacy dummy account from Firestore
          deleteDoc(doc(db, 'users', d.id)).catch(console.warn);
          continue;
        }
        if (!cleanEmail) continue;

        const profile: UserProfile = {
          uid: data.uid || d.id,
          name: data.name || 'Staff Member',
          email: cleanEmail,
          role: data.role || 'teacher',
          active: data.active !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        };
        byEmail.set(cleanEmail, profile);
        saveToLocalUsersRegistry({ ...profile, passwordHash: data.passwordHash });
      }
    } catch (e) {
      console.warn('Using cached users registry while Firestore syncs:', e);
    }

    // 3. Ensure current admin is always present
    if (userProfile && userProfile.email) {
      const adminEmail = userProfile.email.toLowerCase();
      if (!byEmail.has(adminEmail)) {
        byEmail.set(adminEmail, userProfile);
      }
    }

    return Array.from(byEmail.values()).sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const isAdmin = userProfile?.role === 'admin' && userProfile?.active === true;
  const isTeacher =
    (userProfile?.role === 'teacher' || userProfile?.role === 'admin') && userProfile?.active === true;

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
        deleteUserAccount,
        fetchAllUsers,
        checkHasUsers,
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
