import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { audioService } from '@/services/electronAudio';
import { useAudioRecording } from '@/hooks/useAudioRecording';

const AudioSettings = () => {
  const [inputDevice, setInputDevice] = useState('default');
  const [format, setFormat] = useState('wav');
  const [sampleRate, setSampleRate] = useState('44100');
  const [bitrate, setBitrate] = useState(320);
  const { devices, loadDevices } = useAudioRecording();

  useEffect(() => {
    setFormat(audioService.getOutputFormat());
    setBitrate(audioService.getMp3Bitrate());
  }, []);

  const handleFormatChange = (value: string) => {
    setFormat(value);
    audioService.setOutputFormat(value);
  };

  const handleBitrateChange = (value: string) => {
    const newBitrate = Number(value);
    setBitrate(newBitrate);
    audioService.setMp3Bitrate(newBitrate);
  };

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Configurações de Áudio</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="input-device" className="text-sm font-medium text-studio-electric">
              Dispositivo de Entrada
            </Label>
            <Select value={inputDevice} onValueChange={setInputDevice}>
              <SelectTrigger id="input-device" className="mt-2">
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
              <SelectTrigger id="format" className="mt-2">
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
              <Select value={bitrate.toString()} onValueChange={handleBitrateChange}>
                <SelectTrigger id="mp3-bitrate" className="mt-2">
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
            <Select value={sampleRate} onValueChange={setSampleRate}>
              <SelectTrigger id="sample-rate" className="mt-2">
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

          <Button onClick={() => {
            audioService.saveSettings();
            loadDevices();
          }} className="w-full mt-6">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AudioSettings;