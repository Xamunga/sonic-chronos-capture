import React from 'react';
import { Card } from '@/components/ui/card';
const AppHeader = () => {
  return <Card className="mb-6 bg-gradient-to-r from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/0ec13f08-862c-49e3-b3c3-79654a38f9c9.png" 
            alt="Audio Recording Icon" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-studio-electric">
              Gravador Real Time Pro
            </h1>
            <p className="text-sm text-studio-electric">
              Suíte Profissional de Gravação de Áudio
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-studio-electric">ALES Supervisão de  Sonorização</div>
          <div className="text-xs text-studio-electric">
        </div>
        </div>
      </div>
    </Card>;
};
export default AppHeader;