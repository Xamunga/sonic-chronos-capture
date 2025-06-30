
export interface ElectronAPI {
  selectDirectory: () => Promise<string>;
  showSaveDialog: (options: any) => Promise<string>;
  showMessage: (options: any) => Promise<any>;
  openExternal: (url: string) => Promise<void>;
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
