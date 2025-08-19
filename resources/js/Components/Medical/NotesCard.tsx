import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

interface Document {
  url: string;
  nome: string;
  tamanho: string;
}

interface NotesCardProps {
  note?: {
    dataConsulta?: string;
    dataCriacao?: string;
    tituloNota?: string;
    textoNota?: string;
    docsArray?: Document[];
  };
  onClick?: () => void;
  compact?: boolean;
}

const NotesCard: React.FC<NotesCardProps> = ({ 
  note, 
  onClick,
  compact = false 
}) => {
  const {
    dataConsulta,
    dataCriacao,
    tituloNota,
    textoNota,
    docsArray = [],
  } = note || {};

  // Se houver mais de um item nos documentos, exibe o círculo com a contagem
  const showDocsCircle = docsArray.length > 1;
  // Se houver pelo menos um documento, exibe a área de pdf
  const showPdfInfo = docsArray.length >= 1;
  const firstDoc = docsArray[0] || {};

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: compact ? '16px 24px' : '19px 43px',
        alignItems: 'flex-start',
        gap: compact ? '16px' : '48px',
        borderRadius: '30px',
        border: '1px solid #EAECEF',
        background: '#FFF',
        maxWidth: '1110px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(24, 82, 254, 0.15)',
        } : {},
      }}
    >
      {/* Card Data Consulta */}
      {dataConsulta && (
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: '6.4px',
                  height: '6.4px',
                  backgroundColor: '#1852FE',
                  borderRadius: '50%',
                }}
              />
              {dataConsulta}
            </Box>
          }
          size="small"
          sx={{
            height: '32px',
            padding: '4px 13.6px',
            borderRadius: '79.2px',
            border: '0.8px solid #B9D6FF',
            background: '#EDF5FF',
            color: '#2971FF',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12.8px',
            fontWeight: 500,
            '& .MuiChip-label': {
              padding: 0,
            },
          }}
        />
      )}

      {/* Data Criação */}
      {dataCriacao && (
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#111E5A',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: compact ? '12px' : '14px',
            fontWeight: 500,
            lineHeight: compact ? '20px' : '28.8px',
          }}
        >
          {dataCriacao}
        </Typography>
      )}

      {/* Título da Nota */}
      {tituloNota && (
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#111E5A',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: compact ? '18px' : '25px',
            fontWeight: 500,
            lineHeight: compact ? '24px' : '42.703px',
            maxWidth: compact ? '100%' : '156px',
          }}
        >
          {tituloNota}
        </Typography>
      )}

      {/* Texto da Nota – máximo de 2 linhas */}
      {textoNota && (
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#111E5A',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: compact ? '14px' : '16px',
            fontWeight: 500,
            lineHeight: '24px',
            maxWidth: compact ? '100%' : '333px',
          }}
        >
          {textoNota}
        </Typography>
      )}

      {/* Seção de documentos */}
      {showPdfInfo && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showDocsCircle && (
            <Box
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#1852FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: '#FFF',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                {`+${docsArray.length - 1}`}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PdfIcon 
              sx={{ 
                width: '30px', 
                height: '30px', 
                color: '#d32f2f',
                flexShrink: 0 
              }} 
            />
            <Box>
              <Typography
                sx={{
                  color: '#111E5A',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: compact ? '14px' : '16px',
                  fontWeight: 500,
                }}
              >
                {firstDoc.nome || '-'}
              </Typography>
              <Typography
                sx={{
                  color: '#111E5A',
                  opacity: 0.33,
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: compact ? '12px' : '16px',
                  fontWeight: 500,
                }}
              >
                {firstDoc.tamanho || '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NotesCard;