import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Container,
    Stack
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SearchBar from '../Components/Base/SearchBar.tsx';
import NewPatientButton from '../Components/Base/NewPatientButton.tsx';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

export default function Welcome() {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        console.log('Searching for:', term);
    };

    const handleNewPatient = () => {
        console.log('Creating new patient');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head title="Bem-vindo" />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Container maxWidth="md">
                    <Card
                        elevation={8}
                        sx={{
                            borderRadius: 4,
                            textAlign: 'center',
                            p: 2
                        }}
                    >
                        <CardContent>
                            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                                Médico Bolso V2
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Sistema médico desenvolvido com React + Laravel
                            </Typography>

                            <List sx={{ mt: 4, mb: 4 }}>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="React 18" />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="Laravel + Inertia.js" />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="Material-UI (MUI)" />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="TypeScript" />
                                </ListItem>
                            </List>

                            <Box sx={{ mt: 4, mb: 4 }}>
                                <Typography variant="h5" gutterBottom color="primary">
                                    Componentes Migrados da V1
                                </Typography>

                                <Stack spacing={3} sx={{ mt: 3, alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', maxWidth: 500 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            SearchBar Component
                                        </Typography>
                                        <SearchBar
                                            onSearch={handleSearch}
                                            placeholder="Teste do componente SearchBar..."
                                        />
                                        {searchTerm && (
                                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                                Pesquisando por: "{searchTerm}"
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            NewPatientButton Component
                                        </Typography>
                                        <NewPatientButton onClick={handleNewPatient} />
                                    </Box>
                                </Stack>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                sx={{ mt: 2, py: 1.5, px: 4 }}
                            >
                                Começar
                            </Button>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
