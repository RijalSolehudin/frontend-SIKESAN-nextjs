import { Student } from '@/features/master-data/types';

export interface TopUpRequest {
  id: string | number;
  student_id: number;
  requested_amount: number;
  payment_method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by: number | null;
  student?: Student;
  created_at: string;
  updated_at: string;
}

export interface TopUpRequestsResponse {
  data: {
    data: TopUpRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SppBill {
  id: string;
  student_id: number;
  period_month: number;
  period_year: number;
  amount_billed: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'PENDING';
  created_at: string;
  updated_at: string;
}

export interface SppBillsResponse {
  data: SppBill[];
}

export interface SppPayment {
  id: string;
  total_paid_amount: number;
  payment_method: string;
  payment_date: string;
  created_at: string;
}

export interface InfaqCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface LedgerTransaction {
  date: string;
  type: string;
  description: string;
  amount: number;
  reference_id: string;
  is_debit: boolean;
}

export interface LedgerResponse {
  data: {
    data: LedgerTransaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SppPaymentVerification {
  id: string;
  total_paid_amount: number;
  payment_method: string;
  payment_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proof_url: string | null;
  proof_full_url?: string | null;
  sender_bank_name: string | null;
  sender_account_holder: string | null;
  notes: string | null;
  rejection_reason: string | null;
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    username: string;
    phone?: string;
  };
  verifier?: {
    id: number;
    name: string;
    username: string;
  };
  bills?: Array<SppBill & {
    student?: Student;
    pivot?: {
      allocated_amount: number;
    };
  }>;
}

export interface SppVerificationsResponse {
  message: string;
  data: {
    data: SppPaymentVerification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  meta?: {
    pending_count: number;
  };
}

export interface SubmitSppPaymentRequest {
  student_id: number;
  bill_ids: string[];
  total_amount: number;
  proof: File;
  sender_bank_name?: string;
  sender_account_holder?: string;
  notes?: string;
}

export interface SppReceiptBillItem {
  id: string;
  period_month: number;
  month_name: string;
  period_year: string | number;
  amount_billed: number;
  allocated_amount: number;
}

export interface SppReceiptData {
  receipt_number: string;
  payment_id: string;
  payment_date: string;
  payment_time: string;
  total_paid_amount: number;
  payment_method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  institution: {
    name: string;
    sub_name: string;
    address: string;
    phone: string;
    email: string;
  };
  student: {
    id: number;
    nis: string;
    name: string;
    gender?: string | null;
    classroom: string;
    dormitory: string;
  } | null;
  guardian: {
    id: number;
    name: string;
    relationship: string;
    phone: string;
  } | null;
  bills: SppReceiptBillItem[];
  creator?: {
    id: number;
    name: string | null;
    username: string;
  } | null;
  verifier?: {
    id: number;
    name: string;
    username: string;
    verified_at: string | null;
  } | null;
}

export interface SppReceiptResponse {
  message: string;
  data: SppReceiptData;
}

