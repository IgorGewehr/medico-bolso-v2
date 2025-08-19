"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    FormControl,
    InputLabel,
    TextField,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    InputAdornment,
    FormLabel,
    Button,
    Typography,
    Alert,
    Snackbar,
    useTheme,
    useMediaQuery,
    FormHelperText,
    SelectChangeEvent
} from '@mui/material';
import {
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { PatientFormData, BloodType, Gender } from '../../Types/Patient';

interface PatientFormProps {
    initialData?: Partial<PatientFormData>;
    onSubmit: (data: PatientFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    submitText?: string;
}

interface FormErrors {
    nome?: string;
    data_nascimento?: string;
    celular?: string;
    email?: string;
    tipo_sanguineo?: string;
    cep?: string;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

const PatientForm: React.FC<PatientFormProps> = ({
    initialData = {},
    onSubmit,
    onCancel,
    isLoading = false,
    submitText = 'Salvar Paciente'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [formData, setFormData] = useState<PatientFormData>({
        nome: '',
        data_nascimento: '',
        celular: '',
        fixo: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        tipo_sanguineo: undefined,
        height_cm: undefined,
        weight_kg: undefined,
        is_smoker: false,
        is_alcohol_consumer: false,
        allergies: [],
        notes: '',
        ...initialData
    });

    const [gender, setGender] = useState<Gender | ''>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info'
    });

    // Brazilian states for the select field
    const brazilianStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleInputChange = (field: keyof PatientFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleSelectChange = (field: keyof PatientFormData) => (
        event: SelectChangeEvent<string>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));

        // Clear error when user makes selection
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGender(event.target.value as Gender);
    };

    const handleNumberChange = (field: 'height_cm' | 'weight_kg') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value ? parseFloat(value) : undefined
        }));
    };

    const handleBooleanChange = (field: 'is_smoker' | 'is_alcohol_consumer') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.checked
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields validation
        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (formData.nome.trim().length < 2) {
            newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
        }

        if (!formData.data_nascimento) {
            newErrors.data_nascimento = 'Data de nascimento é obrigatória';
        } else {
            const birthDate = new Date(formData.data_nascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 150) {
                newErrors.data_nascimento = 'Data de nascimento inválida';
            }
        }

        if (!formData.celular.trim()) {
            newErrors.celular = 'Celular é obrigatório';
        } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.celular)) {
            // Basic Brazilian phone format validation
            newErrors.celular = 'Formato de celular inválido (ex: (11) 99999-9999)';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
            newErrors.cep = 'CEP inválido (ex: 00000-000)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatPhoneNumber = (value: string): string => {
        // Remove all non-numeric characters
        const numbers = value.replace(/\D/g, '');
        
        // Apply Brazilian phone mask
        if (numbers.length <= 2) {
            return `(${numbers}`;
        } else if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }
        
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatCEP = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 5) {
            return numbers;
        }
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    const handlePhoneChange = (field: 'celular' | 'fixo') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const formatted = formatPhoneNumber(event.target.value);
        setFormData(prev => ({
            ...prev,
            [field]: formatted
        }));

        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleCEPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCEP(event.target.value);
        setFormData(prev => ({
            ...prev,
            cep: formatted
        }));

        if (errors.cep) {
            setErrors(prev => ({
                ...prev,
                cep: undefined
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Por favor, corrija os erros no formulário',
                severity: 'error'
            });
            return;
        }

        try {
            await onSubmit(formData);
            setSnackbar({
                open: true,
                message: 'Paciente salvo com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao salvar paciente. Tente novamente.',
                severity: 'error'
            });
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: isMobile ? '8px' : isTablet ? '16px' : '24px',
            fontSize: isMobile ? '14px' : '16px',
            '& fieldset': { 
                borderColor: 'rgba(17, 30, 90, 0.30)' 
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
            }
        },
    };

    const labelStyles = {
        color: '#111E5A',
        fontWeight: 500,
        fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
        lineHeight: '150%',
        textTransform: 'capitalize' as const,
        mb: 1
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                width: '100%',
                maxWidth: isMobile ? '100vw' : isTablet ? '700px' : '900px',
                height: 'auto',
                minHeight: isMobile ? '100vh' : '400px',
                borderRadius: isMobile ? '16px' : isTablet ? '24px' : '32px',
                border: '1px solid #EAECEF',
                background: '#FFF',
                flexShrink: 0,
                padding: isMobile ? 2 : isTablet ? 2.5 : 3,
                margin: isMobile ? '8px' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible',
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: '#111E5A', fontWeight: 600 }}>
                {initialData?.nome ? 'Editar Paciente' : 'Novo Paciente'}
            </Typography>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                        {/* Full Name */}
                        <Grid item xs={12}>
                            <Typography component="label" sx={labelStyles}>
                                Nome Completo *
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Digite o nome completo"
                                value={formData.nome}
                                onChange={handleInputChange('nome')}
                                error={!!errors.nome}
                                helperText={errors.nome}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputStyles}
                            />
                        </Grid>

                        {/* Birth Date and Blood Type */}
                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Data de Nascimento *
                            </Typography>
                            <TextField
                                fullWidth
                                type="date"
                                value={formData.data_nascimento}
                                onChange={handleInputChange('data_nascimento')}
                                error={!!errors.data_nascimento}
                                helperText={errors.data_nascimento}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Tipo Sanguíneo
                            </Typography>
                            <FormControl fullWidth error={!!errors.tipo_sanguineo}>
                                <Select
                                    value={formData.tipo_sanguineo || ''}
                                    onChange={handleSelectChange('tipo_sanguineo')}
                                    displayEmpty
                                    sx={inputStyles}
                                >
                                    <MenuItem value="">Selecione...</MenuItem>
                                    {bloodTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.tipo_sanguineo && (
                                    <FormHelperText>{errors.tipo_sanguineo}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12}>
                            <FormControl component="fieldset" sx={{ mt: 1 }}>
                                <FormLabel sx={labelStyles}>
                                    Gênero
                                </FormLabel>
                                <RadioGroup 
                                    row={!isMobile} 
                                    value={gender}
                                    onChange={handleGenderChange}
                                    sx={{ 
                                        flexDirection: isMobile ? 'column' : 'row', 
                                        gap: isMobile ? 1 : 2,
                                        mt: 1
                                    }}
                                >
                                    <FormControlLabel
                                        value="Masculino"
                                        control={<Radio />}
                                        label="Masculino"
                                    />
                                    <FormControlLabel
                                        value="Feminino"
                                        control={<Radio />}
                                        label="Feminino"
                                    />
                                    <FormControlLabel
                                        value="Outro"
                                        control={<Radio />}
                                        label="Outro"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* Physical Information */}
                        <Grid item xs={6}>
                            <Typography component="label" sx={labelStyles}>
                                Altura (cm)
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="170"
                                value={formData.height_cm || ''}
                                onChange={handleNumberChange('height_cm')}
                                inputProps={{ min: 50, max: 250 }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <Typography component="label" sx={labelStyles}>
                                Peso (kg)
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="70"
                                value={formData.weight_kg || ''}
                                onChange={handleNumberChange('weight_kg')}
                                inputProps={{ min: 1, max: 500 }}
                                sx={inputStyles}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                        {/* Contact Information */}
                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Celular *
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="(11) 99999-9999"
                                value={formData.celular}
                                onChange={handlePhoneChange('celular')}
                                error={!!errors.celular}
                                helperText={errors.celular}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Telefone Fixo
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="(11) 3333-3333"
                                value={formData.fixo || ''}
                                onChange={handlePhoneChange('fixo')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography component="label" sx={labelStyles}>
                                E-mail
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                placeholder="email@exemplo.com"
                                value={formData.email || ''}
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
                                sx={inputStyles}
                            />
                        </Grid>

                        {/* Address Information */}
                        <Grid item xs={12}>
                            <Typography component="label" sx={labelStyles}>
                                Endereço
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Rua, número, bairro"
                                value={formData.endereco || ''}
                                onChange={handleInputChange('endereco')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Cidade
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Digite a cidade"
                                value={formData.cidade || ''}
                                onChange={handleInputChange('cidade')}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                Estado
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    value={formData.estado || ''}
                                    onChange={handleSelectChange('estado')}
                                    displayEmpty
                                    sx={inputStyles}
                                >
                                    <MenuItem value="">Selecione...</MenuItem>
                                    {brazilianStates.map((state) => (
                                        <MenuItem key={state} value={state}>
                                            {state}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography component="label" sx={labelStyles}>
                                CEP
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="00000-000"
                                value={formData.cep || ''}
                                onChange={handleCEPChange}
                                error={!!errors.cep}
                                helperText={errors.cep}
                                sx={inputStyles}
                            />
                        </Grid>

                        {/* Additional Information */}
                        <Grid item xs={12}>
                            <Typography component="label" sx={labelStyles}>
                                Observações
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Observações adicionais sobre o paciente..."
                                value={formData.notes || ''}
                                onChange={handleInputChange('notes')}
                                sx={inputStyles}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end', 
                mt: 4,
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                {onCancel && (
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isLoading}
                        startIcon={<CancelIcon />}
                        sx={{ 
                            borderRadius: '24px',
                            px: 3,
                            py: 1
                        }}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={<SaveIcon />}
                    sx={{ 
                        borderRadius: '24px',
                        px: 3,
                        py: 1,
                        bgcolor: '#1852FE',
                        '&:hover': {
                            bgcolor: '#1442D1'
                        }
                    }}
                >
                    {isLoading ? 'Salvando...' : submitText}
                </Button>
            </Box>

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
        </Box>
    );
};

export default PatientForm;