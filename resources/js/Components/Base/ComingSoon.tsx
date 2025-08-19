import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    fullHeight?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
    title = "Obrigado!",
    subtitle = "Nosso aplicativo estará disponível em breve.",
    icon,
    fullHeight = true
}) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={fullHeight ? "100vh" : "400px"}
            p={2}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    maxWidth: 500,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                }}
            >
                <Stack spacing={3} alignItems="center">
                    {icon || (
                        <ConstructionIcon
                            sx={{
                                fontSize: 80,
                                color: 'primary.main',
                                opacity: 0.7
                            }}
                        />
                    )}

                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight={700}
                        color="primary"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            lineHeight: 1.6
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default ComingSoon;