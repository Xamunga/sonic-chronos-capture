
import React, { useState, useEffect } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { getFullVersionString } from '@/config/version';
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
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const windowSize = useWindowSize();

  // Atualizar data/hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-background p-1 text-scale-130" style={{ width: '100%', maxHeight: '320px', transform: 'scale(0.6)', transformOrigin: 'top left' }}>
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
        
        {/* Sistema de Abas Horizontais */}
        <div className="w-full flex-1">
          {/* Triggers das Abas em linha horizontal */}
          <div className="flex bg-black border border-studio-electric/30 rounded-t-lg">
            <button
              onClick={() => setActiveTab(activeTab === 'audio' ? null : 'audio')}
              className="flex-1 px-4 py-2 hover:bg-studio-electric/10 text-studio-electric border-r border-studio-electric/30 transition-colors text-lg font-bold"
            >
              Áudio
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'files' ? null : 'files')}
              className="flex-1 px-4 py-2 hover:bg-studio-electric/10 text-studio-electric border-r border-studio-electric/30 transition-colors text-lg font-bold"
            >
              Arquivos
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'resources' ? null : 'resources')}
              className="flex-1 px-4 py-2 hover:bg-studio-electric/10 text-studio-electric border-r border-studio-electric/30 transition-colors text-lg font-bold"
            >
              Recursos
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'log' ? null : 'log')}
              className="flex-1 px-4 py-2 hover:bg-studio-electric/10 text-studio-electric border-r border-studio-electric/30 transition-colors text-lg font-bold"
            >
              Log
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'debug' ? null : 'debug')}
              className="flex-1 px-4 py-2 hover:bg-studio-electric/10 text-studio-electric transition-colors text-lg font-bold"
            >
              Debug
            </button>
          </div>
          
          {/* Conteúdo das Abas */}
          {activeTab === 'audio' && (
            <div className="border-studio-electric/30 border-x border-b rounded-b-lg bg-black px-4 pb-4">
              <AudioSettings />
            </div>
          )}
          
          {activeTab === 'files' && (
            <div className="border-studio-electric/30 border-x border-b rounded-b-lg bg-black px-4 pb-4">
              <FileManagementSettings />
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="border-studio-electric/30 border-x border-b rounded-b-lg bg-black px-4 pb-4">
              <ResourceMonitor />
            </div>
          )}
          
          {activeTab === 'log' && (
            <div className="border-studio-electric/30 border-x border-b rounded-b-lg bg-black px-4 pb-4">
              <LogTab />
            </div>
          )}
          
          {activeTab === 'debug' && (
            <div className="border-studio-electric/30 border-x border-b rounded-b-lg bg-black px-4 pb-4">
              <DebugTab />
            </div>
          )}
        </div>

        <footer className="mt-4 text-center text-xs">
          <div className="bg-black p-2 rounded border border-studio-electric/20 text-white" style={{ textShadow: '0 0 3px hsl(195 100% 50%), 0 0 6px hsl(195 100% 50%)' }}>
            {getFullVersionString()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
