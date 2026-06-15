import React, { useState } from 'react';
import { Menu, Bell, Shield, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { dbService } from '../services/db';

const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  user, 
  onLogout,
  onSwitchRole // callback to switch role quickly for testing
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Quick switch options for demo
  const demoRoles = ['Admin', 'Teacher', 'Parent'];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
      {/* Left side: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 lg:hidden"
          id="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Portal Dashboard</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block w-2 h-2 rounded-full ${dbService.isFirebase ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-[11px] text-slate-500 font-medium">
              {dbService.isFirebase ? 'Connected to Firebase Firestore' : 'Running in Local Sandbox Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Actions, Switcher & User Dropdown */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Quick Role Switcher (Visible in Demo mode) */}
        {!dbService.isFirebase && onSwitchRole && (
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-100 rounded-lg">
            <span className="text-[10px] font-bold text-rose-600 px-2 uppercase tracking-wide">Test As:</span>
            {demoRoles.map(r => (
              <button
                key={r}
                onClick={() => onSwitchRole(r)}
                className={`
                  px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200
                  ${user?.role === r 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-rose-600 hover:bg-rose-100'
                  }
                `}
                id={`role-switch-${r.toLowerCase()}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Notification Bell */}
        <button 
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200"
          id="header-notification-btn"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-all duration-200"
            id="user-profile-dropdown-btn"
          >
            {/* Simple Letter Avatar or image if provided */}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-sm font-semibold text-slate-700 leading-tight truncate max-w-[120px]">{user?.name || 'User'}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize leading-none">{user?.role || 'Guest'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to close dropdown */}
              <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-premium border border-slate-100 z-30 overflow-hidden animate-fade-in">
                {/* Header detail */}
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.email || user?.mobile || 'No email'}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-[10px] font-semibold text-rose-700 border border-rose-100">
                    <Shield size={10} />
                    {user?.role} Portal
                  </span>
                </div>

                {/* Switcher for mobile view */}
                {!dbService.isFirebase && onSwitchRole && (
                  <div className="p-2 border-b border-slate-100 md:hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2 py-1">Switch View</p>
                    {demoRoles.map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          onSwitchRole(r);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg text-left"
                      >
                        {r}
                        {user?.role === r && <Check size={12} className="text-rose-600" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex items-center w-full gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 text-left"
                    id="dropdown-logout-btn"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
