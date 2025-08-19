import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { TextField, InputAdornment, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchFieldProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    setPage: (page: number) => void;
    isTablet?: boolean;
    placeholder?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({ 
    searchTerm, 
    setSearchTerm, 
    setPage, 
    isTablet = false,
    placeholder = "Buscar pacientes por nome, e-mail ou CPF..."
}) => {
    const theme = useTheme();
    const [localSearch, setLocalSearch] = useState<string>(searchTerm);

    const debouncedUpdate = useCallback(
        debounce((value: string) => {
            setSearchTerm(value);
            setPage(1);
        }, 300),
        [setSearchTerm, setPage]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLocalSearch(value);
        debouncedUpdate(value);
    };

    return (
        <TextField
            placeholder={placeholder}
            value={localSearch}
            onChange={handleChange}
            variant="outlined"
            fullWidth={isTablet}
            size="small"
            sx={{
                flex: isTablet ? '1' : '1 1 50%',
                '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                    }
                }
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color={localSearch ? 'primary' : 'inherit'} />
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default React.memo(SearchField);