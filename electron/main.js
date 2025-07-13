const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { autoUpdater } = require('electron-updater');

// Verificação nativa para modo de desenvolvimento
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  console.log('Criando janela principal...');
  console.log('Modo desenvolvimento:', isDev);
  
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 530,
    minWidth: 1200,
    minHeight: 530,
    maxWidth: 1200,
    maxHeight: 530,
    resizable: false,
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
  if (isDev) {
    const startUrl = 'http://localhost:5173';
    console.log('Modo desenvolvimento - carregando URL:', startUrl);
    mainWindow.loadURL(startUrl);
  } else {
    // Na versão empacotada, usar loadFile para carregar o index.html
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Modo produção - carregando arquivo:', indexPath);
    console.log('Arquivo existe?:', require('fs').existsSync(indexPath));
    console.log('__dirname:', __dirname);
    
    mainWindow.loadFile(indexPath);
  }

  // Abrir DevTools apenas em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Mostrar quando estiver pronto
  mainWindow.once('ready-to-show', () => {
    console.log('Janela pronta para mostrar');
    mainWindow.show();
    
    console.log('🚀 Gravador Real Time Pro - Aplicação carregada');
  });

  // Log de erros de carregamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Falha ao carregar:', errorCode, errorDescription, validatedURL);
  });

  // Otimizações para Windows
  mainWindow.webContents.on('did-frame-finish-load', () => {
    console.log('Frame carregado com sucesso');
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
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecionar Diretório de Gravação'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao selecionar diretório:', error);
    return null;
  }
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

ipcMain.handle('ensure-directory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Diretório criado/verificado: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`Erro ao criar diretório ${dirPath}:`, error);
    throw error;
  }
});

ipcMain.handle('save-audio-file', async (event, filePath, audioData) => {
  try {
    await fs.writeFile(filePath, Buffer.from(audioData));
    console.log(`Arquivo de áudio salvo: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar arquivo ${filePath}:`, error);
    throw error;
  }
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
