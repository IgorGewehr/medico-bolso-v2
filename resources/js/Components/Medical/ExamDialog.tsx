"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    CircularProgress,
    Fade,
    alpha,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Snackbar,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Skeleton,
    LinearProgress,
    useTheme,
    useMediaQuery,
    SelectChangeEvent
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    CalendarToday as CalendarTodayIcon,
    Add as AddIcon,
    DeleteOutline as DeleteOutlineIcon,
    AttachFileOutlined as AttachFileOutlinedIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    Download as DownloadOutlinedIcon,
    CameraAltOutlined as CameraAltOutlinedIcon,
    Biotech as BiotechIcon,
    AutoAwesome as AutoAwesomeIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Article as ArticleOutlinedIcon,
    Description as DescriptionOutlinedIcon,
    Image as ImageOutlinedIcon,
    ErrorOutline as ErrorOutlineIcon,
    WarningAmber as WarningAmberIcon,
    TipsAndUpdates as TipsAndUpdatesOutlinedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Exam, ExamStatus, ExamUrgency } from '../../Types/Medical';

// Exam categories configuration
const EXAM_CATEGORIES = {
    LabGerais: {
        main: '#EF4444',
        light: '#FEE2E2',
        dark: '#DC2626',
        background: '#FEF2F2',
        label: 'Laboratório Gerais'
    },
    LabEspecializados: {
        main: '#8B5CF6',
        light: '#EDE9FE',
        dark: '#7C3AED',
        background: '#F3F4F6',
        label: 'Lab. Especializados'
    },
    Imagem: {
        main: '#06B6D4',
        light: '#CFFAFE',
        dark: '#0891B2',
        background: '#F0FDFA',
        label: 'Exames de Imagem'
    },
    Cardiologicos: {
        main: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
        background: '#FFFBEB',
        label: 'Cardiológicos'
    },
    Biopsia: {
        main: '#10B981',
        light: '#D1FAE5',
        dark: '#059669',
        background: '#ECFDF5',
        label: 'Biópsias'
    },
    Outros: {
        main: '#6B7280',
        light: '#F3F4F6',
        dark: '#4B5563',
        background: '#F9FAFB',
        label: 'Outros'
    }
} as const;

type ExamCategory = keyof typeof EXAM_CATEGORIES;

interface ExamAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    fileUrl: string;
    uploadProgress?: number;
    isProcessing?: boolean;
}

interface ExamDialogProps {
    open: boolean;
    onClose: () => void;
    exam?: Exam | null;
    patientId: string;
    onSave: (examData: Partial<Exam>) => Promise<void>;
    onDelete?: (examId: string) => Promise<void>;
}

interface ExamFormData {
    title: string;
    examDate: string;
    examCategory: ExamCategory;
    observations: string;
    clinicalIndication: string;
    urgency: ExamUrgency;
    preparation: string;
    additionalInstructions: string;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

const ExamDialog: React.FC<ExamDialogProps> = ({
    open,
    onClose,
    exam = null,
    patientId,
    onSave,
    onDelete
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<ExamFormData>({
        title: '',
        examDate: format(new Date(), 'yyyy-MM-dd'),
        examCategory: 'LabGerais',
        observations: '',
        clinicalIndication: '',
        urgency: 'Normal',
        preparation: '',
        additionalInstructions: ''
    });

    const [attachments, setAttachments] = useState<ExamAttachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info'
    });

    // Load exam data when dialog opens
    useEffect(() => {
        if (open && exam) {
            setFormData({
                title: exam.exam_name || '',
                examDate: exam.exam_date || format(new Date(), 'yyyy-MM-dd'),
                examCategory: (exam.exam_category as ExamCategory) || 'LabGerais',
                observations: exam.additional_notes || '',
                clinicalIndication: exam.request_details?.clinical_indication || '',
                urgency: exam.request_details?.urgency || 'Normal',
                preparation: exam.request_details?.required_preparation || '',
                additionalInstructions: exam.request_details?.additional_instructions || ''
            });
            // Load attachments if available
            setAttachments([]);
        } else if (open) {
            // Reset form for new exam
            setFormData({
                title: '',
                examDate: format(new Date(), 'yyyy-MM-dd'),
                examCategory: 'LabGerais',
                observations: '',
                clinicalIndication: '',
                urgency: 'Normal',
                preparation: '',
                additionalInstructions: ''
            });
            setAttachments([]);
        }
    }, [open, exam]);

    const handleInputChange = (field: keyof ExamFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSelectChange = (field: keyof ExamFormData) => (
        event: SelectChangeEvent<string>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            handleFileUpload(file);
        });
    };

    const handleFileUpload = async (file: File) => {
        const attachment: ExamAttachment = {
            id: Date.now().toString(),
            fileName: file.name,
            fileType: file.type,
            fileSize: formatFileSize(file.size),
            fileUrl: '',
            uploadProgress: 0,
            isProcessing: true
        };

        setAttachments(prev => [...prev, attachment]);

        try {
            // Simulate file upload
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setAttachments(prev => 
                    prev.map(att => 
                        att.id === attachment.id 
                            ? { ...att, uploadProgress: progress }
                            : att
                    )
                );
            }

            // Complete upload
            setAttachments(prev => 
                prev.map(att => 
                    att.id === attachment.id 
                        ? { 
                            ...att, 
                            fileUrl: URL.createObjectURL(file),
                            isProcessing: false,
                            uploadProgress: 100
                        }
                        : att
                )
            );

            showSnackbar('Arquivo anexado com sucesso!', 'success');
        } catch (error) {
            setAttachments(prev => prev.filter(att => att.id !== attachment.id));
            showSnackbar('Erro ao anexar arquivo', 'error');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleRemoveAttachment = (attachmentId: string) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const examData: Partial<Exam> = {
                exam_name: formData.title,
                exam_date: formData.examDate,
                exam_category: formData.examCategory,
                exam_type: formData.examCategory,
                additional_notes: formData.observations,
                patient_id: patientId,
                status: 'Solicitado',
                request_details: {
                    clinical_indication: formData.clinicalIndication,
                    urgency: formData.urgency,
                    required_preparation: formData.preparation,
                    additional_instructions: formData.additionalInstructions
                }
            };

            if (exam?.id) {
                examData.id = exam.id;
            }

            await onSave(examData);
            setIsSaved(true);
            showSnackbar('Exame salvo com sucesso!', 'success');
            
            setTimeout(() => {
                onClose();
                setIsSaved(false);
            }, 1000);
        } catch (error) {
            showSnackbar('Erro ao salvar exame', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!exam?.id || !onDelete) return;

        setIsLoading(true);
        try {
            await onDelete(exam.id);
            showSnackbar('Exame excluído com sucesso!', 'success');
            onClose();
        } catch (error) {
            showSnackbar('Erro ao excluir exame', 'error');
        } finally {
            setIsLoading(false);
            setIsDeleteConfirm(false);
        }
    };

    const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const steps = ['Informações Básicas', 'Anexos', 'Revisão'];

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <TextField
                            fullWidth
                            label="Título do Exame"
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            margin="normal"
                            required
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Data do Exame"
                                type="date"
                                value={formData.examDate}
                                onChange={handleInputChange('examDate')}
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                            />
                            
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    value={formData.examCategory}
                                    onChange={handleSelectChange('examCategory')}
                                    label="Categoria"
                                >
                                    {Object.entries(EXAM_CATEGORIES).map(([key, category]) => (
                                        <MenuItem key={key} value={key}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: category.main
                                                    }}
                                                />
                                                {category.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            fullWidth
                            label="Indicação Clínica"
                            value={formData.clinicalIndication}
                            onChange={handleInputChange('clinicalIndication')}
                            multiline
                            rows={2}
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Urgência</InputLabel>
                            <Select
                                value={formData.urgency}
                                onChange={handleSelectChange('urgency')}
                                label="Urgência"
                            >
                                <MenuItem value="Normal">Normal</MenuItem>
                                <MenuItem value="Urgente">Urgente</MenuItem>
                                <MenuItem value="Emergência">Emergência</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Preparo Necessário"
                            value={formData.preparation}
                            onChange={handleInputChange('preparation')}
                            multiline
                            rows={2}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            label="Observações Adicionais"
                            value={formData.observations}
                            onChange={handleInputChange('observations')}
                            multiline
                            rows={3}
                            margin="normal"
                        />
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        {/* File Upload Area */}
                        <Paper
                            sx={{
                                p: 3,
                                border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
                                bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                mb: 2
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const files = e.dataTransfer.files;
                                Array.from(files).forEach(handleFileUpload);
                            }}
                        >
                            <AttachFileOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                                Adicionar Anexos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Arraste arquivos aqui ou clique para selecionar
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                Formatos aceitos: PDF, JPG, PNG, DOC (Máx: 10MB)
                            </Typography>
                        </Paper>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />

                        {/* Attachments List */}
                        {attachments.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Anexos ({attachments.length})
                                </Typography>
                                {attachments.map((attachment) => (
                                    <Paper key={attachment.id} sx={{ p: 2, mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1 }}>
                                                {attachment.fileType.includes('pdf') && <PictureAsPdfIcon color="error" />}
                                                {attachment.fileType.includes('image') && <ImageOutlinedIcon color="primary" />}
                                                {attachment.fileType.includes('doc') && <DescriptionOutlinedIcon color="info" />}
                                                
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" noWrap>
                                                        {attachment.fileName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {attachment.fileSize}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {attachment.isProcessing && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={attachment.uploadProgress || 0} 
                                                        sx={{ width: 60 }}
                                                    />
                                                    <Typography variant="caption">
                                                        {attachment.uploadProgress}%
                                                    </Typography>
                                                </Box>
                                            )}

                                            {!attachment.isProcessing && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveAttachment(attachment.id)}
                                                    color="error"
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Revisão do Exame
                        </Typography>
                        
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Título</Typography>
                                <Typography variant="body1">{formData.title || 'Não informado'}</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Data</Typography>
                                    <Typography variant="body1">
                                        {format(new Date(formData.examDate), 'dd/MM/yyyy', { locale: ptBR })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Categoria</Typography>
                                    <Chip 
                                        label={EXAM_CATEGORIES[formData.examCategory].label}
                                        size="small"
                                        sx={{ 
                                            bgcolor: EXAM_CATEGORIES[formData.examCategory].light,
                                            color: EXAM_CATEGORIES[formData.examCategory].dark
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Urgência</Typography>
                                    <Chip 
                                        label={formData.urgency}
                                        size="small"
                                        color={formData.urgency === 'Emergência' ? 'error' : formData.urgency === 'Urgente' ? 'warning' : 'default'}
                                    />
                                </Box>
                            </Box>

                            {formData.clinicalIndication && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Indicação Clínica</Typography>
                                    <Typography variant="body1">{formData.clinicalIndication}</Typography>
                                </Box>
                            )}

                            {formData.preparation && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Preparo</Typography>
                                    <Typography variant="body1">{formData.preparation}</Typography>
                                </Box>
                            )}

                            {formData.observations && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Observações</Typography>
                                    <Typography variant="body1">{formData.observations}</Typography>
                                </Box>
                            )}

                            {attachments.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Anexos ({attachments.length})
                                    </Typography>
                                    {attachments.map((attachment) => (
                                        <Chip 
                                            key={attachment.id}
                                            label={attachment.fileName}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <ThemeProvider theme={createTheme(theme)}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    {/* Header */}
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BiotechIcon color="primary" />
                            <Typography variant="h6">
                                {exam ? 'Editar Exame' : 'Novo Exame'}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleClose} disabled={isLoading}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Stepper */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Stepper activeStep={currentStep} alternativeLabel={!isMobile}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{!isMobile ? label : ''}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                        {renderStepContent(currentStep)}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                        p: 2, 
                        borderTop: 1, 
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            {exam && onDelete && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setIsDeleteConfirm(true)}
                                    disabled={isLoading}
                                    startIcon={<DeleteOutlineIcon />}
                                >
                                    Excluir
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {currentStep > 0 && (
                                <Button
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    disabled={isLoading}
                                >
                                    Voltar
                                </Button>
                            )}
                            
                            {currentStep < steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={!formData.title || isLoading}
                                >
                                    Próximo
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={!formData.title || isLoading}
                                    startIcon={isLoading ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
                                >
                                    {isLoading ? 'Salvando...' : 'Salvar Exame'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirm} onClose={() => setIsDeleteConfirm(false)}>
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Confirmar Exclusão
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => setIsDeleteConfirm(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error" 
                            onClick={handleDelete}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                        >
                            {isLoading ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar */}
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
        </ThemeProvider>
    );
};

export default ExamDialog;