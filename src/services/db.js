import { db, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  INITIAL_USERS, 
  INITIAL_ATTENDANCE, 
  INITIAL_FEES, 
  INITIAL_RECEIPTS 
} from './mockData';

// Local storage keys
const KEYS = {
  CLASSES: 'edutrack_classes',
  USERS: 'edutrack_users',
  STUDENTS: 'edutrack_students',
  ATTENDANCE: 'edutrack_attendance',
  FEES: 'edutrack_fees',
  RECEIPTS: 'edutrack_receipts',
};

// Check and seed LocalStorage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem(KEYS.CLASSES)) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.FEES)) {
    localStorage.setItem(KEYS.FEES, JSON.stringify(INITIAL_FEES));
  }
  if (!localStorage.getItem(KEYS.RECEIPTS)) {
    localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
  }
};

initLocalStorage();

// LocalStorage Helper Helpers
const getLocal = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Unified DB Service Object
export const dbService = {
  isFirebase: isFirebaseConfigured,

  // --- CLASSES ---
  async getClasses() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'classes'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase getClasses failed, falling back to local:", err);
      }
    }
    return getLocal(KEYS.CLASSES);
  },

  // --- USERS ---
  async getUsers() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase getUsers failed, falling back to local:", err);
      }
    }
    return getLocal(KEYS.USERS);
  },

  async addUser(uid, userData) {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', uid), userData);
        return { uid, ...userData };
      } catch (err) {
        console.error("Firebase addUser failed:", err);
      }
    }
    const users = getLocal(KEYS.USERS);
    const newUser = { uid, ...userData };
    users.push(newUser);
    setLocal(KEYS.USERS, users);
    return newUser;
  },

  // --- STUDENTS ---
  async getStudents() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase getStudents failed, falling back to local:", err);
      }
    }
    return getLocal(KEYS.STUDENTS);
  },

  async addStudent(studentData) {
    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, 'students'), studentData);
        return { id: docRef.id, ...studentData };
      } catch (err) {
        console.error("Firebase addStudent failed:", err);
      }
    }
    const students = getLocal(KEYS.STUDENTS);
    const newStudent = { 
      id: 'stud_' + Math.random().toString(36).substr(2, 9), 
      ...studentData,
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    setLocal(KEYS.STUDENTS, students);
    return newStudent;
  },

  async updateStudent(studentId, studentData) {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'students', studentId), studentData);
        return { id: studentId, ...studentData };
      } catch (err) {
        console.error("Firebase updateStudent failed:", err);
      }
    }
    const students = getLocal(KEYS.STUDENTS);
    const idx = students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...studentData };
      setLocal(KEYS.STUDENTS, students);
    }
    return students[idx];
  },

  async deleteStudent(studentId) {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        return studentId;
      } catch (err) {
        console.error("Firebase deleteStudent failed:", err);
      }
    }
    const students = getLocal(KEYS.STUDENTS);
    const filtered = students.filter(s => s.id !== studentId);
    setLocal(KEYS.STUDENTS, filtered);
    return studentId;
  },

  // --- ATTENDANCE ---
  async getAttendanceByClass(classId) {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'attendance'), where('classId', '==', classId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = { id: doc.id, ...doc.data() };
          return acc;
        }, {});
      } catch (err) {
        console.error("Firebase getAttendance failed, falling back to local:", err);
      }
    }
    const attendance = JSON.parse(localStorage.getItem(KEYS.ATTENDANCE)) || {};
    const filtered = {};
    Object.keys(attendance).forEach(key => {
      if (attendance[key].classId === classId) {
        filtered[key] = attendance[key];
      }
    });
    return filtered;
  },

  async getAllAttendance() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'attendance'));
        return querySnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = { id: doc.id, ...doc.data() };
          return acc;
        }, {});
      } catch (err) {
        console.error("Firebase getAllAttendance failed, falling back to local:", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.ATTENDANCE)) || {};
  },

  async saveAttendance(classId, date, records, userId) {
    const id = `${classId}_${date}`;
    const attendanceRecord = {
      classId,
      date,
      records,
      takenBy: userId,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'attendance', id), attendanceRecord);
        return { id, ...attendanceRecord };
      } catch (err) {
        console.error("Firebase saveAttendance failed:", err);
      }
    }

    const attendance = JSON.parse(localStorage.getItem(KEYS.ATTENDANCE)) || {};
    attendance[id] = { id, ...attendanceRecord };
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
    return { id, ...attendanceRecord };
  },

  // --- FEES ---
  async getFees() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'fees'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase getFees failed, falling back to local:", err);
      }
    }
    return getLocal(KEYS.FEES);
  },

  async addFeeStructure(feeData) {
    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, 'fees'), feeData);
        return { id: docRef.id, ...feeData };
      } catch (err) {
        console.error("Firebase addFeeStructure failed:", err);
      }
    }
    const fees = getLocal(KEYS.FEES);
    const newFee = {
      id: 'fee_' + Math.random().toString(36).substr(2, 9),
      ...feeData
    };
    fees.push(newFee);
    setLocal(KEYS.FEES, fees);
    return newFee;
  },

  async updateFeeStatus(feeId, status) {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'fees', feeId), { status });
        return feeId;
      } catch (err) {
        console.error("Firebase updateFeeStatus failed:", err);
      }
    }
    const fees = getLocal(KEYS.FEES);
    const idx = fees.findIndex(f => f.id === feeId);
    if (idx !== -1) {
      fees[idx].status = status;
      setLocal(KEYS.FEES, fees);
    }
    return feeId;
  },

  // --- RECEIPTS ---
  async getReceipts() {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'receipts'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase getReceipts failed, falling back to local:", err);
      }
    }
    return getLocal(KEYS.RECEIPTS);
  },

  async addReceipt(receiptData) {
    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, 'receipts'), receiptData);
        return { id: docRef.id, ...receiptData };
      } catch (err) {
        console.error("Firebase addReceipt failed:", err);
      }
    }
    const receipts = getLocal(KEYS.RECEIPTS);
    const newReceipt = {
      id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
      receiptNumber: 'RCPT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      ...receiptData
    };
    receipts.push(newReceipt);
    setLocal(KEYS.RECEIPTS, receipts);
    return newReceipt;
  }
};
