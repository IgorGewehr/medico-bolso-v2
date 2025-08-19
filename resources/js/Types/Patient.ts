import { BaseModel, BloodType, Gender } from './Common';

export interface VitalSigns {
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface HealthInsurance {
  name: string;
  number: string;
  valid_until: string;
}

export interface Patient extends BaseModel {
  // Dados básicos (campos reais utilizados na aplicação)
  nome: string;
  data_nascimento: string;
  celular: string;
  fixo?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  tipo_sanguineo?: BloodType | null;

  // Campos legados mantidos para compatibilidade
  patient_name?: string | null;
  patient_age?: number | null;
  patient_gender?: Gender | null;
  patient_phone?: string | null;
  patient_email?: string | null;
  patient_address?: string | null;
  patient_cpf?: string | null;
  patient_rg?: string | null;

  // Dados médicos básicos
  blood_type?: BloodType | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  is_smoker: boolean;
  is_alcohol_consumer: boolean;
  allergies?: string[] | null;
  congenital_diseases?: string[] | null;
  chronic_diseases?: string[] | null;
  medications?: string[] | null;
  surgical_history?: string[] | null;
  family_history?: string[] | null;

  // Dados de saúde complementares
  vital_signs?: VitalSigns | null;

  // Dados de contato de emergência
  emergency_contact?: EmergencyContact | null;

  // Plano de saúde
  health_insurance?: HealthInsurance | null;

  // Campos de controle
  doctor_id: string;
  notes?: string | null;
  last_consultation_date?: string | null;
  favorite: boolean;

  // Computed attributes
  full_name?: string;
  phone?: string;
  age?: number;
}

export interface PatientFormData {
  nome: string;
  data_nascimento: string;
  celular: string;
  fixo?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  tipo_sanguineo?: BloodType;
  height_cm?: number;
  weight_kg?: number;
  is_smoker?: boolean;
  is_alcohol_consumer?: boolean;
  allergies?: string[];
  notes?: string;
}

export interface PatientFilters {
  search?: string;
  gender?: Gender;
  blood_type?: BloodType;
  favorite?: boolean;
  age_min?: number;
  age_max?: number;
}