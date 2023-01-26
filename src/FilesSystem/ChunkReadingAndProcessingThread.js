const { Worker, workerData, parentPort } = require('worker_threads');
const fsPromises = require('fs').promises;
const fs = require('fs');
const threadName = "ChunkReadingAndProcessingThread";
es = require('event-stream');
//Receiving data from another thread which has the reference to this thread
parentPort.on('message', (message) => {
    startProcessing(message)
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
     //console.log("PP STARTED READ")
      //break the file in chunks
      //console.time('ChunkReadingAndProcessing TimeTaken:');
      //assuming messsage recieved is va;id and has all the required data
     await startReadingAndProcessing(message.filePath,message.chunkStart,message.chunkEnd,message.chunkId);
      //pass refined chunks to ChunkReadingAndProcessingThread;
      
      //we should maybe send a message here to the parent and kill this thread after its work is done
      //similary we should define all the different threads in the global space so we can kill them after their work is done
      //AT THE END- Killing the thread after its work is done
      terminateThread()//why is is getting called before refinement - it appears like this but is getting called correctly
 
 }

async function startReadingAndProcessing(filePath,startIdx, endIdx, chunkId){
    return new Promise(async (resolve) => {
        let encoding = 'utf8'
        const KB = 1024;
        const readChunkSize = 32*KB;//THIS WAS THE BEST IN PRACTICAL RESULTS
        //var readStream_frontEnd = fs.createReadStream(filePath,{start: chunkStartIndex, end: fileSize-1, highWaterMark: localChunkSize, encoding: encoding});
        console.time('ChunkReadingAndProcessing TimeTaken:');
        var  stream = fs.createReadStream(filePath,{start: startIdx, end: endIdx, highWaterMark: readChunkSize, encoding: encoding})
            .pipe(es.split())
            .pipe(es.mapSync(function(line){
              //  console.log(line);
                //s.pause();
            //s.resume();
            })
            .on('error',function(err){
                console.log(err)
                resolve('failed')
            })
            .on('end',function(){
                console.log("Read entire chunk")
                console.timeEnd('ChunkReadingAndProcessing TimeTaken:')
                resolve('done')
            })

        
            
            
        );

    });

}