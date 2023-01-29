const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', callback)//ipcRendener.On exposed, it tell when message sent from main
  // // we can also expose variables, not just functions
  
});

ipcRenderer.on('update-counter', function (evt, message) {
  console.log("this",message); // Returns: {'SAVED': 'File Saved'}
});