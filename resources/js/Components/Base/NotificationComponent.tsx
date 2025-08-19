"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    IconButton,
    Badge,
    Popover,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Avatar,
    Chip,
    useMediaQuery,
    useTheme,
    CircularProgress
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Message as MessageIcon,
    BugReport as BugIcon,
    Feedback as FeedbackIcon,
    Info as InfoIcon,
    Support as SupportIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    MarkEmailRead as MarkReadIcon
} from "@mui/icons-material";

interface Report {
    id: string;
    type: 'bug' | 'feedback' | 'support' | 'system' | 'admin_chat';
    subject?: string;
    content: string;
    status: 'new' | 'in_progress' | 'resolved';
    hasUnreadResponses: boolean;
    isAdminInitiated?: boolean;
    responses?: Response[];
    createdAt: Date | FirebaseTimestamp;
    updatedAt: Date | FirebaseTimestamp;
}

interface Response {
    id: string;
    content: string;
    isFromAdmin: boolean;
    createdAt: Date | FirebaseTimestamp;
}

interface FirebaseTimestamp {
    toDate: () => Date;
}

interface NotificationClickEvent {
    action: 'openCentralAjuda';
    selectedReportId?: string;
    report?: Report;
    tab?: 'messages';
}

interface NotificationComponentProps {
    onMessageClick?: (event: NotificationClickEvent) => void;
    userId?: string;
    pollingInterval?: number;
}

interface MessageIconConfig {
    icon: React.ReactElement;
    color: string;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ 
    onMessageClick,
    userId,
    pollingInterval = 30000 
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const open = Boolean(anchorEl);

    // Load unread reports function
    const loadUnreadReports = useCallback(async (): Promise<void> => {
        if (!userId) return;

        try {
            console.log('🔔 Loading reports for notifications...');

            // Here you would implement the actual API call to load reports
            // For now, we'll create a mock implementation
            const mockReports: Report[] = [
                {
                    id: '1',
                    type: 'support',
                    subject: 'Dúvida sobre consulta',
                    content: 'Preciso de ajuda para agendar uma consulta com especialista...',
                    status: 'new',
                    hasUnreadResponses: true,
                    responses: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    type: 'admin_chat',
                    subject: 'Conversa com Admin',
                    content: 'Olá! Como posso ajudá-lo hoje?',
                    status: 'in_progress',
                    hasUnreadResponses: true,
                    isAdminInitiated: true,
                    responses: [
                        {
                            id: 'r1',
                            content: 'Olá! Como posso ajudá-lo hoje?',
                            isFromAdmin: true,
                            createdAt: new Date()
                        }
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            // In a real implementation, you would call:
            // const userReports = await firebaseService.getUserReports(userId);
            // const unreadReports = userReports.filter(report => report.hasUnreadResponses === true);
            // const recentReports = userReports.slice(0, 5);

            const userReports = mockReports;
            const unreadReports = userReports.filter(report => report.hasUnreadResponses === true);
            const recentReports = userReports.slice(0, 5);

            console.log(`📊 Reports found: ${userReports.length}, unread: ${unreadReports.length}`);

            setReports(recentReports);
            setUnreadCount(unreadReports.length);
        } catch (error) {
            console.error("❌ Error loading reports:", error);
        }
    }, [userId]);

    // Update reports periodically
    useEffect(() => {
        if (userId) {
            loadUnreadReports();

            // Update every 30 seconds (or custom interval)
            const interval = setInterval(loadUnreadReports, pollingInterval);
            return () => clearInterval(interval);
        }
    }, [userId, loadUnreadReports, pollingInterval]);

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
        loadUnreadReports(); // Update when opening
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    // Mark all reports as read
    const handleMarkAllAsRead = async (): Promise<void> => {
        if (!userId) return;

        setLoading(true);
        try {
            const unreadReportIds = reports
                .filter(report => report.hasUnreadResponses === true)
                .map(report => report.id);

            console.log(`🔄 Marking ${unreadReportIds.length} reports as read...`);

            // In a real implementation, you would call:
            // for (const reportId of unreadReportIds) {
            //     await firebaseService.markReportAsReadByUser(reportId);
            // }

            // Mock implementation
            setReports(prev => 
                prev.map(report => ({
                    ...report,
                    hasUnreadResponses: false
                }))
            );
            setUnreadCount(0);

            if (unreadReportIds.length > 0) {
                await loadUnreadReports();
            }
        } catch (error) {
            console.error("❌ Error marking reports as read:", error);
        }
        setLoading(false);
    };

    const handleReportClick = async (report: Report): Promise<void> => {
        console.log('🔔 Clicking on report:', report.id);

        // Mark as read if it wasn't read
        if (report.hasUnreadResponses) {
            try {
                // In a real implementation:
                // await firebaseService.markReportAsReadByUser(report.id);
                
                // Mock implementation
                setReports(prev => 
                    prev.map(r => 
                        r.id === report.id 
                            ? { ...r, hasUnreadResponses: false }
                            : r
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                
                await loadUnreadReports(); // Update counter
            } catch (error) {
                console.error("❌ Error marking report as read:", error);
            }
        }

        handleClose();
        if (onMessageClick) {
            onMessageClick({
                action: 'openCentralAjuda',
                selectedReportId: report.id,
                report: report,
                tab: 'messages'
            });
        }
    };

    const getMessageIcon = (type: Report['type']): React.ReactElement => {
        const iconConfigs: Record<Report['type'], MessageIconConfig> = {
            bug: { icon: <BugIcon sx={{ fontSize: 20 }} />, color: '#f44336' },
            feedback: { icon: <FeedbackIcon sx={{ fontSize: 20 }} />, color: '#2196f3' },
            support: { icon: <SupportIcon sx={{ fontSize: 20 }} />, color: '#ff9800' },
            system: { icon: <InfoIcon sx={{ fontSize: 20 }} />, color: '#4caf50' },
            admin_chat: { icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />, color: '#9c27b0' }
        };

        const config = iconConfigs[type] || { icon: <MessageIcon sx={{ fontSize: 20 }} />, color: '#9e9e9e' };
        
        return React.cloneElement(config.icon, {
            sx: { ...config.icon.props.sx, color: config.color }
        });
    };

    const getMessageTypeLabel = (type: Report['type']): string => {
        const labels: Record<Report['type'], string> = {
            bug: 'Bug Report',
            feedback: 'Feedback',
            support: 'Suporte',
            system: 'Sistema',
            admin_chat: 'Chat Admin'
        };

        return labels[type] || 'Mensagem';
    };

    const getStatusLabel = (status: Report['status']): string => {
        const labels: Record<Report['status'], string> = {
            new: 'Nova',
            in_progress: 'Em andamento',
            resolved: 'Resolvida'
        };

        return labels[status] || 'Pendente';
    };

    const getStatusColor = (status: Report['status']): string => {
        const colors: Record<Report['status'], string> = {
            new: '#2196f3',
            in_progress: '#ff9800',
            resolved: '#4caf50'
        };

        return colors[status] || '#9e9e9e';
    };

    const formatMessageDate = (date: Date | FirebaseTimestamp): string => {
        if (!date) return '';

        const messageDate = 'toDate' in date ? date.toDate() : new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - messageDate.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;

        return messageDate.toLocaleDateString('pt-BR');
    };

    const generateStatisticsText = (): string => {
        const adminChats = reports.filter(r => r.type === 'admin_chat' && r.hasUnreadResponses).length;
        const regularReports = unreadCount - adminChats;

        if (adminChats > 0 && regularReports > 0) {
            return `${adminChats} chat${adminChats !== 1 ? 's' : ''} admin • ${regularReports} report${regularReports !== 1 ? 's' : ''}`;
        } else if (adminChats > 0) {
            return `${adminChats} chat${adminChats !== 1 ? 's' : ''} com administrador`;
        } else {
            return `${unreadCount} mensagem${unreadCount !== 1 ? 's' : ''} não lida${unreadCount !== 1 ? 's' : ''}`;
        }
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24, 82, 254, 0.1)',
                    border: '1px solid rgba(24, 82, 254, 0.2)',
                    '&:hover': {
                        backgroundColor: 'rgba(24, 82, 254, 0.15)',
                    }
                }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                            minWidth: isMobile ? '16px' : '18px',
                            height: isMobile ? '16px' : '18px'
                        }
                    }}
                >
                    <NotificationsIcon
                        sx={{
                            fontSize: isMobile ? 20 : 22,
                            color: '#1852FE'
                        }}
                    />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: isMobile ? 'left' : 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: isMobile ? 'left' : 'right',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? '8px' : '12px',
                        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        maxWidth: isMobile ? '320px' : isTablet ? '350px' : '380px',
                        width: isMobile ? 'calc(100vw - 32px)' : '100%',
                        maxHeight: isMobile ? '400px' : '500px',
                        ...(isMobile && {
                            position: 'fixed',
                            top: '16px',
                            right: '16px',
                            left: '16px',
                            zIndex: 9999
                        })
                    }
                }}
            >
                <Paper sx={{ p: 0 }}>
                    {/* Header */}
                    <Box sx={{
                        p: isMobile ? 1.5 : 2,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#111E5A',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                Notificações
                            </Typography>
                            {unreadCount > 0 && (
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={loading ? <CircularProgress size={16} /> : <MarkReadIcon />}
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    sx={{
                                        fontSize: isMobile ? '10px' : '12px',
                                        color: '#1852FE',
                                        textTransform: 'none',
                                        minWidth: 'auto',
                                        px: isMobile ? 1 : 2
                                    }}
                                >
                                    Marcar como lidas
                                </Button>
                            )}
                        </Box>

                        {/* Statistics */}
                        {unreadCount > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {generateStatisticsText()}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Reports List */}
                    <List sx={{ p: 0, maxHeight: isMobile ? '300px' : '400px', overflow: 'auto' }}>
                        {reports.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textAlign: 'center', py: 2 }}
                                        >
                                            Nenhuma mensagem encontrada
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ) : (
                            reports.map((report, index) => (
                                <React.Fragment key={report.id}>
                                    <ListItem
                                        component="div"
                                        onClick={() => handleReportClick(report)}
                                        sx={{
                                            py: isMobile ? 1 : 1.5,
                                            px: isMobile ? 1.5 : 2,
                                            backgroundColor: report.hasUnreadResponses
                                                ? 'rgba(24, 82, 254, 0.04)'
                                                : 'transparent',
                                            borderLeft: report.type === 'admin_chat'
                                                ? '3px solid #9c27b0'
                                                : report.hasUnreadResponses
                                                    ? '3px solid #1852FE'
                                                    : '3px solid transparent',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'rgba(24, 82, 254, 0.08)'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: isMobile ? 28 : 36 }}>
                                            {getMessageIcon(report.type)}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: report.hasUnreadResponses ? 600 : 500,
                                                            color: '#111E5A',
                                                            flex: 1,
                                                            fontSize: isMobile ? '13px' : '14px'
                                                        }}
                                                        noWrap
                                                    >
                                                        {report.type === 'admin_chat' && report.isAdminInitiated
                                                            ? '💬 Conversa com Admin'
                                                            : (report.subject || getMessageTypeLabel(report.type))
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ fontSize: isMobile ? '10px' : '11px' }}
                                                    >
                                                        {formatMessageDate(report.updatedAt)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.3,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {report.content}
                                                    </Typography>

                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: isMobile ? 0.5 : 1, 
                                                        mt: 0.5, 
                                                        flexWrap: 'wrap' 
                                                    }}>
                                                        <Chip
                                                            label={getMessageTypeLabel(report.type)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: isMobile ? '9px' : '10px',
                                                                height: isMobile ? '18px' : '20px',
                                                                borderColor: 'rgba(0, 0, 0, 0.12)',
                                                                ...(report.type === 'admin_chat' && {
                                                                    borderColor: '#9c27b0',
                                                                    color: '#9c27b0'
                                                                })
                                                            }}
                                                        />

                                                        <Chip
                                                            label={getStatusLabel(report.status)}
                                                            size="small"
                                                            sx={{
                                                                fontSize: isMobile ? '9px' : '10px',
                                                                height: isMobile ? '18px' : '20px',
                                                                backgroundColor: getStatusColor(report.status),
                                                                color: 'white',
                                                                fontWeight: 500
                                                            }}
                                                        />

                                                        {report.responses && report.responses.length > 0 && (
                                                            <Typography
                                                                variant="caption"
                                                                color="primary"
                                                                sx={{ fontSize: isMobile ? '9px' : '10px', fontWeight: 500 }}
                                                            >
                                                                {report.responses.length} resposta{report.responses.length !== 1 ? 's' : ''}
                                                            </Typography>
                                                        )}

                                                        {/* Special indicator for admin chat */}
                                                        {report.type === 'admin_chat' && report.hasUnreadResponses && (
                                                            <Chip
                                                                label="Mensagem do Admin!"
                                                                size="small"
                                                                sx={{
                                                                    fontSize: isMobile ? '8px' : '9px',
                                                                    height: isMobile ? '16px' : '18px',
                                                                    backgroundColor: '#9c27b0',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    animation: 'pulse 2s infinite',
                                                                    '@keyframes pulse': {
                                                                        '0%': { opacity: 1 },
                                                                        '50%': { opacity: 0.7 },
                                                                        '100%': { opacity: 1 }
                                                                    }
                                                                }}
                                                            />
                                                        )}

                                                        {/* Regular new response indicator */}
                                                        {report.hasUnreadResponses && report.type !== 'admin_chat' && (
                                                            <Chip
                                                                label="Nova resposta!"
                                                                size="small"
                                                                color="error"
                                                                sx={{
                                                                    fontSize: isMobile ? '8px' : '9px',
                                                                    height: isMobile ? '16px' : '18px',
                                                                    fontWeight: 600,
                                                                    animation: 'pulse 2s infinite'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < reports.length - 1 && (
                                        <Divider sx={{ mx: 2, opacity: 0.5 }} />
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </List>

                    {/* Footer */}
                    <Divider />
                    <Box sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                                handleClose();
                                if (onMessageClick) {
                                    onMessageClick({
                                        action: 'openCentralAjuda',
                                        tab: 'messages'
                                    });
                                }
                            }}
                            sx={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: '#1852FE',
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Ver todas as mensagens
                        </Button>
                    </Box>
                </Paper>
            </Popover>
        </>
    );
};

export default NotificationComponent;