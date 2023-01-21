const { app, BrowserWindow, ipcMain } = require('electron');
const filePath = './src/index.html'
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname,"preload.js")
    }
  });

  win.loadFile(filePath);
};

ipcMain.handle('ping', () => 'pong')

app.whenReady().then(() => {
  createWindow();

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