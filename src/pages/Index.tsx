
import React, { useState, useEffect } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '../components/AppHeader';
import RecordingControls from '../components/RecordingControls';
import VUMeters from '../components/VUMeters';
import SpectrumAnalyzer from '../components/SpectrumAnalyzer';
import AudioSettings from '../components/AudioSettings';
import SessionInfo from '../components/SessionInfo';
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
    <div className="min-h-screen bg-gradient-to-br from-studio-dark via-studio-charcoal to-studio-slate p-4">
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-2rem)] flex flex-col">
        <AppHeader />
        
        <Tabs defaultValue="monitor" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-studio-charcoal border-studio-electric/30 sticky top-0 z-10">
            <TabsTrigger 
              value="monitor" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Monitor em Tempo Real
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Configurações de Áudio
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Gerenciamento de Arquivos
            </TabsTrigger>
            <TabsTrigger 
              value="session" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Informações da Sessão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6 flex-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
              <div className="space-y-6">
                <RecordingControls outputPath={outputPath} />
                <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border border-studio-electric/30 rounded-lg p-4 text-center">
                  <div className="text-studio-electric font-mono text-lg">
                    {currentTime.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">Data e Hora Atual</div>
                </div>
              </div>
              <div className="space-y-6">
                <VUMeters />
                <SpectrumAnalyzer />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AudioSettings />
              <div className="space-y-6">
                <VUMeters />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <FileManagementSettings />
          </TabsContent>

          <TabsContent value="session" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionInfo outputPath={outputPath} setOutputPath={setOutputPath} />
              <div className="space-y-6">
                <RecordingControls outputPath={outputPath} />
                <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border border-studio-electric/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-studio-electric mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Divisão Automática</div>
                      <div className="text-xs text-muted-foreground">Ativar/Desativar</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Detecção de Silêncio</div>
                      <div className="text-xs text-muted-foreground">Configurar</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Backup Configurações</div>
                      <div className="text-xs text-muted-foreground">Exportar/Importar</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Ver Logs</div>
                      <div className="text-xs text-muted-foreground">Status do Sistema</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <div className="bg-studio-charcoal/50 rounded-lg p-4 border border-studio-electric/20">
            Gravador Real Time Pro v1.0 | ALES Sonorização | Suíte Profissional de Gravação de Áudio
            <br />
            Otimizado para Windows 10/11 | Suporte USB Multi-canal | Gravação Contínua 24/7
            <br />
            <span className="text-studio-neon">Sistema de Buffer Duplo • Zero Perda de Áudio • Divisão Sem Gaps</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
