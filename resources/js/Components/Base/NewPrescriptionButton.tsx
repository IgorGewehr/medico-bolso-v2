import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface NewPrescriptionButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

const NewPrescriptionButton: React.FC<NewPrescriptionButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <Button
            variant="contained"
            aria-label="Nova Receita"
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: "203px",
                textTransform: "none",
                borderRadius: "99px",
                px: "8px",
                py: "10px",
                backgroundColor: "#2971FF",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                "&:hover": {
                    backgroundColor: "#1e5ae6",
                },
                "&:disabled": {
                    backgroundColor: "#9e9e9e",
                    color: "#757575",
                }
            }}
        >
            <Box
                component="img"
                src="/newreceita.svg"
                alt="Ícone de Nova Receita"
                sx={{
                    width: "22px",
                    height: "22px",
                    objectFit: "contain",
                    flexShrink: 0,
                }}
            />
            <Typography
                sx={{
                    fontFamily: "Gellix",
                    fontSize: "16px",
                    fontWeight: 500,
                    textAlign: "center",
                    flexGrow: 1,
                }}
            >
                Receita
            </Typography>
        </Button>
    );
};

export default NewPrescriptionButton;