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