import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Skeleton,
  useTheme,
  Chip,
  IconButton,
  Button,
  InputAdornment,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
} from '@mui/material';
import {
  SearchRounded,
  PersonRounded,
  PhoneRounded,
  AccessTimeRounded,
  PersonAddRounded,
  SortRounded,
  TrendingUpRounded,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Patient {
  id: string;
  patientName?: string;
  phone?: string;
  email?: string;
  lastVisit?: string;
  createdAt?: string;
  patientPhotoUrl?: string;
}

interface MobilePatientsListCardProps {
  patients?: Patient[];
  loading?: boolean;
  onPatientClick?: (patientId: string) => void;
  onAddPatient?: () => void;
}

type SortBy = 'recent' | 'alphabetical' | 'lastVisit';

const MobilePatientsListCard: React.FC<MobilePatientsListCardProps> = ({
  patients = [],
  loading = false,
  onPatientClick,
  onAddPatient,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  const filteredPatients = patients
    ?.filter(patient => 
      patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.patientName || '').localeCompare(b.patientName || '');
        case 'lastVisit':
          const dateA = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
          const dateB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case 'recent':
        default:
          const createdA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const createdB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return createdB.getTime() - createdA.getTime();
      }
    })
    ?.slice(0, 10);

  const getPatientStatusColor = (patient: Patient): string => {
    if (!patient.lastVisit) return theme.palette.info.main;
    
    const daysSinceLastVisit = differenceInDays(new Date(), new Date(patient.lastVisit));
    if (daysSinceLastVisit <= 7) return theme.palette.success.main;
    if (daysSinceLastVisit <= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPatientStatusText = (patient: Patient): string => {
    if (!patient.lastVisit) return 'Novo';
    
    const daysSinceLastVisit = differenceInDays(new Date(), new Date(patient.lastVisit));
    if (daysSinceLastVisit <= 7) return 'Recente';
    if (daysSinceLastVisit <= 30) return 'Ativo';
    return 'Inativo';
  };

  const handleSortToggle = (): void => {
    const sortOptions: SortBy[] = ['recent', 'alphabetical', 'lastVisit'];
    const currentIndex = sortOptions.indexOf(sortBy);
    setSortBy(sortOptions[(currentIndex + 1) % sortOptions.length]);
  };

  const getSortLabel = (): string => {
    switch (sortBy) {
      case 'alphabetical':
        return 'A-Z';
      case 'lastVisit':
        return 'Última visita';
      case 'recent':
      default:
        return 'Recentes';
    }
  };

  const renderLoadingSkeleton = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
        {[...Array(3)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    </Card>
  );

  const renderEmptyState = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <PersonRounded sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Nenhum paciente encontrado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Comece adicionando seu primeiro paciente
        </Typography>
        <Button
          variant="contained"
          onClick={onAddPatient}
          startIcon={<PersonAddRounded />}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Adicionar Paciente
        </Button>
      </Box>
    </Card>
  );

  if (loading) return renderLoadingSkeleton();
  if (!patients?.length) return renderEmptyState();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Box sx={{ 
        p: 2, 
        pb: 1,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpRounded sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Pacientes Recentes
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setShowSearch(!showSearch)}
              sx={{ 
                color: showSearch ? theme.palette.primary.main : theme.palette.text.secondary,
                backgroundColor: showSearch ? theme.palette.primary.light : 'transparent',
              }}
            >
              <SearchRounded fontSize="small" />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={handleSortToggle}
              sx={{ color: theme.palette.text.secondary }}
            >
              <SortRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {showSearch && (
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              },
            }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip
            label={`${filteredPatients?.length || 0} pacientes`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            label={`Ordenado por: ${getSortLabel()}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      <List sx={{ p: 0 }}>
        {filteredPatients?.map((patient, index) => (
          <ListItem
            key={patient.id || index}
            onClick={() => onPatientClick?.(patient.id)}
            sx={{
              cursor: 'pointer',
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              borderBottom: index < filteredPatients.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
            }}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getPatientStatusColor(patient),
                      border: `2px solid ${theme.palette.background.paper}`,
                    }}
                  />
                }
              >
                <Avatar
                  src={patient.patientPhotoUrl}
                  alt={patient.patientName}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  {patient.patientName?.charAt(0) || 'P'}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {patient.patientName || 'Nome não informado'}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {patient.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneRounded sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                      <Typography variant="caption" color="text.secondary">
                        {patient.phone}
                      </Typography>
                    </Box>
                  )}
                  {patient.lastVisit && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeRounded sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(patient.lastVisit), 'dd/MM', { locale: ptBR })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
            />
            
            <ListItemSecondaryAction>
              <Chip
                label={getPatientStatusText(patient)}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: getPatientStatusColor(patient),
                  color: 'white',
                  minWidth: 60,
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            py: 1,
          }}
        >
          Ver Todos os Pacientes ({patients?.length || 0})
        </Button>
      </Box>
    </Card>
  );
};

export default MobilePatientsListCard;