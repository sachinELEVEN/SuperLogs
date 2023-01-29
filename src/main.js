const { app, BrowserWindow, ipcMain } = require('electron');
const filePath = './src/index.html'
const path = require('path')
const SLLPCManager = require('./LPC/LPCManager.js')
const SLSystemFilesReadHandler = require('./FilesSystem/SystemFilesReadHandler.js')
let mainWindow = null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname,"preload.js"),
      nodeIntegration: true
    }
  });

  win.loadFile(filePath);
  mainWindow = win;
  mainWindow.webContents.send('update-counter', 10)
  
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
//lpc.initialise();
//FileReadHandlingSystem
let frhs = new SLSystemFilesReadHandler();
frhs.loadFiles(lpc,true,function(filesData){
  //this callback is called with the list and updated list
  mainWindow.webContents.send('update-counter', 50)
});//i THINK we will need to do it by using callback

// //ipcMain.send('data-channel', {"hi":"nice"});
// app.webContents.send('data-channel', {"hi":"nice"})
module.exports = mainWindow;
