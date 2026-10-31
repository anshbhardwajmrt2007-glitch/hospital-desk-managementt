import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  UserPlus,
  Settings,
  BarChart3,
  CheckCircle2,
  Lock,
  History,
  TrendingUp,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { UserRole, StaffProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SettingsView } from '../modules/settings/SettingsView';
import { DepartmentDirectory } from '../modules/departments/DepartmentDirectory';
import { ReportsDashboard } from '../modules/reports/ReportsDashboard';

export const HospitalManagerDashboard: React.FC = () => {
  const { currentUser, provisionStaff } = useAuth();
  const {
    patients,
    doctors,
    departments,
    appointments,
    admissions,
    bills,
    staff,
    auditLogs
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'audit' | 'departments' | 'reports' | 'settings'>('overview');

  // Staff Account Provisioning Modal
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('DESK_ADMIN');
  const [newStaffDeptId, setNewStaffDeptId] = useState(departments[0]?.id || '');
  const [newStaffDesignation, setNewStaffDesignation] = useState('');
  const [newStaffShift, setNewStaffShift] = useState('Morning Shift (08:00 AM - 04:00 PM)');
  const [newStaffPassword, setNewStaffPassword] = useState('staff123');
  const [provisionMsg, setProvisionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');

  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalStaff = staff.length;
  const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const activeAdmissions = admissions.filter(a => a.status === 'Admitted').length;

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionMsg(null);

    const res = await provisionStaff({
      email: newStaffEmail.trim(),
      fullName: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      role: newStaffRole,
      departmentId: newStaffDeptId,
      designation: newStaffDesignation.trim() || `${newStaffRole} Officer`,
      shift: newStaffShift,
      initialPassword: newStaffPassword
    });

    if (res.success) {
      setProvisionMsg({ text: res.message, isError: false });
      setTimeout(() => {
        setIsProvisionOpen(false);
        setNewStaffEmail('');
        setNewStaffName('');
        setNewStaffPhone('');
        setNewStaffDesignation('');
      }, 1500);
    } else {
      setProvisionMsg({ text: res.message, isError: true });
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesRole = auditRoleFilter === 'all' || log.userRole === auditRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Executive Administration Console
            </span>
            <span className="text-xs text-slate-400">• General Manager: {currentUser?.fullName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hospital Operations & Staff Governance
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Hospital-wide operational surveillance, staff account provisioning, security audit trails, and clinical wing configurations.
          </p>
        </div>

        <button
          onClick={() => setIsProvisionOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Staff Account</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Hospital Patients"
          value={totalPatients}
          subtitle="Electronic records"
          icon={Users}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
        />
        <StatCard
          title="Clinical Specialists"
          value={totalDoctors}
          subtitle="Registered physicians"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Authorized Staff"
          value={totalStaff}
          subtitle="Multi-role personnel"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Admissions"
          value={activeAdmissions}
          subtitle="Occupied inpatient beds"
          icon={Building}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Gross Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Realized collections"
          icon={TrendingUp}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Operations Overview' },
          { id: 'staff', label: `Staff Provisioning & Roles (${staff.length})` },
          { id: 'audit', label: `Security Audit Trail (${auditLogs.length})` },
          { id: 'departments', label: 'Clinical Wings' },
          { id: 'reports', label: 'Executive Analytics' },
          { id: 'settings', label: 'Hospital Settings' },
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

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Staff by Role Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Staff Distribution by Role Clearance</h3>
              <div className="space-y-2 text-xs">
                {[
                  { role: 'DESK_ADMIN', label: 'Desk Administrators', count: staff.filter(s => s.role === 'DESK_ADMIN').length },
                  { role: 'CHIEF_DOCTOR', label: 'Chief Medical Officers', count: staff.filter(s => s.role === 'CHIEF_DOCTOR').length || 1 },
                  { role: 'DOCTOR', label: 'Consulting Doctors', count: doctors.length },
                  { role: 'BILLING_HEAD', label: 'Billing & Cashier Officers', count: staff.filter(s => s.role === 'BILLING_HEAD').length },
                  { role: 'HEAD_NURSE', label: 'Nursing Supervisors', count: staff.filter(s => s.role === 'HEAD_NURSE').length },
                  { role: 'HOSPITAL_MANAGER', label: 'Hospital Managers', count: staff.filter(s => s.role === 'HOSPITAL_MANAGER').length },
                ].map(r => (
                  <div key={r.role} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">{r.label}</span>
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-xs bg-slate-100 text-slate-800">
                      {r.count} accounts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Audit Highlight */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Security & Clinical Audit Events</h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-hospital-600 font-semibold hover:underline"
                >
                  Full Log ({auditLogs.length}) →
                </button>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{log.action}</span>
                      <span className="text-slate-400 text-[10px]">{log.timestamp.split('T')[1].substring(0, 5)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">By: {log.userEmail} ({log.userRole})</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Staff Account Provisioning Directory</h3>
              <p className="text-xs text-slate-400">Manage employee accounts and provision new staff role clearances.</p>
            </div>
            <button
              onClick={() => setIsProvisionOpen(true)}
              className="px-3.5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Provision Staff
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Employee Code</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Role Clearance</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">{s.employeeCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{s.fullName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{s.designation}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{s.departmentName}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{s.email}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{s.shift}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Security & Clinical Audit Log</h3>
              <p className="text-xs text-slate-400">Immutable ledger of clinical entries, billing operations, and user credential events.</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search action or email..."
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
              <select
                value={auditRoleFilter}
                onChange={(e) => setAuditRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="all">All Roles</option>
                <option value="PATIENT">PATIENT</option>
                <option value="DESK_ADMIN">DESK_ADMIN</option>
                <option value="CHIEF_DOCTOR">CHIEF_DOCTOR</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="BILLING_HEAD">BILLING_HEAD</option>
                <option value="HEAD_NURSE">HEAD_NURSE</option>
                <option value="HOSPITAL_MANAGER">HOSPITAL_MANAGER</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">{log.id}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">{log.userEmail}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{log.resourceType}: {log.resourceId}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <DepartmentDirectory
          onSelectDepartmentForDoctors={() => {}}
          onSelectDepartmentForAppointments={() => {}}
        />
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && <ReportsDashboard />}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && <SettingsView />}

      {/* MODAL: PROVISION STAFF ACCOUNT */}
      <Modal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        title="Provision Authorized Staff Account"
        subtitle="Create an employee credential and assign hospital role clearance."
        maxWidth="2xl"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
          {provisionMsg && (
            <div
              className={`p-3 rounded-xl font-semibold flex items-center gap-2 ${
                provisionMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {provisionMsg.isError ? <ShieldAlert className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              <span>{provisionMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="e.g. Dr. Kavita Iyer"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="staff@medidesk.org"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Clearance <span className="text-rose-500">*</span></label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-900"
              >
                <option value="DESK_ADMIN">DESK_ADMIN (Reception & Front Desk)</option>
                <option value="CHIEF_DOCTOR">CHIEF_DOCTOR (Medical Director / HOD)</option>
                <option value="DOCTOR">DOCTOR (Consulting Specialist)</option>
                <option value="BILLING_HEAD">BILLING_HEAD (Accounts & Cashier)</option>
                <option value="HEAD_NURSE">HEAD_NURSE (Ward & Nursing Lead)</option>
                <option value="HOSPITAL_MANAGER">HOSPITAL_MANAGER (Operations Executive)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newStaffDeptId}
                onChange={(e) => setNewStaffDeptId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
              <input
                type="text"
                value={newStaffDesignation}
                onChange={(e) => setNewStaffDesignation(e.target.value)}
                placeholder="e.g. Senior Medical Officer"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Initial Password (Hashed via PBKDF2)</label>
              <input
                type="password"
                required
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-xs"
            >
              Confirm Account Provisioning
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
