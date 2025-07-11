interface ElectronAPI {
  selectDirectory: () => Promise<string>;
  showSaveDialog: (options: any) => Promise<string>;
  showMessage: (options: any) => Promise<any>;
  openExternal: (url: string) => Promise<void>;
  ensureDirectory: (dirPath: string) => Promise<boolean>;
  saveAudioFile: (filePath: string, audioData: Uint8Array) => Promise<boolean>;
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};