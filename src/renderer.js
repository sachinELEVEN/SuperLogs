const information = document.getElementById('info')
information.innerText = `This app is using Chrome V ${versions.electron()}`

const func = async () =>{
    const response = await window.versions.ping();
    console.log(response);
}

func()

// ipcRenderer.on('data-channel', (event, data) => {
//     console.log(data); // logs { someData: 'Hello World' }
//   });

// ipcRenderer.on('asynchronous-message', function (evt, message) {
//     console.log(message); // Returns: {'SAVED': 'File Saved'}
// });var ipcRenderer = require('electron').ipcRenderer;
// window.versions.onUpdateCounter((_event, value) => {
//    console.log("wow")
// })