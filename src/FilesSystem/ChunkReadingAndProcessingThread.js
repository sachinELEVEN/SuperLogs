const { Worker, workerData, parentPort } = require('worker_threads');
const fsPromises = require('fs').promises;
const threadName = "ChunkReadingAndProcessingThread";
//Receiving data from another thread which has the reference to this thread
parentPort.on('message', (filePath) => {
    startProcessing(filePath)
 });
 
 //sending data to the parent thread which I think main thread w
 function sendMessageToParent(message){
     parentPort.postMessage(message );
     
 }
 
 function terminateThread(){
     let message = `/${threadName}: SELF TERMINATION`
     sendMessageToParent(message)
     parentPort.close();//asking the parent to close the thread
 }
 
 async function startProcessing(message){
     if(!message.filePath){
         console.log(`In ${threadName} /${threadName}  - filePath missing!`)
         terminateThread()
         return;
     }
      //break the file in chunks
      console.time('ChunkReadingAndProcessing TimeTaken:');
      await startReadingAndProcessing();
      console.timeEnd('ChunkReadingAndProcessing TimeTaken:')
      //pass refined chunks to ChunkReadingAndProcessingThread;
      
      //we should maybe send a message here to the parent and kill this thread after its work is done
      //similary we should define all the different threads in the global space so we can kill them after their work is done
      //AT THE END- Killing the thread after its work is done
      terminateThread()//why is is getting called before refinement - it appears like this but is getting called correctly
 
 }

async function startReadingAndProcessing(){
    
}