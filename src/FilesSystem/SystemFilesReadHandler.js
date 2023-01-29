//How to start the FileReadSystem
const { Worker } = require('worker_threads')
const path = require('path')

//responsible for reading the files provided by LPC 
class SLSystemFilesReadHandler{
    constructor(){
        //maybe start lpc system from here
        this.linedFilesData = null;
    }
//maybe it is getting closed before
    async loadFiles(lpcManager,newload,callback){
        //console.log("oyo")
        //call the lpcManager fetch files method and await them and then load them
        console.log("In Main: Starting FilesReadHandlingSystemThread") 
        if ((newload || !this.linedFilesData || this.linedFilesData.length == 0))  {
            this.#startFilesReadSystem(function(){
                console.log("wow",this.linedFilesData)
              //  if (typeof linedFilesData !== 'undefined') {//for some reason we get these undefined values even before the ui launches, i gues it has someting to do with how the document is attached but still dont understand the reason, that why added a this check, it was not there when it was standalone node js app
                   // this.linedFilesData =
                    callback(this.linedFilesData)
               // }
            });
        }else{
           callback(this.linedFilesData);
        }    
    }

    async #startFilesReadSystem(callback){
      
        const fileReadHandlingSystemThread =  new Worker(path.join(__dirname,"FilesReadHandlingSystemThread.js"));
        fileReadHandlingSystemThread.postMessage('start');
        fileReadHandlingSystemThread.on('message', (message) => {
            console.log("In Main: got message from THREAD: ") 
         //   console.log(message.linedFiles)
            if (message.isLinedFilesData){
                console.log("Yeah we got lined files data on MAINi")
                if(typeof this.linedFilesData != undefined){
                    console.log("ERROR UNDEF")
                }
                //correctly till here
                console.log("how",message.linedFilesData)
                this.linedFilesData = message.linedFilesData
                //data source updated
                this.linedFilesData = message.linedFilesData
                console.log("now",this.linedFilesData)

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
//module.exports.getRuntimeFPGLinedFiles = () => this.linedFilesData;

//to test this independenctly
// let obj = new SLSystemFilesReadHandler()
// obj.loadFiles()
//loadFiles();