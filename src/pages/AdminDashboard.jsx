import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  AlertTriangle,
  PlusCircle,
  CheckSquare,
  Receipt,
  BellRing,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatINR, formatDate } from '../utils';

const AdminDashboard = ({ setCurrentTab }) => {
  const { students, fees, receipts, attendance } = useDatabase();
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notiSubject, setNotiSubject] = useState('');
  const [notiBody, setNotiBody] = useState('');
  const [notiTarget, setNotiTarget] = useState('All');
  const [notiSuccess, setNotiSuccess] = useState(false);

  // --- STATS CALCULATIONS ---
  const totalStudents = students.filter(s => s.status === 'Active').length;
  
  // Today's Attendance calculation (fallback to latest date with records if today has none)
  const getLatestAttendanceStats = () => {
    const dates = Object.keys(attendance).map(k => k.split('_')[1]).sort();
    if (dates.length === 0) return { percent: 0, text: 'No records' };
    const latestDate = dates[dates.length - 1];
    
    let total = 0;
    let present = 0;
    
    Object.keys(attendance).forEach(key => {
      if (key.endsWith(latestDate)) {
        const records = attendance[key].records || {};
        Object.keys(records).forEach(sId => {
          total++;
          if (records[sId] === 'Present' || records[sId] === 'Late') {
            present++;
          }
        });
      }
    });

    if (total === 0) return { percent: 0, text: '0/0 Students' };
    const percent = Math.round((present / total) * 100);
    return { 
      percent, 
      text: `${present}/${total} Students`, 
      date: latestDate 
    };
  };
  
  const attStats = getLatestAttendanceStats();

  // Fee Stats
  const totalCollection = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingCollection = fees
    .filter(f => f.status === 'Unpaid')
    .reduce((sum, f) => sum + f.amount, 0);

  // Calculate today's collection (from receipts paid on current day)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCollection = receipts
    .filter(r => r.paymentDate === todayStr)
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const handleSendNotification = (e) => {
    e.preventDefault();
    setNotiSuccess(true);
    setTimeout(() => {
      setNotiSuccess(false);
      setNotificationModalOpen(false);
      setNotiSubject('');
      setNotiBody('');
    }, 1500);
  };

  const classes = [
    { name: 'Std 9 - Div A', code: 'c1', bg: 'bg-emerald-500' },
    { name: 'Std 9 - Div B', code: 'c2', bg: 'bg-indigo-500' },
    { name: 'Std 10 - Div A', code: 'c3', bg: 'bg-rose-500' },
    { name: 'Std 10 - Div B', code: 'c4', bg: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Welcome, Administrator</h1>
          <p className="text-slate-500 text-sm mt-1">Here is what's happening at EduTrack school today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-xs font-bold shadow-sm">
          <TrendingUp size={16} />
          Terminal Session Live
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Students */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalStudents}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active enrollments</p>
          </div>
        </div>

        {/* Card 2: Attendance */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <CalendarCheck size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{attStats.percent}%</h3>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{attStats.text}</p>
          </div>
        </div>

        {/* Card 3: Collection */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <IndianRupee size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collection</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{formatINR(totalCollection)}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Today: +{formatINR(todaysCollection)}</p>
          </div>
        </div>

        {/* Card 4: Pending Fees */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Fees</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{formatINR(pendingCollection)}</h3>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Awaiting collection</p>
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-5 tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <button 
            onClick={() => setCurrentTab('students')}
            className="flex flex-col items-center justify-center p-5 border border-slate-100 rounded-2xl hover:bg-rose-50/50 hover:border-rose-100 hover:text-rose-600 transition-all duration-300 group"
            id="action-add-student"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <PlusCircle size={22} />
            </div>
            <span className="text-sm font-bold">Add Student</span>
          </button>

          <button 
            onClick={() => setCurrentTab('attendance')}
            className="flex flex-col items-center justify-center p-5 border border-slate-100 rounded-2xl hover:bg-rose-50/50 hover:border-rose-100 hover:text-rose-600 transition-all duration-300 group"
            id="action-take-attendance"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <CheckSquare size={22} />
            </div>
            <span className="text-sm font-bold">Take Attendance</span>
          </button>

          <button 
            onClick={() => setCurrentTab('fees')}
            className="flex flex-col items-center justify-center p-5 border border-slate-100 rounded-2xl hover:bg-rose-50/50 hover:border-rose-100 hover:text-rose-600 transition-all duration-300 group"
            id="action-collect-fees"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <Receipt size={22} />
            </div>
            <span className="text-sm font-bold">Collect Fees</span>
          </button>

          <button 
            onClick={() => setNotificationModalOpen(true)}
            className="flex flex-col items-center justify-center p-5 border border-slate-100 rounded-2xl hover:bg-rose-50/50 hover:border-rose-100 hover:text-rose-600 transition-all duration-300 group"
            id="action-send-notification"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <BellRing size={22} />
            </div>
            <span className="text-sm font-bold">Send Notification</span>
          </button>

        </div>
      </div>

      {/* Bottom Layout: Recent Payments & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent receipts */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Fee Transactions</h3>
            <button 
              onClick={() => setCurrentTab('fees')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Receipt No</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 text-xs">
                {receipts.slice(-4).reverse().map(r => {
                  const stud = students.find(s => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-slate-600">{r.receiptNumber}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{stud?.fullName || 'Unknown Student'}</td>
                      <td className="py-3.5 text-slate-500">{formatDate(r.paymentDate)}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] uppercase">
                          {r.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-slate-800">{formatINR(r.amountPaid)}</td>
                    </tr>
                  );
                })}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold">No recent transactions recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Classes overview */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-5 tracking-tight">Active Class Rooms</h3>
          <div className="space-y-4">
            {classes.map(cl => {
              const count = students.filter(s => s.classId === cl.code && s.status === 'Active').length;
              return (
                <div key={cl.code} className="flex justify-between items-center p-3 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cl.bg}`} />
                    <span className="text-sm font-bold text-slate-800">{cl.name}</span>
                  </div>
                  <span className="text-xs font-extrabold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                    {count} Students
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Send Notification Modal */}
      <Modal 
        isOpen={notificationModalOpen} 
        onClose={() => setNotificationModalOpen(false)}
        title="Send Announcement / Notification"
      >
        {notiSuccess ? (
          <div className="text-center py-8 space-y-3 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
            <h4 className="text-lg font-bold text-slate-800">Notification Sent Successfully!</h4>
            <p className="text-xs text-slate-400">Parents will receive SMS and portal alerts immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Target Audience</label>
              <select
                value={notiTarget}
                onChange={(e) => setNotiTarget(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                id="noti-target"
              >
                <option value="All">All Parents & Teachers</option>
                <option value="Std 10 - Div A">Parents of Std 10 - Div A</option>
                <option value="Std 9 - Div A">Parents of Std 9 - Div A</option>
                <option value="Teachers">All Teachers</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
              <input
                type="text"
                required
                value={notiSubject}
                onChange={(e) => setNotiSubject(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="Fee Reminder / Parent Teacher Meeting"
                id="noti-subject"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Message Content</label>
              <textarea
                required
                rows={4}
                value={notiBody}
                onChange={(e) => setNotiBody(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="Dear Parents, this is to inform you that..."
                id="noti-body"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all duration-200 hover-scale"
              id="noti-submit-btn"
            >
              Broadcast Notification
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default AdminDashboard;
