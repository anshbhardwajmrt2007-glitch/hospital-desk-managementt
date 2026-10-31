import {
  Patient,
  Doctor,
  Department,
  Appointment,
  QueueItem,
  Admission,
  Bill,
  AppNotification,
  HospitalSettings,
  UserProfile
} from '../types';

export const initialSettings: HospitalSettings = {
  hospitalName: 'MediDesk Multi-Specialty Hospital',
  tagline: 'Excellence in Compassionate Healthcare & Modern Medical Administration',
  registrationNumber: 'MED-REG-2024-MH-9812',
  phone: '+91 (022) 2890-4400',
  emergencyPhone: '+91 (022) 2890-4499 / 108',
  email: 'reception@medideskhospital.org',
  website: 'https://medidesk-hospital.demo',
  address: 'Plot 42, Health City Avenue, Sector 15, Vashi',
  city: 'Navi Mumbai',
  state: 'Maharashtra',
  pincode: '400703',
  workingHours: '08:00 AM - 08:00 PM (OPD) | 24x7 Emergency',
  slotDurationMinutes: 15,
  avgConsultationMinutes: 15,
  currency: '₹',
  dateFormat: 'DD/MM/YYYY',
  taxRate: 5,
  printHeaderNote: 'ISO 9001:2015 & NABH Accredited Healthcare Facility',
  printFooterNote: 'Simulated Educational Hospital Desk Receipt. Not for actual legal, insurance or taxation claims.'
};

export const initialCurrentUser: UserProfile = {
  id: 'USR-01',
  fullName: 'Priya Deshmukh',
  name: 'Priya Deshmukh',
  email: 'reception.desk@medidesk.org',
  role: 'DESK_ADMIN',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2024-01-01T08:00:00.000Z',
  updatedAt: '2024-01-01T08:00:00.000Z',
  department: 'Central OPD Reception & Registration',
  shift: 'Morning Shift (08:00 AM - 04:00 PM)'
};

export const initialDepartments: Department[] = [
  {
    id: 'DEP-GEN',
    name: 'General Medicine',
    headOfDepartment: 'Dr. Rajesh Nair',
    roomFloor: 'Ground Floor, Wing A',
    contactExtension: '101',
    description: 'Comprehensive primary care, diagnostic assessments, and chronic lifestyle disease management.',
    active: true,
    color: 'blue'
  },
  {
    id: 'DEP-CARD',
    name: 'Cardiology',
    headOfDepartment: 'Dr. Arvind Swaminathan',
    roomFloor: '1st Floor, Wing B',
    contactExtension: '102',
    description: 'Advanced cardiovascular care, ECG, ECHO, angiography, and heart wellness screenings.',
    active: true,
    color: 'rose'
  },
  {
    id: 'DEP-ORTHO',
    name: 'Orthopedics',
    headOfDepartment: 'Dr. Vikram Malhotra',
    roomFloor: '1st Floor, Wing C',
    contactExtension: '103',
    description: 'Joint replacements, sports injuries, fracture management, and spine rehabilitation.',
    active: true,
    color: 'amber'
  },
  {
    id: 'DEP-NEURO',
    name: 'Neurology',
    headOfDepartment: 'Dr. Sunita Kulkarni',
    roomFloor: '2nd Floor, Wing A',
    contactExtension: '104',
    description: 'Diagnosis and treatment of nervous system disorders, migraines, stroke, and epilepsy.',
    active: true,
    color: 'purple'
  },
  {
    id: 'DEP-PED',
    name: 'Pediatrics',
    headOfDepartment: 'Dr. Meera Iyer',
    roomFloor: 'Ground Floor, Wing D',
    contactExtension: '105',
    description: 'Child healthcare, routine vaccinations, neonatal care, and adolescent development.',
    active: true,
    color: 'emerald'
  },
  {
    id: 'DEP-DERM',
    name: 'Dermatology',
    headOfDepartment: 'Dr. Rohan Sengupta',
    roomFloor: '2nd Floor, Wing B',
    contactExtension: '106',
    description: 'Clinical dermatology, skin allergy testing, laser therapies, and cosmetic consultations.',
    active: true,
    color: 'pink'
  },
  {
    id: 'DEP-GYN',
    name: 'Gynecology & Obstetrics',
    headOfDepartment: 'Dr. Ananya Roy',
    roomFloor: '2nd Floor, Wing C',
    contactExtension: '107',
    description: 'Comprehensive maternal health, antenatal care, reproductive medicine, and gynecological surgery.',
    active: true,
    color: 'teal'
  }
];

export const initialDoctors: Doctor[] = [
  {
    id: 'DOC-101',
    name: 'Dr. Rajesh Nair',
    qualification: 'MBBS, MD (General Medicine)',
    specialization: 'Internal Medicine & Diabetology',
    departmentId: 'DEP-GEN',
    departmentName: 'General Medicine',
    phone: '+91 98201 11223',
    email: 'dr.rnair@medidesk.org',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '09:00 AM - 02:00 PM',
    consultationFee: 700,
    status: 'Available',
    opdRoom: 'OPD-101'
  },
  {
    id: 'DOC-102',
    name: 'Dr. Arvind Swaminathan',
    qualification: 'MBBS, MD, DM (Cardiology)',
    specialization: 'Interventional Cardiology',
    departmentId: 'DEP-CARD',
    departmentName: 'Cardiology',
    phone: '+91 98202 22334',
    email: 'dr.aswami@medidesk.org',
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableHours: '10:00 AM - 03:00 PM',
    consultationFee: 1200,
    status: 'In Consultation',
    opdRoom: 'OPD-201'
  },
  {
    id: 'DOC-103',
    name: 'Dr. Vikram Malhotra',
    qualification: 'MBBS, MS (Orthopedics), M.Ch',
    specialization: 'Joint Replacement & Arthroscopy',
    departmentId: 'DEP-ORTHO',
    departmentName: 'Orthopedics',
    phone: '+91 98203 33445',
    email: 'dr.vmalhotra@medidesk.org',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableHours: '11:00 AM - 04:00 PM',
    consultationFee: 1000,
    status: 'Available',
    opdRoom: 'OPD-203'
  },
  {
    id: 'DOC-104',
    name: 'Dr. Sunita Kulkarni',
    qualification: 'MBBS, MD, DM (Neurology)',
    specialization: 'Neuro-Electrophysiology & Epilepsy',
    departmentId: 'DEP-NEURO',
    departmentName: 'Neurology',
    phone: '+91 98204 44556',
    email: 'dr.skulkarni@medidesk.org',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    availableHours: '10:00 AM - 02:00 PM',
    consultationFee: 1500,
    status: 'Available',
    opdRoom: 'OPD-302'
  },
  {
    id: 'DOC-105',
    name: 'Dr. Meera Iyer',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    specialization: 'Neonatology & Child Nutrition',
    departmentId: 'DEP-PED',
    departmentName: 'Pediatrics',
    phone: '+91 98205 55667',
    email: 'dr.miyer@medidesk.org',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableHours: '09:00 AM - 01:00 PM',
    consultationFee: 800,
    status: 'Available',
    opdRoom: 'OPD-104'
  },
  {
    id: 'DOC-106',
    name: 'Dr. Rohan Sengupta',
    qualification: 'MBBS, MD (Dermatology & Venereology)',
    specialization: 'Clinical Dermatology & Trichology',
    departmentId: 'DEP-DERM',
    departmentName: 'Dermatology',
    phone: '+91 98206 66778',
    email: 'dr.rsengupta@medidesk.org',
    availableDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableHours: '02:00 PM - 07:00 PM',
    consultationFee: 900,
    status: 'Available',
    opdRoom: 'OPD-305'
  },
  {
    id: 'DOC-107',
    name: 'Dr. Ananya Roy',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    specialization: 'High Risk Pregnancy & Laparoscopic Surgery',
    departmentId: 'DEP-GYN',
    departmentName: 'Gynecology & Obstetrics',
    phone: '+91 98207 77889',
    email: 'dr.aroy@medidesk.org',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '10:00 AM - 03:00 PM',
    consultationFee: 1100,
    status: 'In Consultation',
    opdRoom: 'OPD-308'
  },
  {
    id: 'DOC-108',
    name: 'Dr. Harshvardhan Kapoor',
    qualification: 'MBBS, MD (General Medicine)',
    specialization: 'Preventive Healthcare & Geriatrics',
    departmentId: 'DEP-GEN',
    departmentName: 'General Medicine',
    phone: '+91 98208 88990',
    email: 'dr.hkapoor@medidesk.org',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    availableHours: '03:00 PM - 08:00 PM',
    consultationFee: 750,
    status: 'On Leave',
    opdRoom: 'OPD-102'
  }
];

export const initialPatients: Patient[] = [
  {
    id: 'PAT-1001',
    name: 'Aarav Sharma',
    age: 34,
    dob: '1990-05-14',
    gender: 'Male',
    phone: '+91 98111 22334',
    email: 'aarav.sharma@example.com',
    address: 'B-402, Sunshine Heights, Palm Beach Road, Sanpada, Navi Mumbai',
    emergencyContact: {
      name: 'Ritu Sharma',
      relationship: 'Spouse',
      phone: '+91 98111 22335'
    },
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    medicalHistory: 'Mild Hypertension (treated since 2021)',
    registrationDate: '2024-01-15T09:30:00.000Z'
  },
  {
    id: 'PAT-1002',
    name: 'Deepika Patil',
    age: 28,
    dob: '1996-08-22',
    gender: 'Female',
    phone: '+91 98222 33445',
    email: 'deepika.patil@example.com',
    address: 'Flat 12, Gulmohar Apartments, Sector 17, Vashi',
    emergencyContact: {
      name: 'Suresh Patil',
      relationship: 'Father',
      phone: '+91 98222 33446'
    },
    bloodGroup: 'O+',
    allergies: 'None',
    medicalHistory: 'First trimester prenatal consultation',
    registrationDate: '2024-02-10T11:15:00.000Z'
  },
  {
    id: 'PAT-1003',
    name: 'Ramesh Sundaram',
    age: 58,
    dob: '1966-11-03',
    gender: 'Male',
    phone: '+91 98333 44556',
    email: 'ramesh.sundaram@example.com',
    address: 'Row House 4, Orchid Meadows, Kharghar',
    emergencyContact: {
      name: 'Lakshmi Sundaram',
      relationship: 'Spouse',
      phone: '+91 98333 44557'
    },
    bloodGroup: 'A+',
    allergies: 'Sulfa Drugs',
    medicalHistory: 'Type 2 Diabetes, High Cholesterol',
    registrationDate: '2024-02-18T14:20:00.000Z'
  },
  {
    id: 'PAT-1004',
    name: 'Ananya Joshi',
    age: 7,
    dob: '2017-03-19',
    gender: 'Female',
    phone: '+91 98444 55667',
    email: 'joshi.family@example.com',
    address: 'A-201, Riverdale Enclave, Seawoods',
    emergencyContact: {
      name: 'Nitin Joshi',
      relationship: 'Father',
      phone: '+91 98444 55667'
    },
    bloodGroup: 'O-',
    allergies: 'Peanuts',
    medicalHistory: 'Childhood seasonal asthma',
    registrationDate: '2024-03-01T10:00:00.000Z'
  },
  {
    id: 'PAT-1005',
    name: 'Farhan Akhtar Qureshi',
    age: 42,
    dob: '1982-07-11',
    gender: 'Male',
    phone: '+91 98555 66778',
    email: 'farhan.qureshi@example.com',
    address: '702, Marine Bay Towers, Belapur',
    emergencyContact: {
      name: 'Zoya Qureshi',
      relationship: 'Spouse',
      phone: '+91 98555 66779'
    },
    bloodGroup: 'AB+',
    allergies: 'None',
    medicalHistory: 'Right knee anterior cruciate ligament repair (2019)',
    registrationDate: '2024-03-12T16:45:00.000Z'
  },
  {
    id: 'PAT-1006',
    name: 'Kavita Menon',
    age: 63,
    dob: '1961-09-30',
    gender: 'Female',
    phone: '+91 98666 77889',
    email: 'kavita.menon@example.com',
    address: 'Villa 18, Royal Palms, Nerul',
    emergencyContact: {
      name: 'Aditya Menon',
      relationship: 'Son',
      phone: '+91 98666 77890'
    },
    bloodGroup: 'A-',
    allergies: 'Aspirin',
    medicalHistory: 'Osteoarthritis of knee joints, Chronic migraine',
    registrationDate: '2024-03-20T08:50:00.000Z'
  },
  {
    id: 'PAT-1007',
    name: 'Vikramaditya Rao',
    age: 51,
    dob: '1973-04-16',
    gender: 'Male',
    phone: '+91 98777 88990',
    email: 'vikram.rao@example.com',
    address: 'Plot 88, NRI Complex Phase 2, Seawoods',
    emergencyContact: {
      name: 'Geetha Rao',
      relationship: 'Spouse',
      phone: '+91 98777 88991'
    },
    bloodGroup: 'B-',
    allergies: 'None',
    medicalHistory: 'Cardiovascular checkup, previous stent placement (2022)',
    registrationDate: '2024-04-05T12:10:00.000Z'
  },
  {
    id: 'PAT-1008',
    name: 'Pooja Hegde',
    age: 24,
    dob: '2000-12-05',
    gender: 'Female',
    phone: '+91 98888 99001',
    email: 'pooja.hegde@example.com',
    address: '304, Green Valley CHS, Kopar Khairane',
    emergencyContact: {
      name: 'Raghav Hegde',
      relationship: 'Brother',
      phone: '+91 98888 99002'
    },
    bloodGroup: 'O+',
    allergies: 'Dust & Pollen',
    medicalHistory: 'Atopic dermatitis and eczema episodes',
    registrationDate: '2024-04-18T15:30:00.000Z'
  },
  {
    id: 'PAT-1009',
    name: 'Gurpreet Singh Gill',
    age: 49,
    dob: '1975-01-28',
    gender: 'Male',
    phone: '+91 98999 00112',
    email: 'gurpreet.gill@example.com',
    address: 'D-501, Millennium Crest, Ghansoli',
    emergencyContact: {
      name: 'Harpreet Kaur',
      relationship: 'Spouse',
      phone: '+91 98999 00113'
    },
    bloodGroup: 'B+',
    allergies: 'None',
    medicalHistory: 'Frequent lower back strain and Sciatica',
    registrationDate: '2024-05-02T10:40:00.000Z'
  },
  {
    id: 'PAT-1010',
    name: 'Sneha Verma',
    age: 31,
    dob: '1993-06-17',
    gender: 'Female',
    phone: '+91 99111 12345',
    email: 'sneha.verma@example.com',
    address: 'Flat 102, Silver Arch, Sector 28, Vashi',
    emergencyContact: {
      name: 'Alok Verma',
      relationship: 'Spouse',
      phone: '+91 99111 12346'
    },
    bloodGroup: 'AB-',
    allergies: 'Iodine contrast dye',
    medicalHistory: 'Hypothyroidism (controlled on Levothyroxine)',
    registrationDate: '2024-05-15T14:05:00.000Z'
  },
  {
    id: 'PAT-1011',
    name: 'Tanvi Saxena',
    age: 22,
    dob: '2002-09-14',
    gender: 'Female',
    phone: '+91 99222 23456',
    email: 'tanvi.saxena@example.com',
    address: 'C-12, Tech Zone Residency, Mahape',
    emergencyContact: {
      name: 'Manish Saxena',
      relationship: 'Father',
      phone: '+91 99222 23457'
    },
    bloodGroup: 'A+',
    allergies: 'None',
    medicalHistory: 'Migraine episodes triggered by screen fatigue',
    registrationDate: '2024-06-01T09:15:00.000Z'
  },
  {
    id: 'PAT-1012',
    name: 'Mohammad Tariq',
    age: 67,
    dob: '1957-02-19',
    gender: 'Male',
    phone: '+91 99333 34567',
    email: 'tariq.mohd@example.com',
    address: '201, Crescent Court, Nerul East',
    emergencyContact: {
      name: 'Bilal Tariq',
      relationship: 'Son',
      phone: '+91 99333 34568'
    },
    bloodGroup: 'O+',
    allergies: 'None',
    medicalHistory: 'Post-CABG surgery follow up, Hypertension',
    registrationDate: '2024-06-14T11:45:00.000Z'
  },
  {
    id: 'PAT-1013',
    name: 'Meenakshi Iyer',
    age: 39,
    dob: '1985-10-08',
    gender: 'Female',
    phone: '+91 99444 45678',
    email: 'meenakshi.iyer@example.com',
    address: '15/B, Heritage Towers, Sanpada',
    emergencyContact: {
      name: 'Karthik Iyer',
      relationship: 'Spouse',
      phone: '+91 99444 45679'
    },
    bloodGroup: 'B+',
    allergies: 'Latex',
    medicalHistory: 'PCOS and metabolic syndrome management',
    registrationDate: '2024-07-03T16:20:00.000Z'
  },
  {
    id: 'PAT-1014',
    name: 'Rohan Shrivastav',
    age: 12,
    dob: '2012-07-25',
    gender: 'Male',
    phone: '+91 99555 56789',
    email: 'shrivastav.family@example.com',
    address: 'Plot 5, Sector 9, Airoli',
    emergencyContact: {
      name: 'Sunita Shrivastav',
      relationship: 'Mother',
      phone: '+91 99555 56789'
    },
    bloodGroup: 'A+',
    allergies: 'Shellfish',
    medicalHistory: 'Routine pediatric growth exam & vaccine booster',
    registrationDate: '2024-07-20T10:30:00.000Z'
  },
  {
    id: 'PAT-1015',
    name: 'Bhavna Kothari',
    age: 46,
    dob: '1978-03-31',
    gender: 'Female',
    phone: '+91 99666 67890',
    email: 'bhavna.kothari@example.com',
    address: '802, Paras Pride, Ulwe, Navi Mumbai',
    emergencyContact: {
      name: 'Hemant Kothari',
      relationship: 'Spouse',
      phone: '+91 99666 67891'
    },
    bloodGroup: 'O-',
    allergies: 'None',
    medicalHistory: 'Persistent skin rash and urticaria',
    registrationDate: '2024-08-05T13:10:00.000Z'
  },
  {
    id: 'PAT-1016',
    name: 'Devendra Chawla',
    age: 54,
    dob: '1970-12-14',
    gender: 'Male',
    phone: '+91 99777 78901',
    email: 'devendra.c@example.com',
    address: 'Flat 401, Sai Dham, Kharghar',
    emergencyContact: {
      name: 'Anita Chawla',
      relationship: 'Spouse',
      phone: '+91 99777 78902'
    },
    bloodGroup: 'B+',
    allergies: 'Ciprofloxacin',
    medicalHistory: 'Lumbar disc herniation, Physical therapy candidate',
    registrationDate: '2024-08-22T09:40:00.000Z'
  },
  {
    id: 'PAT-1017',
    name: 'Sushila Devi',
    age: 72,
    dob: '1952-05-02',
    gender: 'Female',
    phone: '+91 99888 89012',
    email: 'sushila.devi.family@example.com',
    address: 'Row House 10, Shanti Niketan, Belapur',
    emergencyContact: {
      name: 'Amitabh Sharma',
      relationship: 'Son',
      phone: '+91 99888 89013'
    },
    bloodGroup: 'AB+',
    allergies: 'None',
    medicalHistory: 'Severe Bilateral Knee Osteoarthritis, Needs TKR assessment',
    registrationDate: '2024-09-02T15:00:00.000Z'
  },
  {
    id: 'PAT-1018',
    name: 'Aryan Das',
    age: 19,
    dob: '2005-04-18',
    gender: 'Male',
    phone: '+91 99999 90123',
    email: 'aryan.das@example.com',
    address: 'Hostel Block 3, DY Patil Campus, Nerul',
    emergencyContact: {
      name: 'Subhash Das',
      relationship: 'Father',
      phone: '+91 99999 90124'
    },
    bloodGroup: 'O+',
    allergies: 'None',
    medicalHistory: 'Sprained left ankle during football tournament',
    registrationDate: '2024-09-18T17:15:00.000Z'
  },
  {
    id: 'PAT-1019',
    name: 'Zeenat Banu',
    age: 33,
    dob: '1991-11-20',
    gender: 'Female',
    phone: '+91 97111 01234',
    email: 'zeenat.banu@example.com',
    address: '603, Tulip Residency, Seawoods West',
    emergencyContact: {
      name: 'Imran Shaikh',
      relationship: 'Spouse',
      phone: '+91 97111 01235'
    },
    bloodGroup: 'A-',
    allergies: 'Amoxicillin',
    medicalHistory: 'Second trimester ultrasound and routine check',
    registrationDate: '2024-10-04T11:00:00.000Z'
  },
  {
    id: 'PAT-1020',
    name: 'Karan Mehra',
    age: 40,
    dob: '1984-08-09',
    gender: 'Male',
    phone: '+91 97222 12345',
    email: 'karan.mehra@example.com',
    address: 'Flat 502, Orchid Enclave, Vashi',
    emergencyContact: {
      name: 'Sonia Mehra',
      relationship: 'Spouse',
      phone: '+91 97222 12346'
    },
    bloodGroup: 'B-',
    allergies: 'None',
    medicalHistory: 'Chronic stress, tension headaches and insomnia',
    registrationDate: '2024-10-15T14:30:00.000Z'
  }
];

// Helper to get formatted date string for today and adjacent days
const today = new Date().toISOString().split('T')[0];
const getShiftedDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const initialAppointments: Appointment[] = [
  {
    id: 'APT-2001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98111 22334',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Nair',
    departmentName: 'General Medicine',
    date: today,
    timeSlot: '09:30 AM',
    reason: 'Follow-up on blood pressure fluctuation & chest heaviness check',
    status: 'Checked In',
    notes: 'Token issued at reception. Patient currently in waiting lounge.',
    fee: 700,
    createdAt: `${today}T08:45:00.000Z`
  },
  {
    id: 'APT-2002',
    patientId: 'PAT-1002',
    patientName: 'Deepika Patil',
    patientPhone: '+91 98222 33445',
    doctorId: 'DOC-107',
    doctorName: 'Dr. Ananya Roy',
    departmentName: 'Gynecology & Obstetrics',
    date: today,
    timeSlot: '10:00 AM',
    reason: 'Routine 14-week prenatal ultrasound & iron supplement review',
    status: 'In Progress',
    notes: 'In consultation room OPD-308.',
    fee: 1100,
    createdAt: `${today}T09:10:00.000Z`
  },
  {
    id: 'APT-2003',
    patientId: 'PAT-1003',
    patientName: 'Ramesh Sundaram',
    patientPhone: '+91 98333 44556',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Arvind Swaminathan',
    departmentName: 'Cardiology',
    date: today,
    timeSlot: '10:30 AM',
    reason: 'Review HbA1c and Holter monitor 24-hr heart report',
    status: 'Scheduled',
    notes: 'Expected at 10:20 AM.',
    fee: 1200,
    createdAt: `${today}T08:30:00.000Z`
  },
  {
    id: 'APT-2004',
    patientId: 'PAT-1004',
    patientName: 'Ananya Joshi',
    patientPhone: '+91 98444 55667',
    doctorId: 'DOC-105',
    doctorName: 'Dr. Meera Iyer',
    departmentName: 'Pediatrics',
    date: today,
    timeSlot: '11:15 AM',
    reason: 'Persistent night cough and wheezing evaluation',
    status: 'Checked In',
    notes: 'Checked in by father. Token T-03 issued.',
    fee: 800,
    createdAt: `${today}T09:50:00.000Z`
  },
  {
    id: 'APT-2005',
    patientId: 'PAT-1005',
    patientName: 'Farhan Akhtar Qureshi',
    patientPhone: '+91 98555 66778',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Vikram Malhotra',
    departmentName: 'Orthopedics',
    date: today,
    timeSlot: '11:45 AM',
    reason: 'Right knee stiffness post-jogging, MRI review requested',
    status: 'Scheduled',
    fee: 1000,
    createdAt: `${today}T09:00:00.000Z`
  },
  {
    id: 'APT-2006',
    patientId: 'PAT-1008',
    patientName: 'Pooja Hegde',
    patientPhone: '+91 98888 99001',
    doctorId: 'DOC-106',
    doctorName: 'Dr. Rohan Sengupta',
    departmentName: 'Dermatology',
    date: today,
    timeSlot: '02:30 PM',
    reason: 'Facial eczema flare-up and topical ointment refill',
    status: 'Scheduled',
    fee: 900,
    createdAt: `${today}T08:15:00.000Z`
  },
  {
    id: 'APT-2007',
    patientId: 'PAT-1011',
    patientName: 'Tanvi Saxena',
    patientPhone: '+91 99222 23456',
    doctorId: 'DOC-104',
    doctorName: 'Dr. Sunita Kulkarni',
    departmentName: 'Neurology',
    date: today,
    timeSlot: '10:45 AM',
    reason: 'Chronic throbbing headache and aura episodes',
    status: 'Scheduled',
    fee: 1500,
    createdAt: `${today}T07:45:00.000Z`
  },
  {
    id: 'APT-2008',
    patientId: 'PAT-1006',
    patientName: 'Kavita Menon',
    patientPhone: '+91 98666 77889',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Vikram Malhotra',
    departmentName: 'Orthopedics',
    date: getShiftedDate(-1),
    timeSlot: '11:00 AM',
    reason: 'Knee joint lubricant injection & physiotherapy progress',
    status: 'Completed',
    fee: 1000,
    createdAt: `${getShiftedDate(-2)}T10:00:00.000Z`
  },
  {
    id: 'APT-2009',
    patientId: 'PAT-1007',
    patientName: 'Vikramaditya Rao',
    patientPhone: '+91 98777 88990',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Arvind Swaminathan',
    departmentName: 'Cardiology',
    date: getShiftedDate(-1),
    timeSlot: '10:00 AM',
    reason: 'Annual cardiac stress test and echocardiogram consult',
    status: 'Completed',
    fee: 1200,
    createdAt: `${getShiftedDate(-3)}T11:00:00.000Z`
  },
  {
    id: 'APT-2010',
    patientId: 'PAT-1009',
    patientName: 'Gurpreet Singh Gill',
    patientPhone: '+91 98999 00112',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Nair',
    departmentName: 'General Medicine',
    date: getShiftedDate(-2),
    timeSlot: '09:00 AM',
    reason: 'Annual executive full body health check consultation',
    status: 'Completed',
    fee: 700,
    createdAt: `${getShiftedDate(-4)}T09:00:00.000Z`
  },
  {
    id: 'APT-2011',
    patientId: 'PAT-1010',
    patientName: 'Sneha Verma',
    patientPhone: '+91 99111 12345',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Nair',
    departmentName: 'General Medicine',
    date: getShiftedDate(-1),
    timeSlot: '01:00 PM',
    reason: 'Thyroid profile report discussion',
    status: 'Cancelled',
    notes: 'Patient requested reschedule due to out-of-station travel.',
    fee: 700,
    createdAt: `${getShiftedDate(-3)}T14:00:00.000Z`
  },
  {
    id: 'APT-2012',
    patientId: 'PAT-1013',
    patientName: 'Meenakshi Iyer',
    patientPhone: '+91 99444 45678',
    doctorId: 'DOC-107',
    doctorName: 'Dr. Ananya Roy',
    departmentName: 'Gynecology & Obstetrics',
    date: getShiftedDate(1),
    timeSlot: '11:00 AM',
    reason: 'Pelvic scan discussion and hormone balance evaluation',
    status: 'Scheduled',
    fee: 1100,
    createdAt: `${today}T08:00:00.000Z`
  },
  {
    id: 'APT-2013',
    patientId: 'PAT-1014',
    patientName: 'Rohan Shrivastav',
    patientPhone: '+91 99555 56789',
    doctorId: 'DOC-105',
    doctorName: 'Dr. Meera Iyer',
    departmentName: 'Pediatrics',
    date: getShiftedDate(1),
    timeSlot: '10:15 AM',
    reason: 'Allergy screening and asthma inhalation technique check',
    status: 'Scheduled',
    fee: 800,
    createdAt: `${today}T09:20:00.000Z`
  },
  {
    id: 'APT-2014',
    patientId: 'PAT-1015',
    patientName: 'Bhavna Kothari',
    patientPhone: '+91 99666 67890',
    doctorId: 'DOC-106',
    doctorName: 'Dr. Rohan Sengupta',
    departmentName: 'Dermatology',
    date: getShiftedDate(2),
    timeSlot: '03:15 PM',
    reason: 'Dermatitis patch test results',
    status: 'Scheduled',
    fee: 900,
    createdAt: `${today}T10:10:00.000Z`
  },
  {
    id: 'APT-2015',
    patientId: 'PAT-1017',
    patientName: 'Sushila Devi',
    patientPhone: '+91 99888 89012',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Vikram Malhotra',
    departmentName: 'Orthopedics',
    date: getShiftedDate(2),
    timeSlot: '12:00 PM',
    reason: 'Pre-surgery consultation for Total Knee Replacement',
    status: 'Scheduled',
    fee: 1000,
    createdAt: `${today}T10:30:00.000Z`
  }
];

export const initialQueue: QueueItem[] = [
  {
    id: 'Q-01',
    tokenNumber: 1,
    tokenDisplay: 'T-01',
    patientId: 'PAT-1002',
    patientName: 'Deepika Patil',
    doctorId: 'DOC-107',
    doctorName: 'Dr. Ananya Roy',
    departmentName: 'Gynecology & Obstetrics',
    appointmentId: 'APT-2002',
    arrivalTime: '09:10 AM',
    status: 'In Consultation',
    estimatedWaitMinutes: 0,
    calledAt: '09:55 AM',
    date: today
  },
  {
    id: 'Q-02',
    tokenNumber: 2,
    tokenDisplay: 'T-02',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Nair',
    departmentName: 'General Medicine',
    appointmentId: 'APT-2001',
    arrivalTime: '09:20 AM',
    status: 'Waiting',
    estimatedWaitMinutes: 10,
    date: today
  },
  {
    id: 'Q-03',
    tokenNumber: 3,
    tokenDisplay: 'T-03',
    patientId: 'PAT-1004',
    patientName: 'Ananya Joshi',
    doctorId: 'DOC-105',
    doctorName: 'Dr. Meera Iyer',
    departmentName: 'Pediatrics',
    appointmentId: 'APT-2004',
    arrivalTime: '09:48 AM',
    status: 'Waiting',
    estimatedWaitMinutes: 20,
    date: today
  },
  {
    id: 'Q-04',
    tokenNumber: 4,
    tokenDisplay: 'T-04',
    patientId: 'PAT-1018',
    patientName: 'Aryan Das',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Vikram Malhotra',
    departmentName: 'Orthopedics',
    arrivalTime: '10:05 AM',
    status: 'Waiting',
    estimatedWaitMinutes: 30,
    date: today
  },
  {
    id: 'Q-05',
    tokenNumber: 5,
    tokenDisplay: 'T-05',
    patientId: 'PAT-1011',
    patientName: 'Tanvi Saxena',
    doctorId: 'DOC-104',
    doctorName: 'Dr. Sunita Kulkarni',
    departmentName: 'Neurology',
    appointmentId: 'APT-2007',
    arrivalTime: '10:12 AM',
    status: 'Waiting',
    estimatedWaitMinutes: 15,
    date: today
  }
];

export const initialAdmissions: Admission[] = [
  {
    id: 'ADM-3001',
    patientId: 'PAT-1012',
    patientName: 'Mohammad Tariq',
    departmentName: 'Cardiology',
    attendingDoctorId: 'DOC-102',
    attendingDoctorName: 'Dr. Arvind Swaminathan',
    admissionDate: `${getShiftedDate(-3)} 14:00`,
    roomType: 'ICU',
    roomNumber: 'ICU-B',
    bedNumber: 'Bed-02',
    status: 'Admitted',
    initialDiagnosis: 'Unstable Angina, continuous hemodynamic monitoring required',
    dailyRate: 6500
  },
  {
    id: 'ADM-3002',
    patientId: 'PAT-1016',
    patientName: 'Devendra Chawla',
    departmentName: 'Orthopedics',
    attendingDoctorId: 'DOC-103',
    attendingDoctorName: 'Dr. Vikram Malhotra',
    admissionDate: `${getShiftedDate(-2)} 11:30`,
    roomType: 'Semi-Private',
    roomNumber: 'Ward-204',
    bedNumber: 'Bed-A',
    status: 'Admitted',
    initialDiagnosis: 'Acute Lumbar Radiculopathy with severe mobility restriction',
    dailyRate: 3200
  },
  {
    id: 'ADM-3003',
    patientId: 'PAT-1017',
    patientName: 'Sushila Devi',
    departmentName: 'Orthopedics',
    attendingDoctorId: 'DOC-103',
    attendingDoctorName: 'Dr. Vikram Malhotra',
    admissionDate: `${getShiftedDate(-1)} 16:00`,
    roomType: 'Private Room',
    roomNumber: 'Room-310',
    bedNumber: 'Bed-01',
    status: 'Admitted',
    initialDiagnosis: 'Pre-operative prep for Elective Left Total Knee Arthroplasty',
    dailyRate: 4500
  },
  {
    id: 'ADM-3004',
    patientId: 'PAT-1003',
    patientName: 'Ramesh Sundaram',
    departmentName: 'General Medicine',
    attendingDoctorId: 'DOC-101',
    attendingDoctorName: 'Dr. Rajesh Nair',
    admissionDate: `${getShiftedDate(-8)} 09:00`,
    dischargeDate: `${getShiftedDate(-4)} 12:00`,
    roomType: 'General Ward',
    roomNumber: 'Ward-101',
    bedNumber: 'Bed-05',
    status: 'Discharged',
    initialDiagnosis: 'Diabetic Ketoacidosis and acute dehydration',
    dischargeSummary: 'Blood sugars stabilized. Patient discharged with revised insulin titration and diet protocol.',
    dailyRate: 1800
  },
  {
    id: 'ADM-3005',
    patientId: 'PAT-1007',
    patientName: 'Vikramaditya Rao',
    departmentName: 'Cardiology',
    attendingDoctorId: 'DOC-102',
    attendingDoctorName: 'Dr. Arvind Swaminathan',
    admissionDate: `${getShiftedDate(-12)} 10:00`,
    dischargeDate: `${getShiftedDate(-9)} 15:30`,
    roomType: 'Private Room',
    roomNumber: 'Room-305',
    bedNumber: 'Bed-01',
    status: 'Discharged',
    initialDiagnosis: 'Post-coronary angiography observation',
    dischargeSummary: 'Diagnostic angiogram revealed patent stents. Normal ejection fraction 58%. Discharged home on dual antiplatelet therapy.',
    dailyRate: 4500
  }
];

export const initialBills: Bill[] = [
  {
    id: 'INV-4001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98111 22334',
    patientAddress: 'B-402, Sunshine Heights, Sanpada, Navi Mumbai',
    linkedType: 'Appointment',
    linkedId: 'APT-2001',
    invoiceDate: today,
    dueDate: today,
    items: [
      {
        id: 'ITM-1',
        description: 'OPD Specialist Consultation - Dr. Rajesh Nair',
        category: 'Consultation',
        quantity: 1,
        unitPrice: 700,
        total: 700
      },
      {
        id: 'ITM-2',
        description: 'Electrocardiogram (12-Lead ECG)',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 450,
        total: 450
      },
      {
        id: 'ITM-3',
        description: 'Random Blood Sugar (Glucometer Rapid)',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 150,
        total: 150
      }
    ],
    subtotal: 1300,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 5,
    taxAmount: 65,
    grandTotal: 1365,
    paidAmount: 1365,
    outstandingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    payments: [
      {
        id: 'PAY-101',
        date: `${today} 09:35`,
        amount: 1365,
        method: 'UPI',
        referenceNumber: 'UPI/4098231998/OKAXIS',
        receivedBy: 'Priya Deshmukh (Desk Admin)'
      }
    ],
    notes: 'Paid at desk via UPI QR scan.'
  },
  {
    id: 'INV-4002',
    patientId: 'PAT-1003',
    patientName: 'Ramesh Sundaram',
    patientPhone: '+91 98333 44556',
    patientAddress: 'Row House 4, Orchid Meadows, Kharghar',
    linkedType: 'Admission',
    linkedId: 'ADM-3004',
    invoiceDate: getShiftedDate(-4),
    dueDate: getShiftedDate(-4),
    items: [
      {
        id: 'ITM-1',
        description: 'General Ward Bed Charges (4 Days @ ₹1800/day)',
        category: 'Room Charges',
        quantity: 4,
        unitPrice: 1800,
        total: 7200
      },
      {
        id: 'ITM-2',
        description: 'Consultant Inpatient Care - Dr. Rajesh Nair',
        category: 'Consultation',
        quantity: 4,
        unitPrice: 800,
        total: 3200
      },
      {
        id: 'ITM-3',
        description: 'Arterial Blood Gas (ABG) & Diabetic Panel',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 2400,
        total: 2400
      },
      {
        id: 'ITM-4',
        description: 'IV Normal Saline & Infusion Line Sets',
        category: 'Pharmacy',
        quantity: 1,
        unitPrice: 1650,
        total: 1650
      },
      {
        id: 'ITM-5',
        description: 'Round-the-clock Nursing & Vitals Care',
        category: 'Nursing',
        quantity: 4,
        unitPrice: 600,
        total: 2400
      }
    ],
    subtotal: 16850,
    discountPercentage: 10,
    discountAmount: 1685,
    taxPercentage: 5,
    taxAmount: 758.25,
    grandTotal: 15923.25,
    paidAmount: 15923.25,
    outstandingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    payments: [
      {
        id: 'PAY-102',
        date: `${getShiftedDate(-4)} 12:45`,
        amount: 15923.25,
        method: 'Card',
        referenceNumber: 'TXN-HDFC-991208',
        receivedBy: 'Priya Deshmukh (Desk Admin)'
      }
    ],
    notes: 'Senior citizen discount of 10% applied. Settled by credit card upon discharge.'
  },
  {
    id: 'INV-4003',
    patientId: 'PAT-1012',
    patientName: 'Mohammad Tariq',
    patientPhone: '+91 99333 34567',
    patientAddress: '201, Crescent Court, Nerul East',
    linkedType: 'Admission',
    linkedId: 'ADM-3001',
    invoiceDate: today,
    dueDate: getShiftedDate(2),
    items: [
      {
        id: 'ITM-1',
        description: 'ICU Bed Charges with Multipara Monitoring (3 Days @ ₹6500)',
        category: 'Room Charges',
        quantity: 3,
        unitPrice: 6500,
        total: 19500
      },
      {
        id: 'ITM-2',
        description: 'Intensivist & Cardiologist Daily Rounds - Dr. Arvind Swaminathan',
        category: 'Consultation',
        quantity: 3,
        unitPrice: 2000,
        total: 6000
      },
      {
        id: 'ITM-3',
        description: 'Serial Troponin-I & Cardiac Enzymes Assay',
        category: 'Diagnostics',
        quantity: 2,
        unitPrice: 1800,
        total: 3600
      },
      {
        id: 'ITM-4',
        description: 'Continuous Oxygen & Syringe Pump Infusions',
        category: 'Procedure',
        quantity: 3,
        unitPrice: 1200,
        total: 3600
      }
    ],
    subtotal: 32700,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 5,
    taxAmount: 1635,
    grandTotal: 34335,
    paidAmount: 20000,
    outstandingBalance: 14335,
    paymentStatus: 'Partially Paid',
    paymentMethod: 'Cash',
    payments: [
      {
        id: 'PAY-103',
        date: `${getShiftedDate(-2)} 15:00`,
        amount: 20000,
        method: 'Cash',
        referenceNumber: 'CASH-REC-0098',
        receivedBy: 'Priya Deshmukh (Desk Admin)'
      }
    ],
    notes: 'Interim running bill. ₹20,000 paid as advance deposit. Balance ₹14,335 due at discharge.'
  },
  {
    id: 'INV-4004',
    patientId: 'PAT-1006',
    patientName: 'Kavita Menon',
    patientPhone: '+91 98666 77889',
    patientAddress: 'Villa 18, Royal Palms, Nerul',
    linkedType: 'Appointment',
    linkedId: 'APT-2008',
    invoiceDate: getShiftedDate(-1),
    dueDate: today,
    items: [
      {
        id: 'ITM-1',
        description: 'Orthopedic Consultation - Dr. Vikram Malhotra',
        category: 'Consultation',
        quantity: 1,
        unitPrice: 1000,
        total: 1000
      },
      {
        id: 'ITM-2',
        description: 'Intra-articular Knee Injection Procedure Fee',
        category: 'Procedure',
        quantity: 1,
        unitPrice: 1500,
        total: 1500
      },
      {
        id: 'ITM-3',
        description: 'Knee X-Ray Bilateral AP/Lateral Views',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 850,
        total: 850
      }
    ],
    subtotal: 3350,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 5,
    taxAmount: 167.5,
    grandTotal: 3517.5,
    paidAmount: 0,
    outstandingBalance: 3517.5,
    paymentStatus: 'Unpaid',
    payments: [],
    notes: 'Pending settlement by insurance TPA pre-authorization.'
  },
  {
    id: 'INV-4005',
    patientId: 'PAT-1002',
    patientName: 'Deepika Patil',
    patientPhone: '+91 98222 33445',
    patientAddress: 'Flat 12, Gulmohar Apartments, Sector 17, Vashi',
    linkedType: 'Appointment',
    linkedId: 'APT-2002',
    invoiceDate: today,
    dueDate: today,
    items: [
      {
        id: 'ITM-1',
        description: 'Obstetric Specialist Consultation - Dr. Ananya Roy',
        category: 'Consultation',
        quantity: 1,
        unitPrice: 1100,
        total: 1100
      },
      {
        id: 'ITM-2',
        description: 'Obstetric 2D Ultrasound Scan & Fetal Doppler',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 1800,
        total: 1800
      }
    ],
    subtotal: 2900,
    discountPercentage: 5,
    discountAmount: 145,
    taxPercentage: 5,
    taxAmount: 137.75,
    grandTotal: 2892.75,
    paidAmount: 2892.75,
    outstandingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    payments: [
      {
        id: 'PAY-104',
        date: `${today} 10:15`,
        amount: 2892.75,
        method: 'UPI',
        referenceNumber: 'UPI/3889104021/PAYTM',
        receivedBy: 'Priya Deshmukh (Desk Admin)'
      }
    ],
    notes: 'Paid at desk via UPI.'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'Patient Checked In',
    message: 'Aarav Sharma (PAT-1001) checked in for Dr. Rajesh Nair (OPD-101). Token T-02 issued.',
    timestamp: '10 minutes ago',
    type: 'queue',
    read: false,
    linkTab: 'queue'
  },
  {
    id: 'NOTIF-02',
    title: 'New Appointment Booked',
    message: 'Dr. Meera Iyer has a new pediatric booking with Ananya Joshi for 11:15 AM today.',
    timestamp: '25 minutes ago',
    type: 'appointment',
    read: false,
    linkTab: 'appointments'
  },
  {
    id: 'NOTIF-03',
    title: 'New Admission Registered',
    message: 'Sushila Devi (PAT-1017) admitted to Room-310 (Bed-01) under Dr. Vikram Malhotra.',
    timestamp: '1 hour ago',
    type: 'admission',
    read: false,
    linkTab: 'admissions'
  },
  {
    id: 'NOTIF-04',
    title: 'Payment Collected',
    message: 'Invoice INV-4001 settled for ₹1,365 via UPI (Ref: UPI/4098231998/OKAXIS).',
    timestamp: '1 hour ago',
    type: 'billing',
    read: true,
    linkTab: 'billing'
  },
  {
    id: 'NOTIF-05',
    title: 'Outstanding Bill Notice',
    message: 'Invoice INV-4004 for Kavita Menon (₹3,517.50) is pending settlement.',
    timestamp: '3 hours ago',
    type: 'billing',
    read: true,
    linkTab: 'billing'
  }
];
