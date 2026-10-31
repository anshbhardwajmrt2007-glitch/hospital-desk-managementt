import React, { useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  ReceiptText,
  User,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Printer,
  ShieldCheck,
  AlertCircle,
  HeartPulse,
  Phone,
  MapPin,
  KeyRound,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { Appointment, Bill, Doctor } from '../../types';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { Modal } from '../common/Modal';
import { InvoicePrintView } from '../modules/billing/InvoicePrintView';

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM'
];

export const PatientDashboard: React.FC = () => {
  const { currentUser, changePassword } = useAuth();
  const {
    patients,
    appointments,
    bills,
    doctors,
    departments,
    bookAppointment,
    updateAppointmentStatus,
    updatePatient,
    notifications,
    settings
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'appointments' | 'bills' | 'profile' | 'notifications'>('overview');

  // Booking Form State
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentSlot, setAppointmentSlot] = useState('10:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [bookingMessage, setBookingMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Profile Edit State
  const patientRecord = patients.find(p => p.id === currentUser?.patientId || p.userId === currentUser?.id);
  const [editPhone, setEditPhone] = useState(patientRecord?.phone || '');
  const [editAddress, setEditAddress] = useState(patientRecord?.address || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Print Invoice State
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Bill | null>(null);

  // Patient's own records (STRICT RLS filter enforced by Context / DB)
  const myAppointments = appointments.filter(a => a.patientId === currentUser?.patientId);
  const myBills = bills.filter(b => b.patientId === currentUser?.patientId);
  const myNotifications = notifications.filter(n => n.targetPatientId === currentUser?.patientId || n.targetUserId === currentUser?.id);

  const upcomingAppointments = myAppointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked In');
  const pastAppointments = myAppointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
  const pendingBills = myBills.filter(b => b.outstandingBalance > 0);
  const totalOutstanding = pendingBills.reduce((sum, b) => sum + b.outstandingBalance, 0);

  // Filter doctors by selected department
  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId)
    : doctors;

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || filteredDoctors[0];

  // Booked slots check
  const bookedSlots = appointments
    .filter(a => a.doctorId === currentDoctor?.id && a.date === appointmentDate && a.status !== 'Cancelled')
    .map(a => a.timeSlot);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMessage(null);

    if (!patientRecord) {
      setBookingMessage({ text: 'Patient profile record not located.', isError: true });
      return;
    }
    if (!currentDoctor) {
      setBookingMessage({ text: 'Please select a consulting doctor.', isError: true });
      return;
    }
    if (!appointmentReason.trim()) {
      setBookingMessage({ text: 'Please enter reason for visit or primary symptoms.', isError: true });
      return;
    }

    const res = bookAppointment({
      patientId: patientRecord.id,
      patientName: patientRecord.name,
      patientPhone: patientRecord.phone,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      departmentName: currentDoctor.departmentName,
      date: appointmentDate,
      timeSlot: appointmentSlot,
      reason: appointmentReason.trim(),
      status: 'Scheduled',
      fee: currentDoctor.consultationFee,
      bookedBy: 'PATIENT'
    });

    if (!res.success) {
      setBookingMessage({ text: res.message, isError: true });
    } else {
      setBookingMessage({
        text: `Appointment confirmed! Reference: ${res.appointment?.referenceNumber}`,
        isError: false
      });
      setAppointmentReason('');
      setTimeout(() => setActiveTab('appointments'), 1500);
    }
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatus(id, 'Cancelled');
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientRecord) return;
    updatePatient(patientRecord.id, {
      phone: editPhone.trim(),
      address: editAddress.trim()
    });
    setProfileSuccess('Profile contact information updated.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    setPasswordMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Profile Welcome Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Verified Patient Portal
              </span>
              <span className="text-xs text-slate-400">• MediDesk Health ID: <strong className="text-white font-mono">{patientRecord?.id || currentUser?.patientId}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hello, {currentUser?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Welcome to your personal health portal. Review consultation schedules, book specialist visits, and manage hospital invoices.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('book')}
            className="flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-hospital-950/40"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: HeartPulse },
          { id: 'book', label: 'Book Appointment', icon: CalendarPlus },
          { id: 'appointments', label: `My Appointments (${myAppointments.length})`, icon: CalendarDays },
          { id: 'bills', label: `My Invoices (${myBills.length})`, icon: ReceiptText },
          { id: 'profile', label: 'My Health Profile', icon: User },
          { id: 'notifications', label: `Notifications (${myNotifications.length})`, icon: Bell },
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Patient File ID</span>
              <p className="text-xl font-mono font-bold text-hospital-700 mt-1">{patientRecord?.id}</p>
              <span className="text-xs text-slate-500 mt-1 block">Blood Group: <strong>{patientRecord?.bloodGroup}</strong></span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Upcoming Visits</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{upcomingAppointments.length} Bookings</p>
              <span className="text-xs text-slate-500 mt-1 block">Next consultation active</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Past Consultations</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{pastAppointments.length} Completed</p>
              <span className="text-xs text-slate-500 mt-1 block">Records safely archived</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pending Dues</span>
              <p className="text-xl font-mono font-bold text-rose-600 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
              <span className="text-xs text-slate-500 mt-1 block">{pendingBills.length} unpaid bill(s)</span>
            </div>
          </div>

          {/* Next Upcoming Appointment Card */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-gradient-to-r from-hospital-50 to-sky-50 p-5 rounded-2xl border border-hospital-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-hospital-700 tracking-wider">Next Scheduled Consultation</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {upcomingAppointments[0].doctorName} ({upcomingAppointments[0].departmentName})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Date: <strong className="text-slate-800">{upcomingAppointments[0].date}</strong> at <strong className="text-hospital-700">{upcomingAppointments[0].timeSlot}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">Reason: "{upcomingAppointments[0].reason}"</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(upcomingAppointments[0].status)} dot>
                  {upcomingAppointments[0].status}
                </Badge>
                <button
                  onClick={() => handleCancelAppointment(upcomingAppointments[0].id)}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold bg-white border border-rose-200 rounded-lg"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          )}

          {/* Recent Invoices Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Your Recent Hospital Invoices</h3>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs font-semibold text-hospital-600 hover:underline"
              >
                View All Invoices →
              </button>
            </div>

            {myBills.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myBills.slice(0, 3).map(b => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{b.id}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({b.invoiceDate})</span>
                      <p className="text-slate-500 mt-0.5">{b.items.map(i => i.description).slice(0, 2).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">₹{b.grandTotal.toLocaleString('en-IN')}</span>
                      <Badge variant={getStatusBadgeVariant(b.paymentStatus)} dot>
                        {b.paymentStatus}
                      </Badge>
                      <button
                        onClick={() => setSelectedInvoiceToPrint(b)}
                        className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-slate-100 rounded-lg"
                        title="Print / View Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No invoices generated on your account yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOK APPOINTMENT */}
      {activeTab === 'book' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Specialist Consultation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your clinical department, preferred consulting specialist, and choose an available OPD slot.
            </p>
          </div>

          {bookingMessage && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                bookingMessage.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {bookingMessage.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              <span>{bookingMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Medical Department
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  const docs = doctors.filter(d => d.departmentId === e.target.value);
                  if (docs.length > 0) setSelectedDoctorId(docs[0].id);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-hospital-200"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.roomFloor})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Consulting Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-hospital-200"
              >
                {filteredDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} (Fee: ₹{d.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            {currentDoctor && (
              <div className="p-3 bg-hospital-50/70 border border-hospital-200/60 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-hospital-900">{currentDoctor.name}</p>
                  <p className="text-hospital-700">{currentDoctor.qualification} • Room {currentDoctor.opdRoom}</p>
                  <p className="text-[11px] text-slate-500">Days: {currentDoctor.availableDays.join(', ')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</span>
                  <p className="text-base font-extrabold text-hospital-700 font-mono">₹{currentDoctor.consultationFee}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Time Slot
                </label>
                <select
                  value={appointmentSlot}
                  onChange={(e) => setAppointmentSlot(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-hospital-200"
                >
                  {TIME_SLOTS.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <option key={slot} value={slot} disabled={isBooked}>
                        {slot} {isBooked ? '❌ (Booked)' : '✓ (Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit / Symptoms
              </label>
              <textarea
                rows={3}
                required
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                placeholder="Describe your symptoms or reason for consulting the doctor..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Confirm Appointment & Generate Reference
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MY APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Appointment History & Active Bookings</h3>
              <p className="text-xs text-slate-400">Total bookings on your account: {myAppointments.length}</p>
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700"
            >
              + Book Another
            </button>
          </div>

          {myAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Visit Reason</th>
                    <th className="py-3 px-4">Fee (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">
                        {apt.referenceNumber || apt.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {apt.doctorName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {apt.departmentName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{apt.date}</span>
                        <span className="text-hospital-600 font-bold font-mono text-[11px]">{apt.timeSlot}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={apt.reason}>
                        {apt.reason}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        ₹{apt.fee}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(apt.status)} dot>
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {apt.status === 'Scheduled' ? (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No appointments found. Click "+ Book Another" to schedule your first visit.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY BILLS */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Hospital Invoices & Statements</h3>
              <p className="text-xs text-slate-400">Secure view of charges itemized for your account only.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Balance Due</span>
              <p className="text-sm font-mono font-bold text-rose-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {myBills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Services Rendered</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4 text-right">Paid (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {bill.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {bill.invoiceDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {bill.items.map(i => i.description).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ₹{bill.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        ₹{bill.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                        ₹{bill.outstandingBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(bill.paymentStatus)} dot>
                          {bill.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoiceToPrint(bill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-hospital-600 hover:text-hospital-700 bg-hospital-50 hover:bg-hospital-100 rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hospital invoices have been generated for your account.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MY PROFILE & PASSWORD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Permitted Contact Info Edit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Personal & Contact Information
            </h3>

            {profileSuccess && (
              <p className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                {profileSuccess}
              </p>
            )}

            <form onSubmit={handleProfileSave} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold">Full Legal Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{patientRecord?.name}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Date of Birth & Age:</span>
                <p className="text-slate-700 mt-0.5">{patientRecord?.dob} ({patientRecord?.age} Years, {patientRecord?.gender})</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Registered Blood Group:</span>
                <p className="font-bold text-rose-600 mt-0.5">{patientRecord?.bloodGroup}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Known Drug Allergies:</span>
                <p className="text-slate-700 mt-0.5">{patientRecord?.allergies || 'None'}</p>
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (Permitted to Edit)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Residential Address (Permitted to Edit)
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Permitted Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-hospital-600" />
              <span>Change Portal Password</span>
            </h3>

            {passwordMsg && (
              <p
                className={`p-2.5 rounded-xl text-xs font-semibold ${
                  passwordMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {passwordMsg.text}
              </p>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 max-w-3xl mx-auto space-y-3">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Appointment Confirmations & Billing Notices
          </h3>

          {myNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myNotifications.map(n => (
                <div key={n.id} className="py-3 flex items-start gap-3">
                  <div className="p-2 bg-sky-50 rounded-xl text-hospital-600 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No new notifications for your account.
            </div>
          )}
        </div>
      )}

      {/* Printable Invoice PDF Modal */}
      <InvoicePrintView
        isOpen={Boolean(selectedInvoiceToPrint)}
        onClose={() => setSelectedInvoiceToPrint(null)}
        bill={selectedInvoiceToPrint}
      />
    </div>
  );
};
