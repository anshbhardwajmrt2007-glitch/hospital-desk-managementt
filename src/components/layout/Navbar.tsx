import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  UserPlus,
  CalendarPlus,
  Ticket,
  Receipt,
  RotateCcw,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut,
  Settings
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface NavbarProps {
  onOpenMobile: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewPatientModal: () => void;
  onOpenBookAppointmentModal: () => void;
  onOpenQueueTokenModal: () => void;
  onOpenCreateBillModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobile,
  onSelectTab,
  onOpenNewPatientModal,
  onOpenBookAppointmentModal,
  onOpenQueueTokenModal,
  onOpenCreateBillModal
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, resetDemoData, patients, doctors } = useHospital();
  const { currentUser, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Search matches
  const matchedPatients = searchQuery.trim()
    ? patients.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      )
    : [];

  const matchedDoctors = searchQuery.trim()
    ? doctors.filter(
        d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.departmentName || d.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const role = currentUser?.role;

  // Role display label
  const getRoleBadgeLabel = (userRole?: string) => {
    switch (userRole) {
      case 'PATIENT':
        return 'Patient Portal';
      case 'DESK_ADMIN':
        return 'Reception Desk Admin';
      case 'CHIEF_DOCTOR':
        return 'Chief Medical Officer';
      case 'DOCTOR':
        return 'Consultant Doctor';
      case 'BILLING_HEAD':
        return 'Billing Head';
      case 'HEAD_NURSE':
        return 'Head Nurse';
      case 'HOSPITAL_MANAGER':
        return 'Hospital Manager';
      default:
        return userRole || 'Staff';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left Section: Mobile Menu & Live Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open mobile navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search for Staff */}
          {role !== 'PATIENT' ? (
            <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search patient name, ID, doctor..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 focus:bg-white transition-all text-slate-900"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Patients ({matchedPatients.length})
                  </div>
                  {matchedPatients.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        onSelectTab('patients');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-hospital-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.id} • {p.phone}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {p.gender}, {p.age}y
                      </span>
                    </button>
                  ))}
                  {matchedPatients.length === 0 && (
                    <p className="px-3 py-1 text-xs text-slate-400">No matching patients</p>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Doctors ({matchedDoctors.length})
                  </div>
                  {matchedDoctors.slice(0, 3).map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        onSelectTab('doctors');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-hospital-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.specialization} • {d.departmentName || d.department}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        d.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status}
                      </span>
                    </button>
                  ))}
                  {matchedDoctors.length === 0 && (
                    <p className="px-3 py-1 text-xs text-slate-400">No matching doctors</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                Patient Portal
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {currentUser?.patientId || 'PAT-1001'}</span>
            </div>
          )}
        </div>

        {/* Right Section: Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Date / Time badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 text-slate-600 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-hospital-600" />
            <span>{currentTime}</span>
          </div>

          {/* Quick Create Action Dropdown for authorized staff */}
          {(role === 'DESK_ADMIN' || role === 'HOSPITAL_MANAGER') && (
            <div ref={quickRef} className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center gap-1.5 px-3 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-hospital-500"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Action</span>
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Desk Shortcuts
                  </div>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onOpenNewPatientModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-hospital-50 hover:text-hospital-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-hospital-600" />
                    <span>Register Walk-in Patient</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onOpenBookAppointmentModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-hospital-50 hover:text-hospital-700 transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4 text-hospital-600" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onOpenQueueTokenModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-hospital-50 hover:text-hospital-700 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-amber-600" />
                    <span>Issue Queue Token</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onOpenCreateBillModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-hospital-50 hover:text-hospital-700 transition-colors border-t border-slate-100 mt-1"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Generate New Invoice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Demo Data to Initial Seeds"
            aria-label="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-hospital-600 hover:text-hospital-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                        !n.read ? 'bg-hospital-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time || 'Recent'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                  <button
                    onClick={() => {
                      onSelectTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
                  >
                    View All Activity Records →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu (Strict RBAC - No dropdown persona escalation) */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-hospital-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{getRoleBadgeLabel(currentUser?.role)}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{currentUser?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-hospital-700 bg-hospital-50 px-2 py-0.5 rounded-md border border-hospital-200">
                    <ShieldCheck className="w-3 h-3 text-hospital-600" />
                    <span>{getRoleBadgeLabel(currentUser?.role)}</span>
                  </div>
                </div>

                <div className="py-1">
                  {currentUser?.role === 'HOSPITAL_MANAGER' && (
                    <button
                      onClick={() => {
                        onSelectTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Hospital Settings</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Demo Data Confirm Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data?"
        message="This will reset all patients, doctors, appointments, queue tokens, admissions, and bills back to the default initial sample dataset. Any changes made will be restored."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Current Data"
        isDestructive={true}
      />
    </>
  );
};