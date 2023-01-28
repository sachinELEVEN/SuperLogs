//How to start the FileReadSystem
const { Worker } = require('worker_threads')

//responsible for reading the files provided by LPC 
class SLSystemFilesReadHandler{
    constructor(){
        //maybe start lpc system from here
        this.linedFilesData = [];
    }

    async loadFiles(lpcManager,newload){
        //call the lpcManager fetch files method and await them and then load them
        console.log("In Main: Starting FilesReadHandlingSystemThread") 
        if (newload || this.linedFilesData.length==0)  {
            this.#startFilesReadSystem();
        }else{
            return this.linedFilesData;
        }    
    }

    async #startFilesReadSystem(){
        
        const fileReadHandlingSystemThread =  new Worker('./FilesReadHandlingSystemThread');
        fileReadHandlingSystemThread.postMessage('start');
        fileReadHandlingSystemThread.on('message', (message) => {
            console.log("In Main: got message from THREAD: ", message) 
            if (message.linedFilesData){
                console.log("Yeah we got lined files data on MAIN")
                this.linedFilesData = message.linedFilesData
            }   
        });
        fileReadHandlingSystemThread.on('exit', (code) => {
            console.log(`In Main: SUCCESS: Thread Closed: fileReadHandlingSystemThread closed with code ${code}`);
        });
    
    }

    #passLinesFilesToRenderer(){
        
    }
}

module.exports = SLSystemFilesReadHandler;