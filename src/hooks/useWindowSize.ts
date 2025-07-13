import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Configurar tamanho inicial para 1/4 da tela
    // Removido porque a função setWindowSize não existe na API do Electron
    // A configuração de tamanho deve ser feita no main.js do Electron

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};