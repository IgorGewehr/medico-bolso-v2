import { BaseModel } from './Common';

export interface User extends BaseModel {
  name: string;
  email: string;
  email_verified_at?: string | null;
  avatar?: string | null;
  phone?: string | null;
  
  // Doctor specific fields
  crm?: string | null;
  specialty?: string | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  
  // Settings
  timezone?: string;
  locale?: string;
  notifications_enabled?: boolean;
  whatsapp_enabled?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  crm?: string;
  specialty?: string;
  clinic_name?: string;
  clinic_address?: string;
}

export interface UserPreferences {
  timezone: string;
  locale: string;
  notifications_enabled: boolean;
  whatsapp_enabled: boolean;
  reminder_default_hours: number;
  consultation_default_duration: number;
}