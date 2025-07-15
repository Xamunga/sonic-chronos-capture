
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { audioService } from '@/services/electronAudio';

const VUMeters = () => {
  const [leftLevel, setLeftLevel] = useState(-60);
  const [rightLevel, setRightLevel] = useState(-60);
  const [peakLeft, setPeakLeft] = useState(false);
  const [peakRight, setPeakRight] = useState(false);

  useEffect(() => {
    // VU Meters só funcionam durante gravação para evitar confusão do operador
    const handleVolumeUpdate = (left: number, right: number, peak: boolean) => {
      // Só mostrar atividade se estiver gravando
      if (audioService.isCurrentlyRecording()) {
        setLeftLevel(left);
        setRightLevel(right);
        setPeakLeft(peak || left > -6);
        setPeakRight(peak || right > -6);
      } else {
        // Zerar VU Meters quando não está gravando
        setLeftLevel(-60);
        setRightLevel(-60);
        setPeakLeft(false);
        setPeakRight(false);
      }
    };

    // Registrar callback no audioService
    audioService.onVolumeUpdate(handleVolumeUpdate);

    // Verificar estado de gravação periodicamente
    const statusInterval = setInterval(() => {
      if (!audioService.isCurrentlyRecording()) {
        setLeftLevel(-60);
        setRightLevel(-60);
        setPeakLeft(false);
        setPeakRight(false);
      }
    }, 100);

    return () => {
      audioService.removeVolumeCallback(handleVolumeUpdate);
      clearInterval(statusInterval);
    };
  }, []);

  // CORRIGIDO: VUMeter com escala dB profissional
  const VUMeter = ({ level, peak, label }: { level: number; peak: boolean; label: string }) => {
    // Converter dB (-60 a 0) para porcentagem (0 a 100) para display visual
    const displayPercentage = Math.max(0, Math.min(100, ((level + 60) / 60) * 100));
    
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-studio-electric w-8">{label}</span>
        <div className="flex-1 h-9 bg-studio-dark rounded-lg overflow-hidden relative border border-studio-electric/30">
          <div 
            className="vu-meter h-full transition-all duration-75 ease-out"
            style={{ width: `${displayPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 ${
                    i < (displayPercentage / 5) 
                      ? i < 12 ? 'bg-studio-neon'     // -60dB a -20dB (verde)
                        : i < 16 ? 'bg-yellow-400'    // -20dB a -10dB (amarelo)
                        : 'bg-studio-warning'         // -10dB a 0dB (vermelho)
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
          {level > -60 ? level.toFixed(0) : '-∞'}dB
        </span>
      </div>
    );
  };

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
            {audioService.isCurrentlyRecording() 
              ? (audioService.hasAudioSignal() 
                  ? `Peak Hold: ${Math.max(leftLevel, rightLevel) > -60 ? Math.max(leftLevel, rightLevel).toFixed(1) : '-∞'}dB`
                  : <span className="text-studio-electric bg-studio-dark p-2 rounded border border-studio-electric/20">🎤 GRAVANDO - Aguardando sinal</span>
                )
              : <span className="text-studio-warning bg-studio-dark p-2 rounded border border-studio-electric/20 ml-[45%]">SEM SINAL</span>
            }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VUMeters;
