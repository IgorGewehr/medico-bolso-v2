import React from 'react';
import {
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  CloudOff as CloudOffIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  HelpOutline as HelpOutlineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Tipos
interface EmptyStateProps {
  variant?: 'empty' | 'error' | 'offline' | 'search' | 'info';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}

// Ícones por variante
const getVariantIcon = (variant: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;

  const iconProps = { sx: { fontSize: 48, mb: 2 } };

  switch (variant) {
    case 'error':
      return <ErrorIcon {...iconProps} color="error" />;
    case 'offline':
      return <CloudOffIcon {...iconProps} color="disabled" />;
    case 'search':
      return <SearchIcon {...iconProps} color="disabled" />;
    case 'info':
      return <InfoIcon {...iconProps} color="info" />;
    default:
      return <HelpOutlineIcon {...iconProps} color="disabled" />;
  }
};

// Cores por variante
const getVariantColors = (variant: string, theme: any) => {
  switch (variant) {
    case 'error':
      return {
        primary: theme.palette.error.main,
        secondary: theme.palette.error.light,
        background: alpha(theme.palette.error.main, 0.05),
      };
    case 'offline':
      return {
        primary: theme.palette.grey[600],
        secondary: theme.palette.grey[400],
        background: alpha(theme.palette.grey[500], 0.05),
      };
    case 'search':
      return {
        primary: theme.palette.text.secondary,
        secondary: theme.palette.text.disabled,
        background: alpha(theme.palette.action.selected, 0.3),
      };
    case 'info':
      return {
        primary: theme.palette.info.main,
        secondary: theme.palette.info.light,
        background: alpha(theme.palette.info.main, 0.05),
      };
    default:
      return {
        primary: theme.palette.text.primary,
        secondary: theme.palette.text.secondary,
        background: alpha(theme.palette.action.selected, 0.2),
      };
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty',
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'medium',
  fullHeight = false,
}) => {
  const theme = useTheme();
  const colors = getVariantColors(variant, theme);
  const variantIcon = getVariantIcon(variant, icon);

  // Configurações por tamanho
  const sizeConfig = {
    small: {
      padding: 4,
      titleSize: '18px',
      descriptionSize: '14px',
      iconScale: 0.7,
    },
    medium: {
      padding: 6,
      titleSize: '24px',
      descriptionSize: '16px',
      iconScale: 1,
    },
    large: {
      padding: 8,
      titleSize: '28px',
      descriptionSize: '18px',
      iconScale: 1.2,
    },
  };

  const config = sizeConfig[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: config.padding,
        minHeight: fullHeight ? '400px' : 'auto',
        borderRadius: '16px',
        backgroundColor: colors.background,
        border: `1px solid ${alpha(colors.primary, 0.1)}`,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          transform: `scale(${config.iconScale})`,
          mb: 2,
          opacity: 0.8,
        }}
      >
        {variantIcon}
      </Box>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          color: colors.primary,
          fontSize: config.titleSize,
          fontWeight: 600,
          fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
          mb: description ? 1 : 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          sx={{
            color: colors.secondary,
            fontSize: config.descriptionSize,
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            mb: (action || secondaryAction) ? 3 : 0,
            maxWidth: '400px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {action && (
            <Button
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
              onClick={action.onClick}
              sx={{
                borderRadius: '50px',
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                minWidth: '120px',
                boxShadow: action.variant === 'contained' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: action.variant === 'contained' ? '0 6px 16px rgba(0,0,0,0.2)' : 'none',
                },
              }}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outlined'}
              onClick={secondaryAction.onClick}
              sx={{
                borderRadius: '50px',
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                minWidth: '120px',
                borderColor: alpha(colors.primary, 0.3),
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  backgroundColor: alpha(colors.primary, 0.04),
                },
              }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

// Estados pré-definidos comuns
export const EmptyPatientsList: React.FC<{
  onAddPatient?: () => void;
}> = ({ onAddPatient }) => (
  <EmptyState
    variant="empty"
    title="Nenhum paciente encontrado"
    description="Comece adicionando seu primeiro paciente para gerenciar consultas e históricos médicos."
    icon={<PersonAddIcon sx={{ fontSize: 48, mb: 2, color: '#1852FE' }} />}
    action={onAddPatient ? {
      label: 'Adicionar Paciente',
      onClick: onAddPatient,
      variant: 'contained',
    } : undefined}
    size="medium"
    fullHeight
  />
);

export const EmptySearchResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    variant="search"
    title={`Nenhum resultado encontrado${searchTerm ? ` para "${searchTerm}"` : ''}`}
    description="Tente ajustar sua busca ou verifique a ortografia das palavras-chave."
    action={onClearSearch ? {
      label: 'Limpar Busca',
      onClick: onClearSearch,
      variant: 'outlined',
    } : undefined}
    size="medium"
  />
);

export const ConnectionError: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    variant="error"
    title="Erro de Conexão"
    description="Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente."
    icon={<CloudOffIcon sx={{ fontSize: 48, mb: 2, color: '#f44336' }} />}
    action={onRetry ? {
      label: 'Tentar Novamente',
      onClick: onRetry,
      variant: 'contained',
      color: 'error',
    } : undefined}
    size="medium"
    fullHeight
  />
);

export const ComingSoon: React.FC<{
  feature?: string;
}> = ({ feature = 'Esta funcionalidade' }) => (
  <EmptyState
    variant="info"
    title="Em Breve"
    description={`${feature} estará disponível em uma próxima atualização. Fique atento às novidades!`}
    icon={<InfoIcon sx={{ fontSize: 48, mb: 2, color: '#2196f3' }} />}
    size="medium"
    fullHeight
  />
);

export default EmptyState;