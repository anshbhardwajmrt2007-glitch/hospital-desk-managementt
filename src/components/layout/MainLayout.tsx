import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Navbar } from './Navbar';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

// Role-specific Dashboards
import { PatientDashboard } from '../dashboards/PatientDashboard';
import { DeskAdminDashboard } from '../dashboards/DeskAdminDashboard';
import { DoctorDashboard } from '../dashboards/DoctorDashboard';
import { ChiefDoctorDashboard } from '../dashboards/ChiefDoctorDashboard';
import { BillingHeadDashboard } from '../dashboards/BillingHeadDashboard';
import { HeadNurseDashboard } from '../dashboards/HeadNurseDashboard';
import { HospitalManagerDashboard } from '../dashboards/HospitalManagerDashboard';

// Shared Staff Modules
import { PatientList } from '../modules/patients/PatientList';
import { AppointmentList } from '../modules/appointments/AppointmentList';
import { DoctorDirectory } from '../modules/doctors/DoctorDirectory';
import { QueueBoard } from '../modules/queue/QueueBoard';
import { AdmissionList } from '../modules/admissions/AdmissionList';
import { BillingList } from '../modules/billing/BillingList';
import { DepartmentDirectory } from '../modules/departments/DepartmentDirectory';
import { ReportsDashboard } from '../modules/reports/ReportsDashboard';
import { NotificationsView } from '../modules/notifications/NotificationsView';
import { SettingsView } from '../modules/settings/SettingsView';
import { AccessDenied } from '../common/AccessDenied';

// Global Quick Action Modals
import { PatientModal } from '../modules/patients/PatientModal';
import { BookAppointmentModal } from '../modules/appointments/BookAppointmentModal';
import { GenerateTokenModal } from '../modules/queue/GenerateTokenModal';
import { NewAdmissionModal } from '../modules/admissions/NewAdmissionModal';
import { CreateBillModal } from '../modules/billing/CreateBillModal';

// Icons for Patient Portal Top Bar
import { Cross, LogOut, HeartPulse, ShieldCheck, Clock } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { setActiveDepartmentFilter, settings } = useHospital();
  const { currentUser, logout, hasRole } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global modals state
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [bookAppointmentState, setBookAppointmentState] = useState<{
    isOpen: boolean;
    patientId?: string;
    doctorId?: string;
  }>({ isOpen: false });

  const [queueTokenState, setQueueTokenState] = useState<{
    isOpen: boolean;
    patientId?: string;
  }>({ isOpen: false });

  const [admissionState, setAdmissionState] = useState<{
    isOpen: boolean;
    patientId?: string;
  }>({ isOpen: false });

  const [billState, setBillState] = useState<{
    isOpen: boolean;
    patientId?: string;
  }>({ isOpen: false });

  // Cross module navigation handlers
  const handleDepartmentDoctors = (deptName: string) => {
    setActiveDepartmentFilter(deptName);
    setCurrentTab('doctors');
  };

  const handleDepartmentAppointments = (deptName: string) => {
    setActiveDepartmentFilter(deptName);
    setCurrentTab('appointments');
  };

  // Render Role Dashboard
  const renderRoleDashboard = () => {
    switch (currentUser?.role) {
      case 'PATIENT':
        return <PatientDashboard />;
      case 'DESK_ADMIN':
        return <DeskAdminDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'CHIEF_DOCTOR':
        return <ChiefDoctorDashboard />;
      case 'BILLING_HEAD':
        return <BillingHeadDashboard />;
      case 'HEAD_NURSE':
        return <HeadNurseDashboard />;
      case 'HOSPITAL_MANAGER':
        return <HospitalManagerDashboard />;
      default:
        return <DeskAdminDashboard />;
    }
  };

  // Role Access Checker
  const checkAccess = (allowedRoles: UserRole[], component: React.ReactNode) => {
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      return (
        <AccessDenied
          requiredRole={allowedRoles}
          onBackToDashboard={() => setCurrentTab('dashboard')}
        />
      );
    }
    return component;
  };

  const renderActiveModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderRoleDashboard();

      case 'patients':
        return checkAccess(
          ['DESK_ADMIN', 'HOSPITAL_MANAGER'],
          <PatientList
            onBookAppointment={(patientId) => setBookAppointmentState({ isOpen: true, patientId })}
            onAdmitPatient={(patientId) => setAdmissionState({ isOpen: true, patientId })}
            onCreateBill={(patientId) => setBillState({ isOpen: true, patientId })}
          />
        );

      case 'appointments':
        return checkAccess(
          ['DESK_ADMIN', 'DOCTOR', 'HOSPITAL_MANAGER'],
          <AppointmentList
            onIssueQueueToken={(patientId) => setQueueTokenState({ isOpen: true, patientId })}
          />
        );

      case 'doctors':
        return checkAccess(
          ['DESK_ADMIN', 'DOCTOR', 'CHIEF_DOCTOR', 'HOSPITAL_MANAGER'],
          <DoctorDirectory
            onBookAppointment={(doctorId) => setBookAppointmentState({ isOpen: true, doctorId })}
          />
        );

      case 'queue':
        return checkAccess(
          ['DESK_ADMIN', 'HOSPITAL_MANAGER'],
          <QueueBoard />
        );

      case 'admissions':
        return checkAccess(
          ['DESK_ADMIN', 'HEAD_NURSE', 'HOSPITAL_MANAGER'],
          <AdmissionList />
        );

      case 'billing':
        return checkAccess(
          ['BILLING_HEAD', 'HOSPITAL_MANAGER'],
          <BillingList />
        );

      case 'departments':
        return checkAccess(
          ['CHIEF_DOCTOR', 'HOSPITAL_MANAGER'],
          <DepartmentDirectory
            onSelectDepartmentForDoctors={handleDepartmentDoctors}
            onSelectDepartmentForAppointments={handleDepartmentAppointments}
          />
        );

      case 'reports':
        return checkAccess(
          ['CHIEF_DOCTOR', 'BILLING_HEAD', 'HOSPITAL_MANAGER'],
          <ReportsDashboard />
        );

      case 'notifications':
        return <NotificationsView onNavigateTab={setCurrentTab} />;

      case 'settings':
        return checkAccess(
          ['HOSPITAL_MANAGER'],
          <SettingsView />
        );

      default:
        return renderRoleDashboard();
    }
  };

  // If authenticated user is a PATIENT: Dedicated Consumer Portal Layout
  if (currentUser?.role === 'PATIENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Patient Portal Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-hospital-500 text-white shadow-md">
              <Cross className="w-6 h-6 rotate-45 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  Medi<span className="text-teal-600">Desk</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Patient Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{settings.hospitalName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>ID: {currentUser.patientId || 'PAT-1001'}</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-500/20">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'P'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Sign Out of Patient Portal"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Patient Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PatientDashboard />
        </main>
      </div>
    );
  }

  // Hospital Staff Portal Layout (with Sidebar, Navbar, and RBAC)
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onSelectTab={setCurrentTab}
          onOpenNewPatientModal={() => setIsNewPatientOpen(true)}
          onOpenBookAppointmentModal={() => setBookAppointmentState({ isOpen: true })}
          onOpenQueueTokenModal={() => setQueueTokenState({ isOpen: true })}
          onOpenCreateBillModal={() => setBillState({ isOpen: true })}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <PatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />

      <BookAppointmentModal
        isOpen={bookAppointmentState.isOpen}
        onClose={() => setBookAppointmentState({ isOpen: false })}
        preselectedPatientId={bookAppointmentState.patientId}
        preselectedDoctorId={bookAppointmentState.doctorId}
      />

      <GenerateTokenModal
        isOpen={queueTokenState.isOpen}
        onClose={() => setQueueTokenState({ isOpen: false })}
        preselectedPatientId={queueTokenState.patientId}
      />

      <NewAdmissionModal
        isOpen={admissionState.isOpen}
        onClose={() => setAdmissionState({ isOpen: false })}
        preselectedPatientId={admissionState.patientId}
      />

      <CreateBillModal
        isOpen={billState.isOpen}
        onClose={() => setBillState({ isOpen: false })}
        preselectedPatientId={billState.patientId}
      />
    </div>
  );
};