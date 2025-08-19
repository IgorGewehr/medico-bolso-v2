import React, { useState } from 'react';
import {
    Box,
    Button,
    Link,
    Stack,
    TextField,
    Typography,
    Alert,
    Snackbar,
    useMediaQuery,
    useTheme,
    InputAdornment,
    IconButton,
    Paper,
    Divider
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';

interface AuthFormData {
    email: string;
    password: string;
}

interface AuthFormErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface AuthFormProps {
    mode?: 'login' | 'register';
    onSubmit: (data: AuthFormData) => Promise<void>;
    onForgotPassword?: (email: string) => Promise<void>;
    onGoogleAuth?: () => Promise<void>;
    loading?: boolean;
    googleLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
    mode = 'login',
    onSubmit,
    onForgotPassword,
    onGoogleAuth,
    loading = false,
    googleLoading = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: ''
    });
    
    const [errors, setErrors] = useState<AuthFormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: AuthFormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Senha é obrigatória';
        } else if (mode === 'register' && formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof AuthFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
        } catch (error: any) {
            setErrors({ general: error.message || 'Erro ao processar solicitação' });
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email.trim()) {
            setErrors({ email: 'Informe seu e-mail para recuperar a senha' });
            return;
        }

        if (!validateEmail(formData.email)) {
            setErrors({ email: 'E-mail inválido' });
            return;
        }

        try {
            if (onForgotPassword) {
                await onForgotPassword(formData.email);
                setSnackbar({
                    open: true,
                    message: 'E-mail de recuperação enviado com sucesso!',
                    severity: 'success'
                });
            }
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Erro ao enviar e-mail de recuperação',
                severity: 'error'
            });
        }
    };

    const handleGoogleAuth = async () => {
        try {
            if (onGoogleAuth) {
                await onGoogleAuth();
            }
        } catch (error: any) {
            setErrors({ general: error.message || 'Erro ao autenticar com Google' });
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    textAlign="center"
                    color="primary"
                    sx={{ mb: 1 }}
                >
                    {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                </Typography>
                
                <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 4 }}
                >
                    {mode === 'login' 
                        ? 'Acesse sua conta para continuar' 
                        : 'Crie sua conta para começar'
                    }
                </Typography>

                {errors.general && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errors.general}
                    </Alert>
                )}

                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="E-mail"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1.1rem'
                        }}
                    >
                        {loading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                    </Button>

                    {mode === 'login' && onForgotPassword && (
                        <Box textAlign="center">
                            <Link
                                component="button"
                                type="button"
                                variant="body2"
                                onClick={handleForgotPassword}
                                sx={{
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Esqueceu sua senha?
                            </Link>
                        </Box>
                    )}

                    {onGoogleAuth && (
                        <>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ou
                                </Typography>
                            </Divider>

                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                onClick={handleGoogleAuth}
                                disabled={googleLoading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                {googleLoading ? 'Carregando...' : 'Continuar com Google'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default AuthForm;