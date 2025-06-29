
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

const VUMeters = () => {
  const [leftLevel, setLeftLevel] = useState(0);
  const [rightLevel, setRightLevel] = useState(0);
  const [peakLeft, setPeakLeft] = useState(false);
  const [peakRight, setPeakRight] = useState(false);

  useEffect(() => {
    // Simulate audio levels for demonstration
    const interval = setInterval(() => {
      const newLeftLevel = Math.random() * 100;
      const newRightLevel = Math.random() * 100;
      
      setLeftLevel(newLeftLevel);
      setRightLevel(newRightLevel);
      
      setPeakLeft(newLeftLevel > 85);
      setPeakRight(newRightLevel > 85);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const VUMeter = ({ level, peak, label }: { level: number; peak: boolean; label: string }) => (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-studio-electric w-8">{label}</span>
      <div className="flex-1 h-8 bg-studio-dark rounded-lg overflow-hidden relative border border-studio-electric/30">
        <div 
          className="vu-meter h-full transition-all duration-75 ease-out"
          style={{ width: `${level}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={`w-1 h-4 ${
                  i < (level / 5) 
                    ? i < 12 ? 'bg-studio-neon' 
                      : i < 16 ? 'bg-yellow-400' 
                      : 'bg-studio-warning' 
                    : 'bg-studio-slate'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
        peak ? 'bg-studio-warning border-studio-warning text-white animate-pulse' : 'border-studio-slate text-studio-slate'
      }`}>
        PEAK
      </div>
      <span className="text-sm font-mono text-studio-electric w-12">
        {level.toFixed(0)}dB
      </span>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">VU Meters</h3>
        <div className="space-y-4">
          <VUMeter level={leftLevel} peak={peakLeft} label="L" />
          <VUMeter level={rightLevel} peak={peakRight} label="R" />
        </div>
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground">
            Peak Hold: {Math.max(leftLevel, rightLevel).toFixed(1)}dB
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VUMeters;
