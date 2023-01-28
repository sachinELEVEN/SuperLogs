const { app, BrowserWindow, ipcMain } = require('electron');
const filePath = './src/index.html'
const path = require('path')
const SLLPCManager = require('./LPC/LPCManager.js')

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

    ipcMain.on('getAllFilesData', (event) => {
      //let filesData = frhs.loadFiles()
     // event.sender.send('setAllFilesData', );
  });




  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//initialising systems
//LPC
let lpc = new SLLPCManager()
lpc.initialise();
//FileReadHandlingSystem
//let frhs = SLSystemFilesReadHandler();

