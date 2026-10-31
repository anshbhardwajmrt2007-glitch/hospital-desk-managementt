import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Doctor, DoctorAvailability } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  doctorToEdit
}) => {
  const { departments, addDoctor, updateDoctor } = useHospital();

  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    specialization: '',
    departmentId: '',
    phone: '',
    email: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '09:00 AM - 02:00 PM',
    consultationFee: 800,
    status: 'Available' as DoctorAvailability,
    opdRoom: 'OPD-101'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (doctorToEdit) {
      setFormData({
        name: doctorToEdit.name,
        qualification: doctorToEdit.qualification,
        specialization: doctorToEdit.specialization,
        departmentId: doctorToEdit.departmentId,
        phone: doctorToEdit.phone,
        email: doctorToEdit.email,
        availableDays: doctorToEdit.availableDays,
        availableHours: doctorToEdit.availableHours,
        consultationFee: doctorToEdit.consultationFee,
        status: doctorToEdit.status,
        opdRoom: doctorToEdit.opdRoom
      });
    } else {
      setFormData({
        name: 'Dr. ',
        qualification: 'MBBS, MD',
        specialization: '',
        departmentId: departments[0]?.id || '',
        phone: '+91 ',
        email: '',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHours: '09:00 AM - 02:00 PM',
        consultationFee: 800,
        status: 'Available',
        opdRoom: 'OPD-105'
      });
    }
    setErrors({});
  }, [doctorToEdit, isOpen, departments]);

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim() === 'Dr.') newErrors.name = 'Doctor name is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Medical qualifications required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization required';
    if (!formData.phone.trim()) newErrors.phone = 'Contact number is required';
    if (!formData.opdRoom.trim()) newErrors.opdRoom = 'OPD Room number is required';
    if (formData.availableDays.length === 0) newErrors.availableDays = 'Select at least one available day';
    if (formData.consultationFee <= 0) newErrors.consultationFee = 'Fee must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dept = departments.find(d => d.id === formData.departmentId) || departments[0];

    if (doctorToEdit) {
      updateDoctor(doctorToEdit.id, {
        name: formData.name.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        departmentId: dept.id,
        departmentName: dept.name,
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/[^a-z]/g, '')}@medidesk.org`,
        availableDays: formData.availableDays,
        availableHours: formData.availableHours.trim(),
        consultationFee: Number(formData.consultationFee),
        status: formData.status,
        opdRoom: formData.opdRoom.trim()
      });
    } else {
      addDoctor({
        name: formData.name.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        departmentId: dept.id,
        departmentName: dept.name,
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/[^a-z]/g, '')}@medidesk.org`,
        availableDays: formData.availableDays,
        availableHours: formData.availableHours.trim(),
        consultationFee: Number(formData.consultationFee),
        status: formData.status,
        opdRoom: formData.opdRoom.trim()
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctorToEdit ? `Edit Doctor — ${doctorToEdit.name}` : 'Add New Consulting Doctor'}
      subtitle="Register specialist doctor into hospital staff directory and OPD scheduling system."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Nair"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.name ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualifications & Degrees <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. MBBS, MD, DM (Cardiology)"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.qualification ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.qualification && <p className="text-[11px] text-rose-500 mt-1">{errors.qualification}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Specialization <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Interventional Cardiology"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.specialization ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.specialization && <p className="text-[11px] text-rose-500 mt-1">{errors.specialization}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98201 11223"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="doctor@medidesk.org"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              OPD Consultation Room <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.opdRoom}
              onChange={(e) => setFormData({ ...formData, opdRoom: e.target.value })}
              placeholder="e.g. OPD-102"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.opdRoom ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.opdRoom && <p className="text-[11px] text-rose-500 mt-1">{errors.opdRoom}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consultation Fee (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="100"
              step="50"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
              placeholder="e.g. 800"
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                errors.consultationFee ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
              }`}
            />
            {errors.consultationFee && <p className="text-[11px] text-rose-500 mt-1">{errors.consultationFee}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              OPD Timings / Hours
            </label>
            <input
              type="text"
              value={formData.availableHours}
              onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
              placeholder="e.g. 10:00 AM - 03:00 PM"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duty / Availability Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DoctorAvailability })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
            >
              <option value="Available">Available</option>
              <option value="In Consultation">In Consultation</option>
              <option value="On Leave">On Leave</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>
        </div>

        {/* Available Days */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Weekly Available Days <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map(day => {
              const selected = formData.availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    selected
                      ? 'bg-hospital-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {errors.availableDays && <p className="text-[11px] text-rose-500 mt-1">{errors.availableDays}</p>}
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
            className="px-5 py-2 text-sm font-medium text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            {doctorToEdit ? 'Save Doctor Record' : 'Register Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
