import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ExamsCardProps {
  onClick?: () => void;
  disabled?: boolean;
}

const ExamsCard: React.FC<ExamsCardProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: { xs: '100%', sm: '270px' },
        minWidth: { xs: '280px', sm: '270px' },
        maxWidth: { xs: '100%', sm: '270px' },
        height: { xs: '200px', sm: '240px' },
        borderRadius: { xs: '20px', sm: '30px' },
        border: '1px solid #EAECEF',
        backgroundColor: '#FFF',
        position: 'relative',
        flexShrink: 0,
        padding: { xs: '16px 20px', sm: '21px 24px 18px 24px' },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.6 : 1,
        '&:hover': onClick && !disabled ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(24, 82, 254, 0.15)',
        } : {},
      }}
    >
      {/* Imagem Principal */}
      <Box
        component="img"
        src="/examescard.svg"
        alt="Exames"
        sx={{
          width: { xs: '90px', sm: '108.39px' },
          height: { xs: '120px', sm: '150px' },
          flexShrink: 0,
          marginBottom: { xs: '12px', sm: '18px' },
        }}
      />

      {/* Título e Botão */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#111E5A',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: { xs: '18px', sm: '25px' },
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: { xs: '24px', sm: '42.703px' },
          }}
        >
          Exames
        </Typography>

        {/* Botão de Ação */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '44px', sm: '36.43px' },
            height: { xs: '44px', sm: '36.43px' },
            borderRadius: { xs: '22px', sm: '18.215px' },
            backgroundColor: disabled ? '#B0BEC5' : '#1852FE',
            padding: { xs: '10px', sm: '9.107px' },
            flexShrink: 0,
            cursor: onClick && !disabled ? 'pointer' : 'default',
            transition: 'all 0.2s ease-in-out',
            '&:hover': onClick && !disabled ? {
              backgroundColor: '#1340E5',
              transform: 'scale(1.05)',
            } : {},
            '&:active': onClick && !disabled ? {
              transform: 'scale(0.95)',
            } : {},
          }}
        >
          <AddIcon
            sx={{
              width: { xs: '20px', sm: '18.215px' },
              height: { xs: '20px', sm: '18.215px' },
              color: 'white',
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ExamsCard;