import React, { useRef, useState, useCallback } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
    isTablet?: boolean;
}

const SearchBar = React.memo<SearchBarProps>(({ onSearch, placeholder = "Buscar pacientes por nome, e-mail ou CPF...", isTablet = false }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            onSearch(value);
        }, 300);
    }, [onSearch]);

    return (
        <TextField
            inputRef={inputRef}
            placeholder={placeholder}
            value={localSearchTerm}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            sx={{
                flex: isTablet ? '1' : '1 1 50%',
                '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            size="small"
        />
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;