import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  BookOpen, 
  ChevronLeft, 
  LogOut,
  Sparkles
} from 'lucide-react';
import logo from '../assets/logo.svg';

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  currentTab, 
  setCurrentTab, 
  role, 
  onLogout 
}) => {
  
  // Navigation Links based on role
  const getNavLinks = () => {
    switch (role) {
      case 'Admin':
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'fees', label: 'Fees Management', icon: CreditCard },
        ];
      case 'Teacher':
        return [
          { id: 'teacher-dashboard', label: 'My Class', icon: LayoutDashboard },
          { id: 'students', label: 'Students List', icon: Users },
          { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
        ];
      case 'Parent':
        return [
          { id: 'parent-dashboard', label: 'My Child', icon: BookOpen },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-300 transform lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Era Campus Logo" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Era Campus</h1>
              <p className="text-[10px] text-rose-500 font-semibold tracking-wider uppercase">School Portal</p>
            </div>
          </div>
          {/* Collapse button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setIsOpen(false); // Close drawer on mobile select
                }}
                className={`
                  flex items-center w-full gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-rose-50 text-rose-600 shadow-[inset_4px_0_0_0_#e11d48]' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
                id={`sidebar-link-${link.id}`}
              >
                <Icon size={18} className={isActive ? 'text-rose-600' : 'text-slate-400'} />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 text-rose-700">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700">MVP Demo Active</p>
              <p className="text-[9px] text-slate-500">Dual Mode DB Service</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center w-full gap-3 px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all duration-200"
            id="sidebar-logout-btn"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
