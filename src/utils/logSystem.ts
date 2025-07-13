// Sistema global de logs para comunicação entre componentes

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  component?: string;
}

type LogListener = (entry: LogEntry) => void;

class LogSystem {
  private listeners: LogListener[] = [];
  private isElectron = false;

  constructor() {
    // Verificar se está rodando no Electron
    this.isElectron = !!(window as any).electronAPI;
    
    if (this.isElectron) {
      console.log('📁 Sistema de logs de debug inicializado - salvamento automático ativo');
      this.logToFile('info', 'Sistema de logs de debug inicializado', 'LogSystem');
    }
  }

  private async logToFile(type: LogEntry['type'], message: string, component?: string) {
    if (!this.isElectron) return;
    
    try {
      const electronAPI = (window as any).electronAPI;
      await electronAPI.writeDebugLog({
        type,
        message,
        component,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar log em arquivo:', error);
    }
  }

  async getDebugLogsPath(): Promise<string | null> {
    if (!this.isElectron) return null;
    
    try {
      const electronAPI = (window as any).electronAPI;
      return await electronAPI.getDebugLogsPath();
    } catch (error) {
      console.error('Erro ao obter caminho dos logs:', error);
      return null;
    }
  }

  addListener(listener: LogListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: LogListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  addLog(type: LogEntry['type'], message: string, component?: string) {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date(),
      type,
      message,
      component
    };

    // Notificar todos os listeners
    this.listeners.forEach(listener => listener(entry));
    
    // Salvar em arquivo se for Electron
    if (this.isElectron) {
      this.logToFile(type, message, component);
    }
  }

  // Métodos de conveniência
  info(message: string, component?: string) {
    this.addLog('info', message, component);
  }

  success(message: string, component?: string) {
    this.addLog('success', message, component);
  }

  warning(message: string, component?: string) {
    this.addLog('warning', message, component);
  }

  error(message: string, component?: string) {
    this.addLog('error', message, component);
  }
}

// Instância global
export const logSystem = new LogSystem();
export type { LogEntry };