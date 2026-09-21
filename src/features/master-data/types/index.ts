export interface Dormitory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DormitoriesResponse {
  data: Dormitory[];
}

export interface CreateDormitoryRequest {
  name: string;
}

export interface SingleDormitoryResponse {
  data: Dormitory;
}

export interface Classroom {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ClassroomsResponse {
  data: Classroom[];
}

export interface AcademicYear {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYearsResponse {
  data: AcademicYear[];
}

export interface Wallet {
  id: number;
  balance: number;
}

export interface StudentBill {
  id: string;
  student_id: number;
  period_month: number;
  period_year: number;
  amount_billed: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'PENDING';
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  payments?: Array<{
    id: string;
    status: string;
    total_paid_amount: number;
    created_at?: string;
  }>;
}

export interface Student {
  id: number;
  nis: string;
  name: string;
  class_id: number;
  dormitory_id: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  classroom?: Classroom;
  dormitory?: Dormitory;
  wallet?: Wallet;
  guardians?: Guardian[];
  bills?: StudentBill[];
  created_at: string;
  updated_at: string;
}

export interface StudentsResponse {
  data: {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SingleStudentResponse {
  data: Student;
}

export interface Guardian {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  pivot?: {
    student_id: number;
    user_id: number;
    relationship?: string;
    is_primary?: boolean | number;
  };
}

export interface GuardiansResponse {
  data: Guardian[];
}

export interface AssignGuardianRequest {
  user_id: number;
  relationship?: string;
  is_primary?: boolean;
}
