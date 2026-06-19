import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  User,
  CalendarCheck,
  CreditCard,
  Download,
  BellRing,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Calendar
} from 'lucide-react';
import Modal from '../components/Modal';
import ReceiptPDF from '../components/ReceiptPDF';
import { formatINR, formatDate } from '../utils';

const ParentDashboard = ({ user }) => {
  const { students, fees, receipts, attendance, classes, notifications } = useDatabase();
  const [selectedChildId, setSelectedChildId] = useState('');

  // Modal states
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Filter children matching parent's mobile number
  const children = students.filter(s => {
    const dbMobile = String(s.parentMobile || '').replace(/\D/g, '').slice(-10);
    const userMobile = String(user.mobile || '').replace(/\D/g, '').slice(-10);
    return dbMobile === userMobile;
  });
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  // --- STATS & HISTORY FOR SELECTED CHILD ---

  // Attendance calculations
  const getChildAttendanceStats = () => {
    if (!selectedChild) return { percentage: 0, present: 0, absent: 0, late: 0, history: [] };

    let present = 0, absent = 0, late = 0;
    const history = [];

    Object.keys(attendance).forEach(key => {
      const record = attendance[key];
      const status = record.records[selectedChild.id];
      if (status) {
        history.push({ date: record.date, status });
        if (status === 'Present') present++;
        else if (status === 'Absent') absent++;
        else if (status === 'Late') late++;
      }
    });

    const total = present + absent + late;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // Sort history by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { percentage, present, absent, late, total, history };
  };

  const att = getChildAttendanceStats();

  // Fees lists
  const childFees = selectedChild ? fees.filter(f => f.studentId === selectedChild.id) : [];
  const unpaidFees = childFees.filter(f => f.status === 'Unpaid');
  const paidFees = childFees.filter(f => f.status === 'Paid');

  // Notifications alerts
  const getNotifications = () => {
    const alerts = [];
    if (!selectedChild) return [];

    // 1. School broadcast announcements (sent by Admin)
    notifications
      .filter(n => n.target === 'All' || n.target === 'Parents')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(n => {
        alerts.push({
          id: `school_${n.id}`,
          type: 'announcement',
          title: n.subject,
          message: n.body,
          severity: 'info'
        });
      });

    // 2. Fee due reminders
    unpaidFees.forEach(fee => {
      alerts.push({
        id: `fee_${fee.id}`,
        type: 'fee',
        title: 'Fee Payment Outstanding',
        message: `A payment of ${formatINR(fee.amount)} for ${fee.type} Fee (${fee.month}) is due by ${formatDate(fee.dueDate)}.`,
        severity: 'warning'
      });
    });

    // 3. Attendance alert (if marked absent or late on the latest recorded date)
    if (att.history.length > 0) {
      const latest = att.history[0]; // sorted descending, so index 0 is latest
      if (latest.status === 'Absent' || latest.status === 'Late') {
        alerts.push({
          id: `att_${latest.date}`,
          type: 'attendance',
          title: `Daily Attendance Update - ${latest.status}`,
          message: `${selectedChild.fullName} was marked ${latest.status} on roll call date ${formatDate(latest.date)}.`,
          severity: latest.status === 'Absent' ? 'danger' : 'warning'
        });
      }
    }

    return alerts;
  };

  const alerts = getNotifications();

  const handleOpenReceipt = (feeId) => {
    const rcpt = receipts.find(r => r.feeId === feeId);
    if (rcpt) {
      setActiveReceipt(rcpt);
      setReceiptModalOpen(true);
    } else {
      alert("Receipt transaction details not found.");
    }
  };

  if (children.length === 0) {
    return (
      <div className="flex flex-col
