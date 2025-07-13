import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Bug, Monitor, Headphones, Settings, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DebugTab = () => {
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [audioDevices, setAudioDevices] = useState<any[]>([]);
  const [appState, setAppState] = useState<any>({});
  const [electronInfo, setElectronInfo] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const { toast } = useToast();

  // Coleta informações do sistema
  const collectSystemInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      memory: (navigator as any).deviceMemory || 'N/A',
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
    };
    setSystemInfo(info);
  };

  // Coleta informações dos dispositivos de áudio
  const collectAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => 
        device.kind === 'audioinput' || device.kind === 'audiooutput'
      ).map(device => ({
        deviceId: device.deviceId,
        kind: device.kind,
        label: device.label || 'Dispositivo sem nome',
        groupId: device.groupId
      }));
      setAudioDevices(audioDevices);
    } catch (error) {
      setAudioDevices([{ error: 'Erro ao acessar dispositivos de áudio: ' + error }]);
    }
  };

  // Coleta informações do estado da aplicação
  const collectAppState = () => {
    const state = {
      timestamp: new Date().toISOString(),
      currentPath: window.location.hash,
      documentTitle: document.title,
      documentReadyState: document.readyState,
      referrer: document.referrer,
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as any),
      sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as any),
      windowSize: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      }
    };
    setAppState(state);
  };

  // Coleta informações do Electron (se disponível)
  const collectElectronInfo = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI) {
      const info = {
        isElectron: true,
        nodeVersion: process?.versions?.node || 'N/A',
        chromeVersion: process?.versions?.chrome || 'N/A',
        electronVersion: process?.versions?.electron || 'N/A',
        platform: process?.platform || 'N/A',
        arch: process?.arch || 'N/A',
        availableAPIs: Object.keys(electronAPI)
      };
      setElectronInfo(info);
    } else {
      setElectronInfo({
        isElectron: false,
        mode: 'Browser Mode'
      });
    }
  };

  // Coleta métricas de performance
  const collectPerformanceMetrics = () => {
    if ('performance' in window) {
      const metrics = {
        timestamp: new Date().toISOString(),
        navigation: performance.getEntriesByType('navigation')[0],
        memory: (performance as any).memory,
        timing: performance.timing,
        timeOrigin: performance.timeOrigin,
        now: performance.now()
      };
      setPerformanceMetrics(metrics);
    }
  };

  // Atualiza todas as informações
  const refreshAllData = () => {
    collectSystemInfo();
    collectAudioDevices();
    collectAppState();
    collectElectronInfo();
    collectPerformanceMetrics();
  };

  useEffect(() => {
    refreshAllData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (data: any, section: string) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast({
        title: "Copiado!",
        description: `Dados de ${section} copiados para a área de transferência`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar para a área de transferência",
        variant: "destructive"
      });
    }
  };

  const generateFullReport = () => {
    const fullReport = {
      reportGenerated: new Date().toISOString(),
      systemInfo,
      audioDevices,
      appState,
      electronInfo,
      performanceMetrics,
      consoleErrors: [], // Placeholder para erros do console
      networkRequests: [], // Placeholder para requisições de rede
    };
    
    copyToClipboard(fullReport, 'Relatório Completo');
  };

  const DebugSection = ({ title, data, icon: Icon, onCopy }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onCopy(data, title)}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={JSON.stringify(data, null, 2)}
          readOnly
          className="min-h-[200px] font-mono text-xs"
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Console
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshAllData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="default" size="sm" onClick={generateFullReport}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Relatório Completo
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Informações técnicas detalhadas para diagnóstico e depuração
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="audio">Áudio</TabsTrigger>
          <TabsTrigger value="app">Aplicação</TabsTrigger>
          <TabsTrigger value="electron">Electron</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <DebugSection
            title="Informações do Sistema"
            data={systemInfo}
            icon={Monitor}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <DebugSection
            title="Dispositivos de Áudio"
            data={audioDevices}
            icon={Headphones}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="app" className="space-y-4">
          <DebugSection
            title="Estado da Aplicação"
            data={appState}
            icon={Settings}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="electron" className="space-y-4">
          <DebugSection
            title="Informações do Electron"
            data={electronInfo}
            icon={Folder}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <DebugSection
            title="Métricas de Performance"
            data={performanceMetrics}
            icon={Monitor}
            onCopy={copyToClipboard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugTab;