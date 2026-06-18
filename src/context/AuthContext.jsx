import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { dbService } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase auth state if active
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const users = await dbService.getUsers();
          const dbUser = users.find(u => u.uid === fbUser.uid);
          if (dbUser) {
            setUser(dbUser);
          } else {
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email.split('@')[0],
              email: fbUser.email,
              role: 'Teacher',
              assignedClassId: ''
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      const savedUser = localStorage.getItem('edutrack_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  // Login for Admin / Teacher (Email & Password)
  const loginWithEmail = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const users = await dbService.getUsers();
      const matched = users.find(u => u.uid === credentials.user.uid);
      if (matched) {
        setUser(matched);
        return matched;
      }
    }

    const users = await dbService.getUsers();
    const matchedUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (matchedUser && password === (matchedUser.role === 'Admin' ? 'admin123' : 'teacher123')) {
      setUser(matchedUser);
      localStorage.setItem('edutrack_current_user', JSON.stringify(matchedUser));
      return matchedUser;
    } else {
      throw new Error("Invalid email or password. Hint: Use admin@edutrack.com / admin123 or teacher@edutrack.com / teacher123");
    }
  };

  // ✅ Login for Parent (Firebase Real OTP)
  const loginParent = async (mobileNumber, firebaseUser) => {
    const students = await dbService.getStudents();
    const childRecords = students.filter(s => s.parentMobile === mobileNumber);

    if (childRecords.length === 0) {
      throw new Error("Is mobile number se koi student registered nahi hai.");
    }

    const parentUser = {
      uid: 'parent_' + mobileNumber,
      name: childRecords[0].parentName,
      mobile: mobileNumber,
      role: 'Parent',
      children: childRecords.map(c => c.id)
    };

    setUser(parentUser);
    localStorage.setItem('edutrack_current_user', JSON.stringify(parentUser));
    return parentUser;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('edutrack_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, loginParent, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
