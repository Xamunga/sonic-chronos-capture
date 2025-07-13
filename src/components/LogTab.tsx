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
  const [cpuHistory, setCpuHistory] = useState<{ value: number; timestamp: Date }[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<{ value: number; timestamp: Date }[]>([]);
  const [lastCpuWarning, setLastCpuWarning] = useState<Date | null>(null);
  const [lastMemoryWarning, setLastMemoryWarning] = useState<Date | null>(null);

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

  // Função para verificar se valor está alto por mais de 2 minutos
  const checkSustainedHighUsage = (history: { value: number; timestamp: Date }[], threshold: number, type: 'CPU' | 'Memory') => {
    if (history.length === 0) return false;
    
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    
    // Filtrar apenas valores dos últimos 2 minutos
    const recentHistory = history.filter(entry => entry.timestamp >= twoMinutesAgo);
    
    // Verificar se todos os valores recentes estão acima do threshold
    const sustainedHigh = recentHistory.length >= 24 && // pelo menos 2 minutos de dados (a cada 5s)
                          recentHistory.every(entry => entry.value > threshold);
    
    if (sustainedHigh) {
      const lastWarningTime = type === 'CPU' ? lastCpuWarning : lastMemoryWarning;
      const timeSinceLastWarning = lastWarningTime ? (now.getTime() - lastWarningTime.getTime()) / 1000 / 60 : Infinity;
      
      // Só emitir warning se passou mais de 5 minutos desde o último warning
      if (timeSinceLastWarning > 5) {
        const avgValue = recentHistory.reduce((sum, entry) => sum + entry.value, 0) / recentHistory.length;
        addLogEntry('warning', `Uso de ${type} elevado (${avgValue.toFixed(1)}%) por mais de 2 minutos`, 'Monitor');
        
        if (type === 'CPU') {
          setLastCpuWarning(now);
        } else {
          setLastMemoryWarning(now);
        }
      }
    }
  };

  // Monitorar recursos do sistema
  useEffect(() => {
    addLogEntry('info', 'Sistema iniciado com sucesso', 'System');
    
    const interval = setInterval(() => {
      // Simular dados de CPU e memória (em produção, viria do ResourceMonitor)
      const cpuValue = Math.random() * 60 + 10;
      const memoryValue = Math.random() * 40 + 30;
      const now = new Date();
      
      // Adicionar aos históricos
      setCpuHistory(prev => [...prev.slice(-120), { value: cpuValue, timestamp: now }]); // manter últimos 10 minutos
      setMemoryHistory(prev => [...prev.slice(-120), { value: memoryValue, timestamp: now }]);
      
      // Verificar se há uso sustentado alto (threshold: CPU > 80%, Memory > 85%)
      setTimeout(() => {
        checkSustainedHighUsage(cpuHistory, 80, 'CPU');
        checkSustainedHighUsage(memoryHistory, 85, 'Memory');
      }, 100);
      
      // Outros logs ocasionais
      if (Math.random() < 0.3) {
        const otherMessages = [
          { type: 'info' as const, msg: 'Monitoramento de áudio ativo', comp: 'Audio' },
          { type: 'success' as const, msg: 'Configurações salvas', comp: 'Settings' },
          { type: 'info' as const, msg: 'Verificação de dispositivos concluída', comp: 'Audio' },
        ];
        
        const random = otherMessages[Math.floor(Math.random() * otherMessages.length)];
        addLogEntry(random.type, random.msg, random.comp);
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [cpuHistory, memoryHistory, lastCpuWarning, lastMemoryWarning]);

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