import React from 'react';
import { Chip, Box, Typography, alpha } from '@mui/material';
import { 
  Badge as BadgeIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

interface SecretaryIndicatorProps {
  isSecretary: boolean;
  secretaryName?: string;
  doctorName?: string;
  variant?: 'default' | 'compact' | 'chip';
  showIcon?: boolean;
}

const SecretaryIndicator: React.FC<SecretaryIndicatorProps> = ({ 
  isSecretary, 
  secretaryName, 
  doctorName,
  variant = 'default',
  showIcon = true
}) => {
  if (!isSecretary) return null;

  // Variante chip simples
  if (variant === 'chip') {
    return (
      <Chip
        icon={showIcon ? <BadgeIcon sx={{ fontSize: '16px !important' }} /> : undefined}
        label={`${secretaryName || 'Secretária'}`}
        size="small"
        sx={{
          backgroundColor: '#E3F2FD',
          color: '#1976D2',
          fontWeight: 600,
          fontSize: '12px',
          border: '1px solid #90CAF9',
          '& .MuiChip-icon': {
            color: '#1976D2',
          },
        }}
      />
    );
  }

  // Variante compacta
  if (variant === 'compact') {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        backgroundColor: alpha('#2196F3', 0.1),
        borderRadius: '16px',
        border: `1px solid ${alpha('#2196F3', 0.3)}`,
      }}>
        {showIcon && (
          <SupervisorAccountIcon sx={{ 
            color: '#1976D2', 
            fontSize: 16 
          }} />
        )}
        <Typography variant="caption" sx={{
          color: '#1976D2',
          fontWeight: 600,
          fontSize: '11px',
          lineHeight: 1.2,
          fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          {secretaryName}
        </Typography>
      </Box>
    );
  }

  // Variante padrão (completa)
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 2,
      backgroundColor: '#E3F2FD',
      borderRadius: '12px',
      border: '1px solid #90CAF9',
      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)',
    }}>
      {showIcon && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: '#1976D2',
          color: 'white',
        }}>
          <BadgeIcon sx={{ fontSize: 18 }} />
        </Box>
      )}
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{
          color: '#1976D2',
          fontWeight: 600,
          display: 'block',
          lineHeight: 1.2,
          fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '13px',
        }}>
          👩‍⚕️ {secretaryName || 'Secretária Ativa'}
        </Typography>
        
        {doctorName && (
          <Typography variant="caption" sx={{
            color: '#666',
            fontSize: '11px',
            lineHeight: 1.2,
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            mt: 0.5,
            display: 'block',
          }}>
            Trabalhando para Dr. {doctorName}
          </Typography>
        )}
      </Box>
      
      <Chip
        label="Secretária"
        size="small"
        sx={{
          backgroundColor: '#1976D2',
          color: 'white',
          fontSize: '10px',
          fontWeight: 600,
          height: '20px',
        }}
      />
    </Box>
  );
};

export default SecretaryIndicator;