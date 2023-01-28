const { Worker, workerData, parentPort } = require('worker_threads');
const fsPromises = require('fs').promises;
const fs = require('fs');
const { addListener } = require('process');
const threadName = "ChunkReadingAndProcessingThread";
es = require('event-stream');
//if this is off, other formats will be supported but will lead to very high memory usage, in non-ascii cases for 1 GB files maybe 2GB be used.
//if the below flag is true and line contains ascii, that line will be ignored
const allowOnlyASCII = true;//turning this on makes file reads slow
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
 
 let lines = [];//array Uint8Array/normal array depending on value of allowAsciiOnly

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


 let numr=0;
 //let tsize = 0;
 //let lines = new Uint8Array();//idea of using typed array of utf-8
async function startReadingAndProcessing(filePath,startIdx, endIdx, chunkId){
    return new Promise(async (resolve) => {
        let encoding = 'utf8'
        const KB = 1024;
        const readChunkSize = 32*KB;//THIS WAS THE BEST IN PRACTICAL RESULTS
        //var readStream_frontEnd = fs.createReadStream(filePath,{start: chunkStartIndex, end: fileSize-1, highWaterMark: localChunkSize, encoding: encoding});
        console.time('ChunkReadingAndProcessing Reading TimeTaken:');
        var  stream = fs.createReadStream(filePath,{start: startIdx, end: endIdx, highWaterMark: readChunkSize, encoding: encoding})
            .pipe(es.split())
            .pipe(es.mapSync(function(line){
              //  console.log(line);
             // lines.push(line);
             //should make this inline
             //This extra method call overhead is big
            addLine(line);//this add around 1s so for a 1GB file time goes from 2.5s to 3.5s wow thats too much
            //s.pause();
            //s.resume();
            //WE NEED TO ADD A CONFIG SO THAT WE CAN SEND A SINGLE LINE BACK TO MAIN THREAD, SO WE START DISPLAYING
            //CONTENT AS SOON AS WE GET IT - WILL LEAD TO OVERALL PROCESS(THIS THREAD'S WORK SLOW BECAUSE OF OVERHEADS) BUT 
            //USER EXPERIENCE WILL BE FAR SMOOTHER, WILL HAVE TO MOVE sendMessageToParent FROM ON END TO HERE
            })
            .on('error',function(err){
                console.log(err)
                resolve('failed')
            })
            .on('end',function(){
                console.log("Read entire chunk : Numr: ",lines.length)
                console.timeEnd('ChunkReadingAndProcessing Reading TimeTaken:')
                console.time('ChunkReadingAndProcessing Processing TimeTaken:')
                //Add processing here we will do it after we read the complete file.
                      //send chunk to parent
                let chunkPassingMessage = {
                    'isProcessedChunk':'yes',
                    'chunk':lines,
                    'id':chunkId
                }
                 sendMessageToParent(chunkPassingMessage)//this can make the process slow but it is the only way
                 sendMessageToParent({'chunkProcessed':true});
                console.timeEnd('ChunkReadingAndProcessing Processing TimeTaken:')
                resolve('done')
            })

        
            
            
        );

    });

}


//CONVERTING JS STRINGS UTF16 TO UTF8 FOR USE IN OUR SYSTEM AS THEY CAUSE VERY HIGH MEMORY USAGE IN CASES WHERE ONLY ASCII CHARACTERS ALLOWED


function getLine(index){
    if (!allowOnlyASCII){
        //use the js arrays to store data, since everything will be stored as is
       return lines[index]
    }
   return sl_convertToUTF16(lines[index]);
}


function addLine(line){

    if (!allowOnlyASCII){
        //use the js arrays to store data, since everything will be stored as is
        // tsize+=line.length;
        lines.push(line);
        return;
    }

//When ascii only is allowed convert to utf8, to space save
    let uint8Array = sl_convertToUTF8(line);
    if(allowOnlyASCII && line.length != uint8Array.byteLength){
        //Non Ascii character in the line - ignoring it
    }else{
    //   tsize+=uint8Array.byteLength;
      lines.push(uint8Array)
    }
    return;
}

//Do not access directly
function sl_convertToUTF8(str){
    try{
        const strAsUint8 = new TextEncoder().encode(str);
        return strAsUint8;
    }catch(e){
        console.log("failed to encode")
        return null;
    }
    
   // console.log(strAsUint8.byteLength)
   
}

//Do not access directly
function sl_convertToUTF16(uint8Array){
    const utf8Decoder = new TextDecoder();//define global
    const decodedString = utf8Decoder.decode(uint8Array);
    //console.log(decodedString);
    return decodedString;
}

//array stores 1.9 GB for 1  gb, it is taking double space because in js scripts are stored as UTF 16, so 1 byte to 2 byte
//This might not be the O(1) time complexity so not of good use to us because array provide O(1) which is what we want


//surprisingle size for array is also coming out to be around 1.8 GB same as ArrayBuffer


//generates 1.8GB data from 1GB file idk why is possible
//this takes more than reading time -> takes around 3s whereas read takes 2s for 1GB file

  
  /*
This version of the function first calculates the total number of bytes required for the final array 
and creates an ArrayBuffer with that size. This avoids having to resize the ArrayBuffer multiple times during 
the loop, which can be an expensive operation. The Uint8Array is then created as a view on the ArrayBuffer, 
so that it can be used to set the bytes of the strings.

It also avoid to calculate the length of each string at each iteration, by doing it once before the loop.

Also, note that this version of the function still uses a TextEncoder to encode the strings to Uint8Arrays, 
so if you're working with large strings, it might be more efficient to use a different method of encoding the strings.
  */