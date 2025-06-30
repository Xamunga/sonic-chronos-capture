
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
  
  // Informações do sistema
  platform: process.platform,
  version: process.versions.electron
});
