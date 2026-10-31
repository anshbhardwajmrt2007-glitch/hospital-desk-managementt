export type UserRole =
  | 'PATIENT'
  | 'DESK_ADMIN'
  | 'CHIEF_DOCTOR'
  | 'DOCTOR'
  | 'BILLING_HEAD'
  | 'HEAD_NURSE'
  | 'HOSPITAL_MANAGER';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';

export interface UserProfile {
  id: string; // uuid
  email: string;
  role: UserRole;
  fullName: string;
  name?: string; // backwards compatibility alias for fullName
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  patientId?: string; // Links to patient record if role === 'PATIENT'
  staffId?: string;   // Links to staff profile if staff
  doctorId?: string;  // Links to doctor record if role === 'DOCTOR' or 'CHIEF_DOCTOR'
  departmentId?: string;
  department?: string;
  shift?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile {
  id: string; // e.g. STF-101
  userId: string;
  employeeCode: string;
  role: UserRole;
  fullName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  phone: string;
  email: string;
  shift: string;
  joinedDate: string;
  isActive: boolean;
}

export interface Patient {
  id: string; // e.g. PAT-1001
  userId?: string;
  name: string;
  age: number;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup: BloodGroup;
  allergies?: string;
  medicalHistory?: string;
  registrationDate: string; // ISO date string
  registeredBy?: string;
}

export type DoctorAvailability = 'Available' | 'In Consultation' | 'On Leave' | 'Off Duty';

export interface Doctor {
  id: string; // e.g. DOC-101
  userId?: string;
  name: string;
  qualification: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  department?: string; // backwards compatibility alias for departmentName
  phone: string;
  email: string;
  availableDays: string[];
  availableHours: string;
  consultationFee: number; // in INR
  status: DoctorAvailability;
  opdRoom: string;
  avatarUrl?: string;
  isChiefDoctor?: boolean;
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Checked In'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled';

export interface Appointment {
  id: string; // e.g. APT-2001
  referenceNumber?: string; // e.g. MD-APT-2024-XXXX
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  fee: number;
  bookedBy?: 'PATIENT' | 'DESK_ADMIN';
  createdAt: string;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface ClinicalNote {
  id: string; // e.g. CLN-5001
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  prescriptions: PrescriptionItem[];
  followUpDate?: string;
  followUpAdvice?: string;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Deferred';

export interface NursingTask {
  id: string; // e.g. TSK-6001
  admissionId?: string;
  patientId: string;
  patientName: string;
  wardRoom: string;
  bedNumber: string;
  taskType: 'Medication' | 'Vitals Check' | 'Wound Care' | 'IV Fluid / Infusion' | 'Specimen Collection' | 'Hygiene / Turn';
  description: string;
  assignedNurseName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface VitalSignRecord {
  id: string; // e.g. VIT-7001
  patientId: string;
  patientName: string;
  admissionId?: string;
  recordedAt: string;
  recordedBy: string; // Nurse name
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulseRate: number; // bpm
  temperature: number; // °F
  spO2: number; // %
  respiratoryRate: number; // breaths/min
  notes?: string;
}

export type QueueStatus = 'Waiting' | 'In Consultation' | 'Completed' | 'Skipped';

export interface QueueItem {
  id: string; // e.g. Q-01
  tokenNumber: number; // 1, 2, 3...
  tokenDisplay: string; // e.g. "T-01"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  appointmentId?: string;
  arrivalTime: string;
  status: QueueStatus;
  estimatedWaitMinutes: number;
  calledAt?: string;
  completedAt?: string;
  date: string; // YYYY-MM-DD
}

export type AdmissionStatus = 'Admitted' | 'Discharged' | 'Transferred';
export type RoomType = 'General Ward' | 'Semi-Private' | 'Private Room' | 'ICU';

export interface Bed {
  id: string;
  roomNumber: string;
  bedNumber: string;
  roomType: RoomType;
  dailyRate: number;
  isOccupied: boolean;
  currentAdmissionId?: string;
  currentPatientName?: string;
  floor: string;
}

export interface Admission {
  id: string; // e.g. ADM-3001
  patientId: string;
  patientName: string;
  departmentName: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  admissionDate: string; // ISO string or YYYY-MM-DD
  dischargeDate?: string;
  roomType: RoomType;
  roomNumber: string;
  bedNumber: string;
  status: AdmissionStatus;
  initialDiagnosis: string;
  dischargeSummary?: string;
  dailyRate: number;
}

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Net Banking';

export interface BillItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Diagnostics' | 'Pharmacy' | 'Room Charges' | 'Procedure' | 'Nursing';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  receivedBy: string;
  isSimulated?: boolean;
  verificationStatus?: 'Simulated Demo' | 'Confirmed';
}

export interface Bill {
  id: string; // e.g. INV-4001
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress?: string;
  linkedType?: 'Appointment' | 'Admission' | 'Walk-in';
  linkedId?: string;
  invoiceDate: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  outstandingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  payments: PaymentRecord[];
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  headOfDepartment: string;
  roomFloor: string;
  contactExtension: string;
  description: string;
  active: boolean;
  color: string;
}

export type NotificationType = 'appointment' | 'queue' | 'admission' | 'billing' | 'system' | 'clinical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  time?: string; // backwards compatibility alias for timestamp
  type: NotificationType;
  read: boolean;
  targetRole?: UserRole | 'ALL';
  targetUserId?: string;
  targetPatientId?: string;
  linkTab?: string;
}

export interface AuditLog {
  id: string; // e.g. AUD-8001
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resourceType: 'patient' | 'appointment' | 'clinical_note' | 'invoice' | 'admission' | 'user' | 'nursing_task' | 'doctor';
  resourceId: string;
  details: string;
  ipAddress?: string;
}

export interface HospitalSettings {
  hospitalName: string;
  tagline: string;
  registrationNumber: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  workingHours: string;
  slotDurationMinutes: number;
  avgConsultationMinutes: number;
  currency: string;
  dateFormat: string;
  taxRate: number;
  printHeaderNote: string;
  printFooterNote: string;
}
