import React from 'react';
import { Appointment, Doctor } from '../../../types';
import { Badge, getStatusBadgeVariant } from '../../common/Badge';
import { Clock, User } from 'lucide-react';

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onUpdateStatus: (id: string, status: any) => void;
  doctors: Doctor[];
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
  '05:00 PM'
];

export const AppointmentCalendarView: React.FC<AppointmentCalendarViewProps> = ({
  appointments,
  selectedDate,
  onUpdateStatus,
  doctors
}) => {
  const dateAppointments = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            OPD Appointment Schedule for {selectedDate}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly timeline overview of consulting doctor slots and checked-in patients.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-hospital-50 text-hospital-700 rounded-full border border-hospital-200">
          {dateAppointments.length} bookings scheduled
        </span>
      </div>

      <div className="space-y-3">
        {TIME_SLOTS.map(slot => {
          const slotAppointments = dateAppointments.filter(a => a.timeSlot === slot);
          return (
            <div
              key={slot}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border transition-all ${
                slotAppointments.length > 0
                  ? 'bg-hospital-50/30 border-hospital-100'
                  : 'bg-slate-50/40 border-slate-100'
              }`}
            >
              {/* Time Slot column */}
              <div className="w-24 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{slot}</span>
              </div>

              {/* Slot appointments list */}
              <div className="flex-1 flex flex-wrap gap-2">
                {slotAppointments.length > 0 ? (
                  slotAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs min-w-[280px] max-w-md flex-1"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{apt.patientName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({apt.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Dr: <span className="font-semibold text-hospital-700">{apt.doctorName}</span> • {apt.departmentName}
                        </p>
                        <p className="text-[10px] text-slate-400 italic truncate max-w-xs">{apt.reason}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusBadgeVariant(apt.status)} size="sm" dot>
                          {apt.status}
                        </Badge>
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'Checked In')}
                            className="text-[10px] text-hospital-600 hover:text-hospital-700 font-bold underline"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No bookings (Slot open)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
