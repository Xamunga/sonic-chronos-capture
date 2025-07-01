
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Verificação nativa para modo de desenvolvimento
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false // Não mostrar até estar pronto
  });

  // Carregar a aplicação
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Mostrar quando estiver pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Abrir DevTools apenas em desenvolvimento
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Otimizações para Windows
  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (isDev) {
      console.log('Gravador Real Time Pro - Modo Desenvolvimento');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Configurações do app
app.whenReady().then(() => {
  createWindow();

  // Verificar atualizações
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers para funcionalidades nativas
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result.filePath;
});

ipcMain.handle('show-message', async (event, options) => {
  return await dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Atualização disponível.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Aplicação está atualizada.');
});

autoUpdater.on('error', (err) => {
  console.log('Erro no auto-updater: ' + err);
});
