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

 //let lines = [];
 let numr=0;
 let linesArr = [];
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
             //this might be slow, so first store data in general array and then convert them to this to save space,
             //so both reading and writing are efficient
           //  const stringAsUint8 = new TextEncoder().encode(line);
            // Use the `concat` method to add the string to the existing Uint8Array
            //lines = lines.from(lines.concat(stringAsUint8));
           // lines = new Uint8Array([...lines, ...stringAsUint8]); this hangs the code
            // console.log(lines[numr]);
            linesArr.push(line);
                //s.pause();
            //s.resume();
            })
            .on('error',function(err){
                console.log(err)
                resolve('failed')
            })
            .on('end',function(){
                console.log("Read entire chunk : Numr: ",linesArr.length)
                console.timeEnd('ChunkReadingAndProcessing Reading TimeTaken:')
                console.time('ChunkReadingAndProcessing Processing TimeTaken:')
                console.log(linesArr[0])
                const {uint8Array, byteOffsets} = convertTo_Uint8_typed_deallocate(linesArr);
               //linesArr = [];
               getLine(uint8Array,byteOffsets,0)
                console.timeEnd('ChunkReadingAndProcessing Processing TimeTaken:')
                //ask chatgpt how to read from this
                //convert standard array to a typed array to save space

                //resolve('done')
            })

        
            
            
        );

    });

}

function getLine(uint8Array, byteOffsets,index){
    const desiredStringIndex = index;
    const startIndex = byteOffsets[desiredStringIndex];
    const endIndex = byteOffsets[desiredStringIndex+1];
    
    const decoder = new TextDecoder();
    const desiredStringBytes = uint8Array.slice(startIndex, endIndex);
    const desiredString = decoder.decode(desiredStringBytes);
    console.log(desiredString); // "Hello"
}

//this takes more than reading time -> takes around 3s whereas read takes 2s for 1GB file
//this was more efficient than uint_8
//This reduced the space req for 1GB data from 2.25 to 1.17->256MB is it losing data?, which is fine for a 1.05 GB file
//search what is uint8 string, maybe it losingg data dooes not follow its pattern
function convertTo_Uint8_typed(strArray) {
    // Calculate the total number of bytes required for the final array
    let totalBytes = 0;
    for (let i = 0; i < strArray.length; i++) {
      totalBytes += new TextEncoder().encode(strArray[i]).length;
    }
  
    // Create an ArrayBuffer with the total number of bytes
    const buffer = new ArrayBuffer(totalBytes);
    // Create a Uint8Array view on the ArrayBuffer
    const uint8Array = new Uint8Array(buffer);
  
    // Create a TextEncoder instance to avoid creating a new one for each iteration
    const encoder = new TextEncoder();
  
    // Keep track of the current offset in the final array
    let offset = 0;
    // Iterate over the array of strings
    for (let i = 0; i < strArray.length; i++) {
      // Encode the string to a Uint8Array using the TextEncoder instance
      const stringAsUint8 = encoder.encode(strArray[i]);
      // Copy the current string's Uint8Array to the final array
      uint8Array.set(stringAsUint8, offset);
      // Update the offset for the next string
      offset += stringAsUint8.length;
      strArray[i] = null;
    }
    strArray = null;
  return;
    //return uint8Array;
  }

  function convertTo_Uint8_typed_deallocate(strArray) {
    // Create an empty Uint8Array
    let byteOffsets = [];
    let currentOffset = 0;
    let totalBytes = 0;
    // Iterate over the array of strings to calculate the total number of bytes required
    for (let i = 0; i < strArray.length; i++) {
        totalBytes += new TextEncoder().encode(strArray[i]).length;
        byteOffsets[i] = currentOffset;
        currentOffset += new TextEncoder().encode(strArray[i]).length;
    }
    // Create a Uint8Array with the total number of bytes
    const uint8Array = new Uint8Array(totalBytes);
    // Create a TextEncoder instance to avoid creating a new one for each iteration
    const encoder = new TextEncoder();
    // Keep track of the current offset in the final array
    let offset = 0;
    // Iterate over the array of strings
    for (let i = 0; i < strArray.length; i++) {
        // Encode the string to a Uint8Array using the TextEncoder instance
        const stringAsUint8 = encoder.encode(strArray[i]);
        // Copy the current string's Uint8Array to the final array
        uint8Array.set(stringAsUint8, offset);
        // Update the offset for the next string
        offset += stringAsUint8.length;
        strArray[i] = null;
    }
    strArray = null;
    return {uint8Array, byteOffsets};
}


  
  /*
This version of the function first calculates the total number of bytes required for the final array 
and creates an ArrayBuffer with that size. This avoids having to resize the ArrayBuffer multiple times during 
the loop, which can be an expensive operation. The Uint8Array is then created as a view on the ArrayBuffer, 
so that it can be used to set the bytes of the strings.

It also avoid to calculate the length of each string at each iteration, by doing it once before the loop.

Also, note that this version of the function still uses a TextEncoder to encode the strings to Uint8Arrays, 
so if you're working with large strings, it might be more efficient to use a different method of encoding the strings.
  */