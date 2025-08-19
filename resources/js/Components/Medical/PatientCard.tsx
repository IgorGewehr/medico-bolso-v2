import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Box,
    Stack,
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientData {
    id: string;
    nome: string;
    email?: string;
    celular?: string;
    dataNascimento?: string;
    tipoSanguineo?: string;
    avatar?: string;
    chronicConditions?: string[];
    lastVisit?: string;
}

interface PatientCardProps {
    patient: PatientData;
    onClick?: (patient: PatientData) => void;
    onEdit?: (patient: PatientData) => void;
    compact?: boolean;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
    patient, 
    onClick, 
    onEdit, 
    compact = false 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const calculateAge = (birthDate: string) => {
        try {
            return differenceInYears(new Date(), new Date(birthDate));
        } catch {
            return null;
        }
    };

    const formatPhone = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    };

    const handleCardClick = () => {
        if (onClick) onClick(patient);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) onEdit(patient);
    };

    const age = patient.dataNascimento ? calculateAge(patient.dataNascimento) : null;

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': onClick ? {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                } : {},
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <CardContent sx={{ p: compact ? 2 : 3 }}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar
                        src={patient.avatar}
                        sx={{
                            width: compact ? 48 : 56,
                            height: compact ? 48 : 56,
                            bgcolor: 'primary.main',
                            fontSize: compact ? '1rem' : '1.25rem'
                        }}
                    >
                        {patient.avatar ? null : getInitials(patient.nome)}
                    </Avatar>

                    <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography
                                variant={compact ? "subtitle1" : "h6"}
                                fontWeight={600}
                                noWrap
                                sx={{ color: 'text.primary' }}
                            >
                                {patient.nome}
                            </Typography>

                            {onEdit && (
                                <IconButton
                                    size="small"
                                    onClick={handleEditClick}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        <Stack direction="row" spacing={1} mb={2}>
                            {age && (
                                <Chip
                                    label={`${age} anos`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            {patient.tipoSanguineo && (
                                <Chip
                                    label={patient.tipoSanguineo}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        {!compact && (
                            <Stack spacing={0.5}>
                                {patient.celular && (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {formatPhone(patient.celular)}
                                        </Typography>
                                    </Box>
                                )}

                                {patient.email && (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {patient.email}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                            <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                                {patient.chronicConditions.slice(0, 3).map((condition, index) => (
                                    <Chip
                                        key={index}
                                        label={condition}
                                        size="small"
                                        sx={{
                                            bgcolor: 'warning.light',
                                            color: 'warning.dark',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                                {patient.chronicConditions.length > 3 && (
                                    <Chip
                                        label={`+${patient.chronicConditions.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Stack>
                        )}

                        {patient.lastVisit && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Última consulta: {format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: ptBR })}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PatientCard;