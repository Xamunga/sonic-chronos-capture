
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
  const [activeTab, setActiveTab] = useState('');
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
        
        {/* Sistema de Accordion com Layout Horizontal */}
        <div className="w-full flex-1">
          {/* Barra de Abas Horizontal */}
          <div className="grid w-full grid-cols-5 mb-4 bg-black sticky top-0 z-10 rounded-lg">
            <button 
              onClick={() => setActiveTab(activeTab === 'audio' ? '' : 'audio')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'audio' 
                  ? 'bg-studio-electric text-black' 
                  : 'text-studio-electric hover:bg-studio-electric/10'
              }`}
            >
              Áudio
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'files' ? '' : 'files')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'files' 
                  ? 'bg-studio-electric text-black' 
                  : 'text-studio-electric hover:bg-studio-electric/10'
              }`}
            >
              Arquivos
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'resources' ? '' : 'resources')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'resources' 
                  ? 'bg-studio-electric text-black' 
                  : 'text-studio-electric hover:bg-studio-electric/10'
              }`}
            >
              Recursos
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'log' ? '' : 'log')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'log' 
                  ? 'bg-studio-electric text-black' 
                  : 'text-studio-electric hover:bg-studio-electric/10'
              }`}
            >
              Log
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'debug' ? '' : 'debug')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'debug' 
                  ? 'bg-studio-electric text-black' 
                  : 'text-studio-electric hover:bg-studio-electric/10'
              }`}
            >
              Debug
            </button>
          </div>

          {/* Conteúdo Expansível */}
          {activeTab === 'audio' && (
            <div className="animate-fade-in">
              <AudioSettings />
            </div>
          )}
          
          {activeTab === 'files' && (
            <div className="animate-fade-in">
              <FileManagementSettings />
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="animate-fade-in">
              <ResourceMonitor />
            </div>
          )}
          
          {activeTab === 'log' && (
            <div className="animate-fade-in">
              <LogTab />
            </div>
          )}
          
          {activeTab === 'debug' && (
            <div className="animate-fade-in">
              <DebugTab />
            </div>
          )}
        </div>

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
