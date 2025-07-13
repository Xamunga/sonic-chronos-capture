import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { logSystem } from '@/utils/logSystem';

const ResourceMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(1);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskSpace, setDiskSpace] = useState(85);

  useEffect(() => {
    const settings = localStorage.getItem('resourceMonitorSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setIsMonitoring(parsed.isMonitoring ?? true);
      setUpdateInterval(parsed.updateInterval ?? 1);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      isMonitoring,
      updateInterval
    };
    localStorage.setItem('resourceMonitorSettings', JSON.stringify(settings));
    logSystem.success('Configurações de monitoramento salvas', 'Monitor');
  };

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulação de dados de sistema
      setCpuUsage(Math.random() * 60 + 10);
      setMemoryUsage(Math.random() * 40 + 30);
      setDiskSpace(85 + Math.random() * 10);
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, updateInterval]);

  const ResourceBar = ({ value, label, icon: Icon, color }: { 
    value: number; 
    label: string; 
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-studio-electric" />
        <span className="text-sm font-medium text-studio-electric">{label}</span>
        <span className="text-sm font-mono text-white border border-studio-electric bg-black/50 px-2 py-1 rounded ml-auto">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-4 overflow-hidden border border-border">
        <div 
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Monitor de Recursos</h3>
        
        <div className="space-y-6">
          {/* Controles */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isMonitoring}
                onCheckedChange={setIsMonitoring}
                id="monitoring-enabled"
              />
              <Label htmlFor="monitoring-enabled" className="text-sm font-medium">
                Monitoramento Ativo
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="update-interval" className="text-sm">
                Atualizar a cada:
              </Label>
              <Select value={updateInterval.toString()} onValueChange={(value) => setUpdateInterval(Number(value))}>
                <SelectTrigger id="update-interval" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1s</SelectItem>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicadores de recursos */}
          {isMonitoring ? (
            <div className="space-y-4">
              <ResourceBar 
                value={cpuUsage} 
                label="Uso de CPU" 
                icon={Cpu}
                color="bg-red-500"
              />
              <ResourceBar 
                value={memoryUsage} 
                label="Uso de Memória RAM" 
                icon={MemoryStick}
                color="bg-green-500"
              />
              <ResourceBar 
                value={diskSpace} 
                label="Espaço em Disco Usado" 
                icon={HardDrive}
                color="bg-yellow-500"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Monitoramento desabilitado</p>
              <p className="text-sm mt-1">Ative o switch acima para visualizar os recursos</p>
            </div>
          )}

          <Button onClick={saveSettings} className="w-full font-bold">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceMonitor;