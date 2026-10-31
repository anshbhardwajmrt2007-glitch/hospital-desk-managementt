import React, { useMemo } from 'react';
import {
  Users,
  CalendarDays,
  UserCheck,
  ListOrdered,
  BedDouble,
  Receipt,
  UserPlus,
  CalendarPlus,
  Ticket,
  FilePlus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewPatientModal: () => void;
  onOpenBookAppointmentModal: () => void;
  onOpenQueueTokenModal: () => void;
  onOpenCreateBillModal: () => void;
}

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenNewPatientModal,
  onOpenBookAppointmentModal,
  onOpenQueueTokenModal,
  onOpenCreateBillModal
}) => {
  const { patients, appointments, doctors, queue, admissions, bills, departments, settings } = useHospital();
  const { currentUser } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  // Live KPI Calculations
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
  const availableDoctors = doctors.filter(d => d.status === 'Available');
  const waitingInQueue = queue.filter(q => q.status === 'Waiting');
  const activeAdmissions = admissions.filter(a => a.status === 'Admitted');
  
  // Today's collected payments
  const todayCollected = bills.reduce((sum, b) => {
    const todayPayments = b.payments.filter(p => p.date.startsWith(todayStr));
    const paidToday = todayPayments.reduce((pSum, p) => pSum + p.amount, 0);
    return sum + paidToday;
  }, 0);

  // Department distribution for Donut Chart
  const deptData = useMemo(() => {
    return departments.map(d => ({
      name: d.name.replace(' & Obstetrics', ''),
      value: appointments.filter(a => a.departmentName === d.name).length || 1
    }));
  }, [departments, appointments]);

  // Weekly Trend Chart Data
  const weeklyTrends = [
    { day: 'Mon', appointments: 14, registrations: 3 },
    { day: 'Tue', appointments: 19, registrations: 5 },
    { day: 'Wed', appointments: 16, registrations: 4 },
    { day: 'Thu', appointments: 22, registrations: 6 },
    { day: 'Fri', appointments: 25, registrations: 8 },
    { day: 'Sat', appointments: 18, registrations: 4 },
    { day: 'Sun', appointments: 9, registrations: 2 },
  ];

  // Currently called token in queue
  const currentCalledToken = queue.find(q => q.status === 'In Consultation');

  // Recent 5 patients
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 5);

  // Upcoming / Today's appointments (next 5)
  const upcomingAppointments = appointments
    .filter(a => a.date >= todayStr && a.status !== 'Cancelled')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-hospital-500/15 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-hospital-500/30 text-hospital-300 border border-hospital-400/30">
                Hospital Desk Active Shift
              </span>
              <span className="text-xs text-slate-400">• {settings.workingHours}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {currentUser?.fullName || currentUser?.name || 'Reception Staff'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Reception desk console for <strong className="text-white">{settings.hospitalName}</strong>. 
              Review today's appointments, summon next queue tokens, and manage inpatient admissions.
            </p>
          </div>

          {/* Quick Desk Action Launchers */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenNewPatientModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-hospital-950/40"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Patient</span>
            </button>
            <button
              onClick={onOpenBookAppointmentModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-sm"
            >
              <CalendarPlus className="w-4 h-4 text-hospital-400" />
              <span>+ Appointment</span>
            </button>
            <button
              onClick={onOpenQueueTokenModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Ticket className="w-4 h-4" />
              <span>+ Token</span>
            </button>
            <button
              onClick={onOpenCreateBillModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              <span>+ Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Registered in system"
          icon={Users}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
          onClick={() => onNavigateTab('patients')}
        />

        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${appointments.length} total active records`}
          icon={CalendarDays}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => onNavigateTab('appointments')}
        />

        <StatCard
          title="Doctors On Duty"
          value={availableDoctors.length}
          subtitle={`Out of ${doctors.length} faculty`}
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => onNavigateTab('doctors')}
        />

        <StatCard
          title="Patients in Queue"
          value={waitingInQueue.length}
          subtitle="Waiting in OPD lounge"
          icon={ListOrdered}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => onNavigateTab('queue')}
        />

        <StatCard
          title="Inpatient Admissions"
          value={activeAdmissions.length}
          subtitle="Currently occupied beds"
          icon={BedDouble}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => onNavigateTab('admissions')}
        />

        <StatCard
          title="Today's Payments"
          value={`₹${todayCollected.toLocaleString('en-IN')}`}
          subtitle="Simulated collections"
          icon={Receipt}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          onClick={() => onNavigateTab('billing')}
        />
      </div>

      {/* Live Queue Banner Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 flex-shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Called Token:</span>
              <span className="font-mono font-black text-sm px-2 py-0.5 rounded-md bg-slate-900 text-white">
                {currentCalledToken ? currentCalledToken.tokenDisplay : 'NONE'}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentCalledToken ? (
                <>
                  <strong className="text-slate-900">{currentCalledToken.patientName}</strong> with {currentCalledToken.doctorName} ({currentCalledToken.departmentName})
                </>
              ) : (
                'No consultation actively in progress. Doctors waiting for next patient.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('queue')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-hospital-600 hover:text-hospital-700 whitespace-nowrap"
        >
          <span>Open Full Queue Display</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Activity Trends */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Traffic & Appointments Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily consultations vs new patient registrations</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
            >
              Detailed Reports →
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="appointments" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorApt)" name="OPD Appointments" />
                <Area type="monotone" dataKey="registrations" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" name="New Registrations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Volume Share Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Department Caseload</h3>
              <button
                onClick={() => onNavigateTab('departments')}
                className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
              >
                All ({departments.length}) →
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">Distribution across clinical specialties</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-d-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} consultations`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] justify-center text-slate-600">
            {departments.slice(0, 4).map((d, i) => (
              <span key={d.id} className="flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span>{d.name.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's & Upcoming Consultations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Clinic Consultations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Checked-in & scheduled patients</p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
            >
              View All ({appointments.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingAppointments.map(apt => (
              <div key={apt.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 rounded-lg px-1 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{apt.patientName}</span>
                    <span className="font-mono font-bold text-hospital-600 text-[11px]">{apt.timeSlot}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {apt.doctorName} • <span className="text-slate-700">{apt.departmentName}</span>
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(apt.status)} size="sm" dot>
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Registered Patients */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Patient Registrations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest electronic intake records</p>
            </div>
            <button
              onClick={() => onNavigateTab('patients')}
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700"
            >
              Directory ({patients.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPatients.map(p => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 rounded-lg px-1 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-hospital-50 border border-hospital-200 text-hospital-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="font-mono text-hospital-600 text-[10px]">({p.id})</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {p.gender}, {p.age}y • Blood: <span className="font-bold text-rose-600">{p.bloodGroup}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(p.registrationDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
