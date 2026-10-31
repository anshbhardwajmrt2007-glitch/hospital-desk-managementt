import React, { useState } from 'react';
import {
  HeartPulse,
  BedDouble,
  Activity,
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Thermometer,
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { NursingTask, VitalSignRecord, TaskPriority } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { Modal } from '../common/Modal';

export const HeadNurseDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    admissions,
    beds,
    nursingTasks,
    vitalsLogs,
    addNursingTask,
    completeNursingTask,
    recordVitals,
    staff
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'wards' | 'tasks' | 'vitals' | 'shifts'>('wards');

  // New Nursing Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(admissions[0]?.id || '');
  const [taskType, setTaskType] = useState<NursingTask['taskType']>('Medication');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedNurse, setAssignedNurse] = useState('Sister Mary Joseph');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [dueTime, setDueTime] = useState('12:00 PM');

  // Vitals Entry Modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalsPatientId, setVitalsPatientId] = useState(admissions[0]?.patientId || '');
  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(98);
  const [respRate, setRespRate] = useState(16);
  const [vitalNotes, setVitalNotes] = useState('');

  const activeAdmissions = admissions.filter(a => a.status === 'Admitted');
  const occupiedBeds = beds.filter(b => b.isOccupied).length;
  const pendingTasks = nursingTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = nursingTasks.filter(t => t.status === 'Completed');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.id === selectedAdmissionId) || admissions[0];
    if (!adm || !taskDescription.trim()) return;

    addNursingTask({
      admissionId: adm.id,
      patientId: adm.patientId,
      patientName: adm.patientName,
      wardRoom: adm.roomNumber,
      bedNumber: adm.bedNumber,
      taskType,
      description: taskDescription.trim(),
      assignedNurseName: assignedNurse,
      priority: taskPriority,
      status: 'Pending',
      dueTime
    });

    setIsTaskModalOpen(false);
    setTaskDescription('');
  };

  const handleRecordVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find(a => a.patientId === vitalsPatientId);
    if (!adm) return;

    recordVitals({
      patientId: adm.patientId,
      patientName: adm.patientName,
      admissionId: adm.id,
      recordedBy: currentUser?.fullName || 'Sister Mary Joseph',
      bloodPressureSystolic: Number(bpSystolic),
      bloodPressureDiastolic: Number(bpDiastolic),
      pulseRate: Number(pulse),
      temperature: Number(temp),
      spO2: Number(spo2),
      respiratoryRate: Number(respRate),
      notes: vitalNotes.trim() || undefined
    });

    setIsVitalsModalOpen(false);
    setVitalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Nursing Header Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-navy-900 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-400/30">
              Nursing Service & Ward Management Console
            </span>
            <span className="text-xs text-slate-400">• Head Nurse: {currentUser?.fullName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Inpatient Nursing Ward & Care Station
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Coordinate inpatient bedside nursing care, medication rounds, vitals tracking, shift scheduling, and ward bed allocations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Care Task</span>
          </button>
          <button
            onClick={() => setIsVitalsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Activity className="w-4 h-4" />
            <span>Record Vitals</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inpatient Ward Census"
          value={activeAdmissions.length}
          subtitle="Active admitted patients"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Occupied Beds"
          value={`${occupiedBeds} / ${beds.length}`}
          subtitle={`${beds.length - occupiedBeds} beds available`}
          icon={BedDouble}
          iconBgColor="bg-sky-50"
          iconColor="text-hospital-600"
        />

        <StatCard
          title="Pending Care Tasks"
          value={pendingTasks.length}
          subtitle="Medications & vitals checks"
          icon={ClipboardList}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Vitals Logs Filed"
          value={vitalsLogs.length}
          subtitle="Continuous telemetry checks"
          icon={HeartPulse}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'wards', label: `Ward & Bed Census (${activeAdmissions.length})` },
          { id: 'tasks', label: `Nursing Tasks (${pendingTasks.length} Pending)` },
          { id: 'vitals', label: `Vital Signs Log (${vitalsLogs.length})` },
          { id: 'shifts', label: 'Nurse Shift Rosters' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-hospital-600 text-hospital-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: WARDS & BEDS */}
      {activeTab === 'wards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {beds.map(bed => (
              <div
                key={bed.id}
                className={`p-4 rounded-2xl border text-xs transition-all ${
                  bed.isOccupied
                    ? 'bg-purple-50/40 border-purple-200 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{bed.bedNumber}</span>
                    <span className="text-slate-500 font-medium">{bed.roomNumber} ({bed.roomType})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bed.isOccupied ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {bed.isOccupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-slate-600">
                  {bed.isOccupied ? (
                    <div>
                      <p className="font-bold text-slate-900">{bed.currentPatientName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">ADM: {bed.currentAdmissionId}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Sanitized & ready for intake</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: NURSING TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bedside Nursing Care Tasks</h3>
              <p className="text-xs text-slate-400">Administer medications, IV lines, and scheduled dressings.</p>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
            >
              + Add Care Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Patient & Bed</th>
                  <th className="py-3 px-4">Task Category</th>
                  <th className="py-3 px-4">Clinical Description</th>
                  <th className="py-3 px-4">Assigned Nurse</th>
                  <th className="py-3 px-4">Due Time</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nursingTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {task.patientName}
                      <span className="text-[10px] text-slate-400 block font-normal">{task.wardRoom} ({task.bedNumber})</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-purple-700 whitespace-nowrap">{task.taskType}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">{task.description}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{task.assignedNurseName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 whitespace-nowrap">{task.dueTime}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                        task.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge variant={task.status === 'Completed' ? 'success' : 'warning'} size="sm" dot>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {task.status !== 'Completed' ? (
                        <button
                          onClick={() => completeNursingTask(task.id, currentUser?.fullName || 'Nurse')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: VITALS LOGS */}
      {activeTab === 'vitals' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Vital Signs Observations</h3>
              <p className="text-xs text-slate-400">Regular telemetry logs of BP, Pulse, Temperature, SpO2, and Respiratory rates.</p>
            </div>
            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700"
            >
              + Record Vitals
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Recorded At</th>
                  <th className="py-3 px-4 text-center">BP (mmHg)</th>
                  <th className="py-3 px-4 text-center">Pulse (bpm)</th>
                  <th className="py-3 px-4 text-center">Temp (°F)</th>
                  <th className="py-3 px-4 text-center">SpO2 (%)</th>
                  <th className="py-3 px-4 text-center">Resp Rate</th>
                  <th className="py-3 px-4">Nurse Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitalsLogs.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{v.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{v.recordedAt.split('T')[0]}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono whitespace-nowrap">
                      {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 font-mono whitespace-nowrap">{v.pulseRate}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600 font-mono whitespace-nowrap">{v.temperature}°F</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 font-mono whitespace-nowrap">{v.spO2}%</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700 whitespace-nowrap">{v.respiratoryRate}/m</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{v.notes || 'Normal parameters'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SHIFTS */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 max-w-2xl mx-auto space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Nursing Service Shift Roster
          </h3>

          <div className="divide-y divide-slate-100">
            {[
              { shift: 'Morning Shift (07:30 AM - 03:30 PM)', lead: 'Sister Mary Joseph', nurses: 'Nurse Sunita Kadam, Nurse Shalini Patil, Nurse Anjali Verma', ward: 'General Ward & ICU Wing' },
              { shift: 'Evening Shift (03:30 PM - 11:30 PM)', lead: 'Staff Nurse Rekha Sawant', nurses: 'Nurse Deepika Rao, Nurse Pooja Nair', ward: 'Semi-Private & Private Rooms' },
              { shift: 'Night Shift (11:30 PM - 07:30 AM)', lead: 'Staff Nurse Geeta Menon', nurses: 'Nurse Priya George, Nurse Reshma Shaikh', ward: 'All Inpatient Floors & Emergency Triage' },
            ].map(r => (
              <div key={r.shift} className="py-3 space-y-1">
                <span className="font-bold text-slate-900 text-sm">{r.shift}</span>
                <p><span className="text-slate-400 font-semibold">Shift In-charge:</span> <strong>{r.lead}</strong></p>
                <p><span className="text-slate-400 font-semibold">Assigned Staff:</span> {r.nurses}</p>
                <p><span className="text-slate-400 font-semibold">Coverage:</span> {r.ward}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN CARE TASK */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Assign Inpatient Nursing Care Task"
        subtitle="Schedule bedside medication, dressing, or vital check for inpatient."
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Admitted Inpatient</label>
            <select
              value={selectedAdmissionId}
              onChange={(e) => setSelectedAdmissionId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
            >
              {activeAdmissions.map(adm => (
                <option key={adm.id} value={adm.id}>
                  {adm.patientName} — {adm.roomNumber} ({adm.bedNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Category</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
            >
              <option value="Medication">Medication Administration</option>
              <option value="Vitals Check">Vitals & Monitoring Check</option>
              <option value="IV Fluid / Infusion">IV Fluid / Infusion</option>
              <option value="Wound Care">Wound Care / Dressing</option>
              <option value="Specimen Collection">Specimen Collection</option>
              <option value="Hygiene / Turn">Hygiene / Turn / Positioning</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Instructions</label>
            <textarea
              rows={2}
              required
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g. Administer IV Ceftriaxone 1g slowly over 15 mins..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Time</label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
            >
              Assign Care Task
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD VITALS */}
      <Modal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        title="Record Inpatient Vital Signs"
        subtitle="Log bedside physiological observations into electronic telemetry record."
        maxWidth="md"
      >
        <form onSubmit={handleRecordVitals} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              value={vitalsPatientId}
              onChange={(e) => setVitalsPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
            >
              {activeAdmissions.map(adm => (
                <option key={adm.id} value={adm.patientId}>
                  {adm.patientName} ({adm.roomNumber} - {adm.bedNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">BP Systolic (mmHg)</label>
              <input
                type="number"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">BP Diastolic (mmHg)</label>
              <input
                type="number"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pulse Rate (bpm)</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resp. Rate (/min)</label>
              <input
                type="number"
                value={respRate}
                onChange={(e) => setRespRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observations / Notes</label>
            <input
              type="text"
              value={vitalNotes}
              onChange={(e) => setVitalNotes(e.target.value)}
              placeholder="e.g. Afebrile, comfortable on room air..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsVitalsModalOpen(false)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl"
            >
              Save Vitals Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
