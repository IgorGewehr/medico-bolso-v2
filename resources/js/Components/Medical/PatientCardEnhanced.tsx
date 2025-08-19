"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Stack,
    Button,
    useMediaQuery,
    useTheme,
    TextField,
    MenuItem,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    Fade,
    Slide,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Divider,
    Grid,
    Card,
    CardContent,
    SelectChangeEvent
} from "@mui/material";
import {
    Person as PersonIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    KeyboardArrowLeft as KeyboardArrowLeftIcon,
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ContentCopy as ContentCopyIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
    Bloodtype as BloodtypeIcon,
    Cake as CakeIcon,
    Warning as WarningIcon
} from "@mui/icons-material";
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Patient, PatientFormData } from '../../Types/Patient';
import { BloodType, Gender } from '../../Types/Common';

// Enhanced color palette
const themeColors = {
    primary: "#1852FE",
    primaryLight: "#E9EFFF",
    primaryDark: "#0A3AA8",
    success: "#0CAF60",
    error: "#FF4B55",
    warning: "#FFAB2B",
    textPrimary: "#111E5A",
    textSecondary: "#4B5574",
    textTertiary: "#7E84A3",
    lightBg: "#F1F3FA",
    backgroundPrimary: "#FFFFFF",
    backgroundSecondary: "#F4F7FF",
    borderColor: "rgba(17, 30, 90, 0.1)",
    shadowColor: "rgba(17, 30, 90, 0.05)",
    chronic: {
        fumante: { bg: "#FFE8E5", color: "#FF4B55" },
        obeso: { bg: "#FFF4E5", color: "#FFAB2B" },
        hipertenso: { bg: "#E5F8FF", color: "#1C94E0" },
        diabetes: { bg: "#EFE6FF", color: "#7B4BC9" },
        asma: { bg: "#E5FFF2", color: "#0CAF60" },
        default: { bg: "#E9EFFF", color: "#1852FE" }
    },
};

// Field configuration for validation and form control
interface FieldConfig {
    required: boolean;
    label: string;
    maxLength?: number;
    pattern?: string;
    mask?: string;
    options?: string[];
}

const fieldConfig: Record<string, FieldConfig> = {
    nome: { required: true, label: "Nome completo", maxLength: 100 },
    tipoSanguineo: {
        required: false,
        label: "Tipo Sanguíneo",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    dataNascimento: { required: true, label: "Data de Nascimento" },
    celular: { required: true, label: "Celular", pattern: "\\(\\d{2}\\)\\s\\d{5}-\\d{4}", mask: "(99) 99999-9999" },
    fixo: { required: false, label: "Telefone Fixo", pattern: "\\(\\d{2}\\)\\s\\d{4}-\\d{4}", mask: "(99) 9999-9999" },
    email: { required: true, label: "E-mail", pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$" },
    endereco: { required: false, label: "Endereço", maxLength: 150 },
    cidade: { required: false, label: "Cidade", maxLength: 100 },
    estado: {
        required: false,
        label: "Estado",
        options: [
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
            "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
        ]
    },
    cep: { required: false, label: "CEP", pattern: "\\d{5}-\\d{3}", mask: "99999-999" }
};

interface ExtendedPatient extends Patient {
    // Legacy compatibility
    patientName?: string;
    patientAge?: number;
    patientGender?: Gender;
    patientPhone?: string;
    patientEmail?: string;
    patientPhotoUrl?: string;
    chronicDiseases?: string[];
    condicoes?: string[];
}

interface PatientCardEnhancedProps {
    patient: ExtendedPatient;
    onSave?: (updatedPatient: Partial<PatientFormData>) => Promise<void>;
    onDelete?: (patientId: string) => Promise<void>;
    onClick?: (patient: ExtendedPatient) => void;
    onEdit?: (patient: ExtendedPatient) => void;
    compact?: boolean;
    editable?: boolean;
    showActions?: boolean;
}

interface ValidationErrors {
    [key: string]: string;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

// Helper for phone mask
const applyPhoneMask = (value: string, mask: string): string => {
    if (!value || !mask) return value;
    
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    let numberIndex = 0;
    
    for (let i = 0; i < mask.length && numberIndex < numbers.length; i++) {
        if (mask[i] === '9') {
            formatted += numbers[numberIndex];
            numberIndex++;
        } else {
            formatted += mask[i];
        }
    }
    
    return formatted;
};

const PatientCardEnhanced: React.FC<PatientCardEnhancedProps> = ({
    patient,
    onSave,
    onDelete,
    onClick,
    onEdit,
    compact = false,
    editable = true,
    showActions = true
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<PatientFormData>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info'
    });
    const [photoUrl, setPhotoUrl] = useState(patient.patientPhotoUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Initialize edited data with current patient data
        setEditedData({
            nome: patient.nome || patient.patientName || '',
            data_nascimento: patient.data_nascimento || '',
            celular: patient.celular || patient.patientPhone || '',
            fixo: patient.fixo || '',
            email: patient.email || patient.patientEmail || '',
            endereco: patient.endereco || '',
            cidade: patient.cidade || '',
            estado: patient.estado || '',
            cep: patient.cep || '',
            tipo_sanguineo: patient.tipo_sanguineo || patient.blood_type,
            height_cm: patient.height_cm,
            weight_kg: patient.weight_kg,
            is_smoker: patient.is_smoker || false,
            is_alcohol_consumer: patient.is_alcohol_consumer || false,
            allergies: patient.allergies || [],
            notes: patient.notes || ''
        });
    }, [patient]);

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const calculateAge = (birthDate: string): number | null => {
        try {
            return differenceInYears(new Date(), new Date(birthDate));
        } catch {
            return null;
        }
    };

    const formatPhone = (phone: string): string => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const validateField = (fieldName: string, value: string): string => {
        const config = fieldConfig[fieldName];
        if (!config) return '';

        if (config.required && !value.trim()) {
            return `${config.label} é obrigatório`;
        }

        if (config.pattern && value && !new RegExp(config.pattern).test(value)) {
            return `${config.label} tem formato inválido`;
        }

        if (config.maxLength && value.length > config.maxLength) {
            return `${config.label} deve ter no máximo ${config.maxLength} caracteres`;
        }

        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        Object.keys(editedData).forEach(fieldName => {
            const value = editedData[fieldName as keyof PatientFormData] as string || '';
            const error = validateField(fieldName, value);
            if (error) {
                newErrors[fieldName] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (fieldName: keyof PatientFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
    ) => {
        let value = event.target.value;
        
        // Apply mask if available
        const config = fieldConfig[fieldName];
        if (config?.mask && (fieldName === 'celular' || fieldName === 'fixo' || fieldName === 'cep')) {
            value = applyPhoneMask(value, config.mask);
        }

        setEditedData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const handleSave = async (): Promise<void> => {
        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Por favor, corrija os erros no formulário',
                severity: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            if (onSave) {
                await onSave(editedData);
            }
            setIsEditing(false);
            setSnackbar({
                open: true,
                message: 'Paciente atualizado com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao salvar paciente',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (): void => {
        setIsEditing(false);
        setErrors({});
        // Reset edited data to original patient data
        setEditedData({
            nome: patient.nome || patient.patientName || '',
            data_nascimento: patient.data_nascimento || '',
            celular: patient.celular || patient.patientPhone || '',
            fixo: patient.fixo || '',
            email: patient.email || patient.patientEmail || '',
            endereco: patient.endereco || '',
            cidade: patient.cidade || '',
            estado: patient.estado || '',
            cep: patient.cep || '',
            tipo_sanguineo: patient.tipo_sanguineo || patient.blood_type,
            height_cm: patient.height_cm,
            weight_kg: patient.weight_kg,
            is_smoker: patient.is_smoker || false,
            is_alcohol_consumer: patient.is_alcohol_consumer || false,
            allergies: patient.allergies || [],
            notes: patient.notes || ''
        });
    };

    const handleDelete = async (): Promise<void> => {
        if (!onDelete) return;

        setLoading(true);
        try {
            await onDelete(patient.id);
            setDeleteDialogOpen(false);
            setSnackbar({
                open: true,
                message: 'Paciente excluído com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao excluir paciente',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (): void => {
        if (!isEditing && onClick) {
            onClick(patient);
        }
    };

    const handleEditClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(patient);
        } else {
            setIsEditing(true);
        }
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPhotoUrl(result);
                // Here you would typically upload to a service and get back a URL
            };
            reader.readAsDataURL(file);
        }
    };

    const getChronicConditionStyle = (condition: string) => {
        const normalizedCondition = condition.toLowerCase();
        const conditionKey = Object.keys(themeColors.chronic).find(key => 
            normalizedCondition.includes(key)
        ) as keyof typeof themeColors.chronic | undefined;
        
        return conditionKey ? themeColors.chronic[conditionKey] : themeColors.chronic.default;
    };

    const age = patient.data_nascimento ? calculateAge(patient.data_nascimento) : 
                patient.patientAge || null;
    const chronicConditions = patient.chronicDiseases || patient.chronic_diseases || patient.condicoes || [];

    return (
        <>
            <Card
                onClick={handleCardClick}
                sx={{
                    cursor: (!isEditing && onClick) ? 'pointer' : 'default',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': (!isEditing && onClick) ? {
                        transform: 'translateY(-2px)',
                        boxShadow: 6,
                    } : {},
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: themeColors.borderColor,
                    position: 'relative',
                    overflow: 'visible'
                }}
            >
                <CardContent sx={{ p: compact ? 2 : 3 }}>
                    {/* Header with Avatar and Edit Button */}
                    <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                        <Box position="relative">
                            <Avatar
                                src={photoUrl}
                                sx={{
                                    width: compact ? 56 : 72,
                                    height: compact ? 56 : 72,
                                    bgcolor: themeColors.primary,
                                    fontSize: compact ? '1.2rem' : '1.5rem',
                                    fontWeight: 600,
                                    border: '3px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            >
                                {photoUrl ? null : getInitials(patient.nome || patient.patientName || 'P')}
                            </Avatar>
                            
                            {isEditing && (
                                <IconButton
                                    size="small"
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        position: 'absolute',
                                        bottom: -4,
                                        right: -4,
                                        bgcolor: 'white',
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: 'grey.100' }
                                    }}
                                >
                                    <AddPhotoAlternateIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        <Box flex={1} minWidth={0}>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    value={editedData.nome || ''}
                                    onChange={handleFieldChange('nome')}
                                    error={!!errors.nome}
                                    helperText={errors.nome}
                                    label="Nome completo"
                                    variant="outlined"
                                    size="small"
                                />
                            ) : (
                                <Typography
                                    variant={compact ? "h6" : "h5"}
                                    fontWeight={700}
                                    color={themeColors.textPrimary}
                                    noWrap
                                >
                                    {patient.nome || patient.patientName || 'Nome não informado'}
                                </Typography>
                            )}

                            {/* Basic Info Chips */}
                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={0.5}>
                                {age && (
                                    <Chip
                                        icon={<CakeIcon />}
                                        label={`${age} anos`}
                                        size="small"
                                        sx={{
                                            bgcolor: themeColors.primaryLight,
                                            color: themeColors.primary,
                                            fontWeight: 500
                                        }}
                                    />
                                )}
                                
                                {(patient.tipo_sanguineo || patient.blood_type) && (
                                    <Chip
                                        icon={<BloodtypeIcon />}
                                        label={patient.tipo_sanguineo || patient.blood_type}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </Box>

                        {/* Action Buttons */}
                        {showActions && (
                            <Box display="flex" flexDirection="column" gap={1}>
                                {isEditing ? (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={handleSave}
                                            disabled={loading}
                                            sx={{ color: themeColors.success }}
                                        >
                                            {loading ? <CircularProgress size={16} /> : <CheckIcon />}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={handleCancel}
                                            sx={{ color: themeColors.error }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        {editable && (
                                            <IconButton
                                                size="small"
                                                onClick={handleEditClick}
                                                sx={{ color: themeColors.textSecondary }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                        {onDelete && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialogOpen(true);
                                                }}
                                                sx={{ color: themeColors.error }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Contact Information */}
                    {!compact && (
                        <Grid container spacing={2} mb={2}>
                            <Grid item xs={12} sm={6}>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        value={editedData.celular || ''}
                                        onChange={handleFieldChange('celular')}
                                        error={!!errors.celular}
                                        helperText={errors.celular}
                                        label="Celular"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                ) : (
                                    patient.celular || patient.patientPhone ? (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PhoneIcon sx={{ fontSize: 16, color: themeColors.textSecondary }} />
                                            <Typography variant="body2" color={themeColors.textSecondary}>
                                                {formatPhone(patient.celular || patient.patientPhone || '')}
                                            </Typography>
                                        </Box>
                                    ) : null
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        value={editedData.email || ''}
                                        onChange={handleFieldChange('email')}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        label="E-mail"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                ) : (
                                    patient.email || patient.patientEmail ? (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <EmailIcon sx={{ fontSize: 16, color: themeColors.textSecondary }} />
                                            <Typography variant="body2" color={themeColors.textSecondary} noWrap>
                                                {patient.email || patient.patientEmail}
                                            </Typography>
                                        </Box>
                                    ) : null
                                )}
                            </Grid>
                        </Grid>
                    )}

                    {/* Chronic Conditions */}
                    {chronicConditions.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="caption" color={themeColors.textSecondary} gutterBottom>
                                Condições Crônicas:
                            </Typography>
                            <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" gap={0.5}>
                                {chronicConditions.slice(0, compact ? 2 : 4).map((condition, index) => {
                                    const conditionStyle = getChronicConditionStyle(condition);
                                    return (
                                        <Chip
                                            key={index}
                                            icon={<WarningIcon />}
                                            label={condition}
                                            size="small"
                                            sx={{
                                                bgcolor: conditionStyle.bg,
                                                color: conditionStyle.color,
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}
                                        />
                                    );
                                })}
                                {chronicConditions.length > (compact ? 2 : 4) && (
                                    <Chip
                                        label={`+${chronicConditions.length - (compact ? 2 : 4)}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Additional Information in Edit Mode */}
                    {isEditing && !compact && (
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tipo Sanguíneo</InputLabel>
                                    <Select
                                        value={editedData.tipo_sanguineo || ''}
                                        onChange={handleFieldChange('tipo_sanguineo')}
                                        label="Tipo Sanguíneo"
                                    >
                                        <MenuItem value="">Selecione...</MenuItem>
                                        {fieldConfig.tipoSanguineo.options?.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    value={editedData.data_nascimento || ''}
                                    onChange={handleFieldChange('data_nascimento')}
                                    error={!!errors.data_nascimento}
                                    helperText={errors.data_nascimento}
                                    label="Data de Nascimento"
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    value={editedData.endereco || ''}
                                    onChange={handleFieldChange('endereco')}
                                    label="Endereço"
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* Last Visit Information */}
                    {patient.last_consultation_date && !isEditing && (
                        <Typography variant="caption" color={themeColors.textSecondary} sx={{ mt: 1, display: 'block' }}>
                            Última consulta: {format(new Date(patient.last_consultation_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                    )}
                </CardContent>

                {/* Hidden file input for photo upload */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                />
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o paciente {patient.nome || patient.patientName}?
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    >
                        {loading ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default PatientCardEnhanced;