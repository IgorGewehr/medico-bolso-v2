import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  alpha, 
  keyframes,
  useTheme,
} from '@mui/material';
import { 
  LocalHospital as HospitalIcon,
  FavoriteRounded as HeartIcon,
} from '@mui/icons-material';

// Tipos
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  submessage?: string;
  variant?: 'standard' | 'medical' | 'minimal';
  fullscreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
}

// Animações
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const heartBeat = keyframes`
  0%, 14%, 28%, 42%, 70% {
    transform: scale(1);
  }
  7%, 21%, 35% {
    transform: scale(1.1);
  }
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Carregando...',
  submessage,
  variant = 'standard',
  fullscreen = false,
  color = 'primary',
}) => {
  const theme = useTheme();

  // Configurações por tamanho
  const sizeConfig = {
    small: {
      spinner: 24,
      fontSize: '14px',
      spacing: 2,
      container: '80px',
    },
    medium: {
      spinner: 40,
      fontSize: '16px',
      spacing: 3,
      container: '120px',
    },
    large: {
      spinner: 56,
      fontSize: '18px',
      spacing: 4,
      container: '160px',
    },
  };

  const config = sizeConfig[size];

  // Container comum
  const containerProps = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: config.spacing,
    ...(fullscreen && {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: alpha('#FFF', 0.9),
      backdropFilter: 'blur(4px)',
      zIndex: theme.zIndex.modal + 1,
    }),
    ...(!fullscreen && {
      padding: config.spacing * 2,
      minHeight: config.container,
    }),
  };

  // Renderizar variante standard
  if (variant === 'standard') {
    return (
      <Box sx={containerProps}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={config.spinner}
            thickness={4}
            color={color}
            sx={{
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HospitalIcon 
              sx={{ 
                color: theme.palette.primary.main, 
                fontSize: config.spinner * 0.4,
                animation: `${float} 3s ease-in-out infinite`,
              }} 
            />
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.primary,
              fontSize: config.fontSize,
              fontWeight: 500,
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              mb: submessage ? 0.5 : 0,
            }}
          >
            {message}
          </Typography>
          
          {submessage && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: `calc(${config.fontSize} - 2px)`,
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {submessage}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Renderizar variante medical
  if (variant === 'medical') {
    return (
      <Box sx={containerProps}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: config.spinner + 20,
            height: config.spinner + 20,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <CircularProgress
            size={config.spinner}
            thickness={3}
            color="primary"
            sx={{
              position: 'absolute',
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
          
          <HeartIcon
            sx={{
              color: theme.palette.error.main,
              fontSize: config.spinner * 0.4,
              animation: `${heartBeat} 2s ease-in-out infinite`,
            }}
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontSize: config.fontSize,
              fontWeight: 600,
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              mb: submessage ? 0.5 : 0,
            }}
          >
            {message}
          </Typography>
          
          {submessage && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: `calc(${config.fontSize} - 2px)`,
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {submessage}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Renderizar variante minimal
  return (
    <Box sx={containerProps}>
      <CircularProgress
        size={config.spinner}
        thickness={2}
        color={color}
        sx={{
          opacity: 0.8,
        }}
      />
      
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: `calc(${config.fontSize} - 2px)`,
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;