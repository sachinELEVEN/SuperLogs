const { app, BrowserWindow, ipcMain } = require('electron');
const filePath = './src/index.html'
const path = require('path')
const SLLPCManager = require('./LPC/LPCManager.js')
const SLSystemFilesReadHandler = require('./FilesSystem/SystemFilesReadHandler.js');
const { resolve } = require('path');
const { callbackify } = require('util');
//const { spawn } = require('child_process');
//const childProcess = spawn('node', ['SystemFilesReadHandler.js']);//separate node process


//SystemFilesReadHandler
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
  //win.webContents.send('update-runtime-fpg', filesData)
  
};


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


//initialising systems
//LPC

let lpc = new SLLPCManager()
//lpc.initialise();
//FileReadHandlingSystem
let frhs = new SLSystemFilesReadHandler();

module.exports = mainWindow;


//renderer to main a message that i want to start streaming file fpg data
ipcMain.handle('getRuntimeFPGData', async (event, arg) => {
  startStreamingFPGDataToRenderer();//new files
});


//this send message from main to renderer with file data
function startStreamingFPGDataToRenderer(){
  frhs.loadFiles(lpc,true,function(filesData){
   mainWindow.webContents.send('streamingRuntimeFPGData',filesData);
  });//i
}
