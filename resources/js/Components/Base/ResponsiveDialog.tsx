import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    useTheme,
    useMediaQuery,
    styled,
    Fade,
    Slide,
    IconButton,
    Box,
    Typography,
    DialogProps,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';

interface ResponsiveDialogProps extends Omit<DialogProps, 'title'> {
    title?: string;
    subtitle?: string;
    onClose?: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
    hideCloseButton?: boolean;
    fullHeight?: boolean;
}

const StyledResponsiveDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.breakpoints.down('sm') ? 0 : '20px',
        border: theme.breakpoints.down('sm') ? 'none' : '1px solid #E5E7EB',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: theme.breakpoints.down('sm') 
            ? 'none' 
            : '0px 20px 40px rgba(0, 0, 0, 0.1)',
        maxHeight: theme.breakpoints.down('sm') ? '100vh' : '95vh',
        margin: theme.breakpoints.down('sm') ? 0 : '16px',
        width: theme.breakpoints.down('sm') ? '100%' : 'calc(100% - 32px)',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: theme.breakpoints.down('sm') ? 'env(safe-area-inset-bottom)' : 0,
    },
    '& .MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
}));

const ResponsiveDialogHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.breakpoints.down('sm') ? '16px' : '24px',
    borderBottom: '1px solid #E5E7EB',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
}));

const ResponsiveDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.breakpoints.down('sm') ? '16px' : '24px',
    flex: 1,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.divider,
        borderRadius: '10px',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));

const ResponsiveDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.breakpoints.down('sm') ? '16px' : '24px',
    borderTop: '1px solid #E5E7EB',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
}));

const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
    title,
    subtitle,
    onClose,
    children,
    actions,
    hideCloseButton = false,
    fullHeight = false,
    open,
    ...props
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <StyledResponsiveDialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile && fullHeight}
            maxWidth="md"
            fullWidth
            TransitionComponent={isMobile ? Slide : Fade}
            TransitionProps={{
                direction: isMobile ? 'up' : undefined,
            }}
            {...props}
        >
            {(title || subtitle || !hideCloseButton) && (
                <ResponsiveDialogHeader>
                    <Box>
                        {title && (
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                fontWeight={600}
                                color="text.primary"
                                sx={{ mb: subtitle ? 0.5 : 0 }}
                            >
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {!hideCloseButton && onClose && (
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                }
                            }}
                        >
                            <CloseRounded />
                        </IconButton>
                    )}
                </ResponsiveDialogHeader>
            )}

            <ResponsiveDialogContent>
                {children}
            </ResponsiveDialogContent>

            {actions && (
                <ResponsiveDialogActions>
                    {actions}
                </ResponsiveDialogActions>
            )}
        </StyledResponsiveDialog>
    );
};

export default ResponsiveDialog;