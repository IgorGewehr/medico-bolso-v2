import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';

interface SwipeableViewProps {
  children: React.ReactNode[];
  activeIndex: number;
  onIndexChange?: (index: number) => void;
  threshold?: number;
  showIndicators?: boolean;
  enableTouch?: boolean;
  enableMouse?: boolean;
  animationDuration?: number;
  resistance?: number;
}

const SwipeableView: React.FC<SwipeableViewProps> = ({
  children,
  activeIndex,
  onIndexChange,
  threshold = 50,
  showIndicators = true,
  enableTouch = true,
  enableMouse = false,
  animationDuration = 300,
  resistance = 0.3,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Atualizar largura da janela
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWindowWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Atualizar posição quando activeIndex muda
  useEffect(() => {
    if (!isDragging && windowWidth > 0) {
      setTranslateX(-activeIndex * windowWidth);
    }
  }, [activeIndex, windowWidth, isDragging]);

  // Handlers para touch events
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || windowWidth === 0) return;

    setCurrentX(clientX);
    const deltaX = clientX - startX;
    const baseTranslate = -activeIndex * windowWidth;
    
    // Aplicar resistência nos extremos
    let newTranslateX = baseTranslate + deltaX;
    
    // Resistência no início
    if (activeIndex === 0 && deltaX > 0) {
      newTranslateX = baseTranslate + deltaX * resistance;
    }
    
    // Resistência no final
    if (activeIndex === children.length - 1 && deltaX < 0) {
      newTranslateX = baseTranslate + deltaX * resistance;
    }

    setTranslateX(newTranslateX);
  }, [isDragging, startX, activeIndex, windowWidth, children.length, resistance]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    const deltaX = currentX - startX;
    const absDeltaX = Math.abs(deltaX);

    let newIndex = activeIndex;

    // Verificar se deve mudar o índice
    if (absDeltaX > threshold) {
      if (deltaX > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (deltaX < 0 && activeIndex < children.length - 1) {
        newIndex = activeIndex + 1;
      }
    }

    // Chamar callback se índice mudou
    if (newIndex !== activeIndex && onIndexChange) {
      onIndexChange(newIndex);
    } else {
      // Voltar para posição original
      setTranslateX(-activeIndex * windowWidth);
    }
  }, [isDragging, currentX, startX, activeIndex, threshold, children.length, windowWidth, onIndexChange]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableTouch) return;
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableTouch || !isDragging) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableTouch) return;
    e.preventDefault();
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableMouse) return;
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enableMouse || !isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  }, [enableMouse, isDragging, handleMove]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!enableMouse) return;
    e.preventDefault();
    handleEnd();
  }, [enableMouse, handleEnd]);

  // Adicionar/remover event listeners para mouse
  useEffect(() => {
    if (isDragging && enableMouse) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, enableMouse, handleMouseMove, handleMouseUp]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'pan-y pinch-zoom',
        userSelect: 'none',
      }}
    >
      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        sx={{
          display: 'flex',
          height: '100%',
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : `transform ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          cursor: enableMouse ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        {children.map((child, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              overflow: 'auto',
              position: 'relative',
            }}
          >
            {child}
          </Box>
        ))}
      </Box>

      {/* Page Indicators */}
      {showIndicators && children.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 0.5,
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {children.map((_, index) => (
            <Box
              key={index}
              onClick={() => onIndexChange?.(index)}
              sx={{
                width: index === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: '4px',
                backgroundColor:
                  index === activeIndex
                    ? theme.palette.primary.main
                    : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor:
                    index === activeIndex
                      ? theme.palette.primary.dark
                      : 'rgba(255, 255, 255, 0.7)',
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SwipeableView;