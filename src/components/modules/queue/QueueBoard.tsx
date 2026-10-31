import React, { useState, useMemo } from 'react';
import {
  ListOrdered,
  Ticket,
  Volume2,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { QueueItem, QueueStatus } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { SearchInput } from '../../common/SearchInput';
import { EmptyState } from '../../common/EmptyState';
import { GenerateTokenModal } from './GenerateTokenModal';

export const QueueBoard: React.FC = () => {
  const { queue, doctors, departments, callNextToken, updateQueueStatus, settings } = useHospital();

  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Currently called patient (status: 'In Consultation')
  const currentlyCalled = queue.find(q => q.status === 'In Consultation');

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return queue.filter(q => {
      const matchesSearch =
        q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tokenDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'all' || q.departmentName === selectedDept;
      const matchesDoc = selectedDoctorId === 'all' || q.doctorId === selectedDoctorId;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

      return matchesSearch && matchesDept && matchesDoc && matchesStatus;
    }).sort((a, b) => a.tokenNumber - b.tokenNumber);
  }, [queue, searchQuery, selectedDept, selectedDoctorId, statusFilter]);

  // Department waiting counts
  const deptWaitingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    departments.forEach(d => { counts[d.name] = 0; });
    queue.filter(q => q.status === 'Waiting').forEach(q => {
      counts[q.departmentName] = (counts[q.departmentName] || 0) + 1;
    });
    return counts;
  }, [queue, departments]);

  const totalWaiting = queue.filter(q => q.status === 'Waiting').length;

  const handleCallNext = () => {
    const doctorFilter = selectedDoctorId !== 'all' ? selectedDoctorId : undefined;
    callNextToken(doctorFilter);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">OPD Patient Queue & Token Board</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {totalWaiting} Waiting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient queue orchestration with dynamic digital token calling and wait estimates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCallNext}
            disabled={totalWaiting === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Call Next Patient</span>
          </button>

          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-hospital-600 rounded-xl hover:bg-hospital-700 transition-colors shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            <span>Issue Token</span>
          </button>
        </div>
      </div>

      {/* Modern Digital OPD Display Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-hospital-950 p-6 rounded-3xl text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-hospital-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-hospital-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live OPD Digital Display Screen
            </span>
            <div className="mt-2 flex items-baseline gap-4">
              <span className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                {currentlyCalled ? currentlyCalled.tokenDisplay : 'READY'}
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {currentlyCalled ? currentlyCalled.patientName : 'Next Patient Please Proceed'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentlyCalled ? (
                    <>
                      Attending: <strong className="text-white">{currentlyCalled.doctorName}</strong> • {currentlyCalled.departmentName}
                    </>
                  ) : (
                    'Click "Call Next Patient" to summon next checked-in patient into OPD room.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
            <div className="text-center px-4 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">In Queue</span>
              <p className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{totalWaiting}</p>
            </div>
            <div className="text-center px-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Wait/Person</span>
              <p className="text-2xl font-bold text-hospital-400 font-mono mt-0.5">{settings.avgConsultationMinutes}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Waiting Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Dept Queue:
        </span>
        {departments.map(dept => {
          const count = deptWaitingCounts[dept.name] || 0;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(selectedDept === dept.name ? 'all' : dept.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDept === dept.name
                  ? 'bg-hospital-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{dept.name}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                selectedDept === dept.name ? 'bg-white/20 text-white' : count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search token #, patient name, doctor..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-hospital-200"
          >
            <option value="all">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Assigned Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Arrival Time</th>
                  <th className="py-3 px-4">Est. Wait</th>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map(item => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.status === 'In Consultation' ? 'bg-hospital-50/50 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                        {item.tokenDisplay}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {item.patientName}
                      {item.appointmentId && (
                        <span className="text-[10px] text-hospital-600 block font-normal">Apt: {item.appointmentId}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                      {item.doctorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.departmentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono">
                      {item.arrivalTime}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                      {item.status === 'Waiting' ? `~${item.estimatedWaitMinutes} mins` : item.status === 'In Consultation' ? 'Current' : '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(item.status)} dot>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Waiting' && (
                          <button
                            onClick={() => updateQueueStatus(item.id, 'In Consultation')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg shadow-xs"
                            title="Call into Consultation"
                          >
                            Call
                          </button>
                        )}
                        {item.status === 'In Consultation' && (
                          <button
                            onClick={() => updateQueueStatus(item.id, 'Completed')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                            title="Mark Consultation Complete"
                          >
                            Finish
                          </button>
                        )}
                        {item.status === 'Waiting' && (
                          <button
                            onClick={() => updateQueueStatus(item.id, 'Skipped')}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Patient No-Show / Skip"
                          >
                            Skip
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
            title="No tokens in queue"
            description="All scheduled patients have been attended, or no queue tokens have been issued today."
            actionLabel="Issue Next Token"
            onAction={() => setIsTokenModalOpen(true)}
          />
        )}
      </div>

      {/* Generate Token Modal */}
      <GenerateTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
};
