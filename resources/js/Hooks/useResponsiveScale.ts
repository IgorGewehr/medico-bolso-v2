import { useState, useEffect } from 'react';

interface ResponsiveScaleResult {
  scale: number;
  width: number;
  scaleStyle: {
    transform: string;
    transformOrigin: string;
    width: string;
    height: string;
  };
}

interface UseResponsiveScaleOptions {
  disabled?: boolean;
  customBreakpoints?: {
    small?: number;
    medium?: number;
    large?: number;
    xlarge?: number;
  };
  customScales?: {
    small?: number;
    medium?: number;
    large?: number;
    xlarge?: number;
  };
}

/**
 * Hook para aplicar escala responsiva baseada na largura da tela
 * 
 * @param options - Opções de configuração
 * @returns Objeto com scale, width e scaleStyle
 */
export function useResponsiveScale(options: UseResponsiveScaleOptions = {}): ResponsiveScaleResult {
  const [scale, setScale] = useState<number>(1);
  const [width, setWidth] = useState<number>(0);

  const {
    disabled = false,
    customBreakpoints = {},
    customScales = {},
  } = options;

  // Breakpoints padrão
  const defaultBreakpoints = {
    small: 1366,  // Notebooks 14" ou menos
    medium: 1536, // Notebooks 15"
    large: 1920,  // Monitores 16"
    xlarge: 2560, // Monitores grandes
  };

  // Escalas padrão
  const defaultScales = {
    small: 1.0,   // Escala normal para notebooks pequenos
    medium: 0.95, // Um pouco menor para telas médias
    large: 1.05,  // Um pouco maior para telas grandes
    xlarge: 1.15, // Maior para monitores grandes
  };

  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  const scales = { ...defaultScales, ...customScales };

  useEffect(() => {
    if (disabled) {
      setScale(1);
      return;
    }

    const calculateScale = (): void => {
      const screenWidth = window.innerWidth;
      setWidth(screenWidth);

      let newScale = 1;

      if (screenWidth <= breakpoints.small) {
        newScale = scales.small;
      } else if (screenWidth <= breakpoints.medium) {
        newScale = scales.medium;
      } else if (screenWidth <= breakpoints.large) {
        newScale = scales.large;
      } else {
        newScale = scales.xlarge;
      }

      setScale(newScale);
    };

    // Calcula na inicialização
    calculateScale();

    // Recalcula quando a janela é redimensionada
    window.addEventListener('resize', calculateScale);

    // Limpeza
    return () => window.removeEventListener('resize', calculateScale);
  }, [disabled, breakpoints, scales]);

  return {
    scale,
    width,
    scaleStyle: {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: `${(100 / scale)}%`,
      height: `${(100 / scale)}%`,
    },
  };
}

/**
 * Hook simplificado para escala automática
 */
export function useAutoScale(): ResponsiveScaleResult {
  return useResponsiveScale();
}

/**
 * Hook para escala customizada com breakpoints específicos
 */
export function useCustomScale(
  breakpoints: UseResponsiveScaleOptions['customBreakpoints'],
  scales: UseResponsiveScaleOptions['customScales']
): ResponsiveScaleResult {
  return useResponsiveScale({ customBreakpoints: breakpoints, customScales: scales });
}

export default useResponsiveScale;