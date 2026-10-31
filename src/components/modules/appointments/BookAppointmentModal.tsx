import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useHospital } from '../../../context/HospitalContext';
import { Calendar, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
  preselectedDoctorId?: string;
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
  '05:00 PM',
  '05:30 PM'
];

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
  preselectedDoctorId
}) => {
  const { patients, doctors, departments, appointments, bookAppointment } = useHospital();

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [doctorId, setDoctorId] = useState(preselectedDoctorId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle preselects
  useEffect(() => {
    if (preselectedPatientId) setPatientId(preselectedPatientId);
    if (preselectedDoctorId) {
      setDoctorId(preselectedDoctorId);
      const doc = doctors.find(d => d.id === preselectedDoctorId);
      if (doc) setSelectedDeptId(doc.departmentId);
    } else if (doctors.length > 0) {
      setDoctorId(doctors[0].id);
      setSelectedDeptId(doctors[0].departmentId);
    }
    if (patients.length > 0 && !preselectedPatientId) {
      setPatientId(patients[0].id);
    }
    setErrorMessage('');
  }, [preselectedPatientId, preselectedDoctorId, isOpen, doctors, patients]);

  // Doctors filtered by selected department
  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId)
    : doctors;

  // Selected doctor info
  const selectedDoctor = doctors.find(d => d.id === doctorId);
  const selectedPatient = patients.find(p => p.id === patientId);

  // When department changes, pick first doctor in that dept
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const docsInDept = doctors.filter(d => d.departmentId === deptId);
    if (docsInDept.length > 0) {
      setDoctorId(docsInDept[0].id);
    } else {
      setDoctorId('');
    }
  };

  // Check which time slots are already booked for this doctor on the selected date
  const bookedSlots = appointments
    .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'Cancelled')
    .map(a => a.timeSlot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientId) {
      setErrorMessage('Please select a patient.');
      return;
    }
    if (!doctorId || !selectedDoctor) {
      setErrorMessage('Please select a consulting doctor.');
      return;
    }
    if (!date) {
      setErrorMessage('Please select an appointment date.');
      return;
    }
    if (!timeSlot) {
      setErrorMessage('Please select a time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please enter the visit reason or symptoms.');
      return;
    }

    const res = bookAppointment({
      patientId: selectedPatient!.id,
      patientName: selectedPatient!.name,
      patientPhone: selectedPatient!.phone,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      departmentName: selectedDoctor.departmentName,
      date,
      timeSlot,
      reason: reason.trim(),
      status: 'Scheduled',
      fee: selectedDoctor.consultationFee,
      bookedBy: 'DESK_ADMIN'
    });

    if (!res.success) {
      setErrorMessage(res.message);
      return;
    }

    onClose();
    setReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle="Schedule OPD consultation with automatic conflict verification and fee calculation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold">Booking Warning: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* 1. Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Registered Patient <span className="text-rose-500">*</span>
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) — {p.phone} • {p.gender}, {p.age}y
              </option>
            ))}
          </select>
        </div>

        {/* 2. Department & Doctor Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consulting Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white font-medium"
            >
              {filteredDoctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.opdRoom} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Summary banner */}
        {selectedDoctor && (
          <div className="p-3 bg-hospital-50/70 border border-hospital-200/60 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-hospital-900">{selectedDoctor.name}</p>
              <p className="text-hospital-700">{selectedDoctor.qualification} • {selectedDoctor.opdRoom}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Available: {selectedDoctor.availableHours}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500">OPD Consultation Fee</span>
              <p className="text-base font-extrabold text-hospital-700">₹{selectedDoctor.consultationFee}</p>
            </div>
          </div>
        )}

        {/* 3. Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Appointment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Slot <span className="text-rose-500">*</span>
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              {TIME_SLOTS.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <option key={slot} value={slot} disabled={isBooked}>
                    {slot} {isBooked ? '❌ (Already Booked)' : '✓ (Available)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 4. Reason for visit */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Visit / Primary Symptoms <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Follow-up after blood test, severe migraine, joint pain evaluation..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 resize-none"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            Confirm & Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
};
