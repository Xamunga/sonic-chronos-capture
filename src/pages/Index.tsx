
import React, { useState, useEffect } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <div className="space-y-5">
            <RecordingControls outputPath={outputPath} />
            <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30 rounded-lg p-6 text-center border flex flex-col justify-center h-[270px]">
              <div className="text-studio-electric font-mono text-3xl font-bold" style={{ marginBottom: '3.25rem' }}>
                <span>{currentTime.toLocaleDateString('pt-BR')}</span>
                <span style={{ marginLeft: '0.8em' }}>{currentTime.toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="text-sm text-muted-foreground bg-black p-2 rounded border border-studio-electric/20 text-white" style={{ textShadow: '0 0 3px hsl(195 100% 50%), 0 0 6px hsl(195 100% 50%)' }}>Data e Hora Atual</div>
            </div>
          </div>
          <div className="space-y-4">
            <VUMeters />
            <SpectrumAnalyzer />
          </div>
        </div>
        
        {/* Sistema de Accordion para Abas */}
        <Accordion type="multiple" className="w-full flex-1">
          <AccordionItem value="audio" className="border-studio-electric/30">
            <AccordionTrigger className="px-4 py-2 bg-black hover:bg-studio-electric/10 text-studio-electric">
              Áudio
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <AudioSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="files" className="border-studio-electric/30">
            <AccordionTrigger className="px-4 py-2 bg-black hover:bg-studio-electric/10 text-studio-electric">
              Arquivos
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <FileManagementSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="resources" className="border-studio-electric/30">
            <AccordionTrigger className="px-4 py-2 bg-black hover:bg-studio-electric/10 text-studio-electric">
              Recursos
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ResourceMonitor />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="log" className="border-studio-electric/30">
            <AccordionTrigger className="px-4 py-2 bg-black hover:bg-studio-electric/10 text-studio-electric">
              Log
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <LogTab />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="debug" className="border-studio-electric/30">
            <AccordionTrigger className="px-4 py-2 bg-black hover:bg-studio-electric/10 text-studio-electric">
              Debug
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <DebugTab />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <footer className="mt-4 text-center text-xs text-muted-foreground">
          <div className="bg-muted/50 rounded-lg p-2 border border-border">
            Gravador Real Time Pro v2.3 | ALES Sonorização
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
