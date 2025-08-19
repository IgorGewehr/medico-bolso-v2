import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';

// Tipos
interface ActionButtonProps {
  label: string;
  icon?: string;
  iconPath?: string;
  isPrimary?: boolean;
  onClick?: () => void;
  isMobile?: boolean;
  disabled?: boolean;
}

interface TopAppBarProps {
  title?: string;
  variant?: 'standard' | 'patient-profile' | 'import';
  onBackClick?: () => void;
  onMenuToggle?: () => void;
  onPatientClick?: () => void;
  onAppointmentClick?: () => void;
  onPrescriptionClick?: () => void;
  onNotificationClick?: (data?: any) => void;
  isMobile?: boolean;
  hasNotifications?: boolean;
  notificationCount?: number;
  isSecretary?: boolean;
  canCreatePatients?: boolean;
}

// Action Button Component
const ActionButton: React.FC<ActionButtonProps> = ({ 
  label, 
  icon,
  iconPath, 
  isPrimary = false, 
  onClick, 
  isMobile = false,
  disabled = false 
}) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      disabled={disabled}
      aria-label={label}
      sx={{
        height: isMobile ? '36px' : '40px',
        textTransform: 'none',
        borderRadius: '999px',
        px: isMobile ? 2 : 3,
        minWidth: isMobile && label === '+' ? '36px' : 'auto',
        backgroundColor: isPrimary ? '#1852FE' : '#4C515C',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'none',
        fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
        '&:hover': {
          backgroundColor: isPrimary ? '#1340E5' : '#3a3e47',
          boxShadow: 'none',
        },
        '&:disabled': {
          backgroundColor: '#9CA3AF',
          color: '#FFF',
        },
      }}
    >
      {/* Icon Circle */}
      {(icon || iconPath) && (
        <Box
          component="span"
          sx={{
            display: label === '+' && isMobile ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: -1.0,
            mr: label === '+' && isMobile ? 0 : 1,
            width: isMobile ? '24px' : '28px',
            height: isMobile ? '24px' : '28px',
            borderRadius: '50%',
            backgroundColor: '#FFF',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          {iconPath ? (
            <Box
              component="img"
              src={iconPath}
              alt={`${label} icon`}
              sx={{
                width: isMobile ? '16px' : '20px',
                height: isMobile ? '16px' : '20px',
              }}
            />
          ) : (
            <AddIcon sx={{ 
              width: isMobile ? '16px' : '20px', 
              height: isMobile ? '16px' : '20px',
              color: isPrimary ? '#1852FE' : '#4C515C'
            }} />
          )}
        </Box>
      )}

      {/* Label */}
      <Typography
        sx={{
          fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 500,
          display: isMobile && label !== '+' ? 'none' : 'block',
        }}
      >
        {label}
      </Typography>
    </Button>
  );
};

// Back Button Component
const BackButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '1px solid #E5E7EB',
        backgroundColor: '#1852FE',
        mr: 2,
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          backgroundColor: '#1340E5',
        },
      }}
    >
      <ArrowBackIcon sx={{ color: '#FFF', fontSize: '14px' }} />
    </IconButton>
  );
};

// Notification Button Component
const NotificationButton: React.FC<{
  onClick?: () => void;
  hasNotifications?: boolean;
  count?: number;
}> = ({ onClick, hasNotifications = false, count = 0 }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: '40px',
        height: '40px',
        backgroundColor: '#F8FAFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#ECF1FF',
          borderColor: '#1852FE',
        },
      }}
    >
      <Badge 
        badgeContent={count > 0 ? count : null} 
        color="error"
        variant={count > 99 ? 'standard' : 'dot'}
      >
        {hasNotifications ? (
          <NotificationsActiveIcon sx={{ 
            color: '#1852FE', 
            fontSize: '20px' 
          }} />
        ) : (
          <NotificationsIcon sx={{ 
            color: '#64748B', 
            fontSize: '20px' 
          }} />
        )}
      </Badge>
    </IconButton>
  );
};

// Main TopAppBar Component
const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'Dashboard',
  variant = 'standard',
  onBackClick,
  onMenuToggle,
  onPatientClick,
  onAppointmentClick,
  onPrescriptionClick,
  onNotificationClick,
  isMobile = false,
  hasNotifications = false,
  notificationCount = 0,
  isSecretary = false,
  canCreatePatients = true,
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Render buttons based on variant
  const renderButtons = () => {
    const baseButtons = [
      {
        label: 'Receita',
        iconPath: '/newreceita.svg',
        isPrimary: true,
        onClick: onPrescriptionClick,
      },
      ...((!isSecretary || canCreatePatients) ? [{
        label: 'Paciente',
        iconPath: '/newpaciente.svg',
        isPrimary: false,
        onClick: onPatientClick,
      }] : []),
      {
        label: 'Agendamento',
        iconPath: '/newagendamento.svg',
        isPrimary: false,
        onClick: onAppointmentClick,
      },
    ];

    switch (variant) {
      case 'patient-profile':
        return (
          <>
            {baseButtons.map((btn, idx) => (
              <ActionButton
                key={idx}
                {...btn}
                isMobile={isMobile}
              />
            ))}
          </>
        );
      
      case 'import':
        return (
          <ActionButton 
            label="Importar Ficha" 
            iconPath="/import.svg" 
            isMobile={isMobile} 
          />
        );
      
      default:
        return (
          <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2 }}>
            {baseButtons.map((btn, idx) => (
              <ActionButton
                key={idx}
                {...btn}
                isMobile={isMobile}
              />
            ))}
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        height: isMobile ? '60px' : '80px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : isTablet ? '0 24px' : '0 40px',
        boxSizing: 'border-box',
        backgroundColor: '#FFF',
        borderBottom: '1px solid #F0F0F0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left Side - Title and Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Mobile Menu Button */}
        {isMobile && onMenuToggle && (
          <IconButton
            onClick={onMenuToggle}
            sx={{
              mr: 1,
              p: 1,
              color: '#111E5A'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* Back Button (Desktop only) */}
        {!isMobile && onBackClick && (
          <BackButton onClick={onBackClick} />
        )}
        
        {/* Title */}
        <Typography
          sx={{
            color: '#111E5A',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: isMobile ? '18px' : isTablet ? '24px' : '30px',
            fontWeight: 500,
            lineHeight: 1.2,
            ml: isMobile ? 0 : (onBackClick ? 0 : 2),
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Side - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        {/* Notifications */}
        <NotificationButton
          onClick={onNotificationClick}
          hasNotifications={hasNotifications}
          count={notificationCount}
        />

        {/* Action Buttons - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderButtons()}
          </Box>
        )}
        
        {/* Primary Action Button - Mobile */}
        {isMobile && (
          <ActionButton 
            label="+" 
            icon="add"
            isPrimary={true} 
            onClick={onPatientClick} 
            isMobile={isMobile} 
          />
        )}
      </Box>
    </Box>
  );
};

export default TopAppBar;