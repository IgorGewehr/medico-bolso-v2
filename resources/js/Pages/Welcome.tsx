import React from 'react';
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
    Container
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
                <Container maxWidth="sm">
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