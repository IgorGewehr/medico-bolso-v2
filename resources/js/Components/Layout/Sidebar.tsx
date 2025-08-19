import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar, 
  Tooltip, 
  Collapse,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Help as HelpIcon,
  Bug as BugIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Subscriptions as SubscriptionsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';

// Tipos
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  iconPath?: string;
  disabled?: boolean;
  isPremium?: boolean;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
  isSpecial?: boolean;
  parent?: string;
}

interface UserProfile {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  planType?: 'free' | 'monthly' | 'annual' | 'enterprise';
}

interface SidebarProps {
  selectedItem?: string;
  onMenuSelect?: (itemId: string) => void;
  onProfileClick?: () => void;
  user?: UserProfile;
  isSecretary?: boolean;
  secretaryName?: string;
  doctorName?: string;
  isMobile?: boolean;
  onUpgrade?: (moduleId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedItem = 'dashboard',
  onMenuSelect,
  onProfileClick,
  user,
  isSecretary = false,
  secretaryName,
  doctorName,
  isMobile = false,
  onUpgrade,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Menu items estruturados
  const menuItems: Record<string, MenuItem[]> = {
    principal: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        iconPath: '/dashboardico.svg',
      },
      {
        id: 'patients',
        label: 'Pacientes',
        icon: <PeopleIcon />,
        iconPath: '/pacientes.svg',
      },
      {
        id: 'prescriptions',
        label: 'Receitas',
        icon: <AssignmentIcon />,
        iconPath: '/receitas.svg',
      },
      {
        id: 'schedule',
        label: 'Agenda',
        icon: <EventIcon />,
        iconPath: '/agenda.svg',
      },
      {
        id: 'metrics',
        label: 'Métricas',
        icon: <AssessmentIcon />,
        iconPath: '/metricas.svg',
        disabled: true,
      },
      ...(isSecretary ? [] : [{
        id: 'financial',
        label: 'Financeiro',
        icon: <AccountBalanceIcon />,
        iconPath: '/financeiro.svg',
        hasSubmenu: true,
        submenu: [
          {
            id: 'financial/overview',
            label: 'Visão Geral',
            icon: <AssessmentIcon />,
            parent: 'financial',
          },
          {
            id: 'financial/transactions',
            label: 'Transações',
            icon: <AccountBalanceWalletIcon />,
            parent: 'financial',
          },
        ],
      }]),
    ],
    admin: [
      ...(user && user.planType !== 'free' ? [{
        id: 'admin',
        label: 'Dados',
        icon: <AdminPanelSettingsIcon />,
      }] : []),
    ],
    ia: [
      {
        id: 'doctor-ai',
        label: 'Doctor AI',
        icon: <PsychologyIcon />,
        isSpecial: true,
      },
    ],
    suporte: [
      {
        id: 'help',
        label: 'Central de Ajuda',
        icon: <HelpIcon />,
        iconPath: '/centralajuda.svg',
      },
      {
        id: 'report',
        label: 'Reportar',
        icon: <BugIcon />,
        iconPath: '/reportar.svg',
      },
    ],
    configuracoes: [
      ...(isSecretary ? [] : [
        {
          id: 'secretaries',
          label: 'Secretárias',
          icon: <SupervisorAccountIcon />,
          iconPath: '/secretarias.svg',
          isPremium: true,
        },
        {
          id: 'plans',
          label: 'Planos',
          icon: <SubscriptionsIcon />,
          iconPath: '/plano.svg',
        },
      ]),
    ],
  };

  // Handlers
  const handleMenuClick = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }

    if (item.isPremium && user?.planType === 'free') {
      onUpgrade?.(item.id);
      return;
    }

    if (item.hasSubmenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }

    onMenuSelect?.(item.id);
  };

  // Estilos
  const getButtonStyles = (item: MenuItem, isSelected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: isMobile ? '14px' : '12px',
    fontWeight: 500,
    textTransform: 'none' as const,
    width: '100%',
    height: isMobile ? '36px' : '28px',
    px: isMobile ? 2.5 : 2,
    py: isMobile ? 1.5 : 1,
    my: 0.5,
    borderRadius: '18px',
    transition: 'all 0.2s ease',
    color: item.disabled 
      ? '#8A94A6' 
      : isSelected 
        ? '#FFF' 
        : '#111E5A',
    backgroundColor: isSelected && !item.disabled ? '#4285F4' : 'transparent',
    opacity: item.disabled ? 0.6 : isSelected ? 0.77 : 1,
    cursor: item.disabled ? 'default' : 'pointer',
    '&:hover': item.disabled ? {} : {
      backgroundColor: isSelected 
        ? '#4285F4' 
        : 'rgba(66, 133, 244, 0.08)',
    },
    ...(item.parent && { 
      pl: 4, 
      fontSize: isMobile ? '13px' : '11px' 
    }),
  });

  const getDoctorAIStyles = (isSelected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: isMobile ? '14px' : '12px',
    fontWeight: 600,
    textTransform: 'none' as const,
    width: '100%',
    height: isMobile ? '52px' : '44px',
    px: isMobile ? 3 : 2.5,
    py: 1.5,
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    color: isSelected ? '#FFFFFF' : '#2D3748',
    background: isSelected
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#FFFFFF',
    border: `2px solid ${isSelected ? 'transparent' : '#E2E8F0'}`,
    boxShadow: isSelected
      ? '0 4px 16px rgba(102, 126, 234, 0.25)'
      : '0 2px 8px rgba(0, 0, 0, 0.06)',
    '&:hover': {
      background: isSelected
        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
        : '#F7FAFC',
      borderColor: isSelected ? 'transparent' : '#667eea',
      boxShadow: isSelected
        ? '0 6px 20px rgba(102, 126, 234, 0.35)'
        : '0 4px 12px rgba(102, 126, 234, 0.15)',
      transform: 'translateY(-1px)',
    },
  });

  const categoryStyle = {
    color: '#8A94A6',
    fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: isMobile ? '14px' : '12px',
    fontWeight: 500,
    mb: 0.8,
    mt: isMobile ? 2 : 2.5,
    ml: 1.5,
  };

  // Render item
  const renderMenuItem = (item: MenuItem) => {
    const isSelected = item.parent 
      ? selectedItem === item.id 
      : selectedItem === item.id || (item.hasSubmenu && selectedItem?.startsWith(`${item.id}/`));

    // Doctor AI especial
    if (item.isSpecial && item.id === 'doctor-ai') {
      return (
        <Tooltip key={item.id} title="Assistente Médico com IA" placement="right">
          <Button
            onClick={() => handleMenuClick(item)}
            variant="contained"
            sx={getDoctorAIStyles(isSelected)}
            startIcon={
              <AutoAwesomeIcon sx={{
                width: '20px',
                height: '20px',
                mr: 1,
                color: isSelected ? '#FFFFFF' : '#667eea'
              }} />
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.2,
                color: 'inherit'
              }}>
                {item.label}
              </Typography>
              <Typography sx={{
                fontSize: '10px',
                fontWeight: 400,
                lineHeight: 1.2,
                color: isSelected ? 'rgba(255,255,255,0.9)' : '#64748B',
                mt: 0.2
              }}>
                Assistente Médico
              </Typography>
            </Box>
          </Button>
        </Tooltip>
      );
    }

    // Item com submenu
    if (item.hasSubmenu) {
      const isExpanded = expandedMenus[item.id];
      return (
        <Box key={item.id}>
          <Button
            onClick={() => handleMenuClick(item)}
            variant="text"
            sx={getButtonStyles(item, isSelected)}
            startIcon={
              item.iconPath ? (
                <Box
                  component="img"
                  src={item.iconPath}
                  alt={item.label}
                  sx={{ width: '18px', height: '18px', mr: 1.2 }}
                />
              ) : (
                React.cloneElement(item.icon as React.ReactElement, {
                  sx: { width: '18px', height: '18px', mr: 1.2 }
                })
              )
            }
            endIcon={
              isExpanded ? 
                <ExpandLessIcon sx={{ width: 16, height: 16 }} /> : 
                <ExpandMoreIcon sx={{ width: 16, height: 16 }} />
            }
          >
            {item.label}
          </Button>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2 }}>
              {item.submenu?.map(subItem => renderMenuItem(subItem))}
            </Box>
          </Collapse>
        </Box>
      );
    }

    // Item normal
    return (
      <Button
        key={item.id}
        onClick={() => handleMenuClick(item)}
        variant="text"
        sx={getButtonStyles(item, isSelected)}
        startIcon={
          item.iconPath ? (
            <Box
              component="img"
              src={item.iconPath}
              alt={item.label}
              sx={{ 
                width: item.parent ? '16px' : '18px', 
                height: item.parent ? '16px' : '18px', 
                mr: 1.2 
              }}
            />
          ) : (
            React.cloneElement(item.icon as React.ReactElement, {
              sx: { 
                width: item.parent ? '16px' : '18px', 
                height: item.parent ? '16px' : '18px', 
                mr: 1.2 
              }
            })
          )
        }
        endIcon={
          item.disabled ? <LockIcon sx={{ width: 14, height: 14, ml: 0.8 }} /> : 
          item.isPremium && user?.planType === 'free' ? <LockIcon sx={{ width: 14, height: 14, ml: 0.8 }} /> : 
          null
        }
        disableRipple={item.disabled}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <Box sx={{
      backgroundColor: '#F8FAFF',
      height: isMobile ? '100%' : '100vh',
      width: isMobile ? '100%' : '240px',
      position: 'relative',
      pl: isMobile ? '20px' : '30px',
      pr: isMobile ? '20px' : '16px',
      pt: isMobile ? '20px' : '30px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* Logo */}
        <Box
          onClick={() => onMenuSelect?.('dashboard')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            flexShrink: 0, 
            cursor: 'pointer' 
          }}
        >
          <Box
            component="img"
            src="/ico.svg"
            alt="Logo"
            sx={{
              width: '47px',
              height: '44px',
              flexShrink: 0,
              ml: '4px',
              objectFit: 'contain',
            }}
          />
          <Box sx={{ ml: '10px' }}>
            <Typography sx={{
              color: '#4285F4',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}>
              Médico
            </Typography>
            <Typography sx={{
              color: '#8A94A6',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '9px',
              letterSpacing: '2px',
              fontWeight: 500,
              lineHeight: 1.2,
              opacity: 0.9,
              whiteSpace: 'nowrap',
            }}>
              NO BOLSO
            </Typography>
          </Box>
        </Box>

        {/* Indicador de Secretária */}
        {isSecretary && (
          <Box sx={{ 
            mb: 2, 
            mx: 1,
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#E3F2FD',
            border: '1px solid #BBDEFB',
          }}>
            <Typography sx={{
              color: '#1976D2',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'center',
            }}>
              👩‍⚕️ {secretaryName}
            </Typography>
            <Typography sx={{
              color: '#1565C0',
              fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '10px',
              textAlign: 'center',
              mt: 0.5,
            }}>
              Trabalhando para Dr. {doctorName}
            </Typography>
          </Box>
        )}

        {/* Menu Items */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {/* Principal */}
          <Typography sx={categoryStyle}>Principal</Typography>
          <Box>
            {menuItems.principal.map(renderMenuItem)}
          </Box>

          {/* Admin */}
          {menuItems.admin.length > 0 && (
            <>
              <Typography sx={categoryStyle}>Administração</Typography>
              <Box>
                {menuItems.admin.map(renderMenuItem)}
              </Box>
            </>
          )}

          {/* IA */}
          <Typography sx={{ ...categoryStyle, color: '#667eea', fontWeight: 600 }}>
            Inteligência Artificial
          </Typography>
          <Box sx={{ mb: 2 }}>
            {menuItems.ia.map(renderMenuItem)}
          </Box>

          {/* Suporte */}
          <Typography sx={categoryStyle}>Suporte</Typography>
          <Box>
            {menuItems.suporte.map(renderMenuItem)}
          </Box>

          {/* Configurações */}
          {!isSecretary && menuItems.configuracoes.length > 0 && (
            <>
              <Typography sx={categoryStyle}>Configurações</Typography>
              <Box>
                {menuItems.configuracoes.map(renderMenuItem)}
              </Box>
            </>
          )}
        </Box>

        {/* Profile */}
        <Box sx={{ mt: 'auto', mb: 3, position: 'relative', width: '100%' }}>
          <Typography sx={{
            color: '#8A94A6',
            fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            mb: 1,
            ml: 1.5,
          }}>
            Meu Perfil
          </Typography>
          
          <Box
            onClick={onProfileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              px: 2,
              borderRadius: '12px',
              border: '1px solid rgba(66, 133, 244, 0.2)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(17, 30, 90, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(66, 133, 244, 0.04)',
                borderColor: 'rgba(66, 133, 244, 0.5)',
                boxShadow: '0 4px 12px rgba(17, 30, 90, 0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                src={user?.photoUrl}
                alt={user?.name}
                sx={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid #4285F4',
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.8)',
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              
              <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  color: '#111E5A',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  Dr. {user?.name?.split(' ')[0] || 'Usuário'}
                </Typography>
                <Typography sx={{
                  color: '#4285F4',
                  fontFamily: 'Gellix, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.role || 'Médico'}
                </Typography>
              </Box>
            </Box>

            <Badge
              badgeContent={user?.planType === 'free' ? 'Free' : 'Pro'}
              color={user?.planType === 'free' ? 'error' : 'success'}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '10px',
                  height: '16px',
                  minWidth: '16px',
                }
              }}
            >
              <Box
                component="img"
                src="/chevron-down.svg"
                alt="Configurações de perfil"
                sx={{ width: '16px', height: '16px' }}
              />
            </Badge>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;