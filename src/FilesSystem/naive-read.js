const fs = require('fs');
const { resolve } = require('path');
const { start } = require('repl');
const threadName = "ChunkReadingAndProcessingThread";
es = require('event-stream');

/*
This file is there so that we can do comparison like how fast is our readfilesystem compared to the standard approach
*/

console.time('Naive Reading Approach');
//const FilePaths = ['/Users/sachinjeph/Desktop/superFileHandling/file1.txt'];
const FilePaths = ['/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt']
//const FilePaths = ['/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt','/Users/sachinjeph/Desktop/superlogs/superlogs-app/temp/random10g.txt']

let promises = [];

startActual();

async function startActual(){
    console.time('ChunkReadingAndProcessing TimeTaken:');
    for(i=0;i<FilePaths.length;++i){
        promises.push( readFile(FilePaths[i]))
    }
    await Promise.all(promises);
    console.timeEnd('ChunkReadingAndProcessing TimeTaken:')
}

async function readFile(filePath){
    return new Promise(async (resolve) => {
   
let filePath = FilePaths[0];
    var  stream = fs.createReadStream(filePath)
        .pipe(es.split())
        .pipe(es.mapSync(function(line){
           // console.log(line);
            //s.pause();
        //s.resume();
        })
        .on('error',function(err){
            console.log(err)
           resolve()
        })
        .on('end',function(){
            console.log("Read entire chunk")
           resolve()
        })

     
        
        
    );
    });
}
