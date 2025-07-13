import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, Trash2, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  component?: string;
}

const LogTab = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoSave, setIsAutoSave] = useState(true);

  // Função para adicionar entrada no log
  const addLogEntry = (type: LogEntry['type'], message: string, component?: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      component
    };
    
    setLogs(prev => [entry, ...prev].slice(0, 1000)); // Manter apenas últimas 1000 entradas
    
    // Auto-salvar se habilitado
    if (isAutoSave) {
      saveToFile([entry, ...logs]);
    }
  };

  // Simular logs do sistema
  useEffect(() => {
    addLogEntry('info', 'Sistema iniciado com sucesso', 'System');
    
    const interval = setInterval(() => {
      const messages = [
        { type: 'info' as const, msg: 'Monitoramento de áudio ativo', comp: 'Audio' },
        { type: 'success' as const, msg: 'Configurações salvas', comp: 'Settings' },
        { type: 'warning' as const, msg: 'Uso de CPU elevado detectado', comp: 'Monitor' },
      ];
      
      const random = messages[Math.floor(Math.random() * messages.length)];
      addLogEntry(random.type, random.msg, random.comp);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const saveToFile = (logData: LogEntry[]) => {
    const logText = logData.map(log => 
      `[${log.timestamp.toLocaleString('pt-BR')}] ${log.type.toUpperCase()}: ${log.message}${log.component ? ` (${log.component})` : ''}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravador-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportLogs = () => {
    saveToFile(logs);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const filterLogsByType = (type: string) => {
    if (type === 'all') return logs;
    return logs.filter(log => log.type === type);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-studio-electric" />
              <h3 className="text-lg font-semibold text-studio-electric">Logs do Sistema</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAutoSave ? 'default' : 'outline'}>
                Auto-save: {isAutoSave ? 'ON' : 'OFF'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoSave(!isAutoSave)}
                className="bg-muted/50 border-studio-electric font-bold"
              >
                {isAutoSave ? 'Desativar' : 'Ativar'} Auto-save
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-white">
              Total de entradas: {logs.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportLogs} className="bg-muted/50 border-studio-electric font-bold">
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs} className="bg-muted/50 border-studio-electric font-bold">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px] w-full border border-studio-electric rounded-md p-4 bg-muted/50">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start gap-3 py-2">
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLogBadgeVariant(log.type)} className="text-xs">
                          {log.type.toUpperCase()}
                        </Badge>
                        {log.component && (
                          <Badge variant="outline" className="text-xs">
                            {log.component}
                          </Badge>
                        )}
                        <span className="text-xs text-white">
                          {log.timestamp.toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm break-words text-white">{log.message}</p>
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator />}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-white py-8">
                  Nenhum log disponível
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
};

export default LogTab;