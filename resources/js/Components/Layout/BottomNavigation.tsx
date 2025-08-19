import React, { useState } from 'react';
import {
    BottomNavigation as MuiBottomNavigation,
    BottomNavigationAction,
    Paper,
    Badge,
    useTheme,
    Box,
    Fab,
    Zoom,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Description as DescriptionIcon,
    CalendarMonth as CalendarIcon,
    Add as AddIcon,
} from '@mui/icons-material';

interface NavigationItem {
    label: string;
    value: string;
    icon: React.ComponentType;
}

interface NotificationCounts {
    [key: string]: number;
}

interface FabAction {
    icon: React.ReactNode;
    label: string;
    action: string;
}

interface BottomNavigationProps {
    activePage: string;
    onNavigate: (page: string) => void;
    notificationCounts?: NotificationCounts;
    onFabClick?: (action: string) => void;
    showFab?: boolean;
}

const navigationItems: NavigationItem[] = [
    { label: 'Dashboard', value: 'dashboard', icon: DashboardIcon },
    { label: 'Pacientes', value: 'pacientes', icon: PeopleIcon },
    { label: 'Receitas', value: 'receitas', icon: DescriptionIcon },
    { label: 'Agenda', value: 'agenda', icon: CalendarIcon },
];

const fabActions: FabAction[] = [
    { icon: <PeopleIcon />, label: 'Novo Paciente', action: 'patient' },
    { icon: <DescriptionIcon />, label: 'Nova Receita', action: 'prescription' },
    { icon: <CalendarIcon />, label: 'Novo Agendamento', action: 'appointment' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
    activePage,
    onNavigate,
    notificationCounts = {},
    onFabClick,
    showFab = true
}) => {
    const theme = useTheme();
    const [fabOpen, setFabOpen] = useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue !== activePage) {
            onNavigate(newValue);
        }
    };

    const handleFabAction = (action: string) => {
        if (onFabClick) {
            onFabClick(action);
        }
        setFabOpen(false);
    };

    return (
        <>
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: theme.zIndex.bottomNavigation,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    backdropFilter: 'blur(20px)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
                elevation={8}
            >
                <MuiBottomNavigation
                    value={activePage}
                    onChange={handleChange}
                    showLabels
                    sx={{
                        backgroundColor: 'transparent',
                        '& .MuiBottomNavigationAction-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: 'primary.main',
                            },
                            '& .MuiBottomNavigationAction-label': {
                                fontSize: '0.75rem',
                                fontWeight: 500,
                            },
                        },
                    }}
                >
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        const count = notificationCounts[item.value];

                        return (
                            <BottomNavigationAction
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                icon={
                                    count && count > 0 ? (
                                        <Badge
                                            badgeContent={count > 99 ? '99+' : count}
                                            color="error"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: '0.6rem',
                                                    minWidth: '16px',
                                                    height: '16px',
                                                }
                                            }}
                                        >
                                            <IconComponent />
                                        </Badge>
                                    ) : (
                                        <IconComponent />
                                    )
                                }
                                sx={{
                                    minWidth: 'auto',
                                    flex: 1,
                                    paddingTop: 1,
                                    paddingBottom: 1,
                                }}
                            />
                        );
                    })}
                </MuiBottomNavigation>
            </Paper>

            {showFab && onFabClick && (
                <SpeedDial
                    ariaLabel="Ações rápidas"
                    sx={{
                        position: 'fixed',
                        bottom: 80,
                        right: 16,
                        zIndex: theme.zIndex.speedDial,
                    }}
                    icon={<SpeedDialIcon />}
                    onClose={() => setFabOpen(false)}
                    onOpen={() => setFabOpen(true)}
                    open={fabOpen}
                    direction="up"
                >
                    {fabActions.map((action) => (
                        <SpeedDialAction
                            key={action.action}
                            icon={action.icon}
                            tooltipTitle={action.label}
                            onClick={() => handleFabAction(action.action)}
                            sx={{
                                '& .MuiSpeedDialAction-fab': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            }}
                        />
                    ))}
                </SpeedDial>
            )}
        </>
    );
};

export default BottomNavigation;