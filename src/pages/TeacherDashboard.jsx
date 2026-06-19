import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Users, 
  CalendarCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  UserCheck2,
  CheckSquare,
  BellRing
} from 'lucide-react';
import { formatDate } from '../utils';


const TeacherDashboard = ({ user, setCurrentTab }) => {
  const { students, classes, attendance, notifications } = useDatabase();
  
  // Teacher's assigned class ID
  const classId = user.assignedClassId || 'c3'; // Fallback to Std 10 - Div A
  const classObj = classes.find(c => c.id === classId);

  // --- STATS & HISTORY FOR ASSIGNED CLASS ---
  const classStudents = students.filter(s => s.classId === classId && s.status === 'Active');

  // Notifications relevant to Teachers
  const relevantNotifications = notifications
    .filter(n => n.target === 'All' || n.target === 'Teachers')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Latest Attendance stats for this class
  const getLatestAttendanceStats = () => {
    const dates = Object.keys(attendance)
      .filter(k => k.startsWith(`${classId}_`))
      .map(k => k.split('_')[1])
      .sort();
      
    if (dates.length === 0) return { percent: 0, text: 'No records', date: null };
    const latestDate = dates[dates.length - 1];
    
    let total = 0;
    let present = 0;
    
    const record = attendance[`${classId}_${latestDate}`];
    if (record && record.records) {
      Object.keys(record.records).forEach(sId => {
        total++;
        if (record.records[sId] === 'Present' || record.records[sId] === 'Late') {
          present++;
        }
      });
    }

    if (total === 0) return { percent: 0, text: '0/0 Students', date: latestDate };
    const percent = Math.round((present / total) * 100);
    return { 
      percent, 
      text: `${present}/${total} Marked Present`, 
      date: latestDate 
    };
  };

  const attStats = getLatestAttendanceStats();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Classroom Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user.name}. Manage your classroom roster and attendance here.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-xs font-bold shadow-sm">
          <TrendingUp size={16} />
          {classObj ? `${classObj.name} - Div ${classObj.division}` : 'Std 10 - Div A'}
        </div>
      </div>

      {/* Notifications / Announcements */}
      {relevantNotifications.length > 0 && (
        <div className="space-y-3">
          {relevantNotifications.map(n => (
            <div key={n.id} className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <BellRing size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800">{n.subject}</h4>
                <p className="text-xs text-amber-700 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-amber-500 font-semibold mt-1.5">{formatDate(n.createdAt?.split('T')[0])}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Statistics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Students count */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Size</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{classStudents.length}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active pupils in list</p>
          </div>
        </div>

        {/* Card 2: Latest Attendance */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium flex items-center gap-5 hover-scale">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <CalendarCheck size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Attendance</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{attStats.percent}%</h3>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
              {attStats.date ? `Date: ${formatDate(attStats.date)}` : 'No roll calls taken yet'}
            </p>
          </div>
        </div>

        {/* Card 3: Take Roll Shortcut */}
        <div className="p-6 bg-rose-500 rounded-3xl shadow-premium flex flex-col justify-between hover-scale text-white border border-rose-600">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Roll Call</span>
          </div>
          <div className="mt-4">
            <h4 className="font-extrabold text-lg">Daily Roll Call</h4>
            <button
              onClick={() => setCurrentTab('attendance')}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-600 font-bold text-xs rounded-xl shadow hover:bg-slate-50 transition-colors"
              id="teacher-start-roll-btn"
            >
              Start Marking <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Classroom student roster list */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Classroom Roster</h3>
          <button 
            onClick={() => setCurrentTab('students')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Manage Roster <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Roll Number</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">GR Number</th>
                <th className="pb-3">Parent Name</th>
                <th className="pb-3 text-right">Parent Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 text-xs">
              {classStudents.map(stud => (
                <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-bold text-slate-600 pr-4">{stud.rollNumber}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={stud.photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-bold text-slate-800">{stud.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-500">{stud.admissionNumber}</td>
                  <td className="py-3 font-medium text-slate-700">{stud.parentName}</td>
                  <td className="py-3 text-right font-semibold text-slate-600">{stud.parentMobile}</td>
                </tr>
              ))}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold">No students in your classroom roster.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
