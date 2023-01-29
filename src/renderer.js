// const information = document.getElementById('info')
// information.innerText = `This app is using Chrome V ${versions.electron()}`

// const func = async () =>{
//     const response = await window.versions.ping();
//     console.log(response);
// }

// func()

// window.indexBridge.something((event,icounter)=>{
//     console.log("This is called")
// })


// const getGridData2 = () =>{
//     console.log("called")
//     const response = window.version.getGridData(function(){
//         console.log("grid data ")
//         console.log(response)
//     });
    
// }

// getGridData2()

// ipcRenderer.on('data-channel', (event, data) => {
//     console.log(data); // logs { someData: 'Hello World' }
//   });

// ipcRenderer.on('asynchronous-message', function (evt, message) {
//     console.log(message); // Returns: {'SAVED': 'File Saved'}
// });var ipcRenderer = require('electron').ipcRenderer;
// versions.onUpdateRuntimeFPG((_event, value) => {
//     func();
//    console.log("wow")
// })


//const { ipcRenderer } = require('electron');

// ipcRenderer.send('request-data');

// ipcRenderer.on('data', (event, data) => {
//     console.log(data);
// });