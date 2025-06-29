
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const AudioSettings = () => {
  const [inputDevice, setInputDevice] = useState('default');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [sampleRate, setSampleRate] = useState('44100');
  const [inputGain, setInputGain] = useState([50]);

  const inputDevices = [
    { value: 'default', label: 'Default Audio Input' },
    { value: 'yamaha-01v96i', label: 'Yamaha 01v96i USB' },
    { value: 'microphone', label: 'Built-in Microphone' },
    { value: 'line-in', label: 'Line Input' },
  ];

  const formats = [
    { value: 'wav', label: 'WAV (Uncompressed)' },
    { value: 'mp3', label: 'MP3 (320kbps)' },
    { value: 'flac', label: 'FLAC (Lossless)' },
  ];

  const sampleRates = [
    { value: '44100', label: '44.1 kHz (CD Quality)' },
    { value: '48000', label: '48 kHz (Professional)' },
    { value: '96000', label: '96 kHz (High-Res)' },
  ];

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Audio Settings</h3>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="input-device" className="text-sm font-medium text-studio-electric">
              Input Device
            </Label>
            <Select value={inputDevice} onValueChange={setInputDevice}>
              <SelectTrigger className="mt-2 bg-studio-dark border-studio-electric/30">
                <SelectValue placeholder="Select input device" />
              </SelectTrigger>
              <SelectContent className="bg-studio-dark border-studio-electric/30">
                {inputDevices.map((device) => (
                  <SelectItem key={device.value} value={device.value}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="output-format" className="text-sm font-medium text-studio-electric">
              Output Format
            </Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="mt-2 bg-studio-dark border-studio-electric/30">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-studio-dark border-studio-electric/30">
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sample-rate" className="text-sm font-medium text-studio-electric">
              Sample Rate
            </Label>
            <Select value={sampleRate} onValueChange={setSampleRate}>
              <SelectTrigger className="mt-2 bg-studio-dark border-studio-electric/30">
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent className="bg-studio-dark border-studio-electric/30">
                {sampleRates.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="input-gain" className="text-sm font-medium text-studio-electric">
              Input Gain: {inputGain[0]}%
            </Label>
            <Slider
              id="input-gain"
              min={0}
              max={100}
              step={1}
              value={inputGain}
              onValueChange={setInputGain}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-studio-electric/20">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Status: Ready</span>
            <span>Buffer: 512 samples</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioSettings;
