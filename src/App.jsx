import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import FeesManagement from './pages/FeesManagement';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import { INITIAL_USERS } from './services/mockData';

const AppContent = () => {
  const { user, logout, loginParent, loginWithEmail } = useAuth();
  
  // Responsive sidebar open/close drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Current visible page tab
  const [currentTab, setCurrentTab] = useState('');

  // Set default tabs based on active user role
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        setCurrentTab('admin-dashboard');
      } else if (user.role === 'Teacher') {
        setCurrentTab('teacher-dashboard');
      } else if (user.role === 'Parent') {
        setCurrentTab('parent-dashboard');
      }
    }
  }, [user]);

  // Support instant test role switcher (Local Demo Mode only)
  const handleSwitchRole = (newRole) => {
    // Locate corresponding mock user from mockData users array
    const matched = INITIAL_USERS.find(u => u.role === newRole);
    if (matched) {
      // Manually overwrite local storage session & reload context
      localStorage.setItem('edutrack_current_user', JSON.stringify(matched));
      window.location.reload();
    }
  };

  // Render view container matching active tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'admin-dashboard':
        return <AdminDashboard setCurrentTab={setCurrentTab} />;
      case 'teacher-dashboard':
        return <TeacherDashboard user={user} setCurrentTab={setCurrentTab} />;
      case 'parent-dashboard':
        return <ParentDashboard user={user} />;
      case 'students':
        return <StudentManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'fees':
        return <FeesManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-sm font-semibold">View not found or access restricted.</p>
          </div>
        );
    }
  };

  // Auth gate
  if (!user) {
    return <Login />;
  }

  return (
    <DatabaseProvider user={user}>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          role={user.role} 
          onLogout={logout} 
        />

        {/* Main Workspace Frame */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header Panel */}
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            user={user} 
            onLogout={logout}
            onSwitchRole={handleSwitchRole}
          />

          {/* Scrolling Page View container */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-7xl mx-auto h-full">
              {renderTabContent()}
            </div>
          </main>

        </div>
      </div>
    </DatabaseProvider>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
