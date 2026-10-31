import {
  UserProfile,
  StaffProfile,
  Patient,
  Doctor,
  Department,
  Appointment,
  ClinicalNote,
  NursingTask,
  VitalSignRecord,
  QueueItem,
  Admission,
  Bed,
  Bill,
  PaymentRecord,
  AppNotification,
  AuditLog,
  HospitalSettings,
  UserRole
} from '../types';
import {
  initialPatients,
  initialDoctors,
  initialDepartments,
  initialAppointments,
  initialQueue,
  initialAdmissions,
  initialBills,
  initialNotifications,
  initialSettings
} from '../data/mockData';
import {
  initialUserProfiles,
  initialStaffProfiles,
  initialClinicalNotes,
  initialNursingTasks,
  initialVitalsLogs,
  initialBeds,
  initialAuditLogs,
  initialAuthAccounts,
  StoredAuthAccount
} from '../data/seedData';
import { generateUUID, generateReferenceNumber } from './crypto';

const STORAGE_KEYS = {
  USERS: 'medidesk_v2_users',
  ACCOUNTS: 'medidesk_v2_auth_accounts',
  STAFF: 'medidesk_v2_staff',
  PATIENTS: 'medidesk_v2_patients',
  DOCTORS: 'medidesk_v2_doctors',
  DEPARTMENTS: 'medidesk_v2_departments',
  APPOINTMENTS: 'medidesk_v2_appointments',
  CLINICAL_NOTES: 'medidesk_v2_clinical_notes',
  NURSING_TASKS: 'medidesk_v2_nursing_tasks',
  VITALS: 'medidesk_v2_vitals',
  QUEUE: 'medidesk_v2_queue',
  ADMISSIONS: 'medidesk_v2_admissions',
  BEDS: 'medidesk_v2_beds',
  BILLS: 'medidesk_v2_bills',
  AUDIT_LOGS: 'medidesk_v2_audit_logs',
  NOTIFICATIONS: 'medidesk_v2_notifications',
  SETTINGS: 'medidesk_v2_settings',
};

// Generic storage loader
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

export class HospitalDatabaseService {
  // In-memory cache synced to localStorage
  private users: UserProfile[] = loadStorage(STORAGE_KEYS.USERS, initialUserProfiles);
  private accounts: StoredAuthAccount[] = loadStorage(STORAGE_KEYS.ACCOUNTS, initialAuthAccounts);
  private staff: StaffProfile[] = loadStorage(STORAGE_KEYS.STAFF, initialStaffProfiles);
  private patients: Patient[] = loadStorage(STORAGE_KEYS.PATIENTS, initialPatients);
  private doctors: Doctor[] = loadStorage(STORAGE_KEYS.DOCTORS, initialDoctors);
  private departments: Department[] = loadStorage(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
  private appointments: Appointment[] = loadStorage(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  private clinicalNotes: ClinicalNote[] = loadStorage(STORAGE_KEYS.CLINICAL_NOTES, initialClinicalNotes);
  private nursingTasks: NursingTask[] = loadStorage(STORAGE_KEYS.NURSING_TASKS, initialNursingTasks);
  private vitalsLogs: VitalSignRecord[] = loadStorage(STORAGE_KEYS.VITALS, initialVitalsLogs);
  private queue: QueueItem[] = loadStorage(STORAGE_KEYS.QUEUE, initialQueue);
  private admissions: Admission[] = loadStorage(STORAGE_KEYS.ADMISSIONS, initialAdmissions);
  private beds: Bed[] = loadStorage(STORAGE_KEYS.BEDS, initialBeds);
  private bills: Bill[] = loadStorage(STORAGE_KEYS.BILLS, initialBills);
  private auditLogs: AuditLog[] = loadStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  private notifications: AppNotification[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  private settings: HospitalSettings = loadStorage(STORAGE_KEYS.SETTINGS, initialSettings);

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- AUDIT LOGGING ---
  public logAudit(
    currentUser: UserProfile | null,
    action: string,
    resourceType: AuditLog['resourceType'],
    resourceId: string,
    details: string
  ): void {
    const entry: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userEmail: currentUser?.email || 'system@medidesk.org',
      userRole: currentUser?.role || 'HOSPITAL_MANAGER',
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: '127.0.0.1 (Local Session)'
    };
    this.auditLogs = [entry, ...this.auditLogs];
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  public getAuditLogs(currentUser: UserProfile): AuditLog[] {
    // Only HOSPITAL_MANAGER has RLS clearance to read audit logs
    if (currentUser.role !== 'HOSPITAL_MANAGER') {
      return [];
    }
    return this.auditLogs;
  }

  // --- AUTH ACCOUNTS & CREDENTIALS ---
  public getAccountByEmail(email: string): StoredAuthAccount | undefined {
    return this.accounts.find(a => a.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public createAuthAccount(account: StoredAuthAccount): void {
    this.accounts = [...this.accounts, account];
    saveStorage(STORAGE_KEYS.ACCOUNTS, this.accounts);
  }

  public updateAuthAccountPassword(userId: string, salt: string, passwordHash: string): void {
    this.accounts = this.accounts.map(a => a.userId === userId ? { ...a, salt, passwordHash } : a);
    saveStorage(STORAGE_KEYS.ACCOUNTS, this.accounts);
  }

  // --- USER PROFILES ---
  public getUserProfile(userId: string): UserProfile | undefined {
    return this.users.find(u => u.id === userId);
  }

  public getUserProfileByEmail(email: string): UserProfile | undefined {
    return this.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public createUserProfile(profile: UserProfile): void {
    this.users = [...this.users, profile];
    saveStorage(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  public getAllUserProfiles(currentUser: UserProfile): UserProfile[] {
    // Only HOSPITAL_MANAGER can inspect all user profiles
    if (currentUser.role !== 'HOSPITAL_MANAGER') {
      return [currentUser];
    }
    return this.users;
  }

  public provisionStaffAccount(
    managerUser: UserProfile,
    staffData: {
      email: string;
      fullName: string;
      phone: string;
      role: UserRole;
      departmentId: string;
      designation: string;
      shift: string;
      salt: string;
      passwordHash: string;
    }
  ): { success: boolean; message: string; user?: UserProfile } {
    if (managerUser.role !== 'HOSPITAL_MANAGER') {
      return { success: false, message: 'Unauthorized: Only the Hospital Manager can provision staff accounts.' };
    }

    if (this.getUserProfileByEmail(staffData.email)) {
      return { success: false, message: `An account with email ${staffData.email} already exists.` };
    }

    const userId = generateUUID();
    const staffId = `STF-${100 + this.staff.length + 1}`;
    const employeeCode = `EMP-${staffData.role.substring(0, 3)}-0${this.staff.length + 1}`;
    const dept = this.departments.find(d => d.id === staffData.departmentId) || this.departments[0];

    const newUser: UserProfile = {
      id: userId,
      email: staffData.email,
      role: staffData.role,
      fullName: staffData.fullName,
      phone: staffData.phone,
      isActive: true,
      isEmailVerified: true,
      staffId,
      departmentId: dept.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newStaffProfile: StaffProfile = {
      id: staffId,
      userId,
      employeeCode,
      role: staffData.role,
      fullName: staffData.fullName,
      departmentId: dept.id,
      departmentName: dept.name,
      designation: staffData.designation,
      phone: staffData.phone,
      email: staffData.email,
      shift: staffData.shift,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true
    };

    this.createAuthAccount({
      userId,
      email: staffData.email,
      salt: staffData.salt,
      passwordHash: staffData.passwordHash,
      role: staffData.role
    });

    this.createUserProfile(newUser);
    this.staff = [...this.staff, newStaffProfile];
    saveStorage(STORAGE_KEYS.STAFF, this.staff);

    this.logAudit(
      managerUser,
      'STAFF_PROVISIONED',
      'user',
      userId,
      `Provisioned ${staffData.role} account for ${staffData.fullName} (${staffData.email})`
    );

    return { success: true, message: 'Staff account successfully provisioned.', user: newUser };
  }

  // --- PATIENTS & PORTAL SELF-REGISTRATION ---
  public getPatients(currentUser: UserProfile): Patient[] {
    // If PATIENT, only their own patient record is returned!
    if (currentUser.role === 'PATIENT') {
      return this.patients.filter(p => p.userId === currentUser.id || p.id === currentUser.patientId);
    }
    // Staff roles can view patient directory
    return this.patients;
  }

  public getPatientById(patientId: string, currentUser: UserProfile): Patient | undefined {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return undefined;

    // Security check: patients cannot view other patients
    if (currentUser.role === 'PATIENT') {
      if (patient.userId !== currentUser.id && patient.id !== currentUser.patientId) {
        return undefined; // Blocked by RLS
      }
    }
    return patient;
  }

  public registerPatient(
    patientData: Omit<Patient, 'id' | 'registrationDate'>,
    registeredByUser?: UserProfile | null
  ): Patient {
    const maxNum = this.patients.reduce((max, p) => {
      const num = parseInt(p.id.replace('PAT-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);
    const newId = `PAT-${maxNum + 1}`;

    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registrationDate: new Date().toISOString(),
      registeredBy: registeredByUser ? registeredByUser.role : 'Self-Registered Portal'
    };

    this.patients = [newPatient, ...this.patients];
    saveStorage(STORAGE_KEYS.PATIENTS, this.patients);

    this.logAudit(
      registeredByUser || null,
      'PATIENT_REGISTERED',
      'patient',
      newId,
      `Registered new patient ${newPatient.name} (Blood: ${newPatient.bloodGroup})`
    );

    this.notify();
    return newPatient;
  }

  public updatePatient(
    patientId: string,
    updates: Partial<Patient>,
    currentUser: UserProfile
  ): boolean {
    const existing = this.patients.find(p => p.id === patientId);
    if (!existing) return false;

    // RLS: Patient can only update their own contact details (phone, email, address, emergencyContact)
    if (currentUser.role === 'PATIENT') {
      if (existing.userId !== currentUser.id && existing.id !== currentUser.patientId) {
        return false;
      }
      // Sanitize updates: patients cannot alter medical history, blood group, or patient ID
      delete (updates as any).bloodGroup;
      delete (updates as any).medicalHistory;
      delete (updates as any).id;
      delete (updates as any).userId;
    }

    this.patients = this.patients.map(p => p.id === patientId ? { ...p, ...updates } : p);
    saveStorage(STORAGE_KEYS.PATIENTS, this.patients);

    // Sync patient name if changed
    if (updates.name) {
      this.appointments = this.appointments.map(a => a.patientId === patientId ? { ...a, patientName: updates.name! } : a);
      this.queue = this.queue.map(q => q.patientId === patientId ? { ...q, patientName: updates.name! } : q);
      this.admissions = this.admissions.map(adm => adm.patientId === patientId ? { ...adm, patientName: updates.name! } : adm);
      this.bills = this.bills.map(b => b.patientId === patientId ? { ...b, patientName: updates.name! } : b);
      saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);
      saveStorage(STORAGE_KEYS.QUEUE, this.queue);
      saveStorage(STORAGE_KEYS.ADMISSIONS, this.admissions);
      saveStorage(STORAGE_KEYS.BILLS, this.bills);
    }

    this.logAudit(currentUser, 'PATIENT_UPDATED', 'patient', patientId, `Updated patient record for ${existing.name}`);
    this.notify();
    return true;
  }

  public deletePatient(patientId: string, currentUser: UserProfile): boolean {
    // Only DESK_ADMIN or HOSPITAL_MANAGER can delete
    if (currentUser.role !== 'DESK_ADMIN' && currentUser.role !== 'HOSPITAL_MANAGER') {
      return false;
    }
    const target = this.patients.find(p => p.id === patientId);
    if (!target) return false;

    this.patients = this.patients.filter(p => p.id !== patientId);
    saveStorage(STORAGE_KEYS.PATIENTS, this.patients);

    this.logAudit(currentUser, 'PATIENT_DELETED', 'patient', patientId, `Deleted patient record ${target.name} (${patientId})`);
    this.notify();
    return true;
  }

  // --- APPOINTMENTS & CONFLICT PREVENTION ---
  public getAppointments(currentUser: UserProfile): Appointment[] {
    // If PATIENT, only their own appointments are returned
    if (currentUser.role === 'PATIENT') {
      const pid = currentUser.patientId;
      return this.appointments.filter(a => a.patientId === pid);
    }
    // If DOCTOR, their assigned appointments
    if (currentUser.role === 'DOCTOR') {
      return this.appointments.filter(a => a.doctorId === currentUser.doctorId);
    }
    // CHIEF_DOCTOR, DESK_ADMIN, HEAD_NURSE, HOSPITAL_MANAGER can see all
    return this.appointments;
  }

  public bookAppointment(
    appData: Omit<Appointment, 'id' | 'createdAt' | 'referenceNumber'>,
    currentUser: UserProfile
  ): { success: boolean; message: string; appointment?: Appointment } {
    // Conflict check: same doctor, same date, same timeSlot, not cancelled
    const conflict = this.appointments.find(
      a => a.doctorId === appData.doctorId &&
           a.date === appData.date &&
           a.timeSlot === appData.timeSlot &&
           a.status !== 'Cancelled'
    );

    if (conflict) {
      return {
        success: false,
        message: `Scheduling conflict: ${appData.doctorName} is already booked at ${appData.timeSlot} on ${appData.date}. Please select another time slot.`
      };
    }

    const maxNum = this.appointments.reduce((max, a) => {
      const num = parseInt(a.id.replace('APT-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 2000);

    const newId = `APT-${maxNum + 1}`;
    const referenceNumber = generateReferenceNumber('MD-APT');

    const newAppointment: Appointment = {
      ...appData,
      id: newId,
      referenceNumber,
      createdAt: new Date().toISOString()
    };

    this.appointments = [newAppointment, ...this.appointments];
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    this.logAudit(
      currentUser,
      'APPOINTMENT_BOOKED',
      'appointment',
      newId,
      `Booked appointment ${newId} (${referenceNumber}) for ${newAppointment.patientName} with ${newAppointment.doctorName}`
    );

    // Create notification
    this.createNotification({
      title: 'Appointment Booked',
      message: `Appointment ${referenceNumber} scheduled for ${newAppointment.patientName} on ${newAppointment.date} at ${newAppointment.timeSlot}`,
      type: 'appointment',
      targetPatientId: newAppointment.patientId,
      linkTab: 'appointments'
    });

    this.notify();
    return { success: true, message: 'Appointment booked successfully.', appointment: newAppointment };
  }

  public updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
    currentUser: UserProfile
  ): boolean {
    const apt = this.appointments.find(a => a.id === id);
    if (!apt) return false;

    // Patient can only cancel their own appointment
    if (currentUser.role === 'PATIENT') {
      if (apt.patientId !== currentUser.patientId || (status !== 'Cancelled' && status !== 'Rescheduled')) {
        return false;
      }
    }

    this.appointments = this.appointments.map(a => a.id === id ? { ...a, status } : a);
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    // If checked in by desk admin, auto issue a queue token if not already in queue
    if (status === 'Checked In') {
      const existingInQueue = this.queue.find(q => q.appointmentId === id && q.status !== 'Completed');
      if (!existingInQueue) {
        this.generateQueueToken(apt.patientId, apt.doctorId, apt.id, currentUser);
      }
    }

    this.logAudit(currentUser, 'APPOINTMENT_STATUS_CHANGE', 'appointment', id, `Updated appointment ${id} to ${status}`);
    this.notify();
    return true;
  }

  public rescheduleAppointment(
    id: string,
    newDate: string,
    newTimeSlot: string,
    currentUser: UserProfile
  ): { success: boolean; message: string } {
    const apt = this.appointments.find(a => a.id === id);
    if (!apt) return { success: false, message: 'Appointment record not found.' };

    const conflict = this.appointments.find(
      a => a.id !== id &&
           a.doctorId === apt.doctorId &&
           a.date === newDate &&
           a.timeSlot === newTimeSlot &&
           a.status !== 'Cancelled'
    );
    if (conflict) {
      return { success: false, message: `The selected doctor is already booked at ${newTimeSlot} on ${newDate}. Please choose another slot.` };
    }

    this.appointments = this.appointments.map(a =>
      a.id === id ? { ...a, date: newDate, timeSlot: newTimeSlot, status: 'Rescheduled' } : a
    );
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);
    this.logAudit(currentUser, 'APPOINTMENT_RESCHEDULED', 'appointment', id, `Rescheduled appointment ${id} to ${newDate} at ${newTimeSlot}`);
    this.notify();
    return { success: true, message: 'Appointment rescheduled successfully.' };
  }

  public cancelAppointment(id: string, reason?: string, currentUser?: UserProfile): boolean {
    const apt = this.appointments.find(a => a.id === id);
    if (!apt) return false;

    this.appointments = this.appointments.map(a =>
      a.id === id ? { ...a, status: 'Cancelled', notes: reason ? `${a.notes || ''} [Cancelled: ${reason}]`.trim() : a.notes } : a
    );
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);
    this.logAudit(currentUser || null, 'APPOINTMENT_CANCELLED', 'appointment', id, `Cancelled appointment ${id}${reason ? ': ' + reason : ''}`);
    this.notify();
    return true;
  }

  // --- CLINICAL NOTES & PRESCRIPTIONS (DOCTOR & CHIEF DOCTOR ONLY) ---
  public getClinicalNotes(currentUser: UserProfile, patientId?: string): ClinicalNote[] {
    // STRICT RLS: Only DOCTOR and CHIEF_DOCTOR can read clinical notes
    if (currentUser.role !== 'DOCTOR' && currentUser.role !== 'CHIEF_DOCTOR') {
      return []; // Desk admin, billing head, head nurse, and patients blocked from sensitive notes
    }

    let notes = this.clinicalNotes;
    if (currentUser.role === 'DOCTOR') {
      // Doctor can only access notes for patients assigned to them
      notes = notes.filter(n => n.doctorId === currentUser.doctorId);
    }
    if (patientId) {
      notes = notes.filter(n => n.patientId === patientId);
    }
    return notes;
  }

  public saveClinicalNote(
    noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>,
    currentUser: UserProfile
  ): { success: boolean; message: string; note?: ClinicalNote } {
    if (currentUser.role !== 'DOCTOR' && currentUser.role !== 'CHIEF_DOCTOR') {
      return { success: false, message: 'Unauthorized: Only consulting doctors can write clinical notes.' };
    }

    const maxNum = this.clinicalNotes.reduce((max, n) => {
      const num = parseInt(n.id.replace('CLN-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 5000);

    const newNote: ClinicalNote = {
      ...noteData,
      id: `CLN-${maxNum + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.clinicalNotes = [newNote, ...this.clinicalNotes];
    saveStorage(STORAGE_KEYS.CLINICAL_NOTES, this.clinicalNotes);

    this.logAudit(
      currentUser,
      'CLINICAL_NOTE_SAVED',
      'clinical_note',
      newNote.id,
      `Recorded clinical notes & prescriptions for patient ${newNote.patientName}`
    );

    this.notify();
    return { success: true, message: 'Clinical consultation note recorded.', note: newNote };
  }

  // --- NURSING TASKS & VITALS ---
  public getNursingTasks(currentUser: UserProfile): NursingTask[] {
    if (currentUser.role === 'PATIENT' || currentUser.role === 'BILLING_HEAD') {
      return []; // Blocked
    }
    return this.nursingTasks;
  }

  public addNursingTask(taskData: Omit<NursingTask, 'id' | 'createdAt'>, currentUser: UserProfile): boolean {
    if (currentUser.role !== 'HEAD_NURSE' && currentUser.role !== 'HOSPITAL_MANAGER') {
      return false;
    }
    const maxNum = this.nursingTasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('TSK-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 6000);

    const newTask: NursingTask = {
      ...taskData,
      id: `TSK-${maxNum + 1}`,
      createdAt: new Date().toISOString()
    };
    this.nursingTasks = [newTask, ...this.nursingTasks];
    saveStorage(STORAGE_KEYS.NURSING_TASKS, this.nursingTasks);

    this.logAudit(currentUser, 'NURSING_TASK_CREATED', 'nursing_task', newTask.id, `Created ${newTask.taskType} task for ${newTask.patientName}`);
    this.notify();
    return true;
  }

  public completeNursingTask(taskId: string, nurseName: string, currentUser: UserProfile): boolean {
    this.nursingTasks = this.nursingTasks.map(t => t.id === taskId ? {
      ...t,
      status: 'Completed',
      completedAt: new Date().toISOString(),
      completedBy: nurseName
    } : t);
    saveStorage(STORAGE_KEYS.NURSING_TASKS, this.nursingTasks);
    this.logAudit(currentUser, 'NURSING_TASK_COMPLETED', 'nursing_task', taskId, `Completed task ${taskId}`);
    this.notify();
    return true;
  }

  public getVitalsLogs(currentUser: UserProfile, patientId?: string): VitalSignRecord[] {
    if (currentUser.role === 'BILLING_HEAD') return [];
    if (patientId) {
      return this.vitalsLogs.filter(v => v.patientId === patientId);
    }
    return this.vitalsLogs;
  }

  public recordVitals(vitalsData: Omit<VitalSignRecord, 'id' | 'recordedAt'>, currentUser: UserProfile): boolean {
    const maxNum = this.vitalsLogs.reduce((max, v) => {
      const num = parseInt(v.id.replace('VIT-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 7000);

    const newRecord: VitalSignRecord = {
      ...vitalsData,
      id: `VIT-${maxNum + 1}`,
      recordedAt: new Date().toISOString()
    };

    this.vitalsLogs = [newRecord, ...this.vitalsLogs];
    saveStorage(STORAGE_KEYS.VITALS, this.vitalsLogs);
    this.notify();
    return true;
  }

  // --- BILLING & INVOICES ---
  public getBills(currentUser: UserProfile): Bill[] {
    // If PATIENT, only invoices for their own patientId are returned!
    if (currentUser.role === 'PATIENT') {
      return this.bills.filter(b => b.patientId === currentUser.patientId);
    }
    // Doctors do not have access to full financial ledger
    if (currentUser.role === 'DOCTOR') {
      return [];
    }
    return this.bills;
  }

  public createBill(
    billData: Omit<Bill, 'id' | 'paidAmount' | 'outstandingBalance' | 'paymentStatus' | 'payments'>,
    currentUser: UserProfile
  ): Bill {
    const maxNum = this.bills.reduce((max, b) => {
      const num = parseInt(b.id.replace('INV-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 4000);

    const newBill: Bill = {
      ...billData,
      id: `INV-${maxNum + 1}`,
      paidAmount: 0,
      outstandingBalance: billData.grandTotal,
      paymentStatus: 'Unpaid',
      payments: []
    };

    this.bills = [newBill, ...this.bills];
    saveStorage(STORAGE_KEYS.BILLS, this.bills);

    this.logAudit(currentUser, 'INVOICE_GENERATED', 'invoice', newBill.id, `Generated invoice ${newBill.id} for ₹${newBill.grandTotal}`);
    this.notify();
    return newBill;
  }

  public recordPayment(
    billId: string,
    paymentData: Omit<PaymentRecord, 'id' | 'isSimulated' | 'verificationStatus'>,
    currentUser: UserProfile
  ): boolean {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return false;

    const newRecord: PaymentRecord = {
      ...paymentData,
      id: `PAY-${Date.now().toString().slice(-4)}`,
      isSimulated: true,
      verificationStatus: 'Simulated Demo'
    };

    const newPaidAmount = bill.paidAmount + paymentData.amount;
    const newBalance = Math.max(0, bill.grandTotal - newPaidAmount);
    const newStatus: Bill['paymentStatus'] = newBalance <= 0 ? 'Paid' : 'Partially Paid';

    this.bills = this.bills.map(b => b.id === billId ? {
      ...b,
      paidAmount: newPaidAmount,
      outstandingBalance: newBalance,
      paymentStatus: newStatus,
      paymentMethod: paymentData.method,
      payments: [...b.payments, newRecord]
    } : b);

    saveStorage(STORAGE_KEYS.BILLS, this.bills);
    this.logAudit(currentUser, 'PAYMENT_RECORDED', 'invoice', billId, `Recorded payment ₹${paymentData.amount} (${paymentData.method}) for ${billId}`);
    this.notify();
    return true;
  }

  // --- QUEUE, DOCTORS, DEPARTMENTS, ADMISSIONS, BEDS, SETTINGS ---
  public getDoctors(): Doctor[] { return this.doctors; }

  public addDoctor(docData: Omit<Doctor, 'id'>, currentUser: UserProfile): Doctor {
    const maxNum = this.doctors.reduce((max, d) => {
      const num = parseInt(d.id.replace('DOC-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    const newDoc: Doctor = {
      ...docData,
      id: `DOC-${maxNum + 1}`,
      departmentName: docData.departmentName || docData.department || 'General Medicine'
    };
    this.doctors = [...this.doctors, newDoc];
    saveStorage(STORAGE_KEYS.DOCTORS, this.doctors);
    this.logAudit(currentUser, 'DOCTOR_ADDED', 'doctor', newDoc.id, `Added new doctor ${newDoc.name} (${newDoc.id})`);
    this.notify();
    return newDoc;
  }

  public updateDoctor(doctorId: string, updates: Partial<Doctor>, currentUser: UserProfile): boolean {
    const doc = this.doctors.find(d => d.id === doctorId);
    if (!doc) return false;
    this.doctors = this.doctors.map(d => d.id === doctorId ? { ...d, ...updates } : d);
    saveStorage(STORAGE_KEYS.DOCTORS, this.doctors);
    this.logAudit(currentUser, 'DOCTOR_UPDATED', 'doctor', doctorId, `Updated doctor record for ${doc.name}`);
    this.notify();
    return true;
  }
  public getDepartments(): Department[] { return this.departments; }
  public getQueue(): QueueItem[] { return this.queue; }
  public getAdmissions(): Admission[] { return this.admissions; }
  public getBeds(): Bed[] { return this.beds; }
  public getSettings(): HospitalSettings { return this.settings; }
  public getStaff(): StaffProfile[] { return this.staff; }

  public updateSettings(newSettings: Partial<HospitalSettings>, currentUser: UserProfile): boolean {
    if (currentUser.role !== 'HOSPITAL_MANAGER') return false;
    this.settings = { ...this.settings, ...newSettings };
    saveStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.logAudit(currentUser, 'SETTINGS_UPDATED', 'user', 'SETTINGS', 'Updated hospital operational settings');
    this.notify();
    return true;
  }

  public toggleDoctorAvailability(doctorId: string, currentUser: UserProfile): void {
    this.doctors = this.doctors.map(d => {
      if (d.id === doctorId) {
        const nextStatus = d.status === 'Available' ? 'On Leave' : 'Available';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    saveStorage(STORAGE_KEYS.DOCTORS, this.doctors);
    this.logAudit(currentUser, 'DOCTOR_AVAILABILITY_TOGGLED', 'doctor', doctorId, `Toggled doctor ${doctorId} availability`);
    this.notify();
  }

  public generateQueueToken(patientId: string, doctorId: string, appointmentId: string | undefined, currentUser: UserProfile): QueueItem {
    const patient = this.patients.find(p => p.id === patientId);
    const doctor = this.doctors.find(d => d.id === doctorId);

    const todayDate = new Date().toISOString().split('T')[0];
    const todayTokens = this.queue.filter(q => q.date === todayDate);
    const nextTokenNum = todayTokens.length > 0 ? Math.max(...todayTokens.map(q => q.tokenNumber)) + 1 : 1;
    const tokenDisplay = `T-${nextTokenNum < 10 ? '0' + nextTokenNum : nextTokenNum}`;

    const waitingAhead = this.queue.filter(q => q.date === todayDate && q.doctorId === doctorId && q.status === 'Waiting').length;
    const estimatedWaitMinutes = (waitingAhead + 1) * this.settings.avgConsultationMinutes;

    const newQueueItem: QueueItem = {
      id: `Q-${Date.now().toString().slice(-4)}`,
      tokenNumber: nextTokenNum,
      tokenDisplay,
      patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorId,
      doctorName: doctor ? doctor.name : 'Attending Doctor',
      departmentName: doctor ? doctor.departmentName : 'OPD',
      appointmentId,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
      estimatedWaitMinutes,
      date: todayDate
    };

    this.queue = [...this.queue, newQueueItem];
    saveStorage(STORAGE_KEYS.QUEUE, this.queue);
    this.logAudit(currentUser, 'QUEUE_TOKEN_ISSUED', 'appointment', tokenDisplay, `Issued token ${tokenDisplay} for ${newQueueItem.patientName}`);
    this.notify();
    return newQueueItem;
  }

  public callNextQueueToken(doctorId?: string, currentUser?: UserProfile): QueueItem | null {
    const waitingItems = this.queue.filter(q => q.status === 'Waiting' && (!doctorId || q.doctorId === doctorId));
    if (waitingItems.length === 0) return null;

    const nextItem = waitingItems[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.queue = this.queue.map(q => {
      if (q.doctorId === nextItem.doctorId && q.status === 'In Consultation') {
        return { ...q, status: 'Completed', completedAt: nowTime };
      }
      if (q.id === nextItem.id) {
        return { ...q, status: 'In Consultation', calledAt: nowTime, estimatedWaitMinutes: 0 };
      }
      return q;
    });

    this.doctors = this.doctors.map(d => d.id === nextItem.doctorId ? { ...d, status: 'In Consultation' } : d);

    if (nextItem.appointmentId) {
      this.appointments = this.appointments.map(a => a.id === nextItem.appointmentId ? { ...a, status: 'In Progress' } : a);
    }

    saveStorage(STORAGE_KEYS.QUEUE, this.queue);
    saveStorage(STORAGE_KEYS.DOCTORS, this.doctors);
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);

    if (currentUser) {
      this.logAudit(currentUser, 'QUEUE_PATIENT_CALLED', 'appointment', nextItem.tokenDisplay, `Called token ${nextItem.tokenDisplay}`);
    }
    this.notify();
    return nextItem;
  }

  public updateQueueStatus(id: string, status: QueueItem['status'], currentUser: UserProfile): void {
    const item = this.queue.find(q => q.id === id);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.queue = this.queue.map(q => {
      if (q.id === id) {
        return {
          ...q,
          status,
          ...(status === 'In Consultation' ? { calledAt: nowTime, estimatedWaitMinutes: 0 } : {}),
          ...(status === 'Completed' ? { completedAt: nowTime } : {})
        };
      }
      return q;
    });

    if (item && status === 'Completed') {
      if (item.appointmentId) {
        this.appointments = this.appointments.map(a => a.id === item.appointmentId ? { ...a, status: 'Completed' } : a);
      }
      this.doctors = this.doctors.map(d => d.id === item.doctorId && d.status === 'In Consultation' ? { ...d, status: 'Available' } : d);
    }

    saveStorage(STORAGE_KEYS.QUEUE, this.queue);
    saveStorage(STORAGE_KEYS.DOCTORS, this.doctors);
    saveStorage(STORAGE_KEYS.APPOINTMENTS, this.appointments);
    this.logAudit(currentUser, 'QUEUE_STATUS_UPDATED', 'appointment', id, `Updated token ${id} status to ${status}`);
    this.notify();
  }

  public isBedOccupied(roomNumber: string, bedNumber: string): boolean {
    return this.admissions.some(
      adm => adm.status === 'Admitted' &&
             adm.roomNumber.toLowerCase().trim() === roomNumber.toLowerCase().trim() &&
             adm.bedNumber.toLowerCase().trim() === bedNumber.toLowerCase().trim()
    );
  }

  public admitPatient(admData: Omit<Admission, 'id' | 'status'>, currentUser: UserProfile): { success: boolean; message: string; admission?: Admission } {
    if (this.isBedOccupied(admData.roomNumber, admData.bedNumber)) {
      return { success: false, message: `Bed ${admData.bedNumber} in ${admData.roomNumber} is currently occupied.` };
    }

    const maxNum = this.admissions.reduce((max, a) => {
      const num = parseInt(a.id.replace('ADM-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 3000);

    const newAdmission: Admission = {
      ...admData,
      id: `ADM-${maxNum + 1}`,
      status: 'Admitted'
    };

    this.admissions = [newAdmission, ...this.admissions];
    this.beds = this.beds.map(b => (b.roomNumber === admData.roomNumber && b.bedNumber === admData.bedNumber) ? {
      ...b,
      isOccupied: true,
      currentAdmissionId: newAdmission.id,
      currentPatientName: newAdmission.patientName
    } : b);

    saveStorage(STORAGE_KEYS.ADMISSIONS, this.admissions);
    saveStorage(STORAGE_KEYS.BEDS, this.beds);

    this.logAudit(currentUser, 'PATIENT_ADMITTED', 'admission', newAdmission.id, `Admitted ${newAdmission.patientName} to ${newAdmission.roomNumber} (${newAdmission.bedNumber})`);
    this.notify();
    return { success: true, message: 'Patient admitted successfully.', admission: newAdmission };
  }

  public dischargePatient(id: string, dischargeSummary: string, dischargeDate: string | undefined, currentUser: UserProfile): void {
    const dDate = dischargeDate || new Date().toISOString().replace('T', ' ').substring(0, 16);
    const adm = this.admissions.find(a => a.id === id);

    this.admissions = this.admissions.map(a => a.id === id ? {
      ...a,
      status: 'Discharged',
      dischargeDate: dDate,
      dischargeSummary
    } : a);

    if (adm) {
      this.beds = this.beds.map(b => (b.roomNumber === adm.roomNumber && b.bedNumber === adm.bedNumber) ? {
        ...b,
        isOccupied: false,
        currentAdmissionId: undefined,
        currentPatientName: undefined
      } : b);
    }

    saveStorage(STORAGE_KEYS.ADMISSIONS, this.admissions);
    saveStorage(STORAGE_KEYS.BEDS, this.beds);

    if (adm) {
      this.logAudit(currentUser, 'PATIENT_DISCHARGED', 'admission', id, `Discharged ${adm.patientName} from ${adm.roomNumber}`);
    }
    this.notify();
  }

  // --- NOTIFICATIONS ---
  public getNotifications(currentUser: UserProfile): AppNotification[] {
    return this.notifications.filter(n => {
      if (currentUser.role === 'PATIENT') {
        return n.targetPatientId === currentUser.patientId || n.targetUserId === currentUser.id;
      }
      return n.targetRole === 'ALL' || n.targetRole === currentUser.role;
    });
  }

  public createNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      read: false
    };
    this.notifications = [newNotif, ...this.notifications];
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }
}

export const db = new HospitalDatabaseService();
