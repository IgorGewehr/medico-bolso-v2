import React from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Paper, 
    Stack,
    Backdrop
} from '@mui/material';
import { Assignment } from '@mui/icons-material';

interface ReportLoadingIndicatorProps {
    isLoading: boolean;
    title?: string;
    subtitle?: string;
}

const ReportLoadingIndicator: React.FC<ReportLoadingIndicatorProps> = ({ 
    isLoading, 
    title = "Gerando Relatório Clínico",
    subtitle = "Este processo pode levar até 30 segundos enquanto nossa IA analisa todos os dados relevantes do paciente."
}) => {
    if (!isLoading) return null;

    const steps = [
        "Analisando histórico médico",
        "Processando resultados de exames", 
        "Identificando tendências clínicas"
    ];

    return (
        <Backdrop 
            open={isLoading} 
            sx={{ 
                zIndex: (theme) => theme.zIndex.modal + 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    borderRadius: 3,
                    p: 4,
                    maxWidth: 'md',
                    width: '90%',
                    textAlign: 'center'
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                            size={80}
                            thickness={4}
                            sx={{
                                color: '#9c27b0',
                                animationDuration: '1.5s'
                            }}
                        />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Assignment sx={{ fontSize: 32, color: '#9c27b0' }} />
                        </Box>
                    </Box>

                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {title}
                    </Typography>

                    <Stack spacing={2} sx={{ width: '100%' }}>
                        {steps.map((step, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: '#9c27b0',
                                        borderRadius: '50%',
                                        mr: 2,
                                        animation: 'pulse 1.5s infinite',
                                        animationDelay: `${index * 0.3}s`,
                                        '@keyframes pulse': {
                                            '0%': { opacity: 0.3 },
                                            '50%': { opacity: 1 },
                                            '100%': { opacity: 0.3 },
                                        }
                                    }}
                                />
                                <Typography variant="body1" color="text.secondary">
                                    {step}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {subtitle}
                    </Typography>
                </Stack>
            </Paper>
        </Backdrop>
    );
};

export default ReportLoadingIndicator;