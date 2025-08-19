"use client";

import React, { useState } from 'react';
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    alpha,
    Skeleton,
    Card,
    CardContent,
    Button
} from '@mui/material';
import { 
    TrendingUp, 
    Timeline, 
    People,
    TrendingDown,
    Assessment as AssessmentIcon
} from '@mui/icons-material';

interface MetricsData {
    dailyAppointments?: number;
    weeklyAppointments?: number;
    monthlyAppointments?: number;
    yearlyAppointments?: number;
    recurringRate?: number;
    totalPatients?: number;
    newPatientsThisMonth?: number;
    totalRevenue?: number;
    averageAppointmentValue?: number;
    growthPercentage?: number;
    isGrowthPositive?: boolean;
}

interface MetricsCardProps {
    metrics?: MetricsData;
    loading?: boolean;
    onTimeFrameChange?: (period: TimeFrame) => void;
    showReferralProgram?: boolean;
}

type TimeFrame = 'hoje' | 'semana' | 'mes' | 'ano';

const PERIOD_LABELS: Record<TimeFrame, string> = {
    'hoje': 'Hoje',
    'semana': 'Semana',
    'mes': 'Mês',
    'ano': 'Ano'
};

const MetricsCard: React.FC<MetricsCardProps> = ({ 
    metrics = {},
    loading = false,
    onTimeFrameChange,
    showReferralProgram = true
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('hoje');

    const handleTimeFrameChange = (period: TimeFrame) => {
        setTimeFrame(period);
        if (onTimeFrameChange) {
            onTimeFrameChange(period);
        }
    };

    // Get appointment value based on selected period
    const getAppointmentValue = (): string => {
        let value: number;
        switch (timeFrame) {
            case 'hoje':
                value = metrics.dailyAppointments || 0;
                break;
            case 'semana':
                value = metrics.weeklyAppointments || 0;
                break;
            case 'mes':
                value = metrics.monthlyAppointments || 0;
                break;
            case 'ano':
                value = metrics.yearlyAppointments || 0;
                break;
            default:
                value = 0;
        }
        // Add leading zero for numbers less than 10
        return value < 10 ? `0${value}` : `${value}`;
    };

    // Format recurring rate
    const getFormattedRecurringRate = (): string => {
        const rate = metrics.recurringRate || 0;
        return rate < 10 ? `0${rate}` : `${rate}`;
    };

    // Format currency values
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Common style for main cards
    const mainCardStyle = {
        height: '140px',
        mb: 1,
        borderRadius: '20px',
        border: 'none',
        overflow: 'hidden',
        position: 'relative'
    };

    return (
        <Card
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: theme.palette.divider,
                backgroundColor: 'white',
                overflow: 'visible',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.main"
                    gutterBottom
                    sx={{ mb: 2 }}
                >
                    Veja suas métricas
                    <Typography component="span" color="primary" fontWeight={500}>
                        {' '}em tempo real
                    </Typography>
                </Typography>

                {/* Period Selection */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        borderRadius: '30px',
                        mb: 3,
                        p: 0.5,
                        border: '1px solid',
                        borderColor: theme.palette.divider
                    }}
                >
                    {(Object.keys(PERIOD_LABELS) as TimeFrame[]).map((period) => (
                        <Box
                            key={period}
                            onClick={() => handleTimeFrameChange(period)}
                            sx={{
                                py: 0.5,
                                px: isMobile ? 1 : 2,
                                flex: 1,
                                textAlign: 'center',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                backgroundColor: timeFrame === period ? '#1852FE' : 'transparent',
                                color: timeFrame === period ? '#fff' : 'text.secondary',
                                fontWeight: 500,
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: timeFrame === period ? '#1852FE' : alpha('#1852FE', 0.05)
                                }
                            }}
                        >
                            {PERIOD_LABELS[period]}
                        </Box>
                    ))}
                </Box>

                {/* Appointments Card */}
                <Card
                    elevation={0}
                    sx={{
                        ...mainCardStyle,
                        backgroundColor: '#1852FE',
                        color: 'white',
                    }}
                >
                    <CardContent sx={{ p: 2.5, height: '100%', position: 'relative' }}>
                        {/* Decorative elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -30,
                                right: -30,
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                backgroundColor: alpha('#fff', 0.1)
                            }}
                        />

                        <Box sx={{ 
                            position: 'relative', 
                            zIndex: 1, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: 1 
                            }}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                    Seus Atendimentos
                                </Typography>
                                <Timeline fontSize="small" />
                            </Box>

                            {loading ? (
                                <Skeleton 
                                    variant="text" 
                                    width="50%" 
                                    height={60} 
                                    sx={{ bgcolor: alpha('#fff', 0.2) }} 
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                                    <Typography
                                        variant="h2"
                                        component="span"
                                        fontWeight={700}
                                        sx={{ letterSpacing: '-1px', lineHeight: 1 }}
                                    >
                                        {getAppointmentValue()}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        component="span"
                                        sx={{ ml: 1, mt: 1, opacity: 0.8 }}
                                    >
                                        no {timeFrame}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Recurring Rate Card */}
                <Card
                    elevation={0}
                    sx={{
                        ...mainCardStyle,
                        backgroundColor: '#E3F2FD',
                    }}
                >
                    <CardContent sx={{ p: 2.5, height: '100%', position: 'relative' }}>
                        {/* Decorative elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                backgroundColor: alpha('#1852FE', 0.05)
                            }}
                        />

                        <Box sx={{ 
                            position: 'relative', 
                            zIndex: 1, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: 1 
                            }}>
                                <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                    Taxa de Recorrência
                                </Typography>
                                <TrendingUp fontSize="small" color="primary" />
                            </Box>

                            {loading ? (
                                <Skeleton variant="text" width="50%" height={60} />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 'auto' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography
                                            variant="h2"
                                            component="span"
                                            fontWeight={700}
                                            color="#1852FE"
                                            sx={{ letterSpacing: '-1px', lineHeight: 1 }}
                                        >
                                            {getFormattedRecurringRate()}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            component="span"
                                            color="#1852FE"
                                            fontWeight={700}
                                            sx={{ ml: 0.5 }}
                                        >
                                            %
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        dos pacientes retornam em 3 meses
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Additional Metrics Card - Revenue/Growth */}
                <Card
                    elevation={0}
                    sx={{
                        ...mainCardStyle,
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        mt: 1,
                        color: 'white'
                    }}
                >
                    <CardContent sx={{ p: 2.5, height: '100%', position: 'relative' }}>
                        {/* Decorative elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -25,
                                right: -25,
                                width: 140,
                                height: 140,
                                borderRadius: '50%',
                                backgroundColor: alpha('#fff', 0.1)
                            }}
                        />

                        <Box sx={{ 
                            position: 'relative', 
                            zIndex: 1, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: 1 
                            }}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                    Crescimento
                                </Typography>
                                {metrics.isGrowthPositive ? 
                                    <TrendingUp fontSize="small" /> : 
                                    <TrendingDown fontSize="small" />
                                }
                            </Box>

                            {loading ? (
                                <Skeleton 
                                    variant="text" 
                                    width="60%" 
                                    height={40} 
                                    sx={{ bgcolor: alpha('#fff', 0.2) }} 
                                />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 'auto' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography
                                            variant="h3"
                                            component="span"
                                            fontWeight={700}
                                            sx={{ letterSpacing: '-1px', lineHeight: 1 }}
                                        >
                                            {metrics.growthPercentage !== undefined ? 
                                                `${metrics.isGrowthPositive ? '+' : ''}${metrics.growthPercentage}` : 
                                                '+15'
                                            }
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            component="span"
                                            fontWeight={700}
                                            sx={{ ml: 0.5 }}
                                        >
                                            %
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                                        vs. período anterior
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Referral Program Card */}
                {showReferralProgram && (
                    <Card
                        elevation={0}
                        sx={{
                            ...mainCardStyle,
                            background: 'linear-gradient(135deg, #7B40F2 0%, #4A3AFF 100%)',
                            mt: 1,
                            color: 'white'
                        }}
                    >
                        <CardContent sx={{ p: 2.5, height: '100%', position: 'relative' }}>
                            {/* Decorative elements */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -25,
                                    right: -25,
                                    width: 140,
                                    height: 140,
                                    borderRadius: '50%',
                                    backgroundColor: alpha('#fff', 0.1)
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -15,
                                    left: -15,
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: alpha('#fff', 0.08)
                                }}
                            />

                            <Box sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column' 
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    mb: 1 
                                }}>
                                    <Typography variant="subtitle1" fontWeight={500}>
                                        Programa de Indicação
                                    </Typography>
                                    <People fontSize="small" />
                                </Box>

                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    height: '100%' 
                                }}>
                                    <Typography
                                        variant={isMobile ? "body1" : "h6"}
                                        sx={{
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            mt: -1,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        Com 3 indicações você ganha 1 mês grátis!
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricsCard;