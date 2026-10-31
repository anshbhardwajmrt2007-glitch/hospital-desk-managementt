import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useHospital } from '../../../context/HospitalContext';
import { RoomType } from '../../../types';
import { AlertCircle, BedDouble } from 'lucide-react';

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
}

const ROOM_RATES: Record<RoomType, number> = {
  'General Ward': 1800,
  'Semi-Private': 3200,
  'Private Room': 4500,
  'ICU': 6500
};

const SAMPLE_ROOM_BEDS: Record<RoomType, { rooms: string[]; beds: string[] }> = {
  'General Ward': {
    rooms: ['Ward-101', 'Ward-102', 'Ward-103'],
    beds: ['Bed-01', 'Bed-02', 'Bed-03', 'Bed-04', 'Bed-05', 'Bed-06']
  },
  'Semi-Private': {
    rooms: ['Ward-201', 'Ward-202', 'Ward-204'],
    beds: ['Bed-A', 'Bed-B']
  },
  'Private Room': {
    rooms: ['Room-301', 'Room-302', 'Room-305', 'Room-310'],
    beds: ['Bed-01']
  },
  'ICU': {
    rooms: ['ICU-A', 'ICU-B', 'ICU-C'],
    beds: ['Bed-01', 'Bed-02', 'Bed-03', 'Bed-04']
  }
};

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId
}) => {
  const { patients, doctors, departments, admitPatient, isBedOccupied } = useHospital();

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [departmentName, setDepartmentName] = useState(departments[0]?.name || 'General Medicine');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [roomType, setRoomType] = useState<RoomType>('General Ward');
  const [roomNumber, setRoomNumber] = useState('Ward-101');
  const [bedNumber, setBedNumber] = useState('Bed-01');
  const [initialDiagnosis, setInitialDiagnosis] = useState('');
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    setError('');
  }, [preselectedPatientId, isOpen, patients]);

  // When room type changes, update room and bed options
  const handleRoomTypeChange = (type: RoomType) => {
    setRoomType(type);
    const available = SAMPLE_ROOM_BEDS[type];
    if (available) {
      setRoomNumber(available.rooms[0]);
      setBedNumber(available.beds[0]);
    }
  };

  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedDoctor = doctors.find(d => d.id === doctorId);

  // Check if current room/bed is occupied
  const bedOccupied = isBedOccupied(roomNumber, bedNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId || !selectedPatient) {
      setError('Please select a patient to admit.');
      return;
    }
    if (!doctorId || !selectedDoctor) {
      setError('Please assign an attending consultant doctor.');
      return;
    }
    if (!initialDiagnosis.trim()) {
      setError('Please record initial diagnosis and clinical admission reason.');
      return;
    }

    if (bedOccupied) {
      setError(`Cannot admit: Bed ${bedNumber} in ${roomNumber} is currently occupied by an active inpatient.`);
      return;
    }

    const res = admitPatient({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      departmentName,
      attendingDoctorId: selectedDoctor.id,
      attendingDoctorName: selectedDoctor.name,
      admissionDate,
      roomType,
      roomNumber,
      bedNumber,
      initialDiagnosis: initialDiagnosis.trim(),
      dailyRate: ROOM_RATES[roomType]
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    onClose();
    setInitialDiagnosis('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inpatient (IPD) Admission Registration"
      subtitle="Admit patient to hospital ward or ICU with real-time bed occupancy validation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Patient to Admit <span className="text-rose-500">*</span>
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) — {p.phone} • Blood: {p.bloodGroup}
              </option>
            ))}
          </select>
        </div>

        {/* Department & Attending Doctor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admitting Department
            </label>
            <select
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attending Consultant Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.departmentName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room & Bed Allocation */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-purple-600" />
              Bed & Accommodation Assignment
            </h4>
            <span className="text-xs font-bold text-hospital-700">
              ₹{ROOM_RATES[roomType]}/day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Category
              </label>
              <select
                value={roomType}
                onChange={(e) => handleRoomTypeChange(e.target.value as RoomType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
              >
                <option value="General Ward">General Ward (₹1,800/d)</option>
                <option value="Semi-Private">Semi-Private (₹3,200/d)</option>
                <option value="Private Room">Private Room (₹4,500/d)</option>
                <option value="ICU">ICU (₹6,500/d)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
              >
                {SAMPLE_ROOM_BEDS[roomType].rooms.map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bed Number
              </label>
              <select
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white font-medium"
              >
                {SAMPLE_ROOM_BEDS[roomType].beds.map(bed => {
                  const occupied = isBedOccupied(roomNumber, bed);
                  return (
                    <option key={bed} value={bed} disabled={occupied}>
                      {bed} {occupied ? '❌ (Occupied)' : '✓ (Available)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {bedOccupied && (
            <p className="text-xs font-semibold text-rose-600">
              ⚠️ Warning: Bed {bedNumber} in {roomNumber} is occupied. Please select an available bed.
            </p>
          )}
        </div>

        {/* Initial Diagnosis */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Initial Diagnosis & Admission Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={initialDiagnosis}
            onChange={(e) => setInitialDiagnosis(e.target.value)}
            placeholder="e.g. Acute exacerbation of COPD, severe wheezing, oxygen desaturation..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Admission Timestamp
          </label>
          <input
            type="text"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
          />
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
            disabled={bedOccupied}
            className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-xs ${
              bedOccupied
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Admit Patient
          </button>
        </div>
      </form>
    </Modal>
  );
};
