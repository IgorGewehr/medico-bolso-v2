import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Button,
  Avatar,
  InputAdornment,
  styled,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';

// Tipos
interface PatientBasicData {
  nome?: string;
  email?: string;
  telefone?: string;
  tipoSanguineo?: string;
  genero?: 'masculino' | 'feminino';
  dataNascimento?: string;
  endereco?: string;
  cpf?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  patientPhoto?: File | null;
}

interface PatientBasicInfoProps {
  formData?: PatientBasicData;
  updateFormData?: (data: Partial<PatientBasicData>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  hidePhotoUpload?: boolean;
}

// Estilos
const FormLabel = styled(Typography)(() => ({
  color: '#111E5A',
  fontWeight: 500,
  fontSize: '14px',
  marginBottom: '8px',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      border: '1px solid rgba(17, 30, 90, 0.30)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(17, 30, 90, 0.50)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#111E5A',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
  },
}));

const GenderButton = styled(Button)<{ selected?: boolean }>(({ selected }) => ({
  borderRadius: '999px',
  backgroundColor: selected ? '#E8EAF6' : '#FFFFFF',
  border: `1px solid ${selected ? '#111E5A' : 'rgba(17, 30, 90, 0.30)'}`,
  color: '#111E5A',
  textTransform: 'none',
  padding: '10px 16px',
  '&:hover': {
    backgroundColor: selected ? '#E8EAF6' : '#F9FAFB',
    borderColor: selected ? '#111E5A' : '#D1D5DB',
  },
  width: '100%',
  justifyContent: 'flex-start',
}));

const PhotoUploadButton = styled(Button)(() => ({
  borderRadius: '16px',
  border: '1px dashed rgba(17, 30, 90, 0.30)',
  backgroundColor: '#FFFFFF',
  color: '#111E5A',
  textTransform: 'none',
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  width: '100%',
  height: '100px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Estados brasileiros
const BRAZILIAN_STATES = [
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
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({
  formData = {},
  updateFormData,
  errors = {},
  disabled = false,
  hidePhotoUpload = false,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Funções de formatação
  const formatBirthDate = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.substring(0, 2);
    }
    if (digits.length >= 3) {
      formatted += '/' + digits.substring(2, 4);
    }
    if (digits.length >= 5) {
      formatted += '/' + digits.substring(4, 8);
    }
    return formatted;
  };

  const formatCPF = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits.substring(0, Math.min(3, digits.length));
    if (digits.length >= 4) {
      formatted += '.' + digits.substring(3, Math.min(6, digits.length));
    }
    if (digits.length >= 7) {
      formatted += '.' + digits.substring(6, Math.min(9, digits.length));
    }
    if (digits.length >= 10) {
      formatted += '-' + digits.substring(9, Math.min(11, digits.length));
    }
    return formatted;
  };

  const formatPhone = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let formatted = '';
    if (digits.length > 0) {
      formatted = '(' + digits.substring(0, Math.min(2, digits.length));
    }
    if (digits.length >= 3) {
      formatted += ') ' + digits.substring(2, Math.min(7, digits.length));
    }
    if (digits.length >= 8) {
      formatted += '-' + digits.substring(7, Math.min(11, digits.length));
    }
    return formatted;
  };

  const formatCEP = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits.substring(0, Math.min(5, digits.length));
    if (digits.length > 5) {
      formatted += '-' + digits.substring(5, Math.min(8, digits.length));
    }
    return formatted;
  };

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (updateFormData) {
      updateFormData({ [name]: value });
    }
  };

  const handleGenderChange = (gender: 'masculino' | 'feminino') => {
    if (updateFormData) {
      updateFormData({ genero: gender });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
          if (updateFormData) {
            updateFormData({ patientPhoto: file });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormattedChange = (formatter: (value: string) => string, field: keyof PatientBasicData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatter(e.target.value);
      if (updateFormData) {
        updateFormData({ [field]: formatted });
      }
    };

  return (
    <Box component="form" autoComplete="off" sx={{ p: 2 }}>
      {/* Foto do Paciente */}
      {!hidePhotoUpload && (
        <Box sx={{ mb: 3 }}>
          <FormLabel>Foto do Paciente</FormLabel>
          <input
            type="file"
            accept="image/*"
            id="foto-paciente"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
            disabled={disabled}
          />
          <label htmlFor="foto-paciente">
            {photoPreview ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={photoPreview}
                  alt="Foto do paciente"
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddPhotoAlternateIcon />}
                  disabled={disabled}
                  sx={{
                    borderRadius: '999px',
                    textTransform: 'none',
                    border: '1px solid rgba(17, 30, 90, 0.30)',
                    color: '#111E5A',
                  }}
                >
                  Alterar foto
                </Button>
              </Box>
            ) : (
              <PhotoUploadButton component="span" disabled={disabled}>
                <AddPhotoAlternateIcon sx={{ fontSize: 24, mb: 1 }} />
                <Typography variant="body2">
                  Clique para adicionar uma foto
                </Typography>
              </PhotoUploadButton>
            )}
          </label>
        </Box>
      )}

      <Grid container spacing={2}>
        {/* PRIMEIRA LINHA: Nome, Email e Telefone */}
        <Grid item xs={12} sm={4}>
          <FormLabel>Nome Completo*</FormLabel>
          <StyledTextField
            fullWidth
            id="nome"
            name="nome"
            placeholder="Digite o nome completo"
            value={formData?.nome || ''}
            onChange={handleChange}
            error={!!errors.nome}
            helperText={errors.nome}
            variant="outlined"
            disabled={disabled}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>Email</FormLabel>
          <StyledTextField
            fullWidth
            id="email"
            name="email"
            placeholder="contato@paciente.com"
            value={formData?.email || ''}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>Telefone</FormLabel>
          <StyledTextField
            fullWidth
            id="telefone"
            name="telefone"
            placeholder="(00) 00000-0000"
            value={formData?.telefone || ''}
            onChange={handleFormattedChange(formatPhone, 'telefone')}
            variant="outlined"
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* SEGUNDA LINHA: Tipo Sanguíneo, Gênero e Data de Nascimento */}
        <Grid item xs={12} sm={4}>
          <FormLabel>Tipo Sanguíneo</FormLabel>
          <FormControl fullWidth>
            <StyledTextField
              select
              id="tipoSanguineo"
              name="tipoSanguineo"
              value={formData?.tipoSanguineo || ''}
              onChange={handleChange}
              disabled={disabled}
            >
              <MenuItem value="" disabled>
                Selecione um...
              </MenuItem>
              {BLOOD_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </StyledTextField>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>Gênero</FormLabel>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <GenderButton
                onClick={() => handleGenderChange('masculino')}
                selected={formData?.genero === 'masculino'}
                startIcon={<MaleIcon />}
                disabled={disabled}
              >
                Masculino
              </GenderButton>
            </Grid>
            <Grid item xs={6}>
              <GenderButton
                onClick={() => handleGenderChange('feminino')}
                selected={formData?.genero === 'feminino'}
                startIcon={<FemaleIcon />}
                disabled={disabled}
              >
                Feminino
              </GenderButton>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>Data de Nascimento</FormLabel>
          <StyledTextField
            fullWidth
            id="dataNascimento"
            name="dataNascimento"
            placeholder="DD/MM/AAAA"
            value={formData?.dataNascimento || ''}
            onChange={handleFormattedChange(formatBirthDate, 'dataNascimento')}
            variant="outlined"
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* TERCEIRA LINHA: Endereço e CPF */}
        <Grid item xs={12} sm={6}>
          <FormLabel>Endereço</FormLabel>
          <StyledTextField
            fullWidth
            id="endereco"
            name="endereco"
            placeholder="Digite o endereço"
            value={formData?.endereco || ''}
            onChange={handleChange}
            variant="outlined"
            disabled={disabled}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormLabel>CPF</FormLabel>
          <StyledTextField
            fullWidth
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData?.cpf || ''}
            onChange={handleFormattedChange(formatCPF, 'cpf')}
            variant="outlined"
            disabled={disabled}
          />
        </Grid>

        {/* QUARTA LINHA: Cidade, Estado e CEP */}
        <Grid item xs={12} sm={4}>
          <FormLabel>Cidade</FormLabel>
          <StyledTextField
            fullWidth
            id="cidade"
            name="cidade"
            placeholder="Digite o nome da cidade"
            value={formData?.cidade || ''}
            onChange={handleChange}
            variant="outlined"
            disabled={disabled}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>Estado</FormLabel>
          <FormControl fullWidth>
            <StyledTextField
              select
              id="estado"
              name="estado"
              value={formData?.estado || ''}
              onChange={handleChange}
              disabled={disabled}
            >
              <MenuItem value="" disabled>
                Selecione um...
              </MenuItem>
              {BRAZILIAN_STATES.map((state) => (
                <MenuItem key={state.value} value={state.value}>
                  {state.label}
                </MenuItem>
              ))}
            </StyledTextField>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormLabel>CEP</FormLabel>
          <StyledTextField
            fullWidth
            id="cep"
            name="cep"
            placeholder="00000-000"
            value={formData?.cep || ''}
            onChange={handleFormattedChange(formatCEP, 'cep')}
            variant="outlined"
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientBasicInfo;