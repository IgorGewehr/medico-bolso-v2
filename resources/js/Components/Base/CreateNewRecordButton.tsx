import React from "react";
import { Button, Box, Typography, useTheme, useMediaQuery } from "@mui/material";

interface CreateNewRecordButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

const CreateNewRecordButton: React.FC<CreateNewRecordButtonProps> = ({ onClick, disabled = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Button
            variant="contained"
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: { xs: "100%", sm: "213px" },
                minWidth: { xs: "200px", sm: "213px" },
                height: { xs: "48px", sm: "64px" },
                borderRadius: { xs: "24px", sm: "50px" },
                background: "#1852FE",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                gap: { xs: "8px", sm: "16.57px" },
                padding: { xs: "0 12px", sm: "0 16px" },
                textTransform: "none",
                justifyContent: "space-between",
                "&:hover": {
                    background: "#1340E5",
                    transform: "translateY(-2px)",
                },
                "&:active": {
                    transform: "translateY(0)",
                },
                "&:disabled": {
                    background: "#9e9e9e",
                    color: "#757575",
                    transform: "none",
                },
                transition: "all 0.2s ease-in-out",
            }}
        >
            <Typography
                sx={{
                    color: "inherit",
                    fontFamily: "Gellix",
                    fontSize: { xs: "14px", sm: "16px" },
                    fontWeight: 500,
                    lineHeight: "normal",
                }}
            >
                Criar nova ficha
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    width: { xs: "32px", sm: "36.43px" },
                    height: { xs: "32px", sm: "36.43px" },
                    padding: { xs: "8px", sm: "9.107px" },
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    flexShrink: 0,
                }}
            >
                <Box
                    component="img"
                    src="/plusicoblue.svg"
                    alt="Adicionar"
                    sx={{
                        width: { xs: "16px", sm: "18.215px" },
                        height: { xs: "16px", sm: "18.215px" },
                        flexShrink: 0,
                    }}
                />
            </Box>
        </Button>
    );
};

export default CreateNewRecordButton;