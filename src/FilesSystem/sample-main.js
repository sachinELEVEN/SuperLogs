//How to start the FileReadSystem
const { Worker } = require('worker_threads')

startFilesReadSystem();
console.log("In Main: Starting FilesReadHandlingSystemThread")

    
function startFilesReadSystem(){
        
    const fileReadHandlingSystemThread =  new Worker('./FilesReadHandlingSystemThread');
    fileReadHandlingSystemThread.postMessage('start');
    fileReadHandlingSystemThread.on('message', (message) => {
        console.log("In Main: got message from THREAD: ", message)    
    });
    fileReadHandlingSystemThread.on('exit', (code) => {
        console.log(`In Main: SUCCESS: Thread Closed: fileReadHandlingSystemThread closed with code ${code}`);
    });

}
//surprisingle size for array is also coming out to be around 1.8 GB same as ArrayBuffer