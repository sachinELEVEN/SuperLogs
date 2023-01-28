/*
We need to create this 1 separate thread from main thread for FilesReadHandlingSystemThread 
Task of FilesReadHandlingSystemThread

1. Creates k FileReaderThread(depends on the number of CPU cores - need to find its optimum value)
2. Loop through filePath in FilePaths
3. Choose a FileReaderThread randomly and pass it the file path
4. Later convert this into class
*/

//[This file should run on a different thread like FileSystemReadingManagerThread] which is created from main
/*
NOTE - I think we should kill the FileReaderThread, subFileReader thread, and fileProcessing thread after their work is done
We still need to hanlde how do we make the system aware of new changes to the file - maybe fs watched or something like that.
maybe not kill the process as we can maybe perhaps reuse them to simply load their files again, but we can start new instances I think - atleast
killing the file reading threads after their work is done should be done.
*/
const { executionAsyncResource } = require('async_hooks');
const { Worker, workerData, parentPort } = require('worker_threads');

//const subFileReaderThreads = new Array(m).fill(null).map(() => new Worker(__filename));
//const fileProcessingThreads = new Array(n).fill(null).map(() => new Worker(__filename));



//1. initiliasing step
//const FilePaths = ['/Users/sachinjeph/Desktop/superFileHandling/file1.txt'];
const FilePaths = ['/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random.txt']
//const FilePaths = ['/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt']
const FilesContent = {};
const numberOfCPUCores = require('os').cpus().length;
const fileChunkingThreadsCount = Math.min(Math.ceil(numberOfCPUCores * 0.7), FilePaths.length); // number of FileReaderThreads
//const subFileReaderThreads = Math.ceil(numberOfCPUCores * 0.2); // number of SubFileReaderThreads
//const fileProcessingThreads = numberOfCPUCores - k - m; // number of FileProcessingThreads
//2. looping step 
//for (const filePath of FilePaths) {
    ///rrr



 function startExecution(){
    console.log('"In fileReadHandlingSystemThread: Starting thread processing')
    start();
    close();
 }

 function start(){
    
    const fileChunkingThreads = new Array(fileChunkingThreadsCount).fill(null).map(() => new Worker('./FileChunkingThread.js'));
    let filesData = new Array(FilePaths.length);//stores line data for each file//very big so pass by reference and manipulate carefully
    for (i=0;i<FilePaths.length;++i) {
        //Choose a FileReaderThread randomly and pass it the file path
        let filePath = FilePaths[i];
        const fileChunkingThread = fileChunkingThreads[i];
        let message = {
            'filePath':filePath,
        }
        fileChunkingThread.postMessage(message);
       
        fileChunkingThread.on('message', (message) => {
            console.log("In: fileReadHandlingSystemThread: got message from THREAD: ", message)
            let linedFileData= [];
            if (message.nfcNotifier){//no. of chunks notifier 
                //this creates an array of size of nof chunks in the file.
                //Initialising the array as soon as we know how many chunks of this file will be there
                linedFileData= new Array(message.chunkCount);
            }else if(message.isLinedFile){
                //you get 
               
                linedFileData[message.id] = message.linedFileData
                console.log(`Lined file generation, recieved Chunk No. go ${message.id}`)
            }   

        });
        fileChunkingThread.on('exit', (code) => {
            console.log(`In fileReadHandlingSystemThread: SUCCESS: Thread Closed: fileChunkingThread closed with code ${code}`);
        });
    
    }

    
}

function close(){
    let message = '/fileReadHandlingSystemThread: SELF TERMINATION'
    sendMessageToParent(message)
    parentPort.close();
}

function sendMessageToParent(message){
    parentPort.postMessage(message ); 
}

parentPort.on('message', (message) => {
    if(message=='start'){
        startExecution();
    }else{
        console.log("In fileReadHandlingSystemThread: Unsupported message by parent")
    }
   
 });

 


