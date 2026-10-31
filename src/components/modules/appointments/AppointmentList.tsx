import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { Appointment, AppointmentStatus } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { BookAppointmentModal } from './BookAppointmentModal';
import { AppointmentCalendarView } from './AppointmentCalendarView';

interface AppointmentListProps {
  onIssueQueueToken: (patientId: string) => void;
}

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

export const AppointmentList: React.FC<AppointmentListProps> = ({ onIssueQueueToken }) => {
  const {
    appointments,
    doctors,
    departments,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment
  } = useHospital();

  const todayStr = new Date().toISOString().split('T')[0];

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [calendarDate, setCalendarDate] = useState(todayStr);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(todayStr);
  const [newRescheduleTime, setNewRescheduleTime] = useState('10:00 AM');
  const [rescheduleError, setRescheduleError] = useState('');

  const [cancelTargetApt, setCancelTargetApt] = useState<Appointment | null>(null);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch =
        a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.patientPhone.includes(searchQuery);

      const matchesDoctor = selectedDoctorId === 'all' || a.doctorId === selectedDoctorId;
      const matchesDept = selectedDept === 'all' || a.departmentName === selectedDept;
      const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = a.date === todayStr;
      } else if (dateFilter === 'upcoming') {
        matchesDate = a.date >= todayStr;
      } else if (dateFilter === 'past') {
        matchesDate = a.date < todayStr;
      }

      return matchesSearch && matchesDoctor && matchesDept && matchesStatus && matchesDate;
    }).sort((a, b) => {
      // Sort by date then timeSlot
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [appointments, searchQuery, selectedDoctorId, selectedDept, selectedStatus, dateFilter, todayStr]);

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setNewRescheduleDate(apt.date);
    setNewRescheduleTime(apt.timeSlot);
    setRescheduleError('');
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;

    const res = rescheduleAppointment(rescheduleApt.id, newRescheduleDate, newRescheduleTime);
    if (!res.success) {
      setRescheduleError(res.message);
      return;
    }
    setRescheduleApt(null);
  };

  const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointments Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-hospital-100 text-hospital-800">
              {todayCount} Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate specialist outpatient clinic bookings, check-ins, and schedule conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Date Preset Pill Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'today', label: `Today (${todayStr})` },
          { id: 'upcoming', label: 'All Upcoming' },
          { id: 'past', label: 'Past Records' },
          { id: 'all', label: 'All History' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setDateFilter(filter.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === filter.id
                ? 'bg-hospital-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient, doctor, APT-id..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Checked In">Checked In</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content: Table or Calendar view */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">APT ID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Consulting Doctor</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Reason for Visit</th>
                    <th className="py-3 px-4">Fee (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">
                        {apt.id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
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
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'Scheduled' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg transition-colors shadow-xs"
                              title="Check in patient and issue queue token"
                            >
                              Check In
                            </button>
                          )}
                          {apt.status === 'Checked In' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleOpenReschedule(apt)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Reschedule appointment"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                            <button
                              onClick={() => setCancelTargetApt(apt)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No appointments found"
              description="No appointment records match the selected date and filters."
              actionLabel="Book Appointment"
              onAction={() => setIsBookModalOpen(true)}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Select Date for Schedule View:</span>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>
          <AppointmentCalendarView
            appointments={appointments}
            selectedDate={calendarDate}
            onUpdateStatus={updateAppointmentStatus}
            doctors={doctors}
          />
        </div>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <Modal
          isOpen={!!rescheduleApt}
          onClose={() => setRescheduleApt(null)}
          title={`Reschedule Appointment — ${rescheduleApt.id}`}
          subtitle={`Patient: ${rescheduleApt.patientName} with ${rescheduleApt.doctorName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            {rescheduleError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {rescheduleError}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Time Slot
              </label>
              <select
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 bg-white"
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleApt(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-hospital-600 rounded-xl hover:bg-hospital-700"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Appointment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTargetApt}
        onClose={() => setCancelTargetApt(null)}
        onConfirm={() => {
          if (cancelTargetApt) {
            cancelAppointment(cancelTargetApt.id, 'Patient or staff requested cancellation.');
            setCancelTargetApt(null);
          }
        }}
        title="Cancel Appointment Booking?"
        message={`Are you sure you want to cancel the booking for ${cancelTargetApt?.patientName} (${cancelTargetApt?.id}) with ${cancelTargetApt?.doctorName}? This time slot will become available for other patients.`}
        confirmLabel="Cancel Booking"
        isDestructive={true}
      />
    </div>
  );
};
