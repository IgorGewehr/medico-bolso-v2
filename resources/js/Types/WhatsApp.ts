import { BaseModel } from './Common';

// WhatsApp Connection Types
export type WhatsAppConnectionStatus = 'waiting_for_qr_scan' | 'connected' | 'disconnected' | 'error';

export interface WhatsAppDeviceInfo {
  platform: string;
  version: string;
}

export interface WhatsAppConnection extends BaseModel {
  user_id: string;
  session_id: string;
  status: WhatsAppConnectionStatus;
  connected: boolean;
  qr_code?: string | null;
  phone_number?: string | null;
  device_info?: WhatsAppDeviceInfo | null;
  connected_at?: string | null;
  expires_at?: string | null;
  
  // Computed attributes
  is_expired?: boolean;
}

// WhatsApp Message Types
export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio';
export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage extends BaseModel {
  user_id: string;
  to: string;
  message: string;
  type: WhatsAppMessageType;
  template_name?: string | null;
  template_params?: string[] | null;
  status: WhatsAppMessageStatus;
  message_id?: string | null;
  error?: any | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  
  // Computed attributes
  formatted_phone?: string;
}

export interface WhatsAppMessageFormData {
  to: string;
  message: string;
  type?: WhatsAppMessageType;
  template_name?: string;
  template_params?: string[];
}

// WhatsApp Reminder Types
export type WhatsAppReminderType = 'consultation' | 'exam' | 'medication';
export type WhatsAppReminderStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';

export interface WhatsAppReminder extends BaseModel {
  user_id: string;
  patient_id: string;
  consultation_id?: string | null;
  patient_name: string;
  patient_phone: string;
  consultation_date: string;
  consultation_time: string;
  reminder_type: WhatsAppReminderType;
  reminder_time: number; // Hours before
  status: WhatsAppReminderStatus;
  message_id?: string | null;
  sent_at?: string | null;
  error?: any | null;
  scheduled_for: string;
  
  // Computed attributes
  reminder_message?: string;
  hours_until_reminder?: number;
}

export interface WhatsAppReminderFormData {
  patient_id: string;
  consultation_id?: string;
  reminder_type: WhatsAppReminderType;
  reminder_time: number;
  custom_message?: string;
}

// WhatsApp Template Types
export interface WhatsAppTemplate {
  name: string;
  category: string;
  language: string;
  status: string;
  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[];
  };
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL';
  text: string;
  phone_number?: string;
  url?: string;
}

// WhatsApp API Response Types
export interface WhatsAppApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface WhatsAppQRCodeResponse {
  qr_code: string;
  expires_in: number;
}

export interface WhatsAppStatusResponse {
  connected: boolean;
  phone_number?: string;
  device_info?: WhatsAppDeviceInfo;
}

// WhatsApp Bulk Message Types
export interface WhatsAppBulkMessage {
  recipients: string[];
  message: string;
  type: WhatsAppMessageType;
  template_name?: string;
  template_params?: Record<string, string[]>;
}

export interface WhatsAppBulkMessageResult {
  total_sent: number;
  total_failed: number;
  sent_messages: WhatsAppMessage[];
  failed_messages: Array<{
    phone: string;
    error: string;
  }>;
}

// WhatsApp Analytics Types
export interface WhatsAppAnalytics {
  total_messages: number;
  sent_messages: number;
  delivered_messages: number;
  read_messages: number;
  failed_messages: number;
  delivery_rate: number;
  read_rate: number;
  monthly_stats: Array<{
    month: string;
    total_sent: number;
    delivery_rate: number;
  }>;
}