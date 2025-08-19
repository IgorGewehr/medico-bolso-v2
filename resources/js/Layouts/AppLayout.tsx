import React, { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Box, 
    AppBar, 
    Toolbar, 
    Typography, 
    Container,
    ThemeProvider,
    createTheme
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f5f5f5',
        },
    },
});

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head title={title} />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static" elevation={1}>
                    <Toolbar>
                        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                            Médico Bolso V2
                        </Typography>
                    </Toolbar>
                </AppBar>
                
                <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
                    <Container maxWidth="lg">
                        {children}
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}