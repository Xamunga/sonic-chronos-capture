
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '../components/AppHeader';
import RecordingControls from '../components/RecordingControls';
import VUMeters from '../components/VUMeters';
import SpectrumAnalyzer from '../components/SpectrumAnalyzer';
import AudioSettings from '../components/AudioSettings';
import SessionInfo from '../components/SessionInfo';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-studio-dark via-studio-charcoal to-studio-slate p-4">
      <div className="max-w-7xl mx-auto">
        <AppHeader />
        
        <Tabs defaultValue="monitor" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-studio-charcoal border-studio-electric/30">
            <TabsTrigger 
              value="monitor" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Real-Time Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Audio Settings
            </TabsTrigger>
            <TabsTrigger 
              value="session" 
              className="data-[state=active]:bg-studio-electric data-[state=active]:text-studio-dark text-studio-electric"
            >
              Session Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RecordingControls />
              </div>
              <div className="lg:col-span-2 space-y-6">
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

          <TabsContent value="session" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionInfo />
              <div className="space-y-6">
                <RecordingControls />
                <div className="bg-gradient-to-br from-studio-charcoal to-studio-slate border border-studio-electric/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-studio-electric mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Auto Split</div>
                      <div className="text-xs text-muted-foreground">Enable/Disable</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Silence Detection</div>
                      <div className="text-xs text-muted-foreground">Configure</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">Backup Settings</div>
                      <div className="text-xs text-muted-foreground">Export/Import</div>
                    </button>
                    <button className="pro-button p-4 text-center rounded-lg">
                      <div className="text-studio-neon font-semibold">View Logs</div>
                      <div className="text-xs text-muted-foreground">System Status</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <div className="bg-studio-charcoal/50 rounded-lg p-4 border border-studio-electric/20">
            Gravador Real Time Pro v1.0 | ALES Sonorization | Professional Audio Recording Suite
            <br />
            Optimized for Windows 10/11 | Multi-channel USB Audio Support | 24/7 Continuous Recording
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
