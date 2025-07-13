
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
    <div className="min-h-screen bg-background p-2" style={{ maxWidth: '1200px', maxHeight: '530px' }}>
      <div className="max-w-full mx-auto min-h-full flex flex-col">
        <AppHeader />
        
        {/* Monitor Principal - Sem abas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <RecordingControls outputPath={outputPath} />
            <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30 rounded-lg p-3 text-center border">
              <div className="text-studio-electric font-mono text-base">
                {currentTime.toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-muted-foreground">Data e Hora Atual</div>
            </div>
          </div>
          <div className="space-y-4">
            <VUMeters />
            <SpectrumAnalyzer />
          </div>
        </div>
        
        <Tabs defaultValue="audio" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted sticky top-0 z-10">
            <TabsTrigger value="audio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Áudio
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recursos
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
        </Tabs>

        <footer className="mt-4 text-center text-xs text-muted-foreground">
          <div className="bg-muted/50 rounded-lg p-2 border border-border">
            Gravador Real Time Pro v2.1 | ALES Sonorização
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
