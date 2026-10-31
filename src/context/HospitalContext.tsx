import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  Department,
  Appointment,
  QueueItem,
  Admission,
  Bed,
  Bill,
  ClinicalNote,
  NursingTask,
  VitalSignRecord,
  AppNotification,
  AuditLog,
  HospitalSettings,
  AppointmentStatus,
  QueueStatus,
  PaymentRecord,
  StaffProfile
} from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';

interface HospitalContextType {
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  queue: QueueItem[];
  admissions: Admission[];
  beds: Bed[];
  bills: Bill[];
  clinicalNotes: ClinicalNote[];
  nursingTasks: NursingTask[];
  vitalsLogs: VitalSignRecord[];
  auditLogs: AuditLog[];
  staff: StaffProfile[];
  notifications: AppNotification[];
  settings: HospitalSettings;

  // Patient actions
  addPatient: (patient: Omit<Patient, 'id' | 'registrationDate'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => boolean;
  deletePatient: (id: string) => boolean;

  // Doctor actions
  toggleDoctorAvailability: (id: string) => void;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => boolean;

  // Appointment actions
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'referenceNumber'>) => {
    success: boolean;
    message: string;
    appointment?: Appointment;
  };
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => boolean;
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string) => { success: boolean; message: string };
  cancelAppointment: (id: string, reason?: string) => boolean;

  // Queue actions
  generateQueueToken: (patientId: string, doctorId: string, appointmentId?: string) => QueueItem;
  callNextToken: (doctorId?: string) => QueueItem | null;
  updateQueueStatus: (id: string, status: QueueStatus) => void;

  // Admission actions
  admitPatient: (admission: Omit<Admission, 'id' | 'status'>) => {
    success: boolean;
    message: string;
    admission?: Admission;
  };
  dischargePatient: (id: string, dischargeSummary: string, dischargeDate?: string) => void;
  isBedOccupied: (roomNumber: string, bedNumber: string) => boolean;

  // Billing actions
  createBill: (billData: Omit<Bill, 'id' | 'paidAmount' | 'outstandingBalance' | 'paymentStatus' | 'payments'>) => Bill;
  recordPayment: (billId: string, payment: Omit<PaymentRecord, 'id' | 'isSimulated' | 'verificationStatus'>) => boolean;

  // Clinical Notes & Prescriptions (Doctors & Chief Doctor)
  saveClinicalNote: (note: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    message: string;
    note?: ClinicalNote;
  };

  // Nursing Care (Head Nurse & Ward Team)
  addNursingTask: (task: Omit<NursingTask, 'id' | 'createdAt'>) => boolean;
  completeNursingTask: (taskId: string, nurseName: string) => boolean;
  recordVitals: (vitals: Omit<VitalSignRecord, 'id' | 'recordedAt'>) => boolean;

  // Notifications
  addNotification: (title: string, message: string, type: AppNotification['type'], linkTab?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings & System
  updateSettings: (newSettings: Partial<HospitalSettings>) => void;
  resetDemoData: () => void;

  // Active filter state helper for cross-module navigation
  activeDepartmentFilter: string | null;
  setActiveDepartmentFilter: (deptName: string | null) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // State slices reactive to current user and db changes
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [nursingTasks, setNursingTasks] = useState<NursingTask[]>([]);
  const [vitalsLogs, setVitalsLogs] = useState<VitalSignRecord[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<string | null>(null);

  // Sync state whenever db updates or currentUser changes
  const refreshData = () => {
    if (!currentUser) return;
    setPatients(db.getPatients(currentUser));
    setAppointments(db.getAppointments(currentUser));
    setClinicalNotes(db.getClinicalNotes(currentUser));
    setNursingTasks(db.getNursingTasks(currentUser));
    setVitalsLogs(db.getVitalsLogs(currentUser));
    setBills(db.getBills(currentUser));
    setAuditLogs(db.getAuditLogs(currentUser));
    setNotifications(db.getNotifications(currentUser));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = db.subscribe(refreshData);
    return unsubscribe;
  }, [currentUser]);

  // Pass-through getters
  const doctors = db.getDoctors();
  const departments = db.getDepartments();
  const queue = db.getQueue();
  const admissions = db.getAdmissions();
  const beds = db.getBeds();
  const staff = db.getStaff();
  const settings = db.getSettings();

  // Patient Actions
  const addPatient = (patientData: Omit<Patient, 'id' | 'registrationDate'>): Patient => {
    return db.registerPatient(patientData, currentUser);
  };

  const updatePatient = (id: string, updates: Partial<Patient>): boolean => {
    if (!currentUser) return false;
    return db.updatePatient(id, updates, currentUser);
  };

  const deletePatient = (id: string): boolean => {
    if (!currentUser) return false;
    return db.deletePatient(id, currentUser);
  };

  // Doctor Actions
  const toggleDoctorAvailability = (id: string) => {
    if (!currentUser) return;
    db.toggleDoctorAvailability(id, currentUser);
  };

  const addDoctor = (docData: Omit<Doctor, 'id'>): Doctor => {
    if (!currentUser) throw new Error('Unauthenticated');
    return db.addDoctor(docData, currentUser);
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>): boolean => {
    if (!currentUser) return false;
    return db.updateDoctor(id, updates, currentUser);
  };

  // Appointment Actions
  const bookAppointment = (appData: Omit<Appointment, 'id' | 'createdAt' | 'referenceNumber'>) => {
    if (!currentUser) return { success: false, message: 'Unauthenticated' };
    return db.bookAppointment(appData, currentUser);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus): boolean => {
    if (!currentUser) return false;
    return db.updateAppointmentStatus(id, status, currentUser);
  };

  const rescheduleAppointment = (id: string, newDate: string, newTimeSlot: string) => {
    if (!currentUser) return { success: false, message: 'Unauthenticated' };
    return db.rescheduleAppointment(id, newDate, newTimeSlot, currentUser);
  };

  const cancelAppointment = (id: string, reason?: string): boolean => {
    if (!currentUser) return false;
    return db.cancelAppointment(id, reason, currentUser);
  };

  // Queue Actions
  const generateQueueToken = (patientId: string, doctorId: string, appointmentId?: string): QueueItem => {
    if (!currentUser) throw new Error('Unauthenticated');
    return db.generateQueueToken(patientId, doctorId, appointmentId, currentUser);
  };

  const callNextToken = (doctorId?: string): QueueItem | null => {
    return db.callNextQueueToken(doctorId, currentUser || undefined);
  };

  const updateQueueStatus = (id: string, status: QueueStatus) => {
    if (!currentUser) return;
    db.updateQueueStatus(id, status, currentUser);
  };

  // Admission Actions
  const isBedOccupied = (roomNumber: string, bedNumber: string): boolean => {
    return db.isBedOccupied(roomNumber, bedNumber);
  };

  const admitPatient = (admData: Omit<Admission, 'id' | 'status'>) => {
    if (!currentUser) return { success: false, message: 'Unauthenticated' };
    return db.admitPatient(admData, currentUser);
  };

  const dischargePatient = (id: string, dischargeSummary: string, dischargeDate?: string) => {
    if (!currentUser) return;
    db.dischargePatient(id, dischargeSummary, dischargeDate, currentUser);
  };

  // Billing Actions
  const createBill = (billData: Omit<Bill, 'id' | 'paidAmount' | 'outstandingBalance' | 'paymentStatus' | 'payments'>) => {
    if (!currentUser) throw new Error('Unauthenticated');
    return db.createBill(billData, currentUser);
  };

  const recordPayment = (billId: string, paymentData: Omit<PaymentRecord, 'id' | 'isSimulated' | 'verificationStatus'>): boolean => {
    if (!currentUser) return false;
    return db.recordPayment(billId, paymentData, currentUser);
  };

  // Clinical Notes (Doctors & Chief Doctor)
  const saveClinicalNote = (noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return { success: false, message: 'Unauthenticated' };
    return db.saveClinicalNote(noteData, currentUser);
  };

  // Nursing Care (Head Nurse & Ward Team)
  const addNursingTask = (taskData: Omit<NursingTask, 'id' | 'createdAt'>): boolean => {
    if (!currentUser) return false;
    return db.addNursingTask(taskData, currentUser);
  };

  const completeNursingTask = (taskId: string, nurseName: string): boolean => {
    if (!currentUser) return false;
    return db.completeNursingTask(taskId, nurseName, currentUser);
  };

  const recordVitals = (vitalsData: Omit<VitalSignRecord, 'id' | 'recordedAt'>): boolean => {
    if (!currentUser) return false;
    return db.recordVitals(vitalsData, currentUser);
  };

  // Notifications
  const addNotification = (title: string, message: string, type: AppNotification['type'], linkTab?: string) => {
    db.createNotification({
      title,
      message,
      type,
      linkTab,
      targetRole: 'ALL'
    });
  };

  const markNotificationAsRead = (id: string) => {
    db.markNotificationRead(id);
  };

  const markAllNotificationsAsRead = () => {
    notifications.forEach(n => db.markNotificationRead(n.id));
  };

  const clearNotifications = () => {
    db.clearAllNotifications();
  };

  // Settings
  const updateSettings = (newSettings: Partial<HospitalSettings>) => {
    if (!currentUser) return;
    db.updateSettings(newSettings, currentUser);
  };

  const resetDemoData = () => {
    // Clear localStorage and re-initialize
    localStorage.clear();
    window.location.reload();
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        doctors,
        departments,
        appointments,
        queue,
        admissions,
        beds,
        bills,
        clinicalNotes,
        nursingTasks,
        vitalsLogs,
        auditLogs,
        staff,
        notifications,
        settings,
        addPatient,
        updatePatient,
        deletePatient,
        toggleDoctorAvailability,
        addDoctor,
        updateDoctor,
        bookAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        generateQueueToken,
        callNextToken,
        updateQueueStatus,
        isBedOccupied,
        admitPatient,
        dischargePatient,
        createBill,
        recordPayment,
        saveClinicalNote,
        addNursingTask,
        completeNursingTask,
        recordVitals,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        updateSettings,
        resetDemoData,
        activeDepartmentFilter,
        setActiveDepartmentFilter
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
