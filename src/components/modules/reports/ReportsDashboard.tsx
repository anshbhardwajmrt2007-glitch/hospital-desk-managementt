import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  ShieldAlert,
  DollarSign,
  Users,
  CalendarCheck,
  BedDouble
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { StatCard } from '../../common/StatCard';

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];

export const ReportsDashboard: React.FC = () => {
  const { patients, appointments, admissions, bills, departments } = useHospital();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Key metrics
  const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalBilled = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalRegistrations = patients.length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled').length;
  const activeAdmissions = admissions.filter(a => a.status === 'Admitted').length;

  const completionRate = Math.round(
    (completedAppointments / (completedAppointments + cancelledAppointments || 1)) * 100
  );

  // Department Distribution data for Donut Chart
  const departmentChartData = useMemo(() => {
    return departments.map(d => {
      const count = appointments.filter(a => a.departmentName === d.name).length;
      return {
        name: d.name.replace(' & Obstetrics', ''),
        value: count || 1
      };
    });
  }, [departments, appointments]);

  // Appointment Status Breakdown for Bar Chart
  const appointmentStatusData = useMemo(() => {
    return [
      { name: 'Completed', count: appointments.filter(a => a.status === 'Completed').length, fill: '#10b981' },
      { name: 'Scheduled', count: appointments.filter(a => a.status === 'Scheduled').length, fill: '#0ea5e9' },
      { name: 'Checked In', count: appointments.filter(a => a.status === 'Checked In').length, fill: '#6366f1' },
      { name: 'Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length, fill: '#f43f5e' },
    ];
  }, [appointments]);

  // Revenue & Billing Trend sample data
  const revenueTrendData = [
    { day: 'Mon', billed: 12500, collected: 11000 },
    { day: 'Tue', billed: 18400, collected: 16500 },
    { day: 'Wed', billed: 22100, collected: 19800 },
    { day: 'Thu', billed: 17300, collected: 15400 },
    { day: 'Fri', billed: 24800, collected: 21900 },
    { day: 'Sat', billed: 31200, collected: 28500 },
    { day: 'Sun', billed: 14000, collected: 12800 },
  ];

  // Gender Demographics data
  const genderData = useMemo(() => {
    const males = patients.filter(p => p.gender === 'Male').length;
    const females = patients.filter(p => p.gender === 'Female').length;
    const others = patients.filter(p => p.gender === 'Other').length;
    return [
      { name: 'Female Patients', value: females, color: '#ec4899' },
      { name: 'Male Patients', value: males, color: '#0284c7' },
      { name: 'Other', value: others, color: '#8b5cf6' },
    ];
  }, [patients]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Hospital Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational intelligence, clinical volumes, appointment completion metrics, and revenue collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === r.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Demo Disclaimer Banner */}
      <div className="p-3 bg-hospital-50/70 border border-hospital-200 rounded-2xl flex items-center gap-2.5 text-xs text-hospital-800">
        <ShieldAlert className="w-4 h-4 text-hospital-600 flex-shrink-0" />
        <span>
          <strong>Demonstration Analytics:</strong> Figures reflect actual client-side records persisted in this demo session.
        </span>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`₹${totalBilled.toLocaleString('en-IN')} total invoiced`}
          trend={{ value: '14.2%', isPositive: true }}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Total Patient Registrations"
          value={totalRegistrations}
          subtitle="Electronic health profiles active"
          trend={{ value: '8.5%', isPositive: true }}
          icon={Users}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
        />

        <StatCard
          title="Consultation Completion"
          value={`${completionRate}%`}
          subtitle={`${completedAppointments} completed vs ${cancelledAppointments} cancelled`}
          icon={CalendarCheck}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatCard
          title="Active Inpatient Admissions"
          value={activeAdmissions}
          subtitle="Currently occupied ward/ICU beds"
          icon={BedDouble}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Revenue & Invoicing Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Revenue & Invoicing Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Billed charges vs Realized collections (₹)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Weekly Flow
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="billed" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" name="Invoiced (₹)" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" name="Collected (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Appointment Completion vs Cancellation</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of patient appointments by workflow status</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Appointments" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Department Distribution & Gender Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Volume Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department-wise Patient Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of clinic consultations by specialty</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} consultations`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Demographics Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Patient Gender Demographics</h3>
          <p className="text-xs text-slate-400 mb-4">Registered patient community distribution</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-g-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} patients`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
