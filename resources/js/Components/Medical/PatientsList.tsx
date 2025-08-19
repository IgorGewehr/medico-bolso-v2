"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Button,
    Skeleton,
    useTheme,
    alpha,
    Grid,
    ButtonGroup,
    Badge,
    Tooltip,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    SelectChangeEvent
} from '@mui/material';

import {
    Search as SearchIcon,
    ChevronRight as ChevronRightIcon,
    FilterList as FilterListIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    VideoCall as VideoCallIcon,
    Close as CloseIcon,
    CalendarToday as CalendarTodayIcon,
    EventNote as EventNoteIcon,
    EventAvailable as EventAvailableIcon,
    Person as PersonIcon,
    Event as EventIcon,
    ScheduleSend as ScheduleSendIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    Timeline as TimelineIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

import { format, isToday, isPast, isValid, parse, differenceInYears, formatDistance, isAfter, isBefore, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Patient, PatientFilters } from '../../Types/Patient';
import { Consultation, ConsultationStatus } from '../../Types/Medical';
import { Gender, BloodType } from '../../Types/Common';

// View options for filtering
const VIEW_OPTIONS = {
    ALL: 'all',
    TODAY: 'today',
    UPCOMING: 'upcoming',
    FAVORITES: 'favorites'
} as const;

type ViewOption = typeof VIEW_OPTIONS[keyof typeof VIEW_OPTIONS];

// Status configuration
const STATUS_OPTIONS = [
    { label: 'Pendente', value: 'pendente', icon: <EventNoteIcon fontSize="small" />, color: '#757575' },
    { label: 'Reagendado', value: 'reagendado', icon: <ScheduleSendIcon fontSize="small" />, color: '#9C27B0' },
    { label: 'Primeira Consulta', value: 'primeira consulta', icon: <AddCircleOutlineIcon fontSize="small" />, color: '#2196F3' },
    { label: 'Reag. Pendente', value: 'reag. pendente', icon: <ScheduleSendIcon fontSize="small" />, color: '#FF9800' },
];

// Extended patient interface for legacy compatibility
interface ExtendedPatient extends Patient {
    patientName?: string;
    patientAge?: number;
    patientGender?: Gender;
    patientPhone?: string;
    patientEmail?: string;
    lastConsultationDate?: string;
    nextConsultationDate?: string;
    consultationStatus?: string;
    bloodType?: BloodType;
    chronicDiseases?: string[];
    consultationCount?: number;
}

interface PatientsListProps {
    patients?: ExtendedPatient[];
    consultations?: Consultation[];
    loading?: boolean;
    onPatientClick?: (patient: ExtendedPatient) => void;
    onPatientSelect?: (patientId: string) => void;
    showFilters?: boolean;
    showSearch?: boolean;
    maxHeight?: string | number;
}

interface SortConfig {
    field: keyof ExtendedPatient;
    direction: 'asc' | 'desc';
}

interface StatusChipProps {
    status: string;
    onClick?: () => void;
    size?: 'small' | 'medium';
}

// Memoized StatusChip component
const StatusChip = React.memo<StatusChipProps>(({ status, onClick, size = 'small' }) => {
    const getStatusConfig = useCallback((status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return { bgColor: '#F5F5F5', color: '#757575', icon: <EventNoteIcon fontSize="inherit" /> };
            case 'reagendado':
                return { bgColor: '#F3E5F5', color: '#9C27B0', icon: <ScheduleSendIcon fontSize="inherit" /> };
            case 'primeira consulta':
                return { bgColor: '#E3F2FD', color: '#2196F3', icon: <AddCircleOutlineIcon fontSize="inherit" /> };
            case 'reag. pendente':
                return { bgColor: '#FFF8E1', color: '#FF9800', icon: <ScheduleSendIcon fontSize="inherit" /> };
            default:
                return { bgColor: '#F5F5F5', color: '#757575', icon: <EventNoteIcon fontSize="inherit" /> };
        }
    }, []);

    const config = getStatusConfig(status);

    return (
        <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size={size}
            onClick={onClick}
            sx={{
                backgroundColor: config.bgColor,
                color: config.color,
                border: 'none',
                cursor: onClick ? 'pointer' : 'default',
                '& .MuiChip-icon': {
                    color: config.color
                }
            }}
            icon={config.icon}
        />
    );
});

StatusChip.displayName = 'StatusChip';

const PatientsList: React.FC<PatientsListProps> = ({
    patients: initialPatients = [],
    consultations = [],
    loading = false,
    onPatientClick,
    onPatientSelect,
    showFilters = true,
    showSearch = true,
    maxHeight = '600px'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Basic states
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<ExtendedPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<ExtendedPatient[]>([]);
    const [viewOption, setViewOption] = useState<ViewOption>(VIEW_OPTIONS.ALL);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'nome',
        direction: 'asc'
    });

    // Filter states
    const [filters, setFilters] = useState<PatientFilters>({
        search: '',
        gender: undefined,
        blood_type: undefined,
        favorite: undefined,
        age_min: undefined,
        age_max: undefined
    });

    // Dialog states
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);

    // Initialize patients data
    useEffect(() => {
        if (initialPatients) {
            setPatients(initialPatients);
        }
    }, [initialPatients]);

    // Calculate patient age
    const calculateAge = useCallback((birthDate: string): number => {
        if (!birthDate) return 0;
        try {
            const birth = new Date(birthDate);
            if (!isValid(birth)) return 0;
            return differenceInYears(new Date(), birth);
        } catch {
            return 0;
        }
    }, []);

    // Get patient's next consultation
    const getNextConsultation = useCallback((patientId: string): Consultation | null => {
        if (!consultations || consultations.length === 0) return null;
        
        const patientConsultations = consultations
            .filter(consultation => consultation.patient_id === patientId)
            .filter(consultation => {
                const consultDate = new Date(consultation.consultation_date);
                return isValid(consultDate) && isAfter(consultDate, new Date());
            })
            .sort((a, b) => new Date(a.consultation_date).getTime() - new Date(b.consultation_date).getTime());

        return patientConsultations[0] || null;
    }, [consultations]);

    // Enhanced patient data with consultation info
    const enhancedPatients = useMemo(() => {
        return patients.map(patient => {
            const nextConsultation = getNextConsultation(patient.id);
            const patientConsultations = consultations.filter(c => c.patient_id === patient.id);
            
            return {
                ...patient,
                patientName: patient.nome || patient.patient_name,
                patientAge: calculateAge(patient.data_nascimento || ''),
                patientGender: patient.patient_gender,
                patientPhone: patient.celular || patient.patient_phone,
                patientEmail: patient.email || patient.patient_email,
                nextConsultationDate: nextConsultation?.consultation_date,
                consultationStatus: nextConsultation?.status || 'pendente',
                consultationCount: patientConsultations.length,
                bloodType: patient.tipo_sanguineo || patient.blood_type
            };
        });
    }, [patients, consultations, calculateAge, getNextConsultation]);

    // Filter and search logic
    const applyFilters = useCallback(() => {
        let filtered = enhancedPatients;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(patient =>
                (patient.patientName || '').toLowerCase().includes(search) ||
                (patient.patientPhone || '').includes(search) ||
                (patient.patientEmail || '').toLowerCase().includes(search)
            );
        }

        // View option filter
        switch (viewOption) {
            case VIEW_OPTIONS.TODAY:
                filtered = filtered.filter(patient => {
                    if (!patient.nextConsultationDate) return false;
                    return isToday(new Date(patient.nextConsultationDate));
                });
                break;
            case VIEW_OPTIONS.UPCOMING:
                filtered = filtered.filter(patient => {
                    if (!patient.nextConsultationDate) return false;
                    const consultDate = new Date(patient.nextConsultationDate);
                    return isAfter(consultDate, new Date());
                });
                break;
            case VIEW_OPTIONS.FAVORITES:
                filtered = filtered.filter(patient => patient.favorite);
                break;
        }

        // Additional filters
        if (filters.gender) {
            filtered = filtered.filter(patient => patient.patientGender === filters.gender);
        }

        if (filters.blood_type) {
            filtered = filtered.filter(patient => patient.bloodType === filters.blood_type);
        }

        if (filters.favorite !== undefined) {
            filtered = filtered.filter(patient => patient.favorite === filters.favorite);
        }

        if (filters.age_min !== undefined) {
            filtered = filtered.filter(patient => (patient.patientAge || 0) >= filters.age_min!);
        }

        if (filters.age_max !== undefined) {
            filtered = filtered.filter(patient => (patient.patientAge || 0) <= filters.age_max!);
        }

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.field] || '';
            const bValue = b[sortConfig.field] || '';
            
            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredPatients(filtered);
    }, [enhancedPatients, searchTerm, viewOption, filters, sortConfig]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleViewOptionChange = (option: ViewOption) => {
        setViewOption(option);
    };

    const handlePatientClick = (patient: ExtendedPatient) => {
        if (onPatientClick) {
            onPatientClick(patient);
        } else if (onPatientSelect) {
            onPatientSelect(patient.id);
        }
    };

    const handleFavoriteToggle = async (patient: ExtendedPatient, event: React.MouseEvent) => {
        event.stopPropagation();
        
        // Update local state immediately for better UX
        setPatients(prev => 
            prev.map(p => 
                p.id === patient.id 
                    ? { ...p, favorite: !p.favorite }
                    : p
            )
        );

        // Here you would make the API call to update the favorite status
        try {
            // await updatePatientFavorite(patient.id, !patient.favorite);
            console.log('Toggle favorite for patient:', patient.id);
        } catch (error) {
            // Revert on error
            setPatients(prev => 
                prev.map(p => 
                    p.id === patient.id 
                        ? { ...p, favorite: patient.favorite }
                        : p
                )
            );
        }
    };

    const handleSort = (field: keyof ExtendedPatient) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                            <Skeleton variant="text" width={120} height={20} />
                            <Skeleton variant="text" width={80} height={16} />
                        </Box>
                    </Box>
                </TableCell>
                {!isMobile && (
                    <>
                        <TableCell><Skeleton variant="text" width={60} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                        <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    </>
                )}
                <TableCell>
                    <Skeleton variant="circular" width={32} height={32} />
                </TableCell>
            </TableRow>
        ));
    };

    const renderPatientRow = (patient: ExtendedPatient) => {
        const nextConsultation = getNextConsultation(patient.id);
        const age = patient.patientAge || calculateAge(patient.data_nascimento || '');
        
        return (
            <TableRow 
                key={patient.id}
                hover
                onClick={() => handlePatientClick(patient)}
                sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    }
                }}
            >
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge
                            badgeContent={patient.consultationCount || 0}
                            color="primary"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                            <Avatar 
                                sx={{ 
                                    width: 40, 
                                    height: 40,
                                    bgcolor: patient.patientGender === 'Feminino' ? '#E91E63' : '#2196F3'
                                }}
                            >
                                {patient.patientGender === 'Feminino' ? <FemaleIcon /> : <MaleIcon />}
                            </Avatar>
                        </Badge>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {patient.patientName || 'Nome não informado'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {age} anos • {patient.patientPhone || 'Telefone não informado'}
                            </Typography>
                        </Box>
                    </Box>
                </TableCell>
                
                {!isMobile && (
                    <>
                        <TableCell>
                            <Typography variant="body2">
                                {patient.bloodType || '-'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            {nextConsultation ? (
                                <Typography variant="body2">
                                    {format(new Date(nextConsultation.consultation_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Sem agendamento
                                </Typography>
                            )}
                        </TableCell>
                        <TableCell>
                            <StatusChip 
                                status={patient.consultationStatus || 'pendente'}
                                onClick={() => {
                                    setSelectedPatient(patient);
                                    setStatusDialogOpen(true);
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" color="text.secondary">
                                {patient.consultationCount || 0} consultas
                            </Typography>
                        </TableCell>
                    </>
                )}
                
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={(e) => handleFavoriteToggle(patient, e)}
                            color={patient.favorite ? 'error' : 'default'}
                        >
                            {patient.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                        <IconButton size="small">
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Card 
            elevation={0}
            sx={{ 
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Lista de Pacientes
                    </Typography>
                    
                    {showSearch && (
                        <TextField
                            fullWidth
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                    )}

                    {showFilters && (
                        <Box sx={{ mb: 2 }}>
                            <ButtonGroup size="small" variant="outlined">
                                <Button
                                    variant={viewOption === VIEW_OPTIONS.ALL ? 'contained' : 'outlined'}
                                    onClick={() => handleViewOptionChange(VIEW_OPTIONS.ALL)}
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={viewOption === VIEW_OPTIONS.TODAY ? 'contained' : 'outlined'}
                                    onClick={() => handleViewOptionChange(VIEW_OPTIONS.TODAY)}
                                    startIcon={<CalendarTodayIcon />}
                                >
                                    Hoje
                                </Button>
                                <Button
                                    variant={viewOption === VIEW_OPTIONS.UPCOMING ? 'contained' : 'outlined'}
                                    onClick={() => handleViewOptionChange(VIEW_OPTIONS.UPCOMING)}
                                    startIcon={<EventAvailableIcon />}
                                >
                                    Próximos
                                </Button>
                                <Button
                                    variant={viewOption === VIEW_OPTIONS.FAVORITES ? 'contained' : 'outlined'}
                                    onClick={() => handleViewOptionChange(VIEW_OPTIONS.FAVORITES)}
                                    startIcon={<FavoriteIcon />}
                                >
                                    Favoritos
                                </Button>
                            </ButtonGroup>
                        </Box>
                    )}
                </Box>

                {/* Table */}
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        flexGrow: 1,
                        maxHeight: maxHeight,
                        border: '1px solid',
                        borderColor: theme.palette.divider 
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Button 
                                        variant="text" 
                                        onClick={() => handleSort('nome')}
                                        startIcon={<PersonIcon />}
                                    >
                                        Paciente
                                    </Button>
                                </TableCell>
                                {!isMobile && (
                                    <>
                                        <TableCell>Tipo Sanguíneo</TableCell>
                                        <TableCell>Próxima Consulta</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Histórico</TableCell>
                                    </>
                                )}
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                renderSkeletonRows()
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map(renderPatientRow)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 6} align="center">
                                        <Box sx={{ py: 4 }}>
                                            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        {filteredPatients.length} de {patients.length} pacientes
                    </Typography>
                    {filteredPatients.length > 10 && (
                        <Button size="small" variant="outlined">
                            Ver mais
                        </Button>
                    )}
                </Box>
            </CardContent>

            {/* Status Change Dialog */}
            <Dialog 
                open={statusDialogOpen} 
                onClose={() => setStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Alterar Status da Consulta
                </DialogTitle>
                <DialogContent>
                    {selectedPatient && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                Paciente: {selectedPatient.patientName}
                            </Typography>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <Select
                                    value={selectedPatient.consultationStatus || ''}
                                    onChange={(e) => {
                                        if (selectedPatient) {
                                            setSelectedPatient({
                                                ...selectedPatient,
                                                consultationStatus: e.target.value
                                            });
                                        }
                                    }}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {option.icon}
                                                {option.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            // Save status change
                            setStatusDialogOpen(false);
                        }}
                    >
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default PatientsList;