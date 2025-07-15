import React from 'react';
import { Card } from '@/components/ui/card';
const AppHeader = () => {
  return <Card className="mb-6 bg-gradient-to-r from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <img src="/lovable-uploads/1867b4e7-d095-4d77-861c-1b9db4cf0271.png" alt="Ícone do Gravador" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-studio-electric">
              Gravador Real Time Pro
            </h1>
            <p className="text-sm text-muted-foreground">
              Suíte Profissional de Gravação de Áudio
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-studio-electric">ALES Supervisão de Sonorização</div>
          <div className="text-xs text-muted-foreground">
        </div>
        </div>
      </div>
    </Card>;
};
export default AppHeader;