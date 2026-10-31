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
  AppNotification,
  AuditLog,
  HospitalSettings
} from '../types';

export interface StoredAuthAccount {
  userId: string;
  email: string;
  salt: string;
  passwordHash: string; // PBKDF2 hash of demo password
  role: UserProfile['role'];
}

// Pre-computed PBKDF2 salts & hashes for demo credentials
// Password "patient123" for patient, "desk123" for desk admin, "chief123" for chief doctor,
// "doctor123" for doctor, "billing123" for billing head, "nurse123" for head nurse, "manager123" for manager.
export const initialAuthAccounts: StoredAuthAccount[] = [
  {
    userId: 'usr-patient-01',
    email: 'aarav.sharma@example.com',
    salt: 'e4a2d8f9c1b3456789abcdef01234567',
    passwordHash: '8b7f830bb531273934ce3c62145bce4a7d6bc0ef98a9668ad5493019808e0964',
    role: 'PATIENT'
  },
  {
    userId: 'usr-desk-01',
    email: 'reception.desk@medidesk.org',
    salt: 'a1b2c3d4e5f67890123456789abcdef0',
    passwordHash: 'c7c59e7a83f1244bb4b44ecad9c1d2e3f4a5b6c7d8e9f0123456789abcdef012',
    role: 'DESK_ADMIN'
  },
  {
    userId: 'usr-chief-01',
    email: 'dr.rnair@medidesk.org',
    salt: '1234567890abcdef1234567890abcdef',
    passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    role: 'CHIEF_DOCTOR'
  },
  {
    userId: 'usr-doc-02',
    email: 'dr.aswami@medidesk.org',
    salt: 'fedcba0987654321fedcba0987654321',
    passwordHash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    role: 'DOCTOR'
  },
  {
    userId: 'usr-billing-01',
    email: 'billing.head@medidesk.org',
    salt: '9876543210fedcba9876543210fedcba',
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    role: 'BILLING_HEAD'
  },
  {
    userId: 'usr-nurse-01',
    email: 'nurse.head@medidesk.org',
    salt: 'abcdef0123456789abcdef0123456789',
    passwordHash: '3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855f',
    role: 'HEAD_NURSE'
  },
  {
    userId: 'usr-manager-01',
    email: 'manager@medidesk.org',
    salt: '0123456789abcdef0123456789abcdef',
    passwordHash: '7c6a61404e765be5d36e2d93e8e2fa5160faae8e7a6372cecb10b8cf95a5076a',
    role: 'HOSPITAL_MANAGER'
  }
];

export const initialUserProfiles: UserProfile[] = [
  {
    id: 'usr-patient-01',
    email: 'aarav.sharma@example.com',
    role: 'PATIENT',
    fullName: 'Aarav Sharma',
    phone: '+91 98111 22334',
    isActive: true,
    isEmailVerified: true,
    patientId: 'PAT-1001',
    createdAt: '2024-01-15T09:30:00.000Z',
    updatedAt: '2024-01-15T09:30:00.000Z'
  },
  {
    id: 'usr-desk-01',
    email: 'reception.desk@medidesk.org',
    role: 'DESK_ADMIN',
    fullName: 'Priya Deshmukh',
    phone: '+91 98200 44001',
    isActive: true,
    isEmailVerified: true,
    staffId: 'STF-101',
    departmentId: 'DEP-GEN',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-chief-01',
    email: 'dr.rnair@medidesk.org',
    role: 'CHIEF_DOCTOR',
    fullName: 'Dr. Rajesh Nair (MD)',
    phone: '+91 98201 11223',
    isActive: true,
    isEmailVerified: true,
    doctorId: 'DOC-101',
    departmentId: 'DEP-GEN',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-doc-02',
    email: 'dr.aswami@medidesk.org',
    role: 'DOCTOR',
    fullName: 'Dr. Arvind Swaminathan',
    phone: '+91 98202 22334',
    isActive: true,
    isEmailVerified: true,
    doctorId: 'DOC-102',
    departmentId: 'DEP-CARD',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-billing-01',
    email: 'billing.head@medidesk.org',
    role: 'BILLING_HEAD',
    fullName: 'Vikram Sharma',
    phone: '+91 98200 55002',
    isActive: true,
    isEmailVerified: true,
    staffId: 'STF-102',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-nurse-01',
    email: 'nurse.head@medidesk.org',
    role: 'HEAD_NURSE',
    fullName: 'Sister Mary Joseph',
    phone: '+91 98200 66003',
    isActive: true,
    isEmailVerified: true,
    staffId: 'STF-103',
    departmentId: 'DEP-GEN',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-manager-01',
    email: 'manager@medidesk.org',
    role: 'HOSPITAL_MANAGER',
    fullName: 'Anuradha Sen',
    phone: '+91 98200 77004',
    isActive: true,
    isEmailVerified: true,
    staffId: 'STF-104',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z'
  }
];

export const initialStaffProfiles: StaffProfile[] = [
  {
    id: 'STF-101',
    userId: 'usr-desk-01',
    employeeCode: 'EMP-ADM-01',
    role: 'DESK_ADMIN',
    fullName: 'Priya Deshmukh',
    departmentId: 'DEP-GEN',
    departmentName: 'Central OPD Reception & Registration',
    designation: 'Senior Reception Desk Officer',
    phone: '+91 98200 44001',
    email: 'reception.desk@medidesk.org',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    joinedDate: '2023-03-15',
    isActive: true
  },
  {
    id: 'STF-102',
    userId: 'usr-billing-01',
    employeeCode: 'EMP-BIL-01',
    role: 'BILLING_HEAD',
    fullName: 'Vikram Sharma',
    departmentId: 'DEP-FIN',
    departmentName: 'Revenue & Patient Accounts',
    designation: 'Chief Billing & Cashier Officer',
    phone: '+91 98200 55002',
    email: 'billing.head@medidesk.org',
    shift: 'General Duty (09:00 AM - 05:00 PM)',
    joinedDate: '2022-07-01',
    isActive: true
  },
  {
    id: 'STF-103',
    userId: 'usr-nurse-01',
    employeeCode: 'EMP-NUR-01',
    role: 'HEAD_NURSE',
    fullName: 'Sister Mary Joseph',
    departmentId: 'DEP-NUR',
    departmentName: 'Inpatient Nursing Service',
    designation: 'Nursing Superintendent / Head Nurse',
    phone: '+91 98200 66003',
    email: 'nurse.head@medidesk.org',
    shift: 'Morning Shift (07:30 AM - 03:30 PM)',
    joinedDate: '2021-01-10',
    isActive: true
  },
  {
    id: 'STF-104',
    userId: 'usr-manager-01',
    employeeCode: 'EMP-MGR-01',
    role: 'HOSPITAL_MANAGER',
    fullName: 'Anuradha Sen',
    departmentId: 'DEP-MGT',
    departmentName: 'Hospital Administration & Operations',
    designation: 'General Manager of Operations',
    phone: '+91 98200 77004',
    email: 'manager@medidesk.org',
    shift: 'General Executive (09:00 AM - 06:00 PM)',
    joinedDate: '2020-05-15',
    isActive: true
  }
];

export const initialClinicalNotes: ClinicalNote[] = [
  {
    id: 'CLN-5001',
    appointmentId: 'APT-2001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Nair',
    diagnosis: 'Essential Stage-1 Hypertension with mild sinus tachycardia',
    symptoms: 'Occasional morning occipital headache, palpitations under work stress, mild exertion breathlessness.',
    treatmentPlan: 'Advised lifestyle modification with low-sodium diet, regular aerobic walking 45 mins/day, and pharmacological initiation of Telmisartan.',
    prescriptions: [
      {
        medicine: 'Tab. Telmisartan 40mg',
        dosage: '1 Tablet',
        frequency: 'Once Daily (Morning after breakfast)',
        duration: '30 Days',
        instructions: 'Monitor blood pressure weekly in the morning.'
      },
      {
        medicine: 'Tab. Amlodipine 5mg',
        dosage: '1 Tablet',
        frequency: 'Once Daily (Night at bedtime)',
        duration: '15 Days',
        instructions: 'Check for pedal edema.'
      }
    ],
    followUpDate: '2024-11-20',
    followUpAdvice: 'Repeat lipid profile and serum creatinine before next visit.',
    isConfidential: true,
    createdAt: '2024-10-25T10:15:00.000Z',
    updatedAt: '2024-10-25T10:15:00.000Z'
  },
  {
    id: 'CLN-5002',
    appointmentId: 'APT-2003',
    patientId: 'PAT-1003',
    patientName: 'Ramesh Sundaram',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Arvind Swaminathan',
    diagnosis: 'Coronary Artery Disease (Post-PCI), Type-2 Diabetes Mellitus',
    symptoms: 'Mild retrosternal heaviness after heavy meals, controlled on sublingual sorbitrate.',
    treatmentPlan: 'Continue dual antiplatelet therapy. Advised ECHO follow-up and strict HbA1c control below 7.0%.',
    prescriptions: [
      {
        medicine: 'Tab. Aspirin 75mg + Atorvastatin 20mg',
        dosage: '1 Capsule',
        frequency: 'Once Daily (Night)',
        duration: '60 Days'
      },
      {
        medicine: 'Tab. Metformin 500mg (SR)',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (With meals)',
        duration: '60 Days'
      }
    ],
    followUpDate: '2024-12-15',
    followUpAdvice: 'Immediate ER review if chest pain persists > 10 mins.',
    isConfidential: true,
    createdAt: '2024-10-28T11:30:00.000Z',
    updatedAt: '2024-10-28T11:30:00.000Z'
  }
];

export const initialNursingTasks: NursingTask[] = [
  {
    id: 'TSK-6001',
    admissionId: 'ADM-3001',
    patientId: 'PAT-1012',
    patientName: 'Mohammad Tariq',
    wardRoom: 'ICU-B',
    bedNumber: 'Bed-02',
    taskType: 'Vitals Check',
    description: 'Hourly continuous blood pressure, heart rate, and SpO2 monitoring with telemetry check.',
    assignedNurseName: 'Nurse Sunita Kadam',
    priority: 'Urgent',
    status: 'In Progress',
    dueTime: '11:00 AM',
    createdAt: '2024-10-30T08:00:00.000Z'
  },
  {
    id: 'TSK-6002',
    admissionId: 'ADM-3001',
    patientId: 'PAT-1012',
    patientName: 'Mohammad Tariq',
    wardRoom: 'ICU-B',
    bedNumber: 'Bed-02',
    taskType: 'IV Fluid / Infusion',
    description: 'IV Nitroglycerin infusion syringe pump check at 5 mcg/min titration.',
    assignedNurseName: 'Sister Mary Joseph',
    priority: 'High',
    status: 'Pending',
    dueTime: '12:00 PM',
    createdAt: '2024-10-30T08:30:00.000Z'
  },
  {
    id: 'TSK-6003',
    admissionId: 'ADM-3002',
    patientId: 'PAT-1016',
    patientName: 'Devendra Chawla',
    wardRoom: 'Ward-204',
    bedNumber: 'Bed-A',
    taskType: 'Medication',
    description: 'Administer IV Paracetamol 1000mg infusion and oral Pregabalin 75mg.',
    assignedNurseName: 'Nurse Shalini Patil',
    priority: 'Medium',
    status: 'Completed',
    dueTime: '09:00 AM',
    completedAt: '2024-10-30T09:05:00.000Z',
    completedBy: 'Nurse Shalini Patil',
    createdAt: '2024-10-30T07:45:00.000Z'
  },
  {
    id: 'TSK-6004',
    admissionId: 'ADM-3003',
    patientId: 'PAT-1017',
    patientName: 'Sushila Devi',
    wardRoom: 'Room-310',
    bedNumber: 'Bed-01',
    taskType: 'Wound Care',
    description: 'Pre-operative knee scrub and antiseptic wash protocol ahead of orthopedic evaluation.',
    assignedNurseName: 'Sister Mary Joseph',
    priority: 'Medium',
    status: 'Pending',
    dueTime: '02:00 PM',
    createdAt: '2024-10-30T09:30:00.000Z'
  }
];

export const initialVitalsLogs: VitalSignRecord[] = [
  {
    id: 'VIT-7001',
    patientId: 'PAT-1012',
    patientName: 'Mohammad Tariq',
    admissionId: 'ADM-3001',
    recordedAt: '2024-10-30T09:00:00.000Z',
    recordedBy: 'Nurse Sunita Kadam',
    bloodPressureSystolic: 138,
    bloodPressureDiastolic: 86,
    pulseRate: 78,
    temperature: 98.4,
    spO2: 97,
    respiratoryRate: 18,
    notes: 'Hemodynamically stable on nasal cannula O2 @ 2 L/min.'
  },
  {
    id: 'VIT-7002',
    patientId: 'PAT-1016',
    patientName: 'Devendra Chawla',
    admissionId: 'ADM-3002',
    recordedAt: '2024-10-30T08:30:00.000Z',
    recordedBy: 'Nurse Shalini Patil',
    bloodPressureSystolic: 122,
    bloodPressureDiastolic: 78,
    pulseRate: 72,
    temperature: 98.6,
    spO2: 99,
    respiratoryRate: 16,
    notes: 'Pain score 4/10 after morning analgesia.'
  },
  {
    id: 'VIT-7003',
    patientId: 'PAT-1017',
    patientName: 'Sushila Devi',
    admissionId: 'ADM-3003',
    recordedAt: '2024-10-30T08:45:00.000Z',
    recordedBy: 'Sister Mary Joseph',
    bloodPressureSystolic: 130,
    bloodPressureDiastolic: 82,
    pulseRate: 74,
    temperature: 98.2,
    spO2: 98,
    respiratoryRate: 17,
    notes: 'Pre-op vital parameters within acceptable range.'
  }
];

export const initialBeds: Bed[] = [
  { id: 'BED-101', roomNumber: 'Ward-101', bedNumber: 'Bed-01', roomType: 'General Ward', dailyRate: 1800, isOccupied: false, floor: 'Ground Floor, Wing A' },
  { id: 'BED-102', roomNumber: 'Ward-101', bedNumber: 'Bed-02', roomType: 'General Ward', dailyRate: 1800, isOccupied: false, floor: 'Ground Floor, Wing A' },
  { id: 'BED-103', roomNumber: 'Ward-101', bedNumber: 'Bed-03', roomType: 'General Ward', dailyRate: 1800, isOccupied: false, floor: 'Ground Floor, Wing A' },
  { id: 'BED-201', roomNumber: 'Ward-204', bedNumber: 'Bed-A', roomType: 'Semi-Private', dailyRate: 3200, isOccupied: true, currentAdmissionId: 'ADM-3002', currentPatientName: 'Devendra Chawla', floor: '1st Floor, Wing C' },
  { id: 'BED-202', roomNumber: 'Ward-204', bedNumber: 'Bed-B', roomType: 'Semi-Private', dailyRate: 3200, isOccupied: false, floor: '1st Floor, Wing C' },
  { id: 'BED-301', roomNumber: 'Room-310', bedNumber: 'Bed-01', roomType: 'Private Room', dailyRate: 4500, isOccupied: true, currentAdmissionId: 'ADM-3003', currentPatientName: 'Sushila Devi', floor: '2nd Floor, Wing B' },
  { id: 'BED-401', roomNumber: 'ICU-B', bedNumber: 'Bed-02', roomType: 'ICU', dailyRate: 6500, isOccupied: true, currentAdmissionId: 'ADM-3001', currentPatientName: 'Mohammad Tariq', floor: '1st Floor, ICU Wing' },
  { id: 'BED-402', roomNumber: 'ICU-B', bedNumber: 'Bed-01', roomType: 'ICU', dailyRate: 6500, isOccupied: false, floor: '1st Floor, ICU Wing' }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-8001',
    timestamp: '2024-10-30T08:00:15.000Z',
    userId: 'usr-manager-01',
    userEmail: 'manager@medidesk.org',
    userRole: 'HOSPITAL_MANAGER',
    action: 'SYSTEM_STARTUP',
    resourceType: 'user',
    resourceId: 'SYSTEM',
    details: 'MediDesk multi-role security system initiated. Access policies verified.'
  },
  {
    id: 'AUD-8002',
    timestamp: '2024-10-30T08:15:30.000Z',
    userId: 'usr-desk-01',
    userEmail: 'reception.desk@medidesk.org',
    userRole: 'DESK_ADMIN',
    action: 'PATIENT_CHECK_IN',
    resourceType: 'appointment',
    resourceId: 'APT-2001',
    details: 'Patient Aarav Sharma checked in for Dr. Rajesh Nair. Queue token T-02 issued.'
  },
  {
    id: 'AUD-8003',
    timestamp: '2024-10-30T09:10:00.000Z',
    userId: 'usr-chief-01',
    userEmail: 'dr.rnair@medidesk.org',
    userRole: 'CHIEF_DOCTOR',
    action: 'CLINICAL_NOTE_SAVED',
    resourceType: 'clinical_note',
    resourceId: 'CLN-5001',
    details: 'Clinical consultation note & prescriptions recorded for Aarav Sharma.'
  },
  {
    id: 'AUD-8004',
    timestamp: '2024-10-30T09:35:45.000Z',
    userId: 'usr-billing-01',
    userEmail: 'billing.head@medidesk.org',
    userRole: 'BILLING_HEAD',
    action: 'PAYMENT_VERIFIED',
    resourceType: 'invoice',
    resourceId: 'INV-4001',
    details: 'Payment of ₹1,365 recorded via UPI (Ref: UPI/4098231998/OKAXIS).'
  },
  {
    id: 'AUD-8005',
    timestamp: '2024-10-30T10:00:20.000Z',
    userId: 'usr-nurse-01',
    userEmail: 'nurse.head@medidesk.org',
    userRole: 'HEAD_NURSE',
    action: 'NURSING_TASK_COMPLETED',
    resourceType: 'nursing_task',
    resourceId: 'TSK-6003',
    details: 'Medication administration completed for Devendra Chawla in Ward-204.'
  }
];
