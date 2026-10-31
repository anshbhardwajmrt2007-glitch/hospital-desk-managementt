import React, { useState } from 'react';
import {
  Users,
  CalendarDays,
  ListOrdered,
  BedDouble,
  UserPlus,
  CalendarPlus,
  Ticket,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { PatientList } from '../modules/patients/PatientList';
import { AppointmentList } from '../modules/appointments/AppointmentList';
import { QueueBoard } from '../modules/queue/QueueBoard';
import { AdmissionList } from '../modules/admissions/AdmissionList';
import { PatientModal } from '../modules/patients/PatientModal';
import { BookAppointmentModal } from '../modules/appointments/BookAppointmentModal';
import { GenerateTokenModal } from '../modules/queue/GenerateTokenModal';
import { NewAdmissionModal } from '../modules/admissions/NewAdmissionModal';
import { StatCard } from '../common/StatCard';

export const DeskAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { patients, appointments, queue, admissions, doctors } = useHospital();

  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'queue' | 'admissions'>('overview');

  // Quick Action Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
  const waitingInQueue = queue.filter(q => q.status === 'Waiting');
  const activeAdmissions = admissions.filter(a => a.status === 'Admitted');
  const availableDoctors = doctors.filter(d => d.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Reception Desk Header Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-hospital-500/30 text-hospital-300 border border-hospital-400/30">
              Front Desk & Reception Desk Console
            </span>
            <span className="text-xs text-slate-400">• Operator: {currentUser?.fullName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Central Reception Desk
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Register incoming walk-in patients, manage clinic appointment schedules, check-in arrivals, issue digital queue tokens, and coordinate inpatient admissions.
          </p>
        </div>

        {/* Reception Desk Shortcut Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-in</span>
          </button>
          <button
            onClick={() => setIsBookOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-xs"
          >
            <CalendarPlus className="w-4 h-4 text-hospital-400" />
            <span>Book Visit</span>
          </button>
          <button
            onClick={() => setIsTokenOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            <span>Issue Token</span>
          </button>
          <button
            onClick={() => setIsAdmitOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <BedDouble className="w-4 h-4" />
            <span>Admit Bed</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Desk Overview', icon: Clock },
          { id: 'patients', label: `Patients Directory (${patients.length})`, icon: Users },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: CalendarDays },
          { id: 'queue', label: `OPD Queue Board (${waitingInQueue.length} Waiting)`, icon: ListOrdered },
          { id: 'admissions', label: `Inpatient Admissions (${activeAdmissions.length})`, icon: BedDouble },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-hospital-600 text-hospital-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Appointments"
              value={todayAppointments.length}
              subtitle="Scheduled consultations"
              icon={CalendarDays}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
              onClick={() => setActiveTab('appointments')}
            />
            <StatCard
              title="Waiting in Queue"
              value={waitingInQueue.length}
              subtitle="Checked-in OPD patients"
              icon={ListOrdered}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
              onClick={() => setActiveTab('queue')}
            />
            <StatCard
              title="Doctors on Duty"
              value={availableDoctors.length}
              subtitle={`Out of ${doctors.length} specialists`}
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Active Inpatient Beds"
              value={activeAdmissions.length}
              subtitle="Occupied IPD beds"
              icon={BedDouble}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
              onClick={() => setActiveTab('admissions')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Today's Appointments Quick Desk Triage */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Today's Scheduled Consultations</h3>
                <span className="text-xs text-hospital-600 font-semibold">{todayAppointments.length} visits</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map(a => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{a.patientName}</span>
                        <span className="text-slate-400 ml-2 font-mono">({a.timeSlot})</span>
                        <p className="text-slate-500 text-[11px]">{a.doctorName} • {a.departmentName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Checked In' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No appointments scheduled for today.</p>
                )}
              </div>
            </div>

            {/* Waiting Queue Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Live OPD Waiting Queue</h3>
                <span className="text-xs text-amber-600 font-semibold">{waitingInQueue.length} waiting</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {queue.length > 0 ? (
                  queue.map(q => (
                    <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-1 font-mono font-bold text-xs bg-slate-900 text-white rounded-lg">
                          {q.tokenDisplay}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{q.patientName}</p>
                          <p className="text-slate-500 text-[11px]">{q.doctorName} ({q.departmentName})</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.status === 'In Consultation' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Queue is currently clear.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PATIENTS */}
      {activeTab === 'patients' && (
        <PatientList
          onBookAppointment={() => setIsBookOpen(true)}
          onAdmitPatient={() => setIsAdmitOpen(true)}
          onCreateBill={() => {}}
        />
      )}

      {/* TAB: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <AppointmentList onIssueQueueToken={() => setIsTokenOpen(true)} />
      )}

      {/* TAB: QUEUE */}
      {activeTab === 'queue' && <QueueBoard />}

      {/* TAB: ADMISSIONS */}
      {activeTab === 'admissions' && <AdmissionList />}

      {/* Modals */}
      <PatientModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <BookAppointmentModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <GenerateTokenModal isOpen={isTokenOpen} onClose={() => setIsTokenOpen(false)} />
      <NewAdmissionModal isOpen={isAdmitOpen} onClose={() => setIsAdmitOpen(false)} />
    </div>
  );
};
