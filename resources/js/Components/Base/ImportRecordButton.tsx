import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface ImportRecordButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

const ImportRecordButton: React.FC<ImportRecordButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <Button
            variant="outlined"
            aria-label="Importar Ficha"
            onClick={onClick}
            disabled={disabled}
            sx={{
                display: "flex",
                width: "182px",
                height: "52px",
                padding: "18px 17px",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
                borderRadius: "99px",
                border: "1px solid #111E5A",
                textTransform: "none",
                "&:hover": {
                    backgroundColor: "rgba(17, 30, 90, 0.04)",
                    borderColor: "#0d1640",
                },
                "&:disabled": {
                    borderColor: "#9e9e9e",
                    color: "#9e9e9e",
                }
            }}
        >
            <Box
                component="img"
                src="/importficha.svg"
                alt="Ícone Importar Ficha"
                sx={{
                    width: "16px",
                    height: "16px",
                    objectFit: "contain",
                    flexShrink: 0,
                }}
            />
            <Typography
                sx={{
                    color: disabled ? "#9e9e9e" : "#111E5A",
                    fontFamily: "Gellix",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "normal",
                }}
            >
                Importar Ficha
            </Typography>
        </Button>
    );
};

export default ImportRecordButton;