import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserRoundCheck,
  ListOrdered,
  BedDouble,
  ReceiptText,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Cross,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'doctors'
  | 'queue'
  | 'admissions'
  | 'billing'
  | 'departments'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { queue, appointments, admissions, notifications, settings } = useHospital();
  const { currentUser, logout } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const waitingQueueCount = queue.filter(q => q.status === 'Waiting').length;
  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
  const activeAdmissionsCount = admissions.filter(a => a.status === 'Admitted').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const role = currentUser?.role;

  const getDashboardLabel = () => {
    switch (role) {
      case 'PATIENT':
        return 'Patient Portal';
      case 'DESK_ADMIN':
        return 'Reception Desk';
      case 'CHIEF_DOCTOR':
        return 'CMO Console';
      case 'DOCTOR':
        return 'Doctor Console';
      case 'BILLING_HEAD':
        return 'Billing Console';
      case 'HEAD_NURSE':
        return 'Nurse Station';
      case 'HOSPITAL_MANAGER':
        return 'Executive Console';
      default:
        return 'Dashboard';
    }
  };

  const getRoleBadgeLabel = (userRole?: string) => {
    switch (userRole) {
      case 'PATIENT':
        return 'Patient';
      case 'DESK_ADMIN':
        return 'Desk Admin';
      case 'CHIEF_DOCTOR':
        return 'Chief Doctor';
      case 'DOCTOR':
        return 'Doctor';
      case 'BILLING_HEAD':
        return 'Billing Head';
      case 'HEAD_NURSE':
        return 'Head Nurse';
      case 'HOSPITAL_MANAGER':
        return 'Manager';
      default:
        return userRole || 'Staff';
    }
  };

  const allNavItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    roles: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: getDashboardLabel(),
      icon: LayoutDashboard,
      roles: ['PATIENT', 'DESK_ADMIN', 'CHIEF_DOCTOR', 'DOCTOR', 'BILLING_HEAD', 'HEAD_NURSE', 'HOSPITAL_MANAGER']
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      roles: ['DESK_ADMIN', 'HOSPITAL_MANAGER']
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: CalendarDays,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
      badgeColor: 'bg-hospital-100 text-hospital-700',
      roles: ['DESK_ADMIN', 'DOCTOR', 'HOSPITAL_MANAGER']
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: UserRoundCheck,
      roles: ['DESK_ADMIN', 'DOCTOR', 'CHIEF_DOCTOR', 'HOSPITAL_MANAGER']
    },
    {
      id: 'queue',
      label: 'Patient Queue',
      icon: ListOrdered,
      badge: waitingQueueCount > 0 ? waitingQueueCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['DESK_ADMIN', 'HOSPITAL_MANAGER']
    },
    {
      id: 'admissions',
      label: 'Admissions & Beds',
      icon: BedDouble,
      badge: activeAdmissionsCount > 0 ? activeAdmissionsCount : undefined,
      badgeColor: 'bg-purple-100 text-purple-800',
      roles: ['DESK_ADMIN', 'HEAD_NURSE', 'HOSPITAL_MANAGER']
    },
    {
      id: 'billing',
      label: 'Billing & Payments',
      icon: ReceiptText,
      roles: ['BILLING_HEAD', 'HOSPITAL_MANAGER']
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      roles: ['CHIEF_DOCTOR', 'HOSPITAL_MANAGER']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['CHIEF_DOCTOR', 'BILLING_HEAD', 'HOSPITAL_MANAGER']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['PATIENT', 'DESK_ADMIN', 'CHIEF_DOCTOR', 'DOCTOR', 'BILLING_HEAD', 'HEAD_NURSE', 'HOSPITAL_MANAGER']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['HOSPITAL_MANAGER']
    },
  ];

  const visibleNavItems = allNavItems.filter(item => !role || item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-hospital-600 to-teal-400 text-white shadow-md flex-shrink-0">
              <Cross className="w-6 h-6 rotate-45 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Medi<span className="text-hospital-400">Desk</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-widest">
                  Hospital Management OS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Security Strip */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-1.5 bg-hospital-950/70 border border-hospital-800/60 rounded-lg flex items-center gap-2 text-[11px] text-hospital-300">
            <ShieldCheck className="w-3.5 h-3.5 text-hospital-400 flex-shrink-0" />
            <span className="truncate font-semibold">{getRoleBadgeLabel(role)} Workspace</span>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-hospital-600 text-white shadow-sm shadow-hospital-900/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-hospital-400'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-hospital-400 ring-2 ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-hospital-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-hospital-500/30 flex-shrink-0">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.fullName || 'Staff'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{getRoleBadgeLabel(role)}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-2.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};