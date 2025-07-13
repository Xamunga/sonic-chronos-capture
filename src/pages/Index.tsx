
import React, { useState, useEffect } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '../components/AppHeader';
import RecordingControls from '../components/RecordingControls';
import VUMeters from '../components/VUMeters';
import SpectrumAnalyzer from '../components/SpectrumAnalyzer';
import AudioSettings from '../components/AudioSettings';
import ResourceMonitor from '../components/ResourceMonitor';
import FileManagementSettings from '../components/FileManagementSettings';
import LogTab from '../components/LogTab';
import DebugTab from '../components/DebugTab';

const Index = () => {
  const [outputPath, setOutputPath] = useState('C:\\Gravacoes\\');
  const [currentTime, setCurrentTime] = useState(new Date());
  const windowSize = useWindowSize();

  // Atualizar data/hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-background p-1" style={{ width: '100%', maxHeight: '530px' }}>
      <div className="w-full min-h-full flex flex-col">
        <AppHeader />
        
        {/* Monitor Principal - Sem abas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <RecordingControls outputPath={outputPath} />
            <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30 rounded-lg p-6 text-center border flex flex-col justify-center h-[113px]">
              <div className="text-studio-electric font-mono text-2xl font-bold mb-2">
                {currentTime.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-muted-foreground">Data e Hora Atual</div>
            </div>
          </div>
          <div className="space-y-4">
            <VUMeters />
            <SpectrumAnalyzer />
          </div>
        </div>
        
        <Tabs defaultValue="audio" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-muted sticky top-0 z-10">
            <TabsTrigger value="audio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Áudio
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recursos
            </TabsTrigger>
            <TabsTrigger value="log" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Log
            </TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4">
            <AudioSettings />
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <FileManagementSettings />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceMonitor />
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <LogTab />
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <DebugTab />
          </TabsContent>
        </Tabs>

        <footer className="mt-4 text-center text-xs text-muted-foreground">
          <div className="bg-muted/50 rounded-lg p-2 border border-border">
            Gravador Real Time Pro v2.2 | ALES Sonorização
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
