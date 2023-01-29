/*
Also pay attention which threads remain in memory and why is the program not terminating
Task of FileChunkingThread

1. Creates m ChunkReadingAndProcessingThread(depends on the number of CPU cores - need to find its optimum value)
2. Breaks the file represented by the file path and breaks it into m chunks each chunk is continuous, refine chunks
3. Loop through refined chunks(refinedChunks) created and passes the i th chunk to the i th ChunkReadingAndProcessingThread along with the file path

ONE BIG ISSUE AS OF NOW IS THAT WE ARE CREATING TOO MANY THREADS NEED TO MINIMISE THEM AND NOT CREATE N THREAD EACH NESTED THREAD, THREAD POOL SHOULD BE DEFINED IN THE BEGINNING
There still are issues in it i think - rear end is not working correctly

Change name of files :- FilesSystemReadHandlingSystemThread, FileChunkingThread, ChunkReadingAndProcessingThread
*/
const { Worker, workerData, parentPort } = require('worker_threads');
const { deflateSync } = require('zlib');
const fsPromises = require('fs').promises;
const fs = require('fs');
const {EOL} = require('os');
const { resolve } = require('path');
const { rejects } = require('assert');
const path = require('path')
const allowChunking = true;//if false a single file will be read as a whole; good for small size files and files with very very very long line
const megaByte = 1000000//1 MB
const minFileSizeForChunking = 0;//300*megaByte;//in bytes MAKE THIS A PROPER VALUE
const encoding = 'utf8';//so this encoding does not support emoji i think
//Our program will not work efficiently for program that has very very big single lines because how we create chunks > 100MB or more, if this is the case turn off chunking
const refinedChunks = [];//dictionary of value chunk values like [[1,2],[3,5],[69]] [start,end]


console.log("Starting FileChunkingThread")

//1. initiliasing step
const numberOfCPUCores = require('os').cpus().length;
const thread=null;
const chunkReadingAndProcessingThreadCount = Math.ceil(numberOfCPUCores * 0.8); // number of ChunkReadingAndProcessingThread
//const fileProcessingThreads = numberOfCPUCores - k - m; // number of FileProcessingThreads

//2. Breaking the file in chunks - tjid id diificult because it hard to break it into chunks such that it contains fulll lines

//Receiving data from another thread which has the reference to this thread
parentPort.on('message', (message) => {
   startProcessing(message)
});

//sending data to the parent thread which I think main thread w
function sendMessageToParent(message){
    parentPort.postMessage(message);
    
}

function terminateThread(){
    let message = '/FileChunkingThread: SELF TERMINATION'
    sendMessageToParent(message)
    parentPort.close();//asking the parent to close the thread
}

async function startProcessing(message){
    if(!message.filePath){////IMPORTANT here also check if its valid or not, on place where we should check if a file exists or path is valid or not
        console.log("In FileChunkingThread /FileChunking Thread - filePath missing!")
        terminateThread()
        return;
    }
     //break the file in chunks
     console.time('ChunkingProcess TimeTaken:');
     let chunks = await createChunks(message.filePath)
     console.timeEnd('ChunkingProcess TimeTaken:')
     //pass refined chunks to ChunkReadingAndProcessingThread;
     await readAndProcessChunks(message.filePath,message.fileId) // since this is the last method waiting for it does not affect the thread's performance
     //we should maybe send a message here to the parent and kill this thread after its work is done
     //similary we should define all the different threads in the global space so we can kill them after their work is done
     //AT THE END- Killing the thread after its work is done
     terminateThread()//why is is getting called before refinement - it appears like this but is getting called correctly

}

async function createChunks(filePath){
    const sizeInBytes = await fileSize(filePath)  //BIG ASSUMPTION THIS IS VERY FAST - VERIFY THIS.
    if (sizeInBytes == -1){
        resolve('done')
        return;
    }

    if(!allowChunking || sizeInBytes<minFileSizeForChunking||chunkReadingAndProcessingThreadCount==1){
        //no chunking when processor count/thread = 1
       let chunkIndexPair = {}
        chunkIndexPair['f']= 0;//front end
        chunkIndexPair['r']= sizeInBytes-1;//rear end
        chunkIndexPair['id'] = 0;
       
          //return promise here with the updated chunk boundry values #TODO
          refinedChunks.push(chunkIndexPair);
          resolve('done')
          return;
        //return [[0,sizeInBytes-1]];//0 to n-1th byte reading // CHECK IF FILE READING STARTS FROM OTH BYTE OR FIRST BYTE
    }

    console.log("Starting the chunking process")

    //CHUNKING PART 1:- Breaking into rough chunks (do not contain complete lines)
    //TODO Assumption byte reading is possible, today's world 1 char more
    //Break into k equal size chunks
    //here k = chunkReadingAndProcessingThreadCount// number of chunks == number of threads that will read those chunks
    //In total we want k chunks, first break into k-1 chunks, each such chunk will have an integeger values because of Math.floor, kth lastChunkSize = totalSize - k*standardChunkSize
    //loop from i*standardChunkSize to (i+1)*standardChunkSize-1, i varies from 0 to k-2, k-1 th element will be handled separately
    let k = chunkReadingAndProcessingThreadCount;
    sendMessageToParent({'nfcNotifier':'yes','chunkCount':k});
    let standardChunkSize = Math.floor(sizeInBytes/(k-1));
    let lastChunkSize = sizeInBytes - standardChunkSize*(k-1);
   

    //CHUNKING PART 2:- Refining chunks - so each chunk starts with a new line and ends at a line end i.e. making sure chunks are contain complete lines
    //we will be doing read operations on each chunk here on this single thread, amount of ready will be minimum thats why done on single thread.
    
    /*
    check each chunk's first character and move back till new line character is found or file ends. and start reading the chunk from the next char
    check each chunk's last character and move back till new line character is found or file ends. and end reading the chunk at the prev char where newline character or file end is found
    */
    console.log("Starting the chunking refinement process with ",k,"chunks of standardSize:",standardChunkSize)
    let chunkRefinementPromises = [];
//prblem in k-1th which is chunk for 16-53
//PROBLEM IN THIS
console.log("Final Unrefined Chunks: ");
    for(i =0; i<k-1;++i){//actual value for loop k-1
        let startIndex = i*standardChunkSize;
        let endIndex = (i+1)*standardChunkSize - 1;
        console.log(startIndex ," and ",endIndex)
        chunkRefinementPromises.push(readChunkForRefinement(filePath,startIndex,endIndex,i,sizeInBytes));
      //await readChunkForRefinement(filePath,startIndex,endIndex,sizeInBytes);
    }

    //handle the kth/last chunk here
    let lastChunkStartIndex = (k-1)*standardChunkSize;//verified looks correct
   // console.log(k ," and  meta data ", standardChunkSize)
   
    let lastChunkEndIndex = sizeInBytes - 1;
    console.log(lastChunkStartIndex ," and ", lastChunkEndIndex)
     chunkRefinementPromises.push(readChunkForRefinement(filePath,lastChunkStartIndex,lastChunkEndIndex,k-1,sizeInBytes));
  // await readChunkForRefinement(filePath,lastChunkStartIndex,lastChunkEndIndex,sizeInBytes);
//we have to do a promise.all here i think for all these

    await Promise.all(chunkRefinementPromises);
    console.log("Chunk Refinement Process is completed")
    console.log("Chunking process is completed")//maybe these are called before prmosie should actually be resolved - check
    //Done till here - test it now  - Chunking refinement is completee #Final Todo
    //removing chunks which contain duplicate data
    removeDuplicateChunk();

    console.log("Final Refined",k," Chunks: ", refinedChunks);
   
}




//3. looping step 
// for (const filePath of FilePaths) {
//     //Choose a ChunkReadingAndProcessingThread randomly and pass it the file path
//     const ChunkReadingAndProcessingThread = ChunkReadingAndProcessingThreads[Math.floor(Math.random() * k)];
//     ChunkReadingAndProcessingThread.postMessage({ filePath });

// }

/*
SHARED MEMORY USAGE 
//we should create a sharedmemory array here - this is complex for now 
because I will have to use int32array something, which again can cause data corruption and memory size
issues, so do not want to deal with those
*/




//Loop through refined chunks(refinedChunks) created and passes the i th chunk to the i th ChunkReadingAndProcessingThread along with the file path
//Passes each refined chunk to a separate thread to read that chunk and process its data
async function readAndProcessChunks(filePath,fileId){
    return new Promise(async (resolve) => {
    console.log('In: fileReadHandlingSystemThread: Starting chunk reading and processing.')
     //number of chunks will always be >= no of cores
    if (chunkReadingAndProcessingThreadCount<refinedChunks.length){
        console.log("/FileChunkingThread: Error in /readAndProcessChunks: There are more refined chunks than threads to handle them. Chunks Count: ",refinedChunks.length, "Thread: ",chunkReadingAndProcessingThreadCount)
        return;
    }
    let linedFileData= new Array(refinedChunks.length).fill(-1);
    
    //we are creating refinedChunks.length number of strings because sometimes chunkReadingAndProcessingThreadCount are more in number
    //which means some of those threads are unused and always in memory - we do not want that.
    const chunkReadingAndProcessingThreads = new Array(refinedChunks.length).fill(null).map(() => new Worker(path.join(__dirname,"ChunkReadingAndProcessingThread.js")));
    let chunkReadingAndProcessingThreadsCompletedCount = 0;//no. of threads done with their work
    for(i=0;i<refinedChunks.length;++i){
        chunkReadingAndProcessingThread = chunkReadingAndProcessingThreads[i];
        let message = {
            'filePath':filePath,
            'chunkStart':refinedChunks[i].f,
            'chunkEnd':refinedChunks[i].r,
            'chunkId':refinedChunks[i].id,//index representing the chunk order in the total file, first is 0

        }
        chunkReadingAndProcessingThread.postMessage(message);
       
        chunkReadingAndProcessingThread.on('message', (message) => {
            console.log("In: FileChunkingThread: got message from THREAD: ") 
            if(message.chunkProcessed){
                //meaning the chunk has been processed so we can resolve
               //we cannot resolve it we still have to get responses from all chunkReadingAndProcessing thread
               chunkReadingAndProcessingThreadsCompletedCount+=1;
               if(chunkReadingAndProcessingThreadsCompletedCount==refinedChunks.length){
                //all the chunks have been resolved so we can notify the parent that the file has been processed
                sendMessageToParent({'fileProcessed':true});//to notify the parent that the chunk has been processed
                resolve();
               }
               
            }   
             if (message.isProcessedChunk){
                console.log("In: FileChunkingThread: Processed Chunk Receivedt", message.id)
                 //if message is the chunk then save it in one object and pass it to main
                // linedFileData[message.id] = message.chunk//my doubt is passing large amount of data through .postMessage may create copy of data which increases speed, and makes the program slow
                    //we should directly send this to parent
                    //since number of chunks are not that large -> multiple message sending will not take too much extra time
                    //parent.post here //we are sending it as soon as we have it so as to make it as non blocking as possible
                    
                   
                    //IT IS PERFECT TILL HERE
                    linedFileData[message.id] = message.chunk;
                    let linesFilePassingMessage = {
                        'isLinedFile':'yes',
                        'linedFileData':linedFileData,//linedFileData - not sending this as i doubt the message size will grow very big as we start receiving more chunks,//an array containing chunks, which is an array containing lines
                        'fileId':fileId//represents the file part
                      }
                      //here is the issue i think, because we do not make rows for all chunks in a file, if a chunk is invalid for example
                     // console.log("aah7h",linedFileData)
                    //  console.log("THESE LINESp",linesFilePassingMessage)
                      //This message does not work if we do not make this method asyn and wait for it otherwise the thread terminates and we do not have any allocations for parent or other memebers.
                    sendMessageToParent(linesFilePassingMessage)
//we might be killing the thread before
            }
           
           

        });
        chunkReadingAndProcessingThread.on('exit', (code) => {
            console.log(`In fileReadHandlingSystemThread: SUCCESS: Thread Closed: fileChunkingThread closed with code ${code}`);
        });
   }
    });
}




/************UTILITY METHODS */
async function fileSize (path) { 
    try{
        const stats = await fsPromises.stat(path)
        console.log(`File Size(${path})`,stats.size);
        return stats.size
    } catch(err){
        console.log("Error: determining file size: ",err)
        return -1;
    }
    
  }

  //we have to do exception handling here so as to not make promise.all fail
  //sets the refinedChunks
async function readChunkForRefinement(filePath,chunkStartIndex,chunkEndIndex,chunkId,fileSize){
    return new Promise(async (resolve) => {

        console.log("Starting wow ",chunkStartIndex, chunkEndIndex)
    if(chunkStartIndex>=fileSize || chunkStartIndex>chunkEndIndex){
        console.log("CHUNK PART DONE ->",chunkStartIndex, chunkEndIndex)
        console.log("Refined Chunk - ","IGNOERED START>=FILESIZE, or invalid indexes")
        resolve('done')
        return;
    }

    //out local chunk size will depend on the EOL character size in the env, in linux it is \n, in window it is \r\n, so 1 and 2 bytes respectively - needs more testing
    //this is because for chunk refinement we are only concerened where are there new line characters
    const localChunkSize = EOL.length;

    //maybe we will need to create 2 reade streams for backward and bacward for every chunk

    //We have to read the chunk from both ends either both in forward or both in backward, forward is obviously preferred
    // you can read from 0 to  Number.MAX_SAFE_INTEGER
    //at max if all of the file is in a single line we can go till the end of the file in search of new line character
    var readStream_frontEnd = fs.createReadStream(filePath,{start: chunkStartIndex, end: fileSize-1, highWaterMark: localChunkSize, encoding: encoding});
    var readStream_rearEnd = fs.createReadStream(filePath,{start: chunkEndIndex, end: fileSize-1, highWaterMark: localChunkSize, encoding: encoding});

    //we have to read it first byte to prev, and last byte to prev, for every chunk
    //we also have to update the start and end index of chunks
    //how will we come out of thisawait
    let readHead_front = chunkStartIndex;//denoting the latest ready byte
    let readHead_rear = chunkEndIndex;//denoting the latest ready byte
    //await keyword is useless here since readStream return immediately, look for the end event to see when the file has been read
    //may be end is called when stream is terminated, or see which event is called when stream is terminated #Important next step
    let workProgress = 0;// when it is 2 the work is finished as new indeces are found for both rear and front end
    const finishedWork = 2;
    const newIndexesPair = {};//start,end
    

    //Handling readStream_frontend
    readStream_frontEnd.on('data', function(readData) { 
        readStream_frontEnd.pause();//else it pumps everything; this is a good practice so that we free the i/o for other files
        let readHead_frontL = processChunkReadData(readData,readHead_front,localChunkSize,true,fileSize);
        console.log("Front On Data *************",chunkStartIndex, chunkEndIndex, "WP:",workProgress," Front:",readHead_front,"FL:",readHead_frontL, "Rear:", readHead_rear);
        //this readHead_front is the new front boundry of this chunk, so its refined from the rear boundry, this readHead_front
        //is only returned when the work of this stream is done
        let isStreamAvailable = true;
        if(readHead_frontL || chunkStartIndex == 0){
            readHead_front = readHead_frontL ? readHead_frontL : readHead_front;
            readHead_front = chunkStartIndex==0 ? 0 : readHead_front;//first chunk's front will always be at 0
            isStreamAvailable = false;
            workProgress += 1;
            console.log("Front work progress of chunk id",chunkId,":",workProgress)
            if(workProgress==finishedWork){
                //done return promise
                //DO NOT UNSERSTAND THIS
                
               readHead_front = chunkStartIndex==0 ? 0 : readHead_front;//first chunk's front will always be at 0
               //update readHead
               newIndexesPair['f']= readHead_front;//front end
               newIndexesPair['r']= readHead_rear;//rear end
               newIndexesPair['id'] = chunkId
                //return promise here with the updated chunk boundry values #TODO
                refinedChunks.push(newIndexesPair);
                console.log("CHUNK PART DONE -> ",chunkStartIndex, chunkEndIndex)
                console.log("Refined Chunk - ",newIndexesPair)
                console.log("resolvingB")
                resolve('done')
            }
             //terminate the stream here
             readStream_frontEnd.destroy();
              
        }
        if(isStreamAvailable){
            console.log('Front: updated ReadHead from',readHead_front, '->',readHead_front+localChunkSize);
            readHead_front += localChunkSize;
            readStream_frontEnd.resume();
        }
            //#Check how to terminate the stream, and return promise now here I think we should do some manual processing
        }).on('end', function() {
            console.log('/FileChunkingThread: front end of the chunk refined');
        }).on("close", function (err) {
            console.log("/FileChunkingThread: front end: Stream has been destroyed. Waiting for th other end :",workProgress==finishedWork);
            //it may happen that sometimes when file data is small this may not call, no issues for us because we are not observing it
        });

    //Handling readStream_rearEnd
    readStream_rearEnd.on('data', function(readData) { 
        readStream_rearEnd.pause();
        let readHead_rearL = processChunkReadData(readData,readHead_rear,localChunkSize,false,fileSize);
        console.log("Rear On Data *************",chunkStartIndex, chunkEndIndex, "WP:",workProgress," Front:",readHead_front, "Rear:", readHead_rear,"RL:",readHead_rearL);
        //this readHead_rear is the new rear boundry of this chunk, so its refined from the rear boundry, this readHead_rear
        //is only returned when the work of this stream is done
        let isStreamAvailable = true;
        if(readHead_rearL){//show we add reachedEOF here
          readHead_rear = readHead_rearL;
          isStreamAvailable = false;//work of this stream is done since we have refined this end of the chunk
          workProgress += 1;
          console.log("Rear work progress of chunk id",chunkId,":",workProgress)
          //let reachedEOF = readHead_rear>=fileSize-1;//since readHead_rear is already updated and pointing to the next position
          //readHead_rear = reachedEOF ? fileSize-1 : readHead_rear;
          
            if(workProgress==finishedWork){
                //done return promise
                newIndexesPair['f']= readHead_front;//front end
               newIndexesPair['r']= readHead_rear;//rear end
               newIndexesPair['id'] = chunkId
                 //return promise here with the updated chunk boundry values #TODO
                 refinedChunks.push(newIndexesPair);
                 console.log("CHUNK PART DONE - ",chunkStartIndex, chunkEndIndex, "id: ",chunkId)
                 console.log("Refined Chunk - ",newIndexesPair)
                 console.log("resolvingC")
                 resolve('done')
            }
            //terminate the stream here
          readStream_rearEnd.destroy();
             
        }
        if(isStreamAvailable){
            console.log('Rear: updated ReadHead from',readHead_rear, '->',readHead_rear+localChunkSize);
            readHead_rear += localChunkSize;
            readStream_rearEnd.resume();
        }
       
            //#Check how to terminate the stream, and return promise now here I think we should do some manual processing, like which event
            //should we observe for this
        }).on('end', function() {
            //this is called 
            //this is called
            console.log('/FileChunkingThread: rear end of the chunk refined');
        }).on("close", function (err) {
            console.log("/FileChunkingThread: rear end: Stream has been destroyed. Waiting for the other end :",workProgress==finishedWork);
            //it may happen that sometimes when file data is small this may not call, no issues for us because we are not observing it
        });
   
//here we have to wait till we have got both updated rearEndIndex, and fronEndIndex of the chunk TODO
    });
}

function processChunkReadData(data,readHead,increment,isFrontEnd, fileSize,){
    let str = data.toString(encoding);
    
    console.log('readaing head: ',readHead);
    console.log('localChunk Read : ',str);
        let eof = readHead >= fileSize-increment;//end of file
        if(eof){
            console.log(fileSize," incx ",increment)
        }
        
        if(str == EOL || readHead >= fileSize-increment){
            
            console.log("/FileChunkingThread Chunk", eof ? "eof reached.": "LF char found.","Stream should be destroyed now. Front end ",isFrontEnd)
            
            
            //update the front or rear indeces
            if (isFrontEnd){
                return eof ? readHead : readHead+1;//this chunk starts from the next byte
            }else{
                console.log(readHead);
                return readHead;//this chunk ends at the LF(line feeder/ new line character) 
            }
        }
       // console.log('updated ReadHead from',readHead, '->',readHead+increment);
       // readHead += increment;
        

}

function removeDuplicateChunk(){
    //do it on refined chunks
    /*SOME KNOWN CODE ISSUES IN GENERAL ARE EXPLAINED HERE
    ************
    KNOWN ISSUE 1
    Just adding this check to make sure we do not have duplicate data representing chunks. 
    In practice this will only happen with the last chunk- if n-1th chunk's end == nth chunk' end
     then remove nth chunk since it's duplicate
     This will not happen in practice and can only happen when file size is very low or a single last line is very big, in which case do not even use chunking
     
     Situation like below can arrive where nth chunk's is a duplicate and already part n-1th chunk, can happen with other chunk
     as well if file size is even smaller
     Final Refined Chunks:  [
        { f: 54, r: 54, id: 3 },
        { f: 42, r: 54, id: 2 },
        { f: 28, r: 41, id: 1 },
        { f: 0, r: 27, id: 0 }
    ]
    
    
    This happens when 2 or more chunks are on the same last line completely, meaning one chunk's rear end is on the last line
    and the other chunk's front and rear are on the last line.

    This can happen if the file size is really small and/or a line is very large such that more than 1 chunks occupy that line.
    So we know our program is not made for programs with very large lines, and we do not use chunking for very small files.
    So this issue does not concern us
************
    KNOWN ISSUE 2
    Chunking Process fails when both the ends of chunks are on the same line, in that case both search the next EOL/EOF character and find the same 
    exact EOF/EOL character. Lets say the EOF/EOL is found at index 45;
    Then chunk front will becomes 45+1 = 46;
        chunk rear will becomes 45+0= 45;
        and your refined chunk becomes {f: 47,r: 45} which is invalid.
        This can basically fails to pick up that particular line.

        To avoid this we have the same suggestions:-
        1. Line size should not be  very large in comparison to file size
        3. File should not be very small
        2. Do not worry about this for large file issue - Number of chunks should not be very high like 1000. as this increases the chance of having both the ends of the chunk on the same line.
        Eg below:- 
            Final Refined Chunks:  [
            { f: 54, r: 54, id: 7 },
            { f: 14, r: 13, id: 1 },
            { f: 28, r: 27, id: 3 },
            { f: 0, r: 13, id: 0 },
            { f: 42, r: 41, id: 5 },
            { f: 54, r: 54, id: 6 },
            { f: 28, r: 27, id: 2 },
            { f: 42, r: 41, id: 4 }
            ]


            I think one more issue is the biggest one we have is that since a character in a file can be of multi-byte
            length, when breaking a file into chunks it is possible/certainity that we will break that work and it will
            becomes corrupt - simple solution do not break the file into chunks


            There is this issue electron that somehow loads up a list before anything and fails -> gives empty lined data even though
            //subsequent runs well.

    */

}



