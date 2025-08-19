// Common types used across the application

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface User extends BaseModel {
  name: string;
  email: string;
  email_verified_at?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export type Status = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Masculino' | 'Feminino' | 'Outro';