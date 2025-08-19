"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Avatar,
    Button,
    Skeleton,
    IconButton,
    useTheme,
    useMediaQuery,
    Grid,
    alpha,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    VideoCall as VideoCallIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarTodayIcon,
    ArrowForward as ArrowForwardIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { format, addMonths, parseISO, isValid, isSameDay, isToday, getDay, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Consultation, ConsultationType } from '../../Types/Medical';
import { Patient, HealthInsurance } from '../../Types/Patient';
import WeatherContainer from "../Base/WeatherCard";

// Extended interfaces for legacy compatibility
interface LegacyConsultation extends Partial<Consultation> {
    // Firebase/Legacy fields
    patientId?: string;
    doctorId?: string;
    consultationDate?: Date | { toDate: () => Date };
    consultationTime?: string;
    horaInicio?: string;
    nome?: string;
    data?: string;
    reasonForVisit?: string;
    consultationType?: ConsultationType | string;
}

interface LegacyPatient extends Partial<Patient> {
    // Legacy/Firebase fields
    patientName?: string;
    patientPhone?: string;
    phone?: string;
    patientPhotoUrl?: string;
    healthPlans?: HealthInsurance[];
    healthPlan?: HealthInsurance;
    chronicDiseases?: string[];
    condicoesClinicas?: {
        doencas?: string[];
    };
    statusList?: string[];
    reasonForVisit?: string;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
}

interface ConsultationCardProps {
    nextConsultation?: LegacyConsultation | null;
    consultations?: LegacyConsultation[];
    loading?: boolean;
    onViewAgenda?: (consultation?: LegacyConsultation) => void;
    onSelectPatient?: (patientId: string) => void;
}

interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    wind: number;
    location: string;
    icon: string;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({ 
    nextConsultation, 
    consultations = [], 
    loading = false, 
    onViewAgenda, 
    onSelectPatient 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [patientData, setPatientData] = useState<LegacyPatient | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData>({
        temperature: 28,
        condition: 'Ensolarado',
        humidity: 65,
        wind: 10,
        location: 'São Paulo, SP',
        icon: 'sun'
    });

    useEffect(() => {
        const loadPatientData = async (): Promise<void> => {
            if (!nextConsultation || !nextConsultation.patientId || !nextConsultation.doctorId) return;
            
            try {
                // Note: FirebaseService would need to be imported and typed properly
                // For now, we'll simulate the API call
                // const patient = await FirebaseService.getPatient(
                //     nextConsultation.doctorId,
                //     nextConsultation.patientId
                // );
                // setPatientData(patient);
                
                // Temporary simulation - remove when real API is available
                setPatientData({
                    patientName: nextConsultation.nome,
                    patientPhone: '(11) 99999-9999',
                    // Add more mock data as needed
                });
            } catch (error) {
                console.error("Erro ao carregar dados do paciente:", error);
            }
        };

        loadPatientData();

        // Simulate weather data loading
        const weatherTimeout = setTimeout(() => {
            setWeatherData({
                temperature: Math.floor(Math.random() * 10) + 25,
                condition: 'Ensolarado',
                humidity: Math.floor(Math.random() * 30) + 50,
                wind: Math.floor(Math.random() * 15) + 5,
                location: 'São Paulo, SP',
                icon: 'sun'
            });
        }, 1000);

        return () => clearTimeout(weatherTimeout);
    }, [nextConsultation]);

    const handlePrevMonth = (): void => {
        setCurrentMonth(prev => addMonths(prev, -1));
    };

    const handleNextMonth = (): void => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    const handleViewAgenda = (): void => {
        if (onViewAgenda) {
            onViewAgenda(nextConsultation || undefined);
        }
    };

    const handleSelectPatient = (patientId: string): void => {
        if (onSelectPatient && patientId) {
            onSelectPatient(patientId);
        }
    };

    const generateCalendarDays = (): CalendarDay[] => {
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);
        const startDay = getDay(startDate);
        const days: CalendarDay[] = [];

        // Previous month days
        for (let i = 0; i < startDay; i++) {
            days.unshift({
                date: subDays(startDate, i + 1),
                isCurrentMonth: false
            });
        }

        // Current month days
        let currentDate = startDate;
        while (currentDate <= endDate) {
            days.push({
                date: currentDate,
                isCurrentMonth: true
            });
            currentDate = addDays(currentDate, 1);
        }

        // Next month days to complete the calendar
        const daysNeeded = 42 - days.length;
        for (let i = 1; i <= daysNeeded; i++) {
            days.push({
                date: addDays(endDate, i),
                isCurrentMonth: false
            });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();
    const trimmedCalendarDays = calendarDays.slice(0, 35); // Remove extra week

    const hasConsultationsOnDay = (day: Date): boolean => {
        if (!consultations || consultations.length === 0) return false;
        
        return consultations.some(consultation => {
            let consultDate: Date | null = null;
            
            if (consultation.consultationDate instanceof Date) {
                consultDate = consultation.consultationDate;
            } else if (consultation.consultationDate && typeof consultation.consultationDate === 'object' && 'toDate' in consultation.consultationDate) {
                consultDate = (consultation.consultationDate as { toDate: () => Date }).toDate();
            } else if (consultation.data) {
                const parsed = parseISO(consultation.data);
                if (isValid(parsed)) consultDate = parsed;
            }
            
            return consultDate && isValid(consultDate) && isSameDay(consultDate, day);
        });
    };

    const getPatientHealthPlan = (): HealthInsurance | null => {
        if (!patientData) return null;
        
        if (patientData.healthPlans && patientData.healthPlans.length > 0) {
            return patientData.healthPlans[0];
        }
        
        if (patientData.healthPlan) {
            return patientData.healthPlan;
        }
        
        return null;
    };

    const getChronicDiseases = (): string[] => {
        if (!patientData) return [];
        
        if (Array.isArray(patientData.chronicDiseases) && patientData.chronicDiseases.length > 0) {
            return patientData.chronicDiseases;
        }
        
        if (patientData.condicoesClinicas?.doencas && Array.isArray(patientData.condicoesClinicas.doencas)) {
            return patientData.condicoesClinicas.doencas;
        }
        
        return [];
    };

    const getPatientStatus = (): string[] => {
        if (!patientData) return [];
        
        if (Array.isArray(patientData.statusList) && patientData.statusList.length > 0) {
            return patientData.statusList.slice(0, 1);
        }
        
        return [];
    };

    const getConsultationDate = (): Date => {
        if (!nextConsultation) return new Date();

        if (nextConsultation.consultationDate instanceof Date) {
            return nextConsultation.consultationDate;
        }

        if (nextConsultation.consultationDate && typeof nextConsultation.consultationDate === 'object' && 'toDate' in nextConsultation.consultationDate) {
            return (nextConsultation.consultationDate as { toDate: () => Date }).toDate();
        }

        if (nextConsultation.data) {
            const parsed = parseISO(nextConsultation.data);
            if (isValid(parsed)) return parsed;
        }

        return new Date();
    };

    const renderNoConsultation = (): React.ReactElement => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 1
            }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <CalendarTodayIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    Sem consultas agendadas
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleViewAgenda}
                    sx={{ 
                        borderRadius: '50px', 
                        bgcolor: '#1852FE', 
                        textTransform: 'none', 
                        fontSize: '0.65rem' 
                    }}
                >
                    Ir para Agenda
                </Button>
            </Box>
        </Box>
    );

    const renderLoadingSkeleton = (): React.ReactElement => (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 20 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="text" width={150} height={16} />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 18 }} />
                <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 18 }} />
            </Box>
        </Box>
    );

    if (loading) {
        return renderLoadingSkeleton();
    }

    if (!nextConsultation) {
        return renderNoConsultation();
    }

    const healthPlan = getPatientHealthPlan();
    const consultationDate = getConsultationDate();

    return (
        <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 0.5 : 1,
            flexDirection: isMobile ? 'column' : 'row'
        }}>
            {/* Weather Card */}
            {!isMobile && (
                <Box sx={{ width: '25%', height: 180 }}>
                    <WeatherContainer />
                </Box>
            )}

            <Card
                elevation={0}
                sx={{
                    borderRadius: isMobile ? '16px' : '20px',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    overflow: 'hidden',
                    height: isMobile ? 'auto' : 180,
                    minHeight: isMobile ? 150 : 180,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    width: isMobile ? '100%' : '75%'
                }}
            >
                {/* Calendar Section */}
                {!isMobile && (
                    <Box sx={{
                        flex: '1 1 35%',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: '#f8f9fa',
                        p: 1.5,
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} fontSize="0.9rem">
                                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.5 }}>
                                    <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.5 }}>
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                        
                        {/* Days of week header */}
                        <Grid container spacing={0.25} sx={{ mb: 0.5 }}>
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                                <Grid item key={index} xs={12/7}>
                                    <Typography
                                        variant="caption"
                                        align="center"
                                        sx={{
                                            display: 'block',
                                            color: 'text.secondary',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {day}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                        
                        {/* Calendar days */}
                        <Grid container spacing={0.25}>
                            {trimmedCalendarDays.map((dayInfo, index) => {
                                const isToday_ = isToday(dayInfo.date);
                                const hasEvents = hasConsultationsOnDay(dayInfo.date);
                                return (
                                    <Grid item key={index} xs={12/7}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                height: 18,
                                                width: 18,
                                                mx: 'auto',
                                                fontSize: '0.65rem',
                                                fontWeight: isToday_ ? 700 : dayInfo.isCurrentMonth ? 500 : 400,
                                                color: !dayInfo.isCurrentMonth
                                                    ? alpha(theme.palette.text.primary, 0.3)
                                                    : isToday_
                                                        ? '#1852FE'
                                                        : theme.palette.text.primary,
                                                borderRadius: '50%',
                                                backgroundColor: isToday_ ? alpha('#1852FE', 0.15) : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease',
                                                '&:hover': { backgroundColor: alpha('#1852FE', 0.15) }
                                            }}
                                        >
                                            {dayInfo.date.getDate()}
                                            {hasEvents && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 1,
                                                        width: 3,
                                                        height: 3,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#1852FE'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* Consultation Information Section */}
                <Box sx={{
                    flex: isMobile ? '1' : '1 1 65%',
                    bgcolor: '#1852FE',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    p: isMobile ? 2 : 1.5,
                }}>
                    {/* Decorative elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            backgroundColor: alpha('#fff', 0.1)
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            backgroundColor: alpha('#fff', 0.05)
                        }}
                    />

                    {/* Header with title and health plan */}
                    <Box sx={{ position: 'relative', mb: 0.5, height: '32px' }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ fontSize: '1rem', lineHeight: '32px' }}
                        >
                            Próxima consulta
                        </Typography>
                        {healthPlan && (
                            <Box sx={{ position: 'absolute', top: 0, right: 0, textAlign: 'right' }}>
                                <Typography variant="body1" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                    {healthPlan.name}
                                </Typography>
                                {healthPlan.number && (
                                    <Typography variant="caption" sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                        Nº {healthPlan.number}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Patient Information */}
                    <Box sx={{ display: 'flex', mb: 0.75 }}>
                        <Avatar
                            src={patientData?.patientPhotoUrl}
                            alt={patientData?.patientName || nextConsultation?.nome || "Paciente"}
                            sx={{
                                width: 38,
                                height: 38,
                                bgcolor: alpha('#fff', 0.25),
                                fontWeight: 600,
                                mr: 1,
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {(patientData?.patientName || nextConsultation?.nome || "P").charAt(0)}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontWeight: 600, 
                                    fontSize: '1rem', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                }}
                            >
                                {patientData?.patientName || nextConsultation?.nome || "Paciente"}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.25 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        {isToday(consultationDate) ? 'Hoje' : format(consultationDate, 'dd/MM', { locale: ptBR })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: 12, mr: 0.25 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        {nextConsultation?.consultationTime || nextConsultation?.horaInicio || '00:00'}
                                    </Typography>
                                </Box>
                                {nextConsultation?.consultationType === 'Telemedicina' && (
                                    <VideoCallIcon sx={{ fontSize: 14 }} />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Reason and contact information */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
                        <Box>
                            <Typography variant="body1" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 0.25 }}>
                                <strong>Motivo:</strong> {nextConsultation?.reasonForVisit || patientData?.reasonForVisit || "Consulta de rotina"}
                            </Typography>
                            {(patientData?.patientPhone || patientData?.phone) && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ fontSize: 12, mr: 0.25 }} />
                                    <Typography variant="body1" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                        {patientData?.patientPhone || patientData?.phone}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon fontSize="small" />}
                            onClick={handleViewAgenda}
                            sx={{
                                borderRadius: '50px',
                                bgcolor: 'white',
                                color: '#1852FE',
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.5,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                '&:hover': {
                                    bgcolor: alpha('#fff', 0.9),
                                    boxShadow: '0 3px 8px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            Ver Consulta
                        </Button>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default ConsultationCard;