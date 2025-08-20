import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Fade,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
  EventAvailable as EventAvailableIcon,
  MedicalServices as MedicalServicesIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

// Tipos
interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  age?: number;
}

interface Consultation {
  id: string;
  patientId: string;
  patient?: Patient;
  date: Date | string;
  time: string;
  type: 'Presencial' | 'Telemedicina';
  reason?: string;
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  duration?: number;
}

interface MobileConsultationCardProps {
  consultation?: Consultation;
  loading?: boolean;
  showTimeProgress?: boolean;
  onViewConsultation?: (consultation: Consultation) => void;
  onViewPatient?: (patientId: string) => void;
  onViewAgenda?: () => void;
  variant?: 'next' | 'today' | 'upcoming';
}

const MobileConsultationCard: React.FC<MobileConsultationCardProps> = ({
  consultation,
  loading = false,
  showTimeProgress = true,
  onViewConsultation,
  onViewPatient,
  onViewAgenda,
  variant = 'next',
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  // Estado de carregamento
  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                mr: 2,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: '80%',
                  height: 16,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 1,
                  mb: 1,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  width: '60%',
                  height: 14,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 1,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Card>
    );
  }

  // Estado sem consultas
  if (!consultation) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <CalendarTodayIcon
              sx={{ fontSize: 32, color: theme.palette.primary.main }}
            />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Nenhuma consulta agendada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Você não tem consultas marcadas para hoje
          </Typography>
          <Button
            variant="contained"
            onClick={onViewAgenda}
            startIcon={<EventAvailableIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Ver Agenda
          </Button>
        </Box>
      </Card>
    );
  }

  // Formatação de data
  const formatDate = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    if (dateObj.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  };

  // Cores por status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento':
        return theme.palette.success.main;
      case 'Agendada':
        return theme.palette.info.main;
      case 'Cancelada':
        return theme.palette.error.main;
      case 'Concluída':
        return theme.palette.success.light;
      default:
        return theme.palette.text.secondary;
    }
  };

  const patient = consultation.patient;
  const consultationDate = formatDate(consultation.date);
  const statusColor = getStatusColor(consultation.status);

  return (
    <Fade in timeout={300}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          background:
            variant === 'next'
              ? 'linear-gradient(135deg, #1852FE 0%, #4285F4 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          color: variant === 'next' ? 'white' : 'inherit',
          position: 'relative',
        }}
      >
        {/* Pattern Background para variante next */}
        {variant === 'next' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            }}
          />
        )}

        <Box sx={{ p: 2, position: 'relative' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  opacity: variant === 'next' ? 0.8 : 0.6,
                  fontSize: '0.75rem',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {variant === 'next' ? 'Próxima consulta' : 'Consulta'}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {consultationDate}
              </Typography>
            </Box>

            <Chip
              label={consultation.status}
              size="small"
              sx={{
                backgroundColor:
                  variant === 'next'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(statusColor, 0.1),
                color: variant === 'next' ? 'white' : statusColor,
                fontWeight: 600,
                fontSize: '0.75rem',
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            />
          </Box>

          {/* Progress bar para consultas de hoje */}
          {showTimeProgress && variant === 'next' && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={65} // Valor fictício para demonstração
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              />
            </Box>
          )}

          {/* Patient info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={patient?.photoUrl}
              alt={patient?.name}
              sx={{
                width: 48,
                height: 48,
                border:
                  variant === 'next'
                    ? '3px solid rgba(255, 255, 255, 0.3)'
                    : `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                mr: 2,
                backgroundColor:
                  variant === 'next'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(theme.palette.primary.main, 0.1),
              }}
            >
              {patient?.name?.charAt(0) || 'P'}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {patient?.name || 'Paciente'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      opacity: 0.9,
                      fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {consultation.time}
                  </Typography>
                </Box>

                {consultation.type === 'Telemedicina' && (
                  <VideoCallIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                )}
              </Box>
            </Box>

            <IconButton
              onClick={() => setShowDetails(!showDetails)}
              sx={{
                color: variant === 'next' ? 'white' : 'inherit',
                opacity: 0.8,
              }}
            >
              {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {/* Quick actions */}
          <Box sx={{ display: 'flex', gap: 1, mb: showDetails ? 2 : 0 }}>
            <Button
              variant="contained"
              onClick={() => onViewConsultation?.(consultation)}
              sx={{
                flex: 1,
                borderRadius: 2,
                backgroundColor:
                  variant === 'next'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : alpha(theme.palette.primary.main, 0.1),
                color: variant === 'next' ? 'white' : theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                backdropFilter: variant === 'next' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor:
                    variant === 'next'
                      ? 'rgba(255, 255, 255, 0.3)'
                      : alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              Ver Consulta
            </Button>

            <Button
              variant="contained"
              onClick={() => onViewPatient?.(consultation.patientId)}
              sx={{
                flex: 1,
                borderRadius: 2,
                backgroundColor:
                  variant === 'next'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : theme.palette.primary.main,
                color:
                  variant === 'next' ? theme.palette.primary.main : 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                '&:hover': {
                  backgroundColor: variant === 'next' ? 'white' : theme.palette.primary.dark,
                },
              }}
            >
              Ver Paciente
            </Button>
          </Box>

          {/* Additional details */}
          <Collapse in={showDetails}>
            <Divider
              sx={{
                my: 2,
                borderColor:
                  variant === 'next'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : theme.palette.divider,
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {consultation.reason && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalServicesIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    <strong>Motivo:</strong> {consultation.reason}
                  </Typography>
                </Box>
              )}

              {patient?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {patient.phone}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {consultation.type === 'Telemedicina'
                    ? 'Consulta por telemedicina'
                    : 'Consulta presencial'}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Card>
    </Fade>
  );
};

export default MobileConsultationCard;