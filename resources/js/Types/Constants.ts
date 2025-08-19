// Application Constants and Enums

// Blood Types
export const BLOOD_TYPES = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência Bancária' },
] as const;

// Consultation Types
export const CONSULTATION_TYPES = [
  { value: 'Presencial', label: 'Presencial' },
  { value: 'Telemedicina', label: 'Telemedicina' },
] as const;

// Consultation Status
export const CONSULTATION_STATUS = [
  { value: 'Agendada', label: 'Agendada', color: 'info' },
  { value: 'Em Andamento', label: 'Em Andamento', color: 'warning' },
  { value: 'Concluída', label: 'Concluída', color: 'success' },
  { value: 'Cancelada', label: 'Cancelada', color: 'error' },
] as const;

// Schedule Slot Status
export const SCHEDULE_SLOT_STATUS = [
  { value: 'Disponível', label: 'Disponível', color: 'success' },
  { value: 'Agendado', label: 'Agendado', color: 'info' },
  { value: 'Bloqueado', label: 'Bloqueado', color: 'warning' },
  { value: 'Concluído', label: 'Concluído', color: 'default' },
  { value: 'Cancelado', label: 'Cancelado', color: 'error' },
] as const;

// Prescription Types
export const PRESCRIPTION_TYPES = [
  { value: 'comum', label: 'Comum' },
  { value: 'controlada', label: 'Controlada' },
  { value: 'especial', label: 'Especial' },
  { value: 'antimicrobiano', label: 'Antimicrobiano' },
] as const;

// Exam Status
export const EXAM_STATUS = [
  { value: 'Solicitado', label: 'Solicitado', color: 'info' },
  { value: 'Agendado', label: 'Agendado', color: 'warning' },
  { value: 'Coletado', label: 'Coletado', color: 'primary' },
  { value: 'Em Análise', label: 'Em Análise', color: 'secondary' },
  { value: 'Concluído', label: 'Concluído', color: 'success' },
] as const;

// Transaction Types
export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Receita', color: 'success' },
  { value: 'expense', label: 'Despesa', color: 'error' },
] as const;

// Recurring Frequencies
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
] as const;

// Bill Status
export const BILL_STATUS = [
  { value: 'pending', label: 'Pendente', color: 'warning' },
  { value: 'paid', label: 'Pago', color: 'success' },
  { value: 'overdue', label: 'Vencido', color: 'error' },
] as const;

// WhatsApp Message Status
export const WHATSAPP_MESSAGE_STATUS = [
  { value: 'pending', label: 'Pendente', color: 'info' },
  { value: 'sent', label: 'Enviado', color: 'primary' },
  { value: 'delivered', label: 'Entregue', color: 'success' },
  { value: 'read', label: 'Lido', color: 'success' },
  { value: 'failed', label: 'Falhou', color: 'error' },
] as const;

// WhatsApp Connection Status
export const WHATSAPP_CONNECTION_STATUS = [
  { value: 'waiting_for_qr_scan', label: 'Aguardando QR Code', color: 'info' },
  { value: 'connected', label: 'Conectado', color: 'success' },
  { value: 'disconnected', label: 'Desconectado', color: 'warning' },
  { value: 'error', label: 'Erro', color: 'error' },
] as const;

// Note Types
export const NOTE_TYPES = [
  { value: 'Rápida', label: 'Nota Rápida' },
  { value: 'Consulta', label: 'Consulta' },
  { value: 'Exame', label: 'Exame' },
  { value: 'Procedimento', label: 'Procedimento' },
  { value: 'Observação', label: 'Observação' },
] as const;

// Brazilian States
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;

// Time slots for appointments (15-minute intervals)
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return { value: time, label: time };
});

// Common durations for appointments
export const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
] as const;