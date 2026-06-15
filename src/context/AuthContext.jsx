import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
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
          // Fetch additional user role data from dbService
          const users = await dbService.getUsers();
          const dbUser = users.find(u => u.uid === fbUser.uid);
          if (dbUser) {
            setUser(dbUser);
          } else {
            // Default user fallback if auth exists but record doesn't
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email.split('@')[0],
              email: fbUser.email,
              role: 'Teacher', // Default role for external signups
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
      // Local storage session persistence
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
      // Fetch user profile from db
      const users = await dbService.getUsers();
      const matched = users.find(u => u.uid === credentials.user.uid);
      if (matched) {
        setUser(matched);
        return matched;
      }
    }

    // Local Storage Mock Authentication
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

  // Login for Parent (Mobile number + OTP simulation)
  const loginParent = async (mobileNumber, otp) => {
    // Basic verification
    if (!mobileNumber || mobileNumber.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
    
    if (otp !== '123456' && otp !== '000000') {
      throw new Error("Invalid OTP. For demo mode, please use 123456 or 000000.");
    }

    // Check if parent mobile number exists in students parent list
    const students = await dbService.getStudents();
    const childRecords = students.filter(s => s.parentMobile === mobileNumber);

    if (childRecords.length === 0) {
      throw new Error("No student is registered with this parent mobile number.");
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
