import { Student, AcademicYear } from '@/features/master-data/types';

export interface BreakdownItem {
  name: string;
  amount: number;
}

export interface AnnualFeeConfiguration {
  id: number;
  academic_year_id?: number | null;
  academic_year?: AcademicYear | null;
  education_level?: 'SD' | 'SMP' | 'SMA' | null;
  entry_year?: number | null;
  student_type?: 'NEW' | 'RETURNING' | null;
  student_id?: number | null;
  student?: Student | null;
  total_amount: number;
  breakdown_items?: BreakdownItem[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnualFeePayment {
  id: string;
  annual_fee_bill_id: string;
  amount: number;
  payment_method: 'CASH' | 'TRANSFER';
  payment_date: string;
  proof_url?: string | null;
  proof_full_url?: string | null;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified_by?: number | null;
  rejection_reason?: string | null;
  notes?: string | null;
  created_by: number;
  creator?: {
    id: number;
    name: string;
  };
  bill?: AnnualFeeBill;
  created_at: string;
  updated_at: string;
}

export interface AnnualFeeBill {
  id: string;
  student_id: number;
  student: Student;
  academic_year_id: number;
  academic_year: AcademicYear;
  student_type: 'NEW' | 'RETURNING';
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date?: string | null;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  snapshot_breakdown?: BreakdownItem[] | null;
  payments?: AnnualFeePayment[];
  created_at: string;
  updated_at: string;
}

export interface AnnualFeeBillsResponse {
  data: AnnualFeeBill[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    summary: {
      total_billed: number;
      total_paid: number;
      total_remaining: number;
    };
  };
}

export interface AnnualFeeReceiptData {
  payment: AnnualFeePayment;
  bill: AnnualFeeBill;
  student: Student;
  installment_number: number;
  total_installments: number;
  total_billed: number;
  total_paid: number;
  remaining_balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  breakdown: BreakdownItem[];
}
