import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  FiberManualRecord as FiberManualRecordIcon,
  Medication as MedicationIcon,
  LocalPharmacy as LocalPharmacyIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PrescriptionType = 'controlada' | 'especial' | 'antimicrobiano' | 'comum';

interface PrescriptionNote {
  id?: string;
  noteTitle: string;
  noteText: string;
  consultationDate?: Date | string;
  createdAt: Date | string;
}

interface PrescriptionNoteCardProps {
  note: PrescriptionNote;
  onOpen?: (note: PrescriptionNote) => void;
  onClick?: () => void;
}

// Componente para renderizar o tipo da receita com a cor e ícone apropriados
const PrescriptionTypeChip: React.FC<{ type: PrescriptionType }> = ({ type }) => {
  let chipColor: string;
  let chipLabel: string;

  switch (type) {
    case 'controlada':
      chipColor = '#F59E0B';
      chipLabel = 'CONTROLADA';
      break;
    case 'especial':
      chipColor = '#F43F5E';
      chipLabel = 'ESPECIAL';
      break;
    case 'antimicrobiano':
      chipColor = '#6366F1';
      chipLabel = 'ANTIMICROBIANO';
      break;
    default:
      chipColor = '#22C55E';
      chipLabel = 'COMUM';
  }

  return (
    <Chip
      icon={<LocalPharmacyIcon sx={{ fontSize: '16px !important', mr: -0.5 }} />}
      label={chipLabel}
      size="small"
      sx={{
        height: '22px',
        backgroundColor: `${chipColor}20`, // Cor com 20% de opacidade
        color: chipColor,
        fontWeight: 600,
        fontSize: '10px',
        ml: 1,
        '& .MuiChip-icon': {
          color: chipColor
        }
      }}
    />
  );
};

const PrescriptionNoteCard: React.FC<PrescriptionNoteCardProps> = ({ 
  note, 
  onOpen, 
  onClick 
}) => {
  // Extrair tipo da receita do texto da nota se disponível
  const getPrescriptionType = (): PrescriptionType => {
    if (note.noteText) {
      if (note.noteText.includes('Controlada')) return 'controlada';
      if (note.noteText.includes('Especial')) return 'especial';
      if (note.noteText.includes('Antimicrobiano')) return 'antimicrobiano';
    }
    return 'comum';
  };

  const prescriptionType = getPrescriptionType();

  // Formatar data
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Formatar data para criar o texto
  const getCreatedText = (date: Date | string | undefined): string => {
    if (!date) return '';
    return `Criado em ${formatDate(date)}`;
  };

  // Extrair lista de medicamentos do texto da nota, se disponível
  const getMedications = (): string[] => {
    if (!note.noteText) return [];

    const match = note.noteText.split('Medicamentos:')[1];
    if (!match) return [];

    return match
      .trim()
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(2));
  };

  const medications = getMedications();

  const handleClick = () => {
    if (onOpen) onOpen(note);
    if (onClick) onClick();
  };

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: '12px',
        border: '1px solid #22C55E30',
        boxShadow: '0px 2px 4px rgba(34, 197, 94, 0.15)',
        mb: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        '&:hover': {
          boxShadow: '0px 4px 10px rgba(34, 197, 94, 0.2)',
          borderColor: '#22C55E60',
        }
      }}
      onClick={handleClick}
    >
      <Box sx={{
        display: 'flex',
        width: '100%',
        p: 0,
        minHeight: '72px'
      }}>
        {/* Coluna esquerda - Data da emissão */}
        <Box sx={{
          width: '130px',
          borderRight: '1px solid #EAECEF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 2,
          py: 1.5,
          bgcolor: 'rgba(34, 197, 94, 0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <FiberManualRecordIcon
              sx={{
                color: '#22C55E',
                fontSize: 8,
                mr: 0.75
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#22C55E',
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Receita:
            </Typography>
          </Box>
          <Typography
            sx={{
              color: '#111E5A',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              ml: 1.75 // Alinhado com o texto após o ícone acima
            }}
          >
            {note.consultationDate ? formatDate(note.consultationDate) : formatDate(note.createdAt)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 11,
              ml: 1.75,
              mt: 0.5
            }}
          >
            {getCreatedText(note.createdAt)}
          </Typography>
        </Box>

        {/* Coluna central - Conteúdo principal */}
        <Box sx={{
          flex: 1,
          px: 2.5,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#111E5A',
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {note.noteTitle}
            </Typography>
            <PrescriptionTypeChip type={prescriptionType} />
          </Box>

          {/* Lista de medicamentos */}
          <Box sx={{ overflow: 'hidden', maxHeight: '40px' }}>
            {medications.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {medications.slice(0, 2).map((medication, index) => (
                  <Chip
                    key={index}
                    icon={<MedicationIcon sx={{ fontSize: '14px !important' }} />}
                    label={medication.length > 30 ? `${medication.substring(0, 30)}...` : medication}
                    size="small"
                    sx={{
                      height: '22px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      fontWeight: 500,
                      fontSize: 11,
                      '& .MuiChip-icon': {
                        color: '#22C55E'
                      }
                    }}
                  />
                ))}
                {medications.length > 2 && (
                  <Chip
                    label={`+${medications.length - 2}`}
                    size="small"
                    sx={{
                      height: '22px',
                      backgroundColor: '#ECF1FF',
                      color: '#1852FE',
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 14,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {note.noteText}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Coluna direita - PDF */}
        <Box sx={{
          width: '100px',
          borderLeft: '1px solid #EAECEF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1.5,
          bgcolor: 'rgba(34, 197, 94, 0.05)',
        }}>
          {/* Badge indicando PDF */}
          <Chip
            icon={<PictureAsPdfIcon sx={{ fontSize: '14px !important' }} />}
            label="PDF"
            size="small"
            sx={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22C55E',
              fontWeight: 600,
              fontSize: 11,
              mb: 1,
              height: '22px',
              borderRadius: '12px',
              '& .MuiChip-icon': {
                color: '#22C55E'
              }
            }}
          />

          {/* Ícone do PDF */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '4px',
              backgroundColor: '#DCFCE7',
              border: '1px solid #A6F4C5',
            }}
          >
            <PictureAsPdfIcon sx={{ color: '#22C55E' }} />
          </Box>
        </Box>
      </Box>

      {/* Selo de Receita */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#22C55E',
          color: 'white',
          borderRadius: '0 12px 0 12px',
          px: 1.5,
          py: 0.3,
          fontSize: 11,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <LocalPharmacyIcon sx={{ fontSize: 14, mr: 0.5 }} />
        RECEITA
      </Box>
    </Box>
  );
};

export default PrescriptionNoteCard;