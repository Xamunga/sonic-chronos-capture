import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Headphones, Volume2 } from 'lucide-react';
import { audioService } from '@/services/electronAudio';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { logSystem } from '@/utils/logSystem';

const AudioSettings = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputDevice, setInputDevice] = useState('default');
  const [format, setFormat] = useState('wav');
  const [bitrate, setBitrate] = useState(320);
  const [sampleRate, setSampleRate] = useState(44100);
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(-35);

  const loadDevices = async () => {
    const audioDevices = await audioService.getAudioDevices();
    setDevices(audioDevices);
    console.info('Dispositivos carregados:', audioDevices);
  };

  useEffect(() => {
    loadDevices();
    setFormat(audioService.getOutputFormat());
    setBitrate(audioService.getMp3Bitrate());
    setSampleRate(audioService.getSampleRate());
    setInputDevice(audioService.getInputDevice()); // CRÍTICO: Sincronizar dispositivo
    setNoiseSuppressionEnabled(audioService.getNoiseSuppressionEnabled());
    setNoiseThreshold(audioService.getNoiseThreshold());
  }, []);

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    audioService.setOutputFormat(newFormat);
  };

  const handleBitrateChange = (newBitrate: number) => {
    setBitrate(newBitrate);
    audioService.setMp3Bitrate(newBitrate);
  };

  const handleNoiseSuppressionToggle = (enabled: boolean) => {
    setNoiseSuppressionEnabled(enabled);
    audioService.setNoiseSuppressionEnabled(enabled);
  };

  const handleNoiseThresholdChange = (threshold: number) => {
    setNoiseThreshold(threshold);
    audioService.setNoiseThreshold(threshold);
  };

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Headphones className="w-5 h-5 text-studio-electric" />
          <h3 className="text-lg font-semibold text-studio-electric">Configurações de Áudio</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="input-device" className="text-sm font-medium text-studio-electric">
              Dispositivo de Entrada
            </Label>
            <Select value={inputDevice} onValueChange={(value) => {
              setInputDevice(value);
              audioService.setInputDevice(value); // CRÍTICO: Aplicar mudança no service
              console.log('🔧 Dispositivo de entrada alterado:', value);
            }}>
              <SelectTrigger id="input-device" className="mt-2 bg-muted/50 border-studio-electric font-bold">
                <SelectValue placeholder="Selecione o dispositivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Dispositivo Padrão</SelectItem>
                {devices.map((device, index) => (
                  <SelectItem key={index} value={device.deviceId && device.deviceId !== '' ? device.deviceId : `device-${index}`}>
                    {device.label || `Dispositivo ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format" className="text-sm font-medium text-studio-electric">
              Formato de Áudio
            </Label>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger id="format" className="mt-2 bg-muted/50 border-studio-electric font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV (sem compressão)</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === 'mp3' && (
            <div>
              <Label htmlFor="mp3-bitrate" className="text-sm font-medium text-studio-electric">
                Qualidade MP3
              </Label>
              <Select value={bitrate.toString()} onValueChange={(value) => handleBitrateChange(Number(value))}>
                <SelectTrigger id="mp3-bitrate" className="mt-2 bg-muted/50 border-studio-electric font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="96">96 kbps (Qualidade Básica)</SelectItem>
                  <SelectItem value="128">128 kbps (Qualidade Padrão)</SelectItem>
                  <SelectItem value="256">256 kbps (Qualidade Alta)</SelectItem>
                  <SelectItem value="320">320 kbps (Qualidade Máxima)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="sample-rate" className="text-sm font-medium text-studio-electric">
              Taxa de Amostragem
            </Label>
            <Select value={sampleRate.toString()} onValueChange={(value) => setSampleRate(Number(value))}>
              <SelectTrigger id="sample-rate" className="mt-2 bg-muted/50 border-studio-electric font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22050">22.05 kHz</SelectItem>
                <SelectItem value="44100">44.1 kHz (CD Quality)</SelectItem>
                <SelectItem value="48000">48 kHz (Professional)</SelectItem>
                <SelectItem value="96000">96 kHz (Hi-Res)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Supressão de Ruído */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-studio-electric" />
                <Label className="text-sm font-medium text-studio-electric">
                  Supressão de Ruído
                </Label>
              </div>
              <Switch 
                checked={noiseSuppressionEnabled}
                onCheckedChange={handleNoiseSuppressionToggle}
              />
            </div>

            {noiseSuppressionEnabled && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-studio-electric">
                <div className="text-xs text-white">
                  <p className="mb-2">🔇 <strong>Supressão ativada:</strong></p>
                  <ul className="space-y-1 text-xs">
                    <li>• Remove ruído elétrico constante (50Hz/60Hz)</li>
                    <li>• Filtra frequências baixas indesejadas (&lt;80Hz)</li>
                    <li>• Reduz interferência de ventiladores e equipamentos</li>
                    <li>• Preserva a qualidade do áudio principal</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-studio-electric">
                    Threshold de Ruído: {noiseThreshold}dB
                  </Label>
                  <Slider
                    value={[noiseThreshold]}
                    onValueChange={(value) => handleNoiseThresholdChange(value[0])}
                    min={-60}
                    max={-20}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-white">
                    Sinais abaixo de {noiseThreshold}dB serão atenuados
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={() => {
            audioService.saveSettings();
            loadDevices();
            logSystem.success('Configurações de áudio salvas', 'Audio');
          }} className="w-full mt-6 font-bold">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AudioSettings;