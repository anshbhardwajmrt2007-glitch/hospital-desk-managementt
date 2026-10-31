import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Patient, BloodGroup, Gender } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  patientToEdit
}) => {
  const { addPatient, updatePatient } = useHospital();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    gender: 'Male' as Gender,
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    bloodGroup: 'B+' as BloodGroup,
    allergies: '',
    medicalHistory: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        name: patientToEdit.name,
        age: patientToEdit.age.toString(),
        dob: patientToEdit.dob,
        gender: patientToEdit.gender,
        phone: patientToEdit.phone,
        email: patientToEdit.email,
        address: patientToEdit.address,
        emergencyName: patientToEdit.emergencyContact.name,
        emergencyRelationship: patientToEdit.emergencyContact.relationship,
        emergencyPhone: patientToEdit.emergencyContact.phone,
        bloodGroup: patientToEdit.bloodGroup,
        allergies: patientToEdit.allergies || '',
        medicalHistory: patientToEdit.medicalHistory || ''
      });
    } else {
      setFormData({
        name: '',
        age: '',
        dob: '1995-01-01',
        gender: 'Male',
        phone: '+91 ',
        email: '',
        address: '',
        emergencyName: '',
        emergencyRelationship: 'Spouse',
        emergencyPhone: '+91 ',
        bloodGroup: 'B+',
        allergies: 'None',
        medicalHistory: ''
      });
    }
    setErrors({});
  }, [patientToEdit, isOpen]);

  // Sync Age and DOB
  const handleDobChange = (dobVal: string) => {
    setFormData(prev => {
      const birthYear = new Date(dobVal).getFullYear();
      const currentYear = new Date().getFullYear();
      const calcAge = Math.max(0, currentYear - birthYear);
      return {
        ...prev,
        dob: dobVal,
        age: !isNaN(calcAge) ? calcAge.toString() : prev.age
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Patient full name is required';
    if (!formData.phone.trim() || formData.phone.length < 8) newErrors.phone = 'Valid phone number is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 125) {
      newErrors.age = 'Valid age between 0 and 125 required';
    }
    if (!formData.address.trim()) newErrors.address = 'Residential address is required';
    if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (patientToEdit) {
      updatePatient(patientToEdit.id, {
        name: formData.name.trim(),
        age: Number(formData.age),
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyName.trim(),
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone.trim()
        },
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies.trim(),
        medicalHistory: formData.medicalHistory.trim()
      });
    } else {
      addPatient({
        name: formData.name.trim(),
        age: Number(formData.age),
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@patient.medidesk.demo`,
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyName.trim(),
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone.trim()
        },
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies.trim(),
        medicalHistory: formData.medicalHistory.trim()
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientToEdit ? `Edit Patient — ${patientToEdit.id}` : 'Register New Patient'}
      subtitle="Complete hospital intake record. A unique Patient ID (PAT-xxxx) will be generated automatically."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Details */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            1. Personal Demographics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Chandra Sharma"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleDobChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="125"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 34"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.age ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.age && <p className="text-[11px] text-rose-500 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white font-medium text-slate-800"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            2. Contact & Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.phone ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat / House No., Street, City, State, PIN"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.address ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.address && <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            3. Emergency Contact Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="e.g. Suman Sharma"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.emergencyName ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.emergencyName && <p className="text-[11px] text-rose-500 mt-1">{errors.emergencyName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship
              </label>
              <select
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500 bg-white"
              >
                {['Spouse', 'Parent', 'Son / Daughter', 'Sibling', 'Guardian', 'Friend / Relative'].map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+91 98765 43211"
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.emergencyPhone ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-hospital-200 focus:border-hospital-500'
                }`}
              />
              {errors.emergencyPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        </div>

        {/* Medical History & Allergies */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            4. Clinical Notes & Allergies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Drug / Food Allergies
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa drugs, None"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Past Medical History / Chronic Conditions
              </label>
              <input
                type="text"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                placeholder="e.g. Hypertension, Type-2 Diabetes"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-200 focus:border-hospital-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            {patientToEdit ? 'Save Changes' : 'Confirm Registration'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
