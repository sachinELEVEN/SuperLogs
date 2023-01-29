const { contextBridge, ipcRenderer } = require('electron')
//const { Callbacks } = require('jquery')

// contextBridge.exposeInMainWorld('versions', {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
//   ping: () => ipcRenderer.invoke('ping'),
//   getGridData: () => ipcRenderer.invoke('getGridData'),
//   onUpdateRuntimeFPG: (callback) => ipcRenderer.on('update-runtime-fpg', callback)//ipcRendener.On exposed, it tell when message sent from main
//   // // we can also expose variables, not just functions
  
// });

// ipcRenderer.on('update-runtime-fpg', function (evt, message) {
//   console.log("this",message); // Returns: {'SAVED': 'File Saved'}
// });

let indexBridge = {
  something: (callback) => ipcRenderer.on('something',(callback)),
  getRuntimeFPGData: () => ipcRenderer.invoke('getRuntimeFPGData')
}

contextBridge.exposeInMainWorld("indexBridge",indexBridge)