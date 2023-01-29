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

// ipcMain.handle('ping', ()=>{
//   //mainWindow.webContents.send('update-runtime-fpg', filesData);
// })



app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }

  //   mainWindow.webContents.send('update-runtime-fpg', "filesData")
    
  //   setTimeout(() => {
  //     mainWindow.webContents.send('update-runtime-fpg', "filesData2")
  // }, 100);

  //   ipcMain.on('getAllFilesData', (event) => {
  //     //let filesData = frhs.loadFiles()
  //    // event.sender.send('setAllFilesData', );
  // });




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
//console.log("wow")
// frhs.loadFiles(lpc,true,function(filesData){
//   //this callback is called with the list and updated list
//   //console.log("oyo")
//   console.log("Runtime FPG data source updated")
//  // mainWindow.webContents.send('something',filesData);
//  // mainWindow.webContents.send('update-runtime-fpg', filesData)
// });//i THINK we will need to do it by using callback

// //ipcMain.send('data-channel', {"hi":"nice"});
// app.webContents.send('data-channel', {"hi":"nice"})
module.exports = mainWindow;

// ipcMain.on('request-data', (event) => {
//   // assume dataToSend is the data you want to send
//   event.sender.send('data', dataToSend);
// });


// ipcMain.handle('getGridData', ()=>{
//   console.log("getting grid data")
//   frhs.loadFiles(lpc,true,function(filesData){

//     //this callback is called with the list and updated list
//     //console.log("oyo")
//     console.log("Runtime FPG data source updated")
//     mainWindow.webContents.send('update-runtime-fpg', filesData)
//   });;
// });

 let icounter = 0;
// setTimeout(() => {
//   icounter++;
//   mainWindow.webContents.send('something',icounter);
// }, 1500);

//main to renderer
/* 'something' message types is workimng
setInterval(() => {
  icounter++;
  mainWindow.webContents.send('something',icounter);
}, 500);
*/


//renderer to main a message that i want to start streaming file fpg data
ipcMain.handle('getRuntimeFPGData', async (event, arg) => {
  startStreamingFPGDataToRenderer();//new files
});


//this send message from main to renderer with file data
function startStreamingFPGDataToRenderer(){
  frhs.loadFiles(lpc,true,function(filesData){
    //this callback is called with the list and updated list
    //console.log("oyo")
    console.log("Runtime FPG data source updated")
   // mainWindow.webContents.send('something',filesData);
   // mainWindow.webContents.send('update-runtime-fpg', filesData)
   mainWindow.webContents.send('streamingRuntimeFPGData',filesData);
  });//i
}
