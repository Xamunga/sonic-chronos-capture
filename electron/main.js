const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// Configuração do auto-updater
autoUpdater.checkForUpdatesAndNotify();

// Diretório de logs de debug
const debugLogsDir = path.join(os.homedir(), 'AppData', 'Local', 'Gravador Real Time Pro', 'debug-logs');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // Carrega a aplicação
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  // Eventos da janela
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-frame-finish-load', () => {
    console.log('Frame carregado com sucesso');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialização da aplicação
app.whenReady().then(async () => {
  await ensureDebugDirectory();
  await cleanOldLogs();
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Função para garantir que o diretório de debug existe
async function ensureDebugDirectory() {
  try {
    await fs.mkdir(debugLogsDir, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de debug:', error);
  }
}

// Função para limpar logs antigos (manter apenas os últimos 10)
async function cleanOldLogs() {
  try {
    const files = await fs.readdir(debugLogsDir);
    const logFiles = files
      .filter(file => file.startsWith('debug-') && file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(debugLogsDir, file),
        stats: null
      }));

    // Obter stats dos arquivos
    for (const file of logFiles) {
      try {
        file.stats = await fs.stat(file.path);
      } catch (error) {
        console.error('Erro ao obter stats do arquivo:', error);
      }
    }

    // Ordenar por data de modificação (mais recente primeiro)
    logFiles.sort((a, b) => b.stats?.mtime - a.stats?.mtime);

    // Remover arquivos antigos (manter apenas os últimos 10)
    if (logFiles.length > 10) {
      const filesToDelete = logFiles.slice(10);
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`Log antigo removido: ${file.name}`);
        } catch (error) {
          console.error(`Erro ao remover log antigo ${file.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
  }
}

// Handlers IPC
ipcMain.handle('select-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecionar Diretório de Gravação'
    });
    
    return result.canceled ? null : result.filePaths[0];
  } catch (error) {
    console.error('Erro ao selecionar diretório:', error);
    return null;
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result.canceled ? undefined : result.filePath;
  } catch (error) {
    console.error('Erro no diálogo de salvar:', error);
    return undefined;
  }
});

ipcMain.handle('show-message', async (event, options) => {
  try {
    return await dialog.showMessageBox(mainWindow, options);
  } catch (error) {
    console.error('Erro ao mostrar mensagem:', error);
    return { response: 0 };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (error) {
    console.error('Erro ao abrir URL externa:', error);
  }
});

ipcMain.handle('ensure-directory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Erro ao criar diretório:', error);
    return false;
  }
});

ipcMain.handle('save-audio-file', async (event, filePath, audioData) => {
  try {
    // Converter ArrayBuffer para Buffer
    const buffer = Buffer.from(audioData);
    await fs.writeFile(filePath, buffer);
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de áudio:', error);
    return false;
  }
});

// Sistema de logs de debug
ipcMain.handle('write-debug-log', async (event, logData) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `debug-${timestamp}.log`;
    const logFilePath = path.join(debugLogsDir, logFileName);
    
    const logContent = JSON.stringify(logData, null, 2);
    await fs.writeFile(logFilePath, logContent, 'utf8');
    
    console.log(`Log de debug salvo: ${logFileName}`);
    return true;
  } catch (error) {
    console.error('Erro ao escrever log de debug:', error);
    return false;
  }
});

ipcMain.handle('get-debug-logs-path', async () => {
  return debugLogsDir;
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Atualização disponível:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Nenhuma atualização disponível:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Erro no auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Velocidade de download: ${progressObj.bytesPerSecond}`;
  logMessage += ` - Baixado ${progressObj.percent}%`;
  logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Atualização baixada:', info);
});