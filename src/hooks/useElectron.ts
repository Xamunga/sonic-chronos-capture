
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<any>(null);

  useEffect(() => {
    // Verificar se está rodando no Electron
    const isElectronApp = !!(window.electronAPI);
    setIsElectron(isElectronApp);
    
    if (isElectronApp) {
      setElectronAPI(window.electronAPI);
      console.log('🚀 Gravador Real Time Pro - Modo Desktop Ativo');
      toast.success('Modo Desktop Ativo - Funcionalidades completas disponíveis');
    } else {
      console.log('🌐 Gravador Real Time Pro - Modo Navegador');
      toast.info('Modo Navegador - Algumas funcionalidades podem ser limitadas');
    }
  }, []);

  const selectOutputDirectory = async (): Promise<string | null> => {
    if (!electronAPI) {
      toast.warning('Funcionalidade disponível apenas no modo desktop');
      return null;
    }

    try {
      const directory = await electronAPI.selectDirectory();
      if (directory) {
        toast.success(`Diretório selecionado: ${directory}`);
      }
      return directory || null;
    } catch (error) {
      console.error('Erro ao selecionar diretório:', error);
      toast.error('Erro ao selecionar diretório');
      return null;
    }
  };

  const showSaveDialog = async (options: any): Promise<string | null> => {
    if (!electronAPI) {
      toast.warning('Funcionalidade disponível apenas no modo desktop');
      return null;
    }

    try {
      const filePath = await electronAPI.showSaveDialog(options);
      return filePath || null;
    } catch (error) {
      console.error('Erro no diálogo de salvar:', error);
      toast.error('Erro ao mostrar diálogo de salvar');
      return null;
    }
  };

  const showSystemMessage = async (title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if (!electronAPI) {
      // Fallback para toast no navegador
      switch (type) {
        case 'info':
          toast.info(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'error':
          toast.error(message);
          break;
      }
      return;
    }

    try {
      await electronAPI.showMessage({
        type,
        title,
        message,
        buttons: ['OK']
      });
    } catch (error) {
      console.error('Erro ao mostrar mensagem do sistema:', error);
    }
  };

  const openExternalLink = async (url: string) => {
    if (!electronAPI) {
      window.open(url, '_blank');
      return;
    }

    try {
      await electronAPI.openExternal(url);
    } catch (error) {
      console.error('Erro ao abrir link externo:', error);
      window.open(url, '_blank'); // Fallback
    }
  };

  return {
    isElectron,
    electronAPI,
    selectOutputDirectory,
    showSaveDialog,
    showSystemMessage,
    openExternalLink
  };
};
