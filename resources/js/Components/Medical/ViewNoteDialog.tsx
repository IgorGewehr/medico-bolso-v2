import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Grid,
  Paper,
  Avatar,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Slide,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  AttachFile as AttachFileIcon,
  Medication as MedicationIcon,
  EventNote as EventNoteIcon,
  HistoryEdu as HistoryEduIcon,
  Assignment as AssignmentIcon,
  Biotech as BiotechIcon,
  DeleteOutline as DeleteOutlineIcon,
  Warning as WarningIcon,
  Link as LinkIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
interface NoteAttachment {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  uploadedAt?: Date | string;
}

interface Medication {
  nome?: string;
  medicationName?: string;
  name?: string;
  concentracao?: string;
  dosage?: string;
  posologia?: string;
  frequency?: string;
  duracao?: string;
  duration?: string;
  quantidade?: string;
  quantity?: string;
  observacao?: string;
  observation?: string;
}

interface NoteData {
  id: string;
  noteTitle?: string;
  titulo?: string;
  noteText?: string;
  category?: string;
  createdAt: Date | string;
  lastModified?: Date | string;
  consultationDate?: Date | string;
  tipo?: string;
  uso?: string;
  dataEmissao?: Date | string;
  dataValidade?: Date | string;
  orientacaoGeral?: string;
  attachments?: NoteAttachment[];
  medicamentos?: Medication[];
  medications?: Medication[];
  pdfUrl?: string;
}

type NoteType = 'Anamnese' | 'Receita' | 'Exame' | 'Consulta' | 'Rápida' | string;

interface ViewNoteDialogProps {
  open: boolean;
  onClose: () => void;
  noteData?: NoteData;
  noteType: NoteType;
  patientName?: string;
  onEdit?: (noteData: NoteData) => void;
  onDelete?: (noteId: string) => void;
  onOpenPdf?: () => void;
  onOpenAttachment?: (attachment: NoteAttachment) => void;
}

// Transição para o Dialog
const Transition = React.forwardRef<unknown, any>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Cores por tipo de nota
const getTypeColors = (type: NoteType) => {
  switch (type) {
    case 'Anamnese':
      return {
        main: '#6366F1',
        light: '#EDEDFF',
        dark: '#4338CA',
        background: '#F5F5FF',
      };
    case 'Receita':
      return {
        main: '#22C55E',
        light: '#ECFDF5',
        dark: '#16A34A',
        background: '#F0FFF4',
      };
    case 'Exame':
      return {
        main: '#F59E0B',
        light: '#FEF9C3',
        dark: '#D97706',
        background: '#FFFBEB',
      };
    default:
      return {
        main: '#1852FE',
        light: '#ECF1FF',
        dark: '#0A3CC9',
        background: '#F0F5FF',
      };
  }
};

// Ícones por tipo de nota
const getTypeIcon = (type: NoteType) => {
  switch (type) {
    case 'Anamnese':
      return <HistoryEduIcon />;
    case 'Receita':
      return <MedicationIcon />;
    case 'Exame':
      return <BiotechIcon />;
    case 'Consulta':
      return <EventNoteIcon />;
    default:
      return <AssignmentIcon />;
  }
};

// Labels por tipo de nota
const getTypeLabel = (type: NoteType) => {
  switch (type) {
    case 'Anamnese':
      return 'Anamnese';
    case 'Receita':
      return 'Receita Médica';
    case 'Exame':
      return 'Exame';
    case 'Consulta':
      return 'Nota de Consulta';
    case 'Rápida':
      return 'Nota Rápida';
    default:
      return 'Nota';
  }
};

// Informações do tipo de arquivo
const getFileTypeInfo = (fileName?: string, fileType?: string) => {
  if (!fileName) return { icon: <ArticleIcon />, color: '#94A3B8' };

  if (fileType?.startsWith('image/') || 
      fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
    return { icon: <ImageIcon />, color: '#10B981' };
  }

  if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return { icon: <PictureAsPdfIcon />, color: '#EF4444' };
  }

  return { icon: <ArticleIcon />, color: '#3B82F6' };
};

const ViewNoteDialog: React.FC<ViewNoteDialogProps> = ({
  open,
  onClose,
  noteData,
  noteType,
  patientName = 'Paciente',
  onEdit,
  onDelete,
  onOpenPdf,
  onOpenAttachment,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!noteData) return null;

  const typeColors = getTypeColors(noteType);
  const typeIcon = getTypeIcon(noteType);
  const typeLabel = getTypeLabel(noteType);

  // Formatação de datas
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTimeAgo = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
  };

  // Handlers
  const handleEdit = () => {
    if (onEdit && noteData) {
      onEdit(noteData);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && noteData.id) {
      onDelete(noteData.id);
    }
    setDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(false);
  };

  // Renderizar medicamentos para receitas
  const renderMedicamentos = () => {
    const medicamentos = noteData.medicamentos || noteData.medications || [];
    if (medicamentos.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          color: typeColors.main,
          display: 'flex',
          alignItems: 'center',
          mb: 2
        }}>
          <MedicationIcon sx={{ mr: 1 }} />
          Medicamentos
        </Typography>

        {medicamentos.map((med, index) => {
          const nome = med.nome || med.medicationName || med.name || '';
          const concentracao = med.concentracao || med.dosage || '';
          const posologia = med.posologia || med.frequency || '';
          const duracao = med.duracao || med.duration || '';
          const quantidade = med.quantidade || med.quantity || '';
          const observacao = med.observacao || med.observation || '';

          return (
            <Card key={index} sx={{
              mb: 2,
              border: `1px solid ${typeColors.light}`,
              boxShadow: 'none',
              backgroundColor: alpha(typeColors.light, 0.5),
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  {nome}
                  {concentracao && (
                    <Typography component="span" sx={{ ml: 1, fontWeight: 500 }}>
                      {concentracao}
                    </Typography>
                  )}
                </Typography>

                {posologia && (
                  <Typography variant="body1" sx={{ mt: 1, color: theme.palette.grey[700] }}>
                    <strong>Posologia:</strong> {posologia}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {quantidade && (
                    <Chip
                      label={`Quantidade: ${quantidade}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(typeColors.light, 0.7),
                        color: typeColors.dark,
                        fontWeight: 500,
                      }}
                    />
                  )}

                  {duracao && (
                    <Chip
                      label={`Duração: ${duracao}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(typeColors.light, 0.7),
                        color: typeColors.dark,
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>

                {observacao && (
                  <Typography variant="body2" sx={{
                    mt: 2,
                    color: theme.palette.grey[600],
                    fontStyle: 'italic'
                  }}>
                    <strong>Observação:</strong> {observacao}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  // Renderizar informações específicas da receita
  const renderReceitaDetails = () => {
    if (noteType !== 'Receita') return null;

    const tipoReceita = noteData.tipo ? 
      noteData.tipo.charAt(0).toUpperCase() + noteData.tipo.slice(1) : 'Comum';
    const uso = noteData.uso ? 
      noteData.uso.charAt(0).toUpperCase() + noteData.uso.slice(1) : 'Interno';

    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{
              p: 2,
              backgroundColor: alpha(typeColors.light, 0.5),
              borderRadius: 2,
              height: '100%',
            }}>
              <Typography variant="body2" color="textSecondary">Tipo de Receita</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: typeColors.main, mt: 0.5 }}>
                {tipoReceita}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{
              p: 2,
              backgroundColor: alpha(typeColors.light, 0.5),
              borderRadius: 2,
              height: '100%',
            }}>
              <Typography variant="body2" color="textSecondary">Uso</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: typeColors.main, mt: 0.5 }}>
                {uso}
              </Typography>
            </Paper>
          </Grid>

          {noteData.dataEmissao && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{
                p: 2,
                backgroundColor: alpha(typeColors.light, 0.5),
                borderRadius: 2,
              }}>
                <Typography variant="body2" color="textSecondary">Data de Emissão</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: typeColors.main, mt: 0.5 }}>
                  {formatDate(noteData.dataEmissao)}
                </Typography>
              </Paper>
            </Grid>
          )}

          {noteData.dataValidade && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{
                p: 2,
                backgroundColor: alpha(typeColors.light, 0.5),
                borderRadius: 2,
              }}>
                <Typography variant="body2" color="textSecondary">Validade</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: typeColors.main, mt: 0.5 }}>
                  {formatDate(noteData.dataValidade)}
                </Typography>
              </Paper>
            </Grid>
          )}

          {noteData.orientacaoGeral && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{
                p: 2,
                backgroundColor: alpha(typeColors.light, 0.5),
                borderRadius: 2
              }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Orientações Gerais
                </Typography>
                <Typography variant="body1">
                  {noteData.orientacaoGeral}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  // Renderizar anexos
  const renderAttachments = () => {
    if (!noteData.attachments || noteData.attachments.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          color: theme.palette.grey[800],
          display: 'flex',
          alignItems: 'center',
          mb: 2
        }}>
          <AttachFileIcon sx={{ mr: 1 }} />
          Anexos ({noteData.attachments.length})
        </Typography>

        <Grid container spacing={2}>
          {noteData.attachments.map((attachment, index) => {
            const fileInfo = getFileTypeInfo(attachment.fileName, attachment.fileType);

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #EAECEF',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(typeColors.light, 0.3),
                      borderColor: typeColors.light,
                    }
                  }}
                  onClick={() => onOpenAttachment?.(attachment)}
                >
                  <Avatar sx={{
                    bgcolor: alpha(fileInfo.color, 0.1),
                    color: fileInfo.color,
                    width: 40,
                    height: 40,
                    mr: 2
                  }}>
                    {fileInfo.icon}
                  </Avatar>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: theme.palette.grey[800],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {attachment.fileName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.grey[500] }}>
                      {attachment.fileSize} • {
                        attachment.uploadedAt ? 
                        formatDateTime(attachment.uploadedAt) : 
                        'Data desconhecida'
                      }
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : '20px',
          overflow: 'hidden',
          boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.08)',
          height: fullScreen ? '100%' : 'auto',
          maxHeight: fullScreen ? '100%' : '90vh'
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #EAECEF',
        backgroundColor: typeColors.light,
        p: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{
            bgcolor: typeColors.main,
            color: 'white',
            width: 40,
            height: 40,
            mr: 2,
            display: { xs: 'none', sm: 'flex' }
          }}>
            {typeIcon}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: typeColors.dark }}>
                {noteData.noteTitle || noteData.titulo || `${typeLabel} - ${formatDate(noteData.createdAt)}`}
              </Typography>
              <Chip
                label={noteData.category || typeLabel}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: typeColors.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: '22px'
                }}
                icon={
                  <Box component="span" sx={{ '& > svg': { color: 'white !important', fontSize: '14px !important' } }}>
                    {typeIcon}
                  </Box>
                }
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Paciente: {patientName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: theme.palette.grey[700] }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{
          height: '100%',
          p: { xs: 2, sm: 3 },
          overflow: 'auto',
          backgroundColor: typeColors.background
        }}>
          {/* Metadados */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #EAECEF'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ color: theme.palette.grey[400], fontSize: 18, mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Criado em: {formatDateTime(noteData.createdAt)}
              </Typography>
            </Box>

            {noteData.lastModified && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ color: theme.palette.grey[400], fontSize: 18, mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Atualizado: {formatTimeAgo(noteData.lastModified)}
                </Typography>
              </Box>
            )}

            {noteData.consultationDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, sm: 'auto' } }}>
                <EventNoteIcon sx={{ color: typeColors.main, fontSize: 18, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: typeColors.main }}>
                  Consulta: {formatDate(noteData.consultationDate)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Conteúdo principal */}
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid #EAECEF',
            mb: 3,
            backgroundColor: 'white'
          }}>
            {noteData.noteText && (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {noteData.noteText}
              </Typography>
            )}
          </Paper>

          {/* Conteúdo específico por tipo */}
          {noteType === 'Receita' && renderReceitaDetails()}
          {renderMedicamentos()}
          {renderAttachments()}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: { xs: 2, sm: 3 },
        borderTop: '1px solid #EAECEF',
        backgroundColor: 'white'
      }}>
        {deleteConfirm ? (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <WarningIcon sx={{ color: 'error.main', mr: 1.5 }} />
            <Typography sx={{ color: 'error.main', fontWeight: 500, mr: 'auto' }}>
              Tem certeza que deseja excluir esta nota?
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDeleteCancel}
              sx={{ mr: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </Button>
          </Box>
        ) : (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDeleteClick}
              sx={{
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.04),
                  borderColor: theme.palette.error.dark
                }
              }}
            >
              Excluir
            </Button>

            <Box>
              {(noteData.pdfUrl || onOpenPdf) && (
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={onOpenPdf}
                  sx={{ mr: 2 }}
                >
                  Ver PDF
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  backgroundColor: typeColors.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: typeColors.dark
                  }
                }}
              >
                Editar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default ViewNoteDialog;