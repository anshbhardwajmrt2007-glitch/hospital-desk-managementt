import React, { useState } from 'react';
import {
  Stethoscope,
  Building2,
  CalendarDays,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  BarChart2,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { StatCard } from '../common/StatCard';
import { Badge, getStatusBadgeVariant } from '../common/Badge';

export const ChiefDoctorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { doctors, departments, appointments, clinicalNotes, patients } = useHospital();

  const [activeTab, setActiveTab] = useState<'overview' | 'workload' | 'performance' | 'delays'>('overview');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const completedToday = todayAppointments.filter(a => a.status === 'Completed').length;
  const delayedOrWaiting = todayAppointments.filter(a => a.status === 'Checked In' || a.status === 'In Progress').length;
  const availableDoctors = doctors.filter(d => d.status === 'Available');

  const overallCompletionRate = Math.round(
    (completedToday / (todayAppointments.length || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Chief Doctor Header Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-hospital-500/30 text-hospital-300 border border-hospital-400/30">
              Chief Medical Officer (CMO) Console
            </span>
            <span className="text-xs text-slate-400">• Clinical Governance & Quality</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Clinical Operations & Medical Board
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitor hospital-wide clinical throughput, doctor availability, department workload distribution, and consultation completion rates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">OPD Completion</span>
            <p className="text-sm font-bold text-white font-mono">{overallCompletionRate}% Rate</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Medical Faculty"
          value={`${availableDoctors.length} / ${doctors.length}`}
          subtitle="Specialists currently on duty"
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Today's Caseload"
          value={todayAppointments.length}
          subtitle="Total clinic bookings"
          icon={CalendarDays}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
        />
        <StatCard
          title="Consultations in Progress / Waiting"
          value={delayedOrWaiting}
          subtitle="Active in OPD lounges"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Clinical Records Filed"
          value={clinicalNotes.length}
          subtitle="Electronic notes & prescriptions"
          icon={FileText}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Department Clinical Overview' },
          { id: 'workload', label: `Doctor Workload & Duty (${doctors.length})` },
          { id: 'delays', label: `Consultation Queue Monitor (${delayedOrWaiting})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-hospital-600 text-hospital-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: DEPARTMENT OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => {
            const deptDocs = doctors.filter(d => d.departmentId === dept.id || d.departmentName === dept.name);
            const deptAptsToday = appointments.filter(a => a.departmentName === dept.name && a.date === todayStr);
            const completed = deptAptsToday.filter(a => a.status === 'Completed').length;

            return (
              <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-hospital-700 font-medium">HOD: {dept.headOfDepartment}</p>
                  </div>
                  <Badge variant={dept.active ? 'success' : 'neutral'} size="sm">
                    {dept.roomFloor.split(',')[0]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Doctors</span>
                    <p className="font-bold text-slate-900 mt-0.5">{deptDocs.length} Specialists</p>
                  </div>
                  <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-hospital-700 font-bold uppercase">Today's Visits</span>
                    <p className="font-bold text-hospital-900 mt-0.5">{deptAptsToday.length} Patients</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <span>Completed: <strong className="text-emerald-700">{completed}</strong></span>
                  <span>Pending: <strong className="text-amber-700">{deptAptsToday.length - completed}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: WORKLOAD */}
      {activeTab === 'workload' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Doctor Clinical Workload & Attendance Monitor</h3>
            <p className="text-xs text-slate-400">Real-time duty status, scheduled consultations, and completed patient count.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">OPD Room</th>
                  <th className="py-3 px-4 text-center">Duty Status</th>
                  <th className="py-3 px-4 text-center">Today's Patients</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map(d => {
                  const docApts = appointments.filter(a => a.doctorId === d.id && a.date === todayStr);
                  const docDone = docApts.filter(a => a.status === 'Completed').length;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {d.name}
                        <span className="text-[10px] text-slate-400 block font-normal">{d.qualification}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{d.specialization}</td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{d.departmentName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 whitespace-nowrap">{d.opdRoom}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(d.status)} dot>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono whitespace-nowrap">
                        {docApts.length}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700 font-mono whitespace-nowrap">
                        {docDone}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        ₹{d.consultationFee}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: QUEUE & DELAYS */}
      {activeTab === 'delays' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Consultations & Lounge Wait Monitor</h3>
              <p className="text-xs text-slate-400">Patients currently checked-in at desk awaiting doctor consultation.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
              {delayedOrWaiting} Waiting / In Progress
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.filter(a => a.status === 'Checked In' || a.status === 'In Progress').map(a => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.patientName}</span>
                    <span className="font-mono text-hospital-600 font-semibold">{a.timeSlot}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Attending: <strong>{a.doctorName}</strong> ({a.departmentName}) • Reason: {a.reason}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(a.status)} dot>
                  {a.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
