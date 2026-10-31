-- ==============================================================================
-- MediDesk — Hospital Multi-User Management System Database Schema & RLS
-- PostgreSQL / Supabase Schema Definition
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'PATIENT',
        'DESK_ADMIN',
        'CHIEF_DOCTOR',
        'DOCTOR',
        'BILLING_HEAD',
        'HEAD_NURSE',
        'HOSPITAL_MANAGER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status_enum AS ENUM (
        'Scheduled',
        'Checked In',
        'In Progress',
        'Completed',
        'Cancelled',
        'Rescheduled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE queue_status_enum AS ENUM (
        'Waiting',
        'In Consultation',
        'Completed',
        'Skipped'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE admission_status_enum AS ENUM (
        'Admitted',
        'Discharged',
        'Transferred'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'Paid',
        'Partially Paid',
        'Unpaid'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_enum AS ENUM (
        'Low',
        'Medium',
        'High',
        'Urgent'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM (
        'Pending',
        'In Progress',
        'Completed',
        'Deferred'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USER PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'PATIENT',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    patient_id VARCHAR(50),
    staff_id VARCHAR(50),
    doctor_id VARCHAR(50),
    department_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY, -- e.g. PAT-1001
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact JSONB NOT NULL, -- {name, relationship, phone}
    blood_group VARCHAR(10) NOT NULL,
    allergies TEXT DEFAULT 'None',
    medical_history TEXT,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_by VARCHAR(100) DEFAULT 'DESK_ADMIN'
);

-- 5. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DEP-GEN
    name VARCHAR(150) NOT NULL,
    head_of_department VARCHAR(255) NOT NULL,
    room_floor VARCHAR(100) NOT NULL,
    contact_extension VARCHAR(50) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    color VARCHAR(50) DEFAULT 'blue',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DOC-101
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE RESTRICT,
    department_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    available_days TEXT[] NOT NULL,
    available_hours VARCHAR(100) NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 700.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    opd_room VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    is_chief_doctor BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. APT-2001
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status appointment_status_enum NOT NULL DEFAULT 'Scheduled',
    notes TEXT,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    booked_by VARCHAR(50) NOT NULL DEFAULT 'DESK_ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Database-level scheduling conflict guard:
    CONSTRAINT unique_doctor_slot_active UNIQUE (doctor_id, appointment_date, time_slot)
);

-- 8. PATIENT QUEUE TABLE
CREATE TABLE IF NOT EXISTS patient_queue (
    id VARCHAR(50) PRIMARY KEY,
    token_number INT NOT NULL,
    token_display VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
    arrival_time VARCHAR(50) NOT NULL,
    status queue_status_enum NOT NULL DEFAULT 'Waiting',
    estimated_wait_minutes INT NOT NULL DEFAULT 15,
    called_at VARCHAR(50),
    completed_at VARCHAR(50),
    queue_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 9. BEDS & ROOMS TABLE
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- General Ward, Semi-Private, Private Room, ICU
    daily_rate NUMERIC(10, 2) NOT NULL,
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    current_admission_id VARCHAR(50),
    current_patient_name VARCHAR(255),
    floor VARCHAR(100) NOT NULL,
    CONSTRAINT unique_room_bed UNIQUE (room_number, bed_number)
);

-- 10. ADMISSIONS TABLE
CREATE TABLE IF NOT EXISTS admissions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. ADM-3001
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    attending_doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    attending_doctor_name VARCHAR(255) NOT NULL,
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    room_type VARCHAR(50) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    status admission_status_enum NOT NULL DEFAULT 'Admitted',
    initial_diagnosis TEXT NOT NULL,
    discharge_summary TEXT,
    daily_rate NUMERIC(10, 2) NOT NULL
);

-- 11. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY, -- e.g. INV-4001
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_address TEXT,
    linked_type VARCHAR(50), -- Appointment, Admission, Walk-in
    linked_id VARCHAR(50),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status payment_status_enum NOT NULL DEFAULT 'Unpaid',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id VARCHAR(50) REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 13. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- Cash, Card, UPI
    reference_number VARCHAR(100),
    received_by VARCHAR(255) NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT true,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Simulated Demo'
);

-- 14. CLINICAL NOTES TABLE (Sensitive - Doctors & Chief Doctor only)
CREATE TABLE IF NOT EXISTS clinical_notes (
    id VARCHAR(50) PRIMARY KEY, -- e.g. CLN-5001
    appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE RESTRICT,
    doctor_name VARCHAR(255) NOT NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    prescriptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up_date DATE,
    follow_up_advice TEXT,
    is_confidential BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. NURSING TASKS TABLE
CREATE TABLE IF NOT EXISTS nursing_tasks (
    id VARCHAR(50) PRIMARY KEY, -- e.g. TSK-6001
    admission_id VARCHAR(50) REFERENCES admissions(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    ward_room VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    assigned_nurse_name VARCHAR(255) NOT NULL,
    priority task_priority_enum NOT NULL DEFAULT 'Medium',
    status task_status_enum NOT NULL DEFAULT 'Pending',
    due_time VARCHAR(50) NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. VITALS LOGS TABLE
CREATE TABLE IF NOT EXISTS vitals_logs (
    id VARCHAR(50) PRIMARY KEY, -- e.g. VIT-7001
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    admission_id VARCHAR(50) REFERENCES admissions(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by VARCHAR(255) NOT NULL,
    blood_pressure_systolic INT NOT NULL,
    blood_pressure_diastolic INT NOT NULL,
    pulse_rate INT NOT NULL,
    temperature NUMERIC(4, 1) NOT NULL,
    spo2 INT NOT NULL,
    respiratory_rate INT NOT NULL,
    notes TEXT
);

-- 17. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID,
    user_email VARCHAR(255) NOT NULL,
    user_role user_role_enum NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50)
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(50) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    target_role VARCHAR(50) DEFAULT 'ALL',
    target_user_id UUID,
    target_patient_id VARCHAR(50),
    link_tab VARCHAR(50)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract current authenticated user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role_enum AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. user_profiles RLS
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id OR current_user_role() = 'HOSPITAL_MANAGER');

CREATE POLICY "Managers can insert/update staff profiles" ON user_profiles
    FOR ALL USING (current_user_role() = 'HOSPITAL_MANAGER');

CREATE POLICY "Public user self-registration as Patient only" ON user_profiles
    FOR INSERT WITH CHECK (role = 'PATIENT');

-- 2. patients RLS
CREATE POLICY "Patients view own record only" ON patients
    FOR SELECT USING (
        user_id = auth.uid() OR
        current_user_role() IN ('DESK_ADMIN', 'CHIEF_DOCTOR', 'DOCTOR', 'BILLING_HEAD', 'HEAD_NURSE', 'HOSPITAL_MANAGER')
    );

CREATE POLICY "Staff or self can update patient contact" ON patients
    FOR UPDATE USING (
        user_id = auth.uid() OR
        current_user_role() IN ('DESK_ADMIN', 'HOSPITAL_MANAGER')
    );

-- 3. clinical_notes RLS (Strict: Doctors & Chief Doctor only; Patients and Desk Admins blocked)
CREATE POLICY "Doctors and Chief Doctor view clinical notes" ON clinical_notes
    FOR SELECT USING (
        current_user_role() IN ('DOCTOR', 'CHIEF_DOCTOR')
    );

CREATE POLICY "Assigned doctor can create/update clinical notes" ON clinical_notes
    FOR ALL USING (
        current_user_role() = 'DOCTOR' AND doctor_id = (SELECT doctor_id FROM user_profiles WHERE id = auth.uid())
    );

-- 4. appointments RLS
CREATE POLICY "Patients view own appointments only; staff view all" ON appointments
    FOR SELECT USING (
        patient_id = (SELECT patient_id FROM user_profiles WHERE id = auth.uid()) OR
        current_user_role() IN ('DESK_ADMIN', 'CHIEF_DOCTOR', 'DOCTOR', 'HEAD_NURSE', 'HOSPITAL_MANAGER')
    );

CREATE POLICY "Patient or desk admin can book appointments" ON appointments
    FOR INSERT WITH CHECK (
        current_user_role() IN ('PATIENT', 'DESK_ADMIN', 'HOSPITAL_MANAGER')
    );

-- 5. invoices RLS
CREATE POLICY "Patients view own invoices only; billing & managers view all" ON invoices
    FOR SELECT USING (
        patient_id = (SELECT patient_id FROM user_profiles WHERE id = auth.uid()) OR
        current_user_role() IN ('BILLING_HEAD', 'HOSPITAL_MANAGER', 'DESK_ADMIN')
    );

CREATE POLICY "Billing head and managers can create/update invoices" ON invoices
    FOR ALL USING (
        current_user_role() IN ('BILLING_HEAD', 'HOSPITAL_MANAGER')
    );

-- 6. audit_logs RLS (Only Manager can read audit trail)
CREATE POLICY "Only manager views audit logs" ON audit_logs
    FOR SELECT USING (current_user_role() = 'HOSPITAL_MANAGER');

CREATE POLICY "System logs audit entries" ON audit_logs
    FOR INSERT WITH CHECK (true);
