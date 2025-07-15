import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Bug, Monitor, Headphones, Settings, Folder, Download, FileText, AlertTriangle, Activity, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logSystem } from '@/utils/logSystem';

const DebugTab = () => {
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [audioDevices, setAudioDevices] = useState<any[]>([]);
  const [appState, setAppState] = useState<any>({});
  const [electronInfo, setElectronInfo] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [debugLogsPath, setDebugLogsPath] = useState<string>('');
  const [recordingDiagnostics, setRecordingDiagnostics] = useState<any>({});
  const [fileDiagnostics, setFileDiagnostics] = useState<any>({});
  const [vuMeterDiagnostics, setVuMeterDiagnostics] = useState<any>({});
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
        nodeVersion: electronAPI?.platform?.nodeVersion || 'N/A',
        chromeVersion: electronAPI?.platform?.chromeVersion || 'N/A', 
        electronVersion: electronAPI?.version || 'N/A',
        platform: electronAPI?.platform || navigator.platform,
        arch: 'N/A',
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

  // Carregar caminho dos logs de debug
  const loadDebugLogsPath = async () => {
    try {
      const path = await logSystem.getDebugLogsPath();
      if (path) {
        setDebugLogsPath(path);
      }
    } catch (error) {
      console.error('Erro ao carregar caminho dos logs:', error);
    }
  };

  // NOVO: Diagnósticos específicos para problemas v2.8/v2.9
  const collectRecordingDiagnostics = () => {
    const audioSettings = localStorage.getItem('audioSettings');
    let settings = {};
    try {
      settings = audioSettings ? JSON.parse(audioSettings) : {};
    } catch (e) {
      settings = { error: 'Erro ao parsear audioSettings' };
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      audioSettings: settings,
      mediaRecorderSupport: {
        isSupported: typeof MediaRecorder !== 'undefined',
        supportedMimeTypes: {
          'audio/webm': MediaRecorder?.isTypeSupported('audio/webm'),
          'audio/webm;codecs=opus': MediaRecorder?.isTypeSupported('audio/webm;codecs=opus'),
          'audio/mp4': MediaRecorder?.isTypeSupported('audio/mp4'),
          'audio/mpeg': MediaRecorder?.isTypeSupported('audio/mpeg'),
        }
      },
      webAudioAPI: {
        isSupported: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
        maxChannelCount: 'N/A' as string | number,
        sampleRate: 'N/A' as string | number,
        error: undefined as string | undefined
      },
      currentRecordingState: {
        // Estes serão atualizados dinamicamente pelo audioService
        isRecording: false,
        isPaused: false,
        currentFileSize: 'N/A',
        lastSplitTime: 'N/A',
        totalChunks: 'N/A'
      }
    };

    // Tentar obter informações do AudioContext se disponível
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      diagnostics.webAudioAPI.maxChannelCount = audioContext.destination.maxChannelCount;
      diagnostics.webAudioAPI.sampleRate = audioContext.sampleRate;
      audioContext.close();
    } catch (e) {
      diagnostics.webAudioAPI.error = 'Erro ao acessar AudioContext';
    }

    setRecordingDiagnostics(diagnostics);
  };

  // NOVO: Diagnósticos de estrutura de arquivos e pastas
  const collectFileDiagnostics = () => {
    const audioSettings = localStorage.getItem('audioSettings');
    let settings = {};
    try {
      settings = audioSettings ? JSON.parse(audioSettings) : {};
    } catch (e) {
      settings = {};
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      folderStructureConfig: {
        dateFolderEnabled: (settings as any).dateFolderEnabled,
        dateFolderFormat: (settings as any).dateFolderFormat,
        fileNameFormat: (settings as any).fileNameFormat,
        outputFormat: (settings as any).outputFormat,
        splitEnabled: (settings as any).splitEnabled,
        splitIntervalMinutes: (settings as any).splitIntervalMinutes
      },
      expectedFolderStructure: {
        currentDate: new Date().toISOString().split('T')[0],
        expectedDateFolder_ddmm: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }).replace('/', '-'),
        expectedDateFolder_mmddyyyy: new Date().toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        }).replace(/\//g, '-'),
        currentTime: new Date().toLocaleTimeString('pt-BR', { 
          hour12: false 
        }).replace(/:/g, '-')
      },
      fileSystemAPI: {
        electronAvailable: !!(window as any).electronAPI,
        electronSaveFileAPI: !!(window as any).electronAPI?.saveAudioFile,
        electronEnsureDirAPI: !!(window as any).electronAPI?.ensureDirectory
      }
    };

    setFileDiagnostics(diagnostics);
  };

  // NOVO: Diagnósticos específicos para VU Meters
  const collectVuMeterDiagnostics = () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      analysisNode: {
        available: 'N/A',
        fftSize: 'N/A',
        bufferLength: 'N/A',
        connected: 'N/A'
      },
      volumeCallbacks: {
        registered: 'N/A',
        lastUpdate: 'N/A',
        updateFrequency: 'Targeting 10 FPS (100ms)'
      },
      peakDetection: {
        enabled: true,
        threshold: -6, // dB
        lastPeakL: 'N/A',
        lastPeakR: 'N/A'
      },
      commonIssues: {
        stuckAtMaximum: 'Monitor se VU meters ficam travados no máximo',
        peakIndicatorsStuck: 'Monitor se indicadores L/R ficam acesos permanentemente',
        noResponse: 'Monitor se VU meters não respondem ao áudio',
        afterSplitFreeze: 'Monitor se VU meters travam após split de arquivo'
      }
    };

    setVuMeterDiagnostics(diagnostics);
  };

  // Atualiza todas as informações
  const refreshAllData = () => {
    collectSystemInfo();
    collectAudioDevices();
    collectAppState();
    collectElectronInfo();
    collectPerformanceMetrics();
    loadDebugLogsPath();
    // NOVOS diagnósticos específicos v3.0
    collectRecordingDiagnostics();
    collectFileDiagnostics();
    collectVuMeterDiagnostics();
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
      version: 'v3.0-dev',
      criticalDiagnostics: {
        recordingDiagnostics,
        fileDiagnostics,
        vuMeterDiagnostics
      },
      systemInfo,
      audioDevices,
      appState,
      electronInfo,
      performanceMetrics,
      consoleErrors: [], // Placeholder para erros do console
      networkRequests: [], // Placeholder para requisições de rede
    };
    
    copyToClipboard(fullReport, 'Relatório Completo v3.0');
  };

  const exportFullReportToFile = () => {
    const fullReport = {
      reportGenerated: new Date().toISOString(),
      version: 'v3.0-dev',
      criticalDiagnostics: {
        recordingDiagnostics,
        fileDiagnostics,
        vuMeterDiagnostics
      },
      systemInfo,
      audioDevices,
      appState,
      electronInfo,
      performanceMetrics,
      consoleErrors: [], // Placeholder para erros do console
      networkRequests: [], // Placeholder para requisições de rede
    };

    // Gerar conteúdo formatado do arquivo
    const reportContent = `RELATÓRIO COMPLETO DE DEBUG v3.0
===========================================
Gerado em: ${new Date().toLocaleString('pt-BR')}
Versão: v3.0-dev (Plano Manus implementado)

🚨 DIAGNÓSTICOS CRÍTICOS v3.0 🚨
===========================================

=== DIAGNÓSTICOS DE GRAVAÇÃO ===
${JSON.stringify(recordingDiagnostics, null, 2)}

=== DIAGNÓSTICOS DE ARQUIVOS E PASTAS ===
${JSON.stringify(fileDiagnostics, null, 2)}

=== DIAGNÓSTICOS VU METERS ===
${JSON.stringify(vuMeterDiagnostics, null, 2)}

=== INFORMAÇÕES DO SISTEMA ===
${JSON.stringify(systemInfo, null, 2)}

=== DISPOSITIVOS DE ÁUDIO ===
${JSON.stringify(audioDevices, null, 2)}

=== ESTADO DA APLICAÇÃO ===
${JSON.stringify(appState, null, 2)}

=== INFORMAÇÕES DO ELECTRON ===
${JSON.stringify(electronInfo, null, 2)}

=== MÉTRICAS DE PERFORMANCE ===
${JSON.stringify(performanceMetrics, null, 2)}

=== ERROS DO CONSOLE ===
${JSON.stringify([], null, 2)}

=== REQUISIÇÕES DE REDE ===
${JSON.stringify([], null, 2)}

===========================================
Fim do relatório v3.0`;

    // Criar e baixar o arquivo
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-report-${new Date().toISOString().split('T')[0]}-${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "Arquivo de debug completo foi baixado",
    });
  };

  const openDebugLogsFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && debugLogsPath) {
      try {
        await electronAPI.openExternal(debugLogsPath);
        toast({
          title: "Pasta aberta!",
          description: "Pasta de logs de debug foi aberta no explorador",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível abrir a pasta de logs",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Indisponível",
        description: "Funcionalidade disponível apenas no modo desktop",
        variant: "destructive"
      });
    }
  };

  const DebugSection = ({ title, data, icon: Icon, onCopy }: any) => (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">{title}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => onCopy(data, title)} className="bg-muted/50 border-studio-electric font-bold">
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
        <Textarea
          value={JSON.stringify(data, null, 2)}
          readOnly
          className="min-h-[200px] font-mono text-xs bg-muted/50 border-studio-electric font-bold text-white"
        />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-studio-electric" />
              <h3 className="text-lg font-semibold text-studio-electric">Debug Console</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshAllData} className="bg-muted/50 border-studio-electric font-bold">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={generateFullReport} className="bg-muted/50 border-studio-electric font-bold">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Relatório
              </Button>
              <Button variant="default" size="sm" onClick={exportFullReportToFile} className="font-bold">
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
              {debugLogsPath && (
                <Button variant="outline" size="sm" onClick={openDebugLogsFolder} className="bg-muted/50 border-studio-electric font-bold">
                  <Folder className="h-4 w-4 mr-2" />
                  Logs Automáticos
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm text-white space-y-2">
            <p><strong>v3.0 Debug Enhanced:</strong> Diagnósticos específicos para problemas v2.8/v2.9 identificados</p>
            <p className="text-xs text-red-400">🚨 Versão de desenvolvimento - Plano Manus implementado</p>
            {debugLogsPath && (
              <p className="text-xs text-studio-electric bg-studio-dark p-2 rounded border border-studio-electric/20">
                <FileText className="w-4 h-4 inline mr-2" />
                Logs automáticos salvos em: {debugLogsPath}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="critical">🚨 Críticos</TabsTrigger>
          <TabsTrigger value="recording">Gravação</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="audio">Áudio</TabsTrigger>
          <TabsTrigger value="app">Aplicação</TabsTrigger>
          <TabsTrigger value="electron">Electron</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <div className="grid gap-4">
            <DebugSection
              title="🔴 Diagnósticos de Gravação (v3.0)"
              data={recordingDiagnostics}
              icon={AlertTriangle}
              onCopy={copyToClipboard}
            />
            <DebugSection
              title="🔴 Diagnósticos de Arquivos e Pastas (v3.0)"
              data={fileDiagnostics}
              icon={FolderOpen}
              onCopy={copyToClipboard}
            />
            <DebugSection
              title="🔴 Diagnósticos VU Meters (v3.0)"
              data={vuMeterDiagnostics}
              icon={Activity}
              onCopy={copyToClipboard}
            />
          </div>
        </TabsContent>

        <TabsContent value="recording" className="space-y-4">
          <DebugSection
            title="Diagnósticos de Gravação Detalhados"
            data={recordingDiagnostics}
            icon={AlertTriangle}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <DebugSection
            title="Diagnósticos de Estrutura de Arquivos"
            data={fileDiagnostics}
            icon={FolderOpen}
            onCopy={copyToClipboard}
          />
        </TabsContent>

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