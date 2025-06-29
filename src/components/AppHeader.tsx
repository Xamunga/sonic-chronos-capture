
import React from 'react';
import { Card } from '@/components/ui/card';

const AppHeader = () => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-studio-electric to-studio-neon rounded-lg flex items-center justify-center">
            <span className="text-studio-dark font-bold text-xl">G</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-studio-electric">
              Gravador Real Time Pro
            </h1>
            <p className="text-sm text-muted-foreground">
              Professional Audio Recording Suite
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-studio-neon">
            ALES Sonorization
          </div>
          <div className="text-xs text-muted-foreground">
            Professional Audio Solutions
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AppHeader;
