import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface NewAppointmentButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

const NewAppointmentButton: React.FC<NewAppointmentButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <Button
            variant="contained"
            aria-label="Novo Agendamento"
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: "203px",
                textTransform: "none",
                borderRadius: "99px",
                px: "8px",
                py: "10px",
                backgroundColor: "#4C515C",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                "&:hover": {
                    backgroundColor: "#3a3f47",
                },
                "&:disabled": {
                    backgroundColor: "#9e9e9e",
                    color: "#757575",
                }
            }}
        >
            <Box
                component="img"
                src="/newagendamento.svg"
                alt="Ícone de Novo agendamento"
                sx={{
                    width: "18px",
                    height: "18px",
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
                Agendamento
            </Typography>
        </Button>
    );
};

export default NewAppointmentButton;