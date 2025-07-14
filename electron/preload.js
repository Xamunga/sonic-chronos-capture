const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Seleção de diretórios
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // Diálogos de arquivo
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Mensagens do sistema
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  
  // Abrir links externos
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Gerenciamento de arquivos e diretórios
  ensureDirectory: (dirPath) => ipcRenderer.invoke('ensure-directory', dirPath),
  saveAudioFile: (filePath, audioData) => ipcRenderer.invoke('save-audio-file', filePath, audioData),
  
  // Sistema de logs de debug
  writeDebugLog: (logData) => ipcRenderer.invoke('write-debug-log', logData),
  getDebugLogsPath: () => ipcRenderer.invoke('get-debug-logs-path'),
  
  // Informações do sistema
  platform: process.platform,
  version: process.versions.electron
});