import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  AlertCircle,
  Clock,
  BedDouble,
  ReceiptText,
  CalendarPlus,
  FilePlus,
  UserCheck
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { Patient } from '../../../types';
import { useHospital } from '../../../context/HospitalContext';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onBookAppointment: (patientId: string) => void;
  onAdmitPatient: (patientId: string) => void;
  onCreateBill: (patientId: string) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onBookAppointment,
  onAdmitPatient,
  onCreateBill
}) => {
  const { appointments, admissions, bills, settings } = useHospital();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'admissions' | 'bills'>('overview');

  if (!patient) return null;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const patientAdmissions = admissions.filter(a => a.patientId === patient.id);
  const patientBills = bills.filter(b => b.patientId === patient.id);

  const totalBilled = patientBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalPaid = patientBills.reduce((sum, b) => sum + b.paidAmount, 0);
  const outstanding = patientBills.reduce((sum, b) => sum + b.outstandingBalance, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Patient Medical Record — ${patient.name}`}
      subtitle={`Patient ID: ${patient.id} • Registered on ${new Date(patient.registrationDate).toLocaleDateString('en-IN')}`}
      maxWidth="4xl"
    >
      {/* Top Profile Summary Bar */}
      <div className="bg-gradient-to-r from-hospital-50 via-sky-50/50 to-white p-5 rounded-2xl border border-hospital-100 mb-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-hospital-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-hospital-100 text-hospital-800 rounded-full font-mono">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.gender} • {patient.age} Years (DOB: {patient.dob}) • Blood Group:{' '}
                <strong className="text-rose-600 font-bold">{patient.bloodGroup}</strong>
              </p>
            </div>
          </div>

          {/* Quick Desk Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onClose();
                onBookAppointment(patient.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-hospital-700 bg-white border border-hospital-200 rounded-xl hover:bg-hospital-50 transition-colors shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-hospital-600" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onAdmitPatient(patient.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors shadow-xs"
            >
              <BedDouble className="w-3.5 h-3.5 text-purple-600" />
              <span>Admit Inpatient</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onCreateBill(patient.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generate Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-5">
        {[
          { id: 'overview', label: 'Demographics & Vitals' },
          { id: 'appointments', label: `Appointments (${patientAppointments.length})` },
          { id: 'admissions', label: `Admissions (${patientAdmissions.length})` },
          { id: 'bills', label: `Billing & Invoices (${patientBills.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-hospital-600 text-hospital-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-hospital-600" />
                Contact Information
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Primary Phone:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.email || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Residential Address:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.address}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Emergency Contact
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Next of Kin / Contact Name:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergencyContact.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Relationship:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergencyContact.relationship}</p>
                </div>
                <div>
                  <span className="text-slate-400">Emergency Phone:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{patient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Notes & Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Allergies & Contraindications
              </h4>
              <p className="text-xs text-rose-900 font-medium">
                {patient.allergies && patient.allergies !== 'None' ? patient.allergies : 'No known drug or food allergies on record.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chronic Conditions / Medical History
              </h4>
              <p className="text-xs text-slate-600">
                {patient.medicalHistory || 'No significant chronic past history noted.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {patientAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {patientAppointments.map(a => (
                <div key={a.id} className="p-3.5 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-hospital-600">{a.id}</span>
                      <span className="text-xs font-semibold text-slate-800">{a.doctorName}</span>
                      <span className="text-[11px] text-slate-500">({a.departmentName})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Reason: <span className="italic">{a.reason}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Date: {a.date}</span>
                      <span>Slot: {a.timeSlot}</span>
                      <span>Fee: ₹{a.fee}</span>
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(a.status)} dot>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No previous appointment bookings found for this patient.</p>
          )}
        </div>
      )}

      {/* Admissions Tab */}
      {activeTab === 'admissions' && (
        <div className="space-y-3">
          {patientAdmissions.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {patientAdmissions.map(adm => (
                <div key={adm.id} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600">{adm.id}</span>
                      <span className="text-xs font-semibold text-slate-800">{adm.roomType} — {adm.roomNumber} ({adm.bedNumber})</span>
                      <span className="text-[11px] text-slate-500">Doctor: {adm.attendingDoctorName}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Diagnosis: {adm.initialDiagnosis}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Admitted: {adm.admissionDate} {adm.dischargeDate ? `| Discharged: ${adm.dischargeDate}` : ''}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(adm.status)} dot>
                    {adm.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No inpatient admission records on file for this patient.</p>
          )}
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          {/* Financial summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">₹{totalBilled.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Total Paid</span>
              <p className="text-sm font-bold text-emerald-800 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-600">Outstanding Balance</span>
              <p className="text-sm font-bold text-rose-800 mt-0.5">₹{outstanding.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {patientBills.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {patientBills.map(b => (
                <div key={b.id} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{b.id}</span>
                      <span className="text-xs font-semibold text-slate-800">₹{b.grandTotal.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-400">({b.invoiceDate})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Items: {b.items.map(i => i.description).slice(0, 2).join(', ')}{b.items.length > 2 ? '...' : ''}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Paid: ₹{b.paidAmount.toLocaleString('en-IN')} • Due: ₹{b.outstandingBalance.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(b.paymentStatus)} dot>
                    {b.paymentStatus}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No invoices generated for this patient yet.</p>
          )}
        </div>
      )}
    </Modal>
  );
};
