import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Avatar,
  alpha,
  styled,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Tipos
interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  photoUrl?: string;
}

interface AppointmentData {
  id?: string;
  patientId: string;
  consultationDate: Date;
  consultationTime: string;
  consultationDuration: number;
  consultationType: 'Presencial' | 'Telemedicina';
  reasonForVisit: string;
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';
}

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AppointmentData) => Promise<void>;
  appointment?: AppointmentData;
  patients: Patient[];
  loading?: boolean;
  title?: string;
}

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '650px',
    width: '100%'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    '& fieldset': {
      borderColor: '#CED4DA',
    },
    '&:hover fieldset': {
      borderColor: '#B0B8C4',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    }
  },
  '& .MuiInputLabel-outlined': {
    transform: 'translate(14px, 16px) scale(1)',
  },
  '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    '& fieldset': {
      borderColor: '#CED4DA',
    },
    '&:hover fieldset': {
      borderColor: '#B0B8C4',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    }
  },
  '& .MuiInputLabel-outlined': {
    transform: 'translate(14px, 16px) scale(1)',
  },
  '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
  }
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    padding: '4px 16px',
    '& fieldset': {
      borderColor: '#CED4DA',
    },
    '&:hover fieldset': {
      borderColor: '#B0B8C4',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&.MuiButton-contained': {
    '&:hover': {
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    }
  },
  '&.MuiButton-outlined': {
    borderColor: '#CED4DA',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    }
  }
}));

const PatientItem = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
}));

const PatientAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  marginRight: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onClose,
  onSave,
  appointment,
  patients = [],
  loading = false,
  title,
}) => {
  const [formData, setFormData] = useState<AppointmentData>({
    patientId: appointment?.patientId || '',
    consultationDate: appointment?.consultationDate || new Date(),
    consultationTime: appointment?.consultationTime || '09:00',
    consultationDuration: appointment?.consultationDuration || 30,
    consultationType: appointment?.consultationType || 'Presencial',
    reasonForVisit: appointment?.reasonForVisit || '',
    status: appointment?.status || 'Agendada',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    patients.find(p => p.id === appointment?.patientId) || null
  );

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = new Date(e.target.value + 'T00:00:00');
    setFormData(prev => ({ ...prev, consultationDate: dateValue }));
    
    if (errors.consultationDate) {
      setErrors(prev => ({ ...prev, consultationDate: '' }));
    }
  };

  const handlePatientSelect = (event: any, newValue: Patient | null) => {
    setSelectedPatient(newValue);
    setFormData(prev => ({ 
      ...prev, 
      patientId: newValue?.id || '' 
    }));
    
    if (errors.patientId) {
      setErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Selecione um paciente';
    }

    if (!formData.consultationTime) {
      newErrors.consultationTime = 'Informe o horário da consulta';
    }

    if (!formData.consultationDate) {
      newErrors.consultationDate = 'Selecione uma data para a consulta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || saving) return;

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        ...(appointment?.id && { id: appointment.id }),
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Erro ao salvar agendamento. Tente novamente.' 
      }));
    } finally {
      setSaving(false);
    }
  };

  // Formatação da data para input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Render patient option
  const renderPatientOption = (props: any, option: Patient) => {
    const { key, ...otherProps } = props;
    
    return (
      <Box component="li" key={`patient-${option.id}`} {...otherProps}>
        <PatientItem>
          <PatientAvatar src={option.photoUrl}>
            {option.photoUrl ? '' : (option.name ? option.name.charAt(0).toUpperCase() : <PersonIcon />)}
          </PatientAvatar>
          <Box>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.phone ? `Contato: ${option.phone}` : 'Telefone não informado'}
              {option.age ? `, ${option.age} anos` : ''}
            </Typography>
          </Box>
        </PatientItem>
      </Box>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" fontWeight={600}>
            {title || (appointment ? 'Editar Consulta' : 'Nova Consulta')}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {errors.general && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: alpha('#f44336', 0.1), 
              borderRadius: 2,
              border: `1px solid ${alpha('#f44336', 0.3)}`
            }}>
              <Typography color="error">{errors.general}</Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            {/* Seleção de Paciente */}
            <Grid item xs={12}>
              <StyledAutocomplete
                value={selectedPatient}
                onChange={handlePatientSelect}
                options={patients}
                getOptionLabel={(option) => option.name || ''}
                loading={loading}
                renderOption={renderPatientOption}
                getOptionKey={(option) => option.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paciente"
                    required
                    error={!!errors.patientId}
                    helperText={errors.patientId}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Data */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Data"
                type="date"
                value={formatDateForInput(formData.consultationDate)}
                onChange={handleDateChange}
                required
                error={!!errors.consultationDate}
                helperText={errors.consultationDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Horário */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Horário"
                type="time"
                name="consultationTime"
                value={formData.consultationTime}
                onChange={handleChange}
                required
                error={!!errors.consultationTime}
                helperText={errors.consultationTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Duração */}
            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Duração</InputLabel>
                <Select
                  name="consultationDuration"
                  value={formData.consultationDuration}
                  onChange={handleSelectChange}
                  label="Duração"
                >
                  <MenuItem value={15}>15 minutos</MenuItem>
                  <MenuItem value={30}>30 minutos</MenuItem>
                  <MenuItem value={45}>45 minutos</MenuItem>
                  <MenuItem value={60}>1 hora</MenuItem>
                  <MenuItem value={90}>1h30</MenuItem>
                  <MenuItem value={120}>2 horas</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleSelectChange}
                  label="Tipo"
                >
                  <MenuItem value="Presencial">Presencial</MenuItem>
                  <MenuItem value="Telemedicina">Telemedicina</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Motivo */}
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Motivo da Consulta"
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleChange}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <AssignmentIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                  }
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <StyledFormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="Agendada">Agendada</MenuItem>
                  <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                  <MenuItem value="Concluída">Concluída</MenuItem>
                  <MenuItem value="Cancelada">Cancelada</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <ActionButton
            onClick={onClose}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cancelar
          </ActionButton>

          <ActionButton
            type="submit"
            variant="contained"
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Salvando...' : (appointment ? 'Atualizar' : 'Agendar')}
          </ActionButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default AppointmentModal;