
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { audioService } from '@/services/electronAudio';

const SpectrumAnalyzer = () => {
  const [spectrum, setSpectrum] = useState<number[]>(Array(32).fill(0));

  useEffect(() => {
    const handleSpectrumUpdate = (data: number[]) => {
      setSpectrum(data);
    };

    // Registrar callback no audioService
    audioService.onSpectrumUpdate(handleSpectrumUpdate);

    // Fallback para mostrar "SEM SINAL" quando não há entrada
    const fallbackInterval = setInterval(() => {
      if (!audioService.hasAudioSignal()) {
        setSpectrum(Array(32).fill(0));
      }
    }, 50);

    return () => {
      audioService.removeSpectrumCallback(handleSpectrumUpdate);
      clearInterval(fallbackInterval);
    };
  }, []);

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Analisador de Espectro</h3>
        <div className="h-32 flex items-end justify-between space-x-1 bg-studio-dark rounded-lg p-2">
          {spectrum.map((level, index) => (
            <div
              key={index}
              className="spectrum-bar w-2 rounded-t transition-all duration-75 ease-out"
              style={{ height: `${level}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>20Hz</span>
          <span>1kHz</span>
          <span>20kHz</span>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {audioService.hasAudioSignal() 
            ? <span className="text-studio-neon">Processamento Otimizado Windows 10/11</span>
            : <span className="text-studio-warning bg-studio-dark p-2 rounded border border-studio-electric/20">SEM SINAL</span>
          }
        </div>
      </div>
    </Card>
  );
};

export default SpectrumAnalyzer;
