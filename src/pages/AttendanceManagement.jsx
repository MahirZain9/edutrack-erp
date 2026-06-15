import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Save, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  BookOpen 
} from 'lucide-react';
import { formatDate } from '../utils';

const AttendanceManagement = () => {
  const { students, classes, saveAttendance, attendance } = useDatabase();
  const { user } = useAuth();
  
  // Page states
  const [activeSubTab, setActiveSubTab] = useState('take'); // 'take' or 'reports'
  
  // Selector states
  const [selectedClass, setSelectedClass] = useState('c3'); // default Class 10-A
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Take Attendance states
  const [markedRecords, setMarkedRecords] = useState({}); // studentId -> status
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reports states
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportMonth, setReportMonth] = useState('2026-06'); // YYYY-MM

  // Load existing attendance for class/date if available
  useEffect(() => {
    const key = `${selectedClass}_${selectedDate}`;
    const existing = attendance[key];
    
    // Filter active students for selected class
    const classStudents = students.filter(s => s.classId === selectedClass && s.status === 'Active');
    
    const initialRecords = {};
    classStudents.forEach(s => {
      if (existing && existing.records && existing.records[s.id]) {
        initialRecords[s.id] = existing.records[s.id];
      } else {
        // default status: unselected or empty
        initialRecords[s.id] = '';
      }
    });
    setMarkedRecords(initialRecords);
  }, [selectedClass, selectedDate, attendance, students]);

  // Set default student for reports tab
  useEffect(() => {
    const classStudents = students.filter(s => s.classId === selectedClass && s.status === 'Active');
    if (classStudents.length > 0) {
      setReportStudentId(classStudents[0].id);
    } else {
      setReportStudentId('');
    }
  }, [selectedClass, students]);

  const classStudents = students.filter(s => s.classId === selectedClass && s.status === 'Active');

  const handleMarkStatus = (studentId, status) => {
    setMarkedRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    classStudents.forEach(s => {
      allPresent[s.id] = 'Present';
    });
    setMarkedRecords(allPresent);
  };

  const handleSaveAttendance = async () => {
    // Validate that all students have a marked status
    const unmarked = classStudents.filter(s => !markedRecords[s.id]);
    if (unmarked.length > 0) {
      alert(`Please mark attendance for all students. ${unmarked.length} remaining.`);
      return;
    }

    await saveAttendance(selectedClass, selectedDate, markedRecords);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // --- REPORT CALCULATIONS ---
  const getStudentReportData = () => {
    if (!reportStudentId) return { present: 0, absent: 0, late: 0, percentage: 0, history: [] };

    let present = 0;
    let absent = 0;
    let late = 0;
    const history = [];

    // Filter attendance matching this month
    Object.keys(attendance).forEach(key => {
      const record = attendance[key];
      if (record.date.startsWith(reportMonth)) {
        const status = record.records[reportStudentId];
        if (status) {
          history.push({ date: record.date, status });
          if (status === 'Present') present++;
          if (status === 'Absent') absent++;
          if (status === 'Late') late++;
        }
      }
    });

    const total = present + absent + late;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    // Sort history by date
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { present, absent, late, total, percentage, history };
  };

  const reportData = getStudentReportData();

  // Summary counts for current marking screen
  const markingStats = () => {
    let present = 0, absent = 0, late = 0, unmarked = 0;
    classStudents.forEach(s => {
      const status = markedRecords[s.id];
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Late') late++;
      else unmarked++;
    });
    return { present, absent, late, unmarked };
  };

  const stats = markingStats();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Attendance Workspace</h1>
          <p className="text-slate-500 text-xs mt-0.5">Take daily student roll calls or verify monthly attendance reports.</p>
        </div>
        
        {/* Sub-tab Switchers */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('take')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeSubTab === 'take' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-take-attendance"
          >
            Take Roll Call
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeSubTab === 'reports' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-attendance-reports"
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Classroom</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
            id="attendance-class-select"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - Div {c.division}</option>
            ))}
          </select>
        </div>

        {activeSubTab === 'take' ? (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
              id="attendance-date-input"
            />
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Student</label>
            <select
              value={reportStudentId}
              onChange={(e) => setReportStudentId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
              id="report-student-select"
            >
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
              {classStudents.length === 0 && <option value="">No Active Students</option>}
            </select>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Month</label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
              id="report-month-input"
            />
          </div>
        )}

        {activeSubTab === 'take' && (
          <div className="flex items-end">
            <button
              onClick={handleMarkAllPresent}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
              id="mark-all-present-btn"
            >
              <Sparkles size={14} className="text-rose-500" />
              Mark All Present
            </button>
          </div>
        )}
      </div>

      {/* WORKSPACE VIEW: TAKE ATTENDANCE */}
      {activeSubTab === 'take' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Attendance List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Class Roll Roster ({classStudents.length} Students)</span>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-fade-in">
                  ✓ Attendance Saved!
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100/70">
              {classStudents.map(stud => {
                const status = markedRecords[stud.id];
                return (
                  <div key={stud.id} className="flex items-center justify-between p-4 hover:bg-slate-50/20 transition-colors">
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <img src={stud.photo} alt={stud.fullName} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{stud.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Roll Number: {stud.rollNumber}</p>
                      </div>
                    </div>

                    {/* Marking Buttons */}
                    <div className="flex gap-1">
                      {/* PRESENT */}
                      <button
                        onClick={() => handleMarkStatus(stud.id, 'Present')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all duration-200 flex items-center gap-1
                          ${status === 'Present' 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-emerald-50/50'
                          }
                        `}
                        id={`mark-present-${stud.id}`}
                      >
                        <Check size={12} /> P
                      </button>

                      {/* LATE */}
                      <button
                        onClick={() => handleMarkStatus(stud.id, 'Late')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all duration-200 flex items-center gap-1
                          ${status === 'Late' 
                            ? 'bg-amber-500 text-white border-amber-500' 
                            : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50/50'
                          }
                        `}
                        id={`mark-late-${stud.id}`}
                      >
                        <Clock size={12} /> L
                      </button>

                      {/* ABSENT */}
                      <button
                        onClick={() => handleMarkStatus(stud.id, 'Absent')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all duration-200 flex items-center gap-1
                          ${status === 'Absent' 
                            ? 'bg-rose-500 text-white border-rose-500' 
                            : 'bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50/50'
                          }
                        `}
                        id={`mark-absent-${stud.id}`}
                      >
                        <X size={12} /> A
                      </button>
                    </div>

                  </div>
                );
              })}
              {classStudents.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-semibold">
                  No active students registered in this class.
                </div>
              )}
            </div>

            {classStudents.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all hover-scale"
                  id="save-attendance-btn"
                >
                  <Save size={16} />
                  Save Roster Attendance
                </button>
              </div>
            )}
          </div>

          {/* Marking Summary Card */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3">Roster Summary</h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Present Students</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">{stats.present}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Late Students</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">{stats.late}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Absent Students</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">{stats.absent}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-700">Unmarked</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">{stats.unmarked}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* WORKSPACE VIEW: REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Monthly Stats Visuals */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-center items-center text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Attendance Percentage</h3>
            
            {/* Circular Progress Bar */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#be123c" strokeWidth="8" fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * reportData.percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-800">{reportData.percentage}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Rating</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full text-xs border-t border-slate-100 pt-4 mt-2">
              <div>
                <p className="text-slate-400 font-medium">Present</p>
                <p className="font-bold text-emerald-600">{reportData.present} Days</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Late</p>
                <p className="font-bold text-amber-500">{reportData.late} Days</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Absent</p>
                <p className="font-bold text-rose-500">{reportData.absent} Days</p>
              </div>
            </div>
          </div>

          {/* Monthly calendar list */}
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Daily Status Log</h3>
            
            <div className="overflow-y-auto max-h-[350px] divide-y divide-slate-100/50 pr-2">
              {reportData.history.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-semibold">
                  No attendance records exist for this student in the selected month.
                </div>
              ) : (
                reportData.history.map(item => (
                  <div key={item.date} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border
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
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AttendanceManagement;
