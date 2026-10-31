import React from 'react';
import {
  UserRound,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  CalendarPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { Doctor } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onBookAppointment: (doctorId: string) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onBookAppointment
}) => {
  const { appointments, toggleDoctorAvailability } = useHospital();

  if (!doctor) return null;

  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = doctorAppointments.filter(a => a.date === todayStr);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Doctor Profile — ${doctor.name}`}
      subtitle={`${doctor.qualification} • ${doctor.specialization}`}
      maxWidth="3xl"
    >
      {/* Top Banner */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-hospital-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                <Badge variant={getStatusBadgeVariant(doctor.status)} dot>
                  {doctor.status}
                </Badge>
              </div>
              <p className="text-xs text-hospital-700 font-semibold mt-0.5">
                {doctor.departmentName} • Room {doctor.opdRoom}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Fee: <strong className="text-slate-800">₹{doctor.consultationFee}</strong> • Hours: {doctor.availableHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleDoctorAvailability(doctor.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors shadow-xs flex items-center gap-1.5 ${
                doctor.status === 'Available'
                  ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              {doctor.status === 'Available' ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark On Leave</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Available</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                onBookAppointment(doctor.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Available Days */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Weekly OPD Schedule
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {doctor.availableDays.map(day => (
            <span
              key={day}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60"
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Scheduled Appointments Today */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Today's Consultations ({todayAppointments.length})
          </h4>
          <span className="text-xs text-slate-400">Total All-time: {doctorAppointments.length}</span>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {todayAppointments.map(a => (
              <div key={a.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-hospital-600">{a.timeSlot}</span>
                    <span className="font-semibold text-slate-800">{a.patientName}</span>
                    <span className="text-slate-400">({a.patientPhone})</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{a.reason}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(a.status)} dot>
                  {a.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No consultations scheduled for today.
          </div>
        )}
      </div>
    </Modal>
  );
};
