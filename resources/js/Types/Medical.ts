import { BaseModel, VitalSigns } from './Common';

// Anamnesis Types
export interface SocialHistory {
  is_smoker: boolean;
  cigarettes_per_day: number;
  is_alcohol_consumer: boolean;
  alcohol_frequency: string;
  is_drug_user: boolean;
  drug_details: string;
  physical_activity: string;
  occupation: string;
  diet_habits: string;
}

export interface SystemsReview {
  cardiovascular: string;
  respiratory: string;
  gastrointestinal: string;
  genitourinary: string;
  neurological: string;
  musculoskeletal: string;
  endocrine: string;
  hematologic: string;
  psychiatric: string;
  dermatological: string;
}

export interface PhysicalExam {
  general_appearance: string;
  vital_signs: VitalSigns;
  head_and_neck: string;
  cardiovascular: string;
  respiratory: string;
  abdomen: string;
  extremities: string;
  neurological: string;
  other: string;
}

export interface Anamnesis extends BaseModel {
  patient_id: string;
  doctor_id: string;
  anamnese_date: string;
  chief_complaint: string;
  illness_history: string;
  medical_history?: string[] | null;
  surgical_history?: string[] | null;
  family_history?: string | null;
  social_history?: SocialHistory | null;
  current_medications?: string[] | null;
  allergies?: string[] | null;
  systems_review?: SystemsReview | null;
  physical_exam?: PhysicalExam | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  additional_notes?: string | null;
}

// Note Types
export interface NoteAttachment {
  file_name: string;
  file_type: string;
  file_size: string;
  file_url: string;
  uploaded_at: string;
}

export interface Note extends BaseModel {
  patient_id: string;
  doctor_id: string;
  note_title: string;
  note_text: string;
  consultation_date?: string | null;
  note_type: string;
  is_important: boolean;
  attachments?: NoteAttachment[] | null;
  last_modified?: string | null;
  modified_by?: string | null;
  view_count: number;
}

// Consultation Types
export type ConsultationType = 'Presencial' | 'Telemedicina';
export type ConsultationStatus = 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';

export interface FollowUp {
  required: boolean;
  timeframe: string;
  instructions: string;
}

export interface Consultation extends BaseModel {
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  consultation_time: string;
  consultation_duration: number;
  consultation_type: ConsultationType;
  room_link?: string | null;
  status: ConsultationStatus;
  reason_for_visit: string;
  clinical_notes?: string | null;
  diagnosis?: string | null;
  procedures_performed?: string[] | null;
  referrals?: string[] | null;
  prescription_id?: string | null;
  exams_requested?: string[] | null;
  follow_up?: FollowUp | null;
  additional_notes?: string | null;
}

// Exam Types
export type ExamStatus = 'Solicitado' | 'Agendado' | 'Coletado' | 'Em Análise' | 'Concluído';
export type ExamUrgency = 'Normal' | 'Urgente' | 'Emergência';

export interface ExamRequestDetails {
  clinical_indication: string;
  urgency: ExamUrgency;
  required_preparation: string;
  additional_instructions: string;
}

export interface ExamResults {
  conclusion_text: string;
  is_abnormal: boolean;
  performed_by: string;
  performed_at: string;
  result_date?: string | null;
  reference_values: string;
  result_file_url: string;
}

export interface Exam extends BaseModel {
  patient_id: string;
  doctor_id: string;
  consultation_id?: string | null;
  exam_name: string;
  exam_type: string;
  exam_category: string;
  exam_date: string;
  status: ExamStatus;
  request_details?: ExamRequestDetails | null;
  results?: ExamResults | null;
  additional_notes?: string | null;
}

// Medication Types
export interface Medication extends BaseModel {
  medication_name: string;
  active_ingredient: string;
  dosage: string;
  form: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  side_effects?: string[] | null;
  contraindications?: string[] | null;
  interactions?: string[] | null;
  is_controlled: boolean;
  controlled_type?: string | null;
}

// Prescription Types
export type PrescriptionType = 'comum' | 'controlada' | 'especial' | 'antimicrobiano';
export type PrescriptionStatus = 'active' | 'Ativa' | 'Renovada' | 'Suspensa' | 'Concluída';

export interface PrescriptionMedication {
  nome: string;
  concentracao: string;
  posologia: string;
  observacao: string;
}

export interface PrescriptionMedicationLegacy {
  medication_name: string;
  dosage: string;
  form: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription extends BaseModel {
  patient_id: string;
  doctor_id: string;
  consultation_id?: string | null;
  titulo: string;
  tipo: PrescriptionType;
  data_emissao: string;
  expiration_date?: string | null;
  medicamentos?: PrescriptionMedication[] | null;
  medications?: PrescriptionMedicationLegacy[] | null;
  general_instructions?: string | null;
  status: PrescriptionStatus;
  pdf_url?: string | null;
  additional_notes?: string | null;
}

// Schedule Types
export type ScheduleSlotStatus = 'Disponível' | 'Agendado' | 'Bloqueado' | 'Concluído' | 'Cancelado';

export interface ScheduleSlot extends BaseModel {
  slot_id: string;
  patient_id?: string | null;
  doctor_id: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: ScheduleSlotStatus;
  patient_name?: string | null;
  patient_phone?: string | null;
  appointment_type?: string | null;
  appointment_reason?: string | null;
  notes?: string | null;
}

export interface WorkingHours {
  start_time: string;
  end_time: string;
  lunch_break_start: string;
  lunch_break_end: string;
}

export interface Schedule {
  doctor_id: string;
  schedule_date: string;
  is_working_day: boolean;
  working_hours: WorkingHours;
  slots: ScheduleSlot[];
}

// Medical Record Types
export interface HealthSummary {
  active_problem_list: string[];
  allergies: string[];
  medications: string[];
  vital_signs_timeline: VitalSigns[];
  immunizations: string[];
  recent_lab_results: string[];
}

export interface MedicalRecord extends BaseModel {
  patient_id: string;
  doctor_id: string;
  patient_info?: any | null;
  health_summary?: HealthSummary | null;
  consultation_ids?: string[] | null;
  anamnese_ids?: string[] | null;
  exam_ids?: string[] | null;
  prescription_ids?: string[] | null;
  last_updated?: string | null;
}