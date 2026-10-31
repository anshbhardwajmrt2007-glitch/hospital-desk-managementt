import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useHospital } from '../../../context/HospitalContext';
import { Ticket, Clock, AlertCircle } from 'lucide-react';

interface GenerateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

export const GenerateTokenModal: React.FC<GenerateTokenModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId
}) => {
  const { patients, doctors, appointments, queue, generateQueueToken, settings } = useHospital();

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    if (doctors.length > 0) {
      setDoctorId(doctors[0].id);
    }
  }, [preselectedPatientId, isOpen, patients, doctors]);

  // When patient changes, see if they have an appointment today
  useEffect(() => {
    if (patientId) {
      const todayApt = appointments.find(
        a => a.patientId === patientId && a.date === todayStr && a.status !== 'Cancelled'
      );
      if (todayApt) {
        setAppointmentId(todayApt.id);
        setDoctorId(todayApt.doctorId);
      } else {
        setAppointmentId('');
      }
    }
  }, [patientId, appointments, todayStr]);

  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedDoctor = doctors.find(d => d.id === doctorId);

  // Calculate wait estimate
  const waitingAhead = queue.filter(
    q => q.date === todayStr && q.doctorId === doctorId && q.status === 'Waiting'
  ).length;
  const estimatedWait = (waitingAhead + 1) * settings.avgConsultationMinutes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId) return;

    generateQueueToken(patientId, doctorId, appointmentId || undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Reception Queue Token"
      subtitle="Generate an OPD waiting token for walk-in or checked-in appointment patient."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Patient <span className="text-rose-500">*</span>
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) — {p.phone}
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
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.departmentName} ({d.opdRoom})
              </option>
            ))}
          </select>
        </div>

        {appointmentId && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Linked to confirmed appointment <strong>{appointmentId}</strong> for today.</span>
          </div>
        )}

        {/* Live Wait Projection */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-1">
            <span>Waiting Patients Ahead:</span>
            <span className="text-sm font-bold">{waitingAhead} patients</span>
          </div>
          <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
            <span>Estimated Queue Wait Time:</span>
            <span className="text-sm font-bold text-amber-800">~{estimatedWait} mins</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-2">
            Based on {settings.avgConsultationMinutes} min/patient average consultation configured in hospital settings.
          </p>
        </div>

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
            className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors shadow-xs"
          >
            Print & Issue Token
          </button>
        </div>
      </form>
    </Modal>
  );
};
