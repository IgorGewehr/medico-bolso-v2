import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface CreateNewPrescriptionButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

const CreateNewPrescriptionButton: React.FC<CreateNewPrescriptionButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: "213px",
                height: "64px",
                borderRadius: "50px",
                background: "#1852FE",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                gap: "16.57px",
                padding: "0 16px",
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
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "normal",
                }}
            >
                Criar nova receita
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    width: "36.43px",
                    height: "36.43px",
                    padding: "9.107px",
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
                        width: "18.215px",
                        height: "18.215px",
                        flexShrink: 0,
                    }}
                />
            </Box>
        </Button>
    );
};

export default CreateNewPrescriptionButton;