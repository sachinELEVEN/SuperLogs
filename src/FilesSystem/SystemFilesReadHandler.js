//How to start the FileReadSystem
const { Worker } = require('worker_threads')
const path = require('path')

//responsible for reading the files provided by LPC 
class SLSystemFilesReadHandler{
    constructor(){
        //maybe start lpc system from here
        this.linedFilesData = null;
    }

    //returns the complete files data as we generate them in the callback
    async loadFiles(lpcManager,newload,callback){
        //call the lpcManager fetch files method and await them and then load them
        console.log("In Main: Starting FilesReadHandlingSystemThread") 
        if ((newload || !this.linedFilesData || this.linedFilesData.length == 0))  {
            this.startFilesReadSystem(() => {
            
                    callback(this.linedFilesData);
                   // resolve();
            });
        }else{
           callback(this.linedFilesData);
          // resolve();
        }   
    }

    async startFilesReadSystem(callback){
      
        const fileReadHandlingSystemThread =  new Worker(path.join(__dirname,"FilesReadHandlingSystemThread.js"));
        fileReadHandlingSystemThread.postMessage('start');
        fileReadHandlingSystemThread.on('message', (message) => {
            console.log("In Main: got message from THREAD: ") 
            if (message.isLinedFilesData){
                console.log("Yeah we got lined files data on MAIN")
                if(typeof this.linedFilesData === 'undefined'){
                    console.log("ERROR UNDEF")
                    return;
                }
                this.linedFilesData = message.linedFilesData

                callback();
            }   
        });
        fileReadHandlingSystemThread.on('exit', (code) => {
            console.log(`In Main: SUCCESS: Thread Closed: fileReadHandlingSystemThread closed with code ${code}`);
            callback([]);
        });
    
    }

    #passLinesFilesToRenderer(){
        
    }
}

module.exports = SLSystemFilesReadHandler;

//to test this independenctly
// let obj = new SLSystemFilesReadHandler()
// obj.loadFiles()
//loadFiles();