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
  const { students, fees, receipts, attendance, classes } = useDatabase();
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

    // 1. Fee due reminders
    unpaidFees.forEach(fee => {
      alerts.push({
        id: `fee_${fee.id}`,
        type: 'fee',
        title: 'Fee Payment Outstanding',
        message: `A payment of ${formatINR(fee.amount)} for ${fee.type} Fee (${fee.month}) is due by ${formatDate(fee.dueDate)}.`,
        severity: 'warning'
      });
    });

    // 2. Attendance alert (if marked absent or late on the latest recorded date)
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
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
        <AlertTriangle size={40} className="text-rose-500" />
        <h3 className="text-lg font-bold text-slate-700">No Child Records Found</h3>
        <p className="text-xs text-center max-w-sm">We couldn't locate any registered student containing your mobile number ({user.mobile}). Please contact the school admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome & Sibling Switcher Bar */}
      <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Parent Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user.name}. Monitor your children's progress here.</p>
        </div>

        {/* Child sibling tabs switcher */}
        {children.length > 1 && (
          <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wide">Child:</span>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`
                  px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200
                  ${selectedChildId === c.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }
                `}
              >
                {c.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <>
          {/* Dashboard Grid layouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Child Profile summary */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedChild.photo}
                    alt={selectedChild.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedChild.fullName}</h3>
                    <p className="text-xs text-rose-500 font-semibold">
                      {classes.find(cl => cl.id === selectedChild.classId)?.name || 'Std 10'} - Div {selectedChild.division}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Roll Number: {selectedChild.rollNumber}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GR Number:</span>
                    <span className="font-mono font-bold text-slate-700">{selectedChild.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="font-semibold text-slate-700">{formatDate(selectedChild.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender:</span>
                    <span className="font-semibold text-slate-700">{selectedChild.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Residential Address:</span>
                    <span className="font-medium text-slate-700 text-right max-w-[150px] truncate">{selectedChild.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mt-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck2 size={16} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Student Profile Verified & Active</span>
              </div>
            </div>

            {/* Attendance circle progress */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-center items-center text-center space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Attendance Status</h3>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#be123c" strokeWidth="8" fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * att.percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-800">{att.percentage}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Academic Rate</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full text-xs border-t border-slate-100 pt-4">
                <div>
                  <p className="text-slate-400 font-medium">Present</p>
                  <p className="font-bold text-emerald-600">{att.present} Days</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Late</p>
                  <p className="font-bold text-amber-500">{att.late} Days</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Absent</p>
                  <p className="font-bold text-rose-500">{att.absent} Days</p>
                </div>
              </div>
            </div>

            {/* Notification alert panels */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 overflow-y-auto max-h-[320px]">
              <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <BellRing size={18} className="text-rose-500" />
                Alerts & Reminders
              </h3>

              <div className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-normal animate-fade-in
                      ${alert.severity === 'danger'
                        ? 'bg-rose-50 border-rose-100 text-rose-700'
                        : 'bg-amber-50 border-amber-100 text-amber-700'
                      }
                    `}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1
                      ${alert.severity === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}
                    `} />
                    <div>
                      <p className="font-bold">{alert.title}</p>
                      <p className="mt-1 opacity-90">{alert.message}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No active notifications or pending fee warnings.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Grid: Attendance log list vs Fee history receipts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Attendance ledger log */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Recent Roll Roster Log</h3>

              <div className="overflow-y-auto max-h-[280px] divide-y divide-slate-100/50 pr-2">
                {att.history.map(item => (
                  <div key={item.date} className="flex justify-between items-center py-3">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(item.date)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border
                      ${item.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : item.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }
                    `}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {att.history.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                    No attendance records exist for this student yet.
                  </div>
                )}
              </div>
            </div>

            {/* Fee Invoices & Receipts download */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Fee Invoice Ledgers</h3>

              <div className="overflow-y-auto max-h-[280px] divide-y divide-slate-100/50 pr-2">
                {childFees.map(fee => (
                  <div key={fee.id} className="flex justify-between items-center py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{fee.type} Fee</p>
                      <p className="text-[10px] text-slate-400 font-medium">Billing Period: {fee.month}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-800">{formatINR(fee.amount)}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">due: {formatDate(fee.dueDate)}</p>
                      </div>

                      {fee.status === 'Paid' ? (
                        <button
                          onClick={() => handleOpenReceipt(fee.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors"
                          title="Download receipt PDF"
                          id={`download-receipt-${fee.id}`}
                        >
                          <Download size={12} /> Receipt
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {childFees.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                    No active fee invoices issued for this student.
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* visual / printable receipt modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Payment Collection Receipt"
      >
        {activeReceipt && (
          <ReceiptPDF
            receipt={activeReceipt}
            student={students.find(s => s.id === activeReceipt.studentId)}
            fee={fees.find(f => f.id === activeReceipt.feeId)}
          />
        )}
      </Modal>

    </div>
  );
};

export default ParentDashboard;
