import { BaseModel, PaymentMethod, Status } from './Common';

// Financial Transaction Types
export type TransactionType = 'income' | 'expense';

export interface FinancialTransaction extends BaseModel {
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  payment_method: PaymentMethod;
  patient_id?: string | null;
  patient_name?: string | null;
  consultation_id?: string | null;
  status: Status;
}

export interface FinancialTransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  payment_method: PaymentMethod;
  patient_id?: string;
  consultation_id?: string;
  notes?: string;
}

// Recurring Transaction Types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction extends BaseModel {
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string | null;
  day_of_month?: number | null;
  is_active: boolean;
}

export interface RecurringTransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  day_of_month?: number;
}

// Bill Types
export type BillStatus = 'pending' | 'paid' | 'overdue';

export interface Bill extends BaseModel {
  user_id: string;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  status: BillStatus;
  paid_at?: string | null;
  barcode?: string | null;
  notes?: string | null;
  
  // Computed attributes
  is_overdue?: boolean;
  days_until_due?: number;
}

export interface BillFormData {
  description: string;
  amount: number;
  due_date: string;
  category: string;
  barcode?: string;
  notes?: string;
}

// Financial Summary Types
export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_income: number;
  transaction_count: number;
}

export interface CategorySummary {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface FinancialDashboard {
  current_month: MonthlySummary;
  previous_month: MonthlySummary;
  yearly_summary: MonthlySummary[];
  top_categories: CategorySummary[];
  recent_transactions: FinancialTransaction[];
  upcoming_bills: Bill[];
  overdue_bills: Bill[];
}

// Common Financial Categories
export const INCOME_CATEGORIES = [
  'consulta',
  'procedimento',
  'exame',
  'retorno',
  'outros'
] as const;

export const EXPENSE_CATEGORIES = [
  'aluguel',
  'energia',
  'agua',
  'internet',
  'telefone',
  'material',
  'medicamentos',
  'equipamentos',
  'marketing',
  'contabilidade',
  'outros'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];