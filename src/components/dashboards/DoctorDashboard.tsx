import React, { useState } from 'react';
import {
  Stethoscope,
  CalendarDays,
  Users,
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Pill,
  HeartPulse,
  Activity,
  History,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { Appointment, ClinicalNote, PrescriptionItem } from '../../types';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';

export const DoctorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    appointments,
    patients,
    clinicalNotes,
    saveClinicalNote,
    updateAppointmentStatus,
    toggleDoctorAvailability,
    doctors
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'consultations' | 'patients' | 'notes' | 'schedule'>('consultations');

  // Currently consulting patient modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Clinical Consultation Form
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpAdvice, setFollowUpAdvice] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }
  ]);
  const [clinicalSaveMsg, setClinicalSaveMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // View Past Patient History Modal
  const [viewHistoryPatientId, setViewHistoryPatientId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Doctor's assigned doctor record
  const currentDoctor = doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  // Doctor's assigned appointments only (STRICT ISOLATION)
  const myAppointments = appointments.filter(a => a.doctorId === currentDoctor.id);
  const todayConsultations = myAppointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
  const checkedInWaiting = todayConsultations.filter(a => a.status === 'Checked In' || a.status === 'In Progress');
  const completedToday = todayConsultations.filter(a => a.status === 'Completed');

  // Unique assigned patients
  const assignedPatientIds = Array.from(new Set(myAppointments.map(a => a.patientId)));
  const assignedPatients = patients.filter(p => assignedPatientIds.includes(p.id));

  // Doctor's clinical notes history
  const myClinicalNotes = clinicalNotes.filter(n => n.doctorId === currentDoctor.id);

  // Prescription builder helpers
  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescriptionRow = (index: number, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions(prescriptions.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const handleStartConsultation = (apt: Appointment) => {
    setSelectedAppointment(apt);
    updateAppointmentStatus(apt.id, 'In Progress');
    setSymptoms(apt.reason);
    setDiagnosis('');
    setTreatmentPlan('');
    setFollowUpDate('');
    setFollowUpAdvice('');
    setPrescriptions([
      { medicine: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: 'As needed (SOS)', duration: '3 Days', instructions: 'After meals for fever/pain' }
    ]);
    setClinicalSaveMsg(null);
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    if (!diagnosis.trim()) {
      setClinicalSaveMsg({ text: 'Clinical diagnosis is required before completing consultation.', isError: true });
      return;
    }
    if (!treatmentPlan.trim()) {
      setClinicalSaveMsg({ text: 'Treatment plan or clinical advice is required.', isError: true });
      return;
    }

    const res = saveClinicalNote({
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      diagnosis: diagnosis.trim(),
      symptoms: symptoms.trim() || selectedAppointment.reason,
      treatmentPlan: treatmentPlan.trim(),
      prescriptions: prescriptions.filter(p => p.medicine.trim().length > 0),
      followUpDate: followUpDate || undefined,
      followUpAdvice: followUpAdvice.trim() || undefined,
      isConfidential: true
    });

    if (res.success) {
      updateAppointmentStatus(selectedAppointment.id, 'Completed');
      setClinicalSaveMsg({ text: 'Consultation notes and electronic prescriptions saved. Appointment marked completed.', isError: false });
      setTimeout(() => setSelectedAppointment(null), 1200);
    } else {
      setClinicalSaveMsg({ text: res.message, isError: true });
    }
  };

  // Selected patient history for modal
  const historyNotes = clinicalNotes.filter(n => n.patientId === viewHistoryPatientId);
  const historyPatient = patients.find(p => p.id === viewHistoryPatientId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-hospital-500/30 text-hospital-300 border border-hospital-400/30">
              Clinical Specialist Console
            </span>
            <span className="text-xs text-slate-400">• OPD Room: <strong className="text-white">{currentDoctor.opdRoom}</strong></span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {currentDoctor.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {currentDoctor.qualification} — {currentDoctor.specialization} ({currentDoctor.departmentName})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(currentDoctor.status)} dot>
            {currentDoctor.status}
          </Badge>
          <button
            onClick={() => toggleDoctorAvailability(currentDoctor.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors"
          >
            {currentDoctor.status === 'Available' ? 'Mark On Leave' : 'Set Available'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'consultations', label: `Today's Consultations (${todayConsultations.length})`, icon: Clock },
          { id: 'patients', label: `My Assigned Patients (${assignedPatients.length})`, icon: Users },
          { id: 'notes', label: `Clinical Records (${myClinicalNotes.length})`, icon: FileText },
          { id: 'schedule', label: 'My OPD Schedule', icon: CalendarDays },
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

      {/* TAB: CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Today's Queue"
              value={todayConsultations.length}
              subtitle="Scheduled OPD patients"
              icon={CalendarDays}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <StatCard
              title="Checked-in Waiting"
              value={checkedInWaiting.length}
              subtitle="Ready in consultation lounge"
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Completed Today"
              value={completedToday.length}
              subtitle="Prescriptions recorded"
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Patient Consultation Line-up</h3>
                <p className="text-xs text-slate-400">Click "Start Consultation" to review clinical history and write prescriptions.</p>
              </div>
            </div>

            {todayConsultations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Patient ID</th>
                      <th className="py-3 px-4">Symptoms / Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Consultation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayConsultations.map(apt => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-hospital-700 whitespace-nowrap">
                          {apt.timeSlot}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {apt.patientName}
                          <span className="text-slate-400 text-[11px] block">{apt.patientPhone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {apt.patientId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate" title={apt.reason}>
                          {apt.reason}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(apt.status)} dot>
                            {apt.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewHistoryPatientId(apt.patientId)}
                              className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-slate-100 rounded-lg"
                              title="Review Clinical History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {apt.status !== 'Completed' ? (
                              <button
                                onClick={() => handleStartConsultation(apt)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl shadow-xs"
                              >
                                {apt.status === 'In Progress' ? 'Continue Exam' : 'Start Consultation'}
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No consultations booked for today.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ASSIGNED PATIENTS */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Your Clinical Caseload ({assignedPatients.length} Patients)</h3>
            <p className="text-xs text-slate-400">Restricted access to patients assigned to your clinical care.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Known Allergies</th>
                  <th className="py-3 px-4">Past Medical History</th>
                  <th className="py-3 px-4 text-right">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedPatients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-700">{p.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.age}y, {p.gender}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{p.bloodGroup}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.allergies || 'None'}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{p.medicalHistory || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewHistoryPatientId(p.id)}
                        className="px-2.5 py-1 text-xs text-hospital-600 bg-hospital-50 hover:bg-hospital-100 rounded-lg font-semibold"
                      >
                        Clinical History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CLINICAL NOTES ARCHIVE */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Recorded Clinical Consultation Notes ({myClinicalNotes.length})
          </h3>

          <div className="space-y-4">
            {myClinicalNotes.map(n => (
              <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-hospital-700">{n.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{n.patientName} ({n.patientId})</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{n.createdAt.split('T')[0]}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-400 font-semibold">Diagnosis:</span>
                    <p className="font-bold text-slate-800">{n.diagnosis}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Symptoms:</span>
                    <p className="text-slate-700">{n.symptoms}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 font-semibold">Prescriptions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {n.prescriptions.map((rx, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] font-medium">
                        💊 {rx.medicine} — {rx.dosage} ({rx.frequency}, {rx.duration})
                      </span>
                    ))}
                  </div>
                </div>

                {n.followUpAdvice && (
                  <p className="text-[11px] text-hospital-700 font-medium italic pt-1">
                    Follow-up: {n.followUpAdvice} {n.followUpDate ? `(Target: ${n.followUpDate})` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 max-w-2xl mx-auto space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            OPD Timings & Weekly Available Days
          </h3>

          <div className="p-4 bg-hospital-50/70 border border-hospital-200 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">OPD Consultation Room:</span>
              <span className="font-bold text-slate-900">{currentDoctor.opdRoom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Official OPD Hours:</span>
              <span className="font-bold text-hospital-700">{currentDoctor.availableHours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Standard Consultation Fee:</span>
              <span className="font-mono font-bold text-slate-900">₹{currentDoctor.consultationFee}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Available Consultation Days:</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                const isAvail = currentDoctor.availableDays.includes(day);
                return (
                  <span
                    key={day}
                    className={`px-3 py-1.5 rounded-xl font-semibold ${
                      isAvail ? 'bg-hospital-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {day} {isAvail ? '✓' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLINICAL CONSULTATION WORKSPACE */}
      {selectedAppointment && (
        <Modal
          isOpen={Boolean(selectedAppointment)}
          onClose={() => setSelectedAppointment(null)}
          title={`Clinical Consultation — ${selectedAppointment.patientName}`}
          subtitle={`Patient ID: ${selectedAppointment.patientId} • Appointment Ref: ${selectedAppointment.referenceNumber}`}
          maxWidth="4xl"
        >
          <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
            {clinicalSaveMsg && (
              <div
                className={`p-3 rounded-xl font-semibold flex items-center gap-2 ${
                  clinicalSaveMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {clinicalSaveMsg.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                <span>{clinicalSaveMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Presenting Symptoms & History of Present Illness <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hospital-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Clinical Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Pharyngitis / Type-2 DM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-hospital-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Examination & Treatment Plan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Diagnostic investigations ordered, lifestyle counseling, dietary restrictions..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hospital-200"
              />
            </div>

            {/* Electronic Prescription Writer */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-hospital-600" />
                  Electronic Prescription / Medications
                </span>
                <button
                  type="button"
                  onClick={addPrescriptionRow}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-hospital-600 bg-white border border-hospital-200 rounded-lg hover:bg-hospital-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={rx.medicine}
                        onChange={(e) => updatePrescriptionRow(idx, 'medicine', e.target.value)}
                        placeholder="Medicine name..."
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={rx.dosage}
                        onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                        placeholder="Dosage (e.g. 1 Tab)"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={rx.frequency}
                        onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                        placeholder="Frequency (e.g. Twice daily)"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={rx.duration}
                        onChange={(e) => updatePrescriptionRow(idx, 'duration', e.target.value)}
                        placeholder="Duration (5d)"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(idx)}
                        disabled={prescriptions.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Target Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Follow-up Instructions</label>
                <input
                  type="text"
                  value={followUpAdvice}
                  onChange={(e) => setFollowUpAdvice(e.target.value)}
                  placeholder="e.g. Repeat fasting blood sugar and review in 14 days"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold rounded-xl"
              >
                Cancel / Pause
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Consultation & Complete Visit</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: PATIENT HISTORY VIEWER */}
      {viewHistoryPatientId && (
        <Modal
          isOpen={Boolean(viewHistoryPatientId)}
          onClose={() => setViewHistoryPatientId(null)}
          title={`Clinical History — ${historyPatient?.name}`}
          subtitle={`Patient ID: ${historyPatient?.id} • Blood: ${historyPatient?.bloodGroup}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p><span className="text-slate-400 font-semibold">Known Allergies:</span> <strong className="text-rose-600">{historyPatient?.allergies || 'None'}</strong></p>
              <p><span className="text-slate-400 font-semibold">Medical History:</span> {historyPatient?.medicalHistory || 'None on record'}</p>
            </div>

            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pt-2">
              Previous Consultation Notes ({historyNotes.length})
            </h4>

            {historyNotes.length > 0 ? (
              <div className="space-y-3">
                {historyNotes.map(note => (
                  <div key={note.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{note.doctorName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{note.createdAt.split('T')[0]}</span>
                    </div>
                    <p><span className="text-slate-500 font-semibold">Diagnosis:</span> <strong>{note.diagnosis}</strong></p>
                    <p className="text-slate-600">{note.treatmentPlan}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No previous notes recorded for this patient.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
