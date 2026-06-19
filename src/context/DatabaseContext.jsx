import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';
const DatabaseContext = createContext(null);
export const DatabaseProvider = ({ children, user }) => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadAllData = async () => {
    setLoading(true);
    try {
      const studs = await dbService.getStudents();
      const clss = await dbService.getClasses();
      const f = await dbService.getFees();
      const r = await dbService.getReceipts();
      const a = await dbService.getAllAttendance();
      const n = await dbService.getNotifications();
      setStudents(studs);
      setClasses(clss);
      setFees(f);
      setReceipts(r);
      setAttendance(a);
      setNotifications(n);
    } catch (error) {
      console.error("Failed to load DB data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAllData();
  }, [user]); // Reload when user auth state changes
  const addStudent = async (studentData) => {
    const newStud = await dbService.addStudent(studentData);
    setStudents(prev => [...prev, newStud]);
    return newStud;
  };
  const updateStudent = async (studentId, studentData) => {
    const updated = await dbService.updateStudent(studentId, studentData);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updated } : s));
    return updated;
  };
  const deleteStudent = async (studentId) => {
    await dbService.deleteStudent(studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  const saveAttendance = async (classId, date, records) => {
    if (!user) return;
    const newRecord = await dbService.saveAttendance(classId, date, records, user.uid);
    setAttendance(prev => ({
      ...prev,
      [`${classId}_${date}`]: newRecord
    }));
    return newRecord;
  };
  const addNotification = async (notiData) => {
    const newNoti = await dbService.addNotification(notiData);
    setNotifications(prev => [...prev, newNoti]);
    return newNoti;
  };
  const addFeeStructure = async (feeData) => {
    const newFee = await dbService.addFeeStructure(feeData);
    setFees(prev => [...prev, newFee]);
    return newFee;
  };
  const markFeePaid = async (feeId, amountPaid, paymentMode) => {
    // 1. Update Fee Status to Paid
    await dbService.updateFeeStatus(feeId, 'Paid');
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'Paid' } : f));
    // 2. Fetch target fee to get studentId
    const targetFee = fees.find(f => f.id === feeId);
    if (!targetFee) return;
    // 3. Generate Receipt
    const receiptData = {
      feeId,
      studentId: targetFee.studentId,
      amountPaid,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode
    };
    const newReceipt = await dbService.addReceipt(receiptData);
    setReceipts(prev => [...prev, newReceipt]);
    return newReceipt;
  };
  const markFeeUnpaid = async (feeId) => {
    await dbService.updateFeeStatus(feeId, 'Unpaid');
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'Unpaid' } : f));
    // Optionally delete related receipts
    // In local db mode or firebase, keep simple
  };
  return (
    <DatabaseContext.Provider value={{
      students,
      classes,
      fees,
      receipts,
      attendance,
      notifications,
      loading,
      refresh: loadAllData,
      addStudent,
      updateStudent,
      deleteStudent,
      saveAttendance,
      addNotification,
      addFeeStructure,
      markFeePaid,
      markFeeUnpaid
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
export const useDatabase = () => useContext(DatabaseContext);
