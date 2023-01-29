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
            return;
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
            return;
        });
    
    }

    #passLinesFilesToRenderer(){
        
    }
}

module.exports = SLSystemFilesReadHandler;

//to test this independenctly
let obj = new SLSystemFilesReadHandler()
let identifier = 'TAG:'
//we do not have lpc
let count = 0;
obj.loadFiles(null,true,function(){
    console.log("got data 1")
    count+=1;
    //the number of  counts and process.std.write are not same, dont know why they are not getting called equal no. of times
   // process.stdout.write(`${identifier}Some data ${count}`);//i thunk this output everything
    //i think this writes the complete stdout
   // process.stdout.flush();//setting the flush of stdout causes child to exit with code 1
   // child process
   // process.send({ message: `${identifier}Some data to send back ${count}` });

    //we should use process.send()
})
 
/*
./SystemFilesReadHandler.js
Some data to send back 1
Some data to send back 4
Some data to send back 5
Some data to send back 7
Child process exited with code 0
 ~/desktop/superl/superlogs-app/s/Fil
*/