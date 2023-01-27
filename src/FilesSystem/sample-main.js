//How to start the FileReadSystem
const { Worker } = require('worker_threads')

//startFilesReadSystem();
console.log("In Main: Starting FilesReadHandlingSystemThread")
//let arr = [convertToUTF8("ss")];
//console.log(roughSizeOfObject(arr));
let uint8Array = new Uint8Array();
uint8Array = appendStringToUint8Array("s");
uint8Array = appendStringToUint8Array("a");
//we might need to convert utf16 str into uint8array and convert them back when we need them

function convertToUTF8(str) {
    //a string is converted to utf8 array
    //0-255 ascii can be stored
    //so storing in it we first need to make sure that the data we are converting is ascii else do not convert
    // Encode the string as UTF-8
    let encodedString = new TextEncoder().encode(str);
    // Convert the encoded string to a Uint8Array
    let uint8Array = new Uint8Array(encodedString);
    // Decode the Uint8Array as UTF-8
   // let decodedString = new TextDecoder().decode(uint8Array);
   console.log("this",roughSizeOfObject(uint8Array[0]))
   let arr = [uint8Array[0]]
   console.log("too",uint8Array.byteLength)//look like it is using byte space
//reading
console.log("read",uint8Array[0])
    return uint8Array[0];
}

// const string = "Hji";
// const utf8Encoder = new TextEncoder();
// const utf8Array = utf8Encoder.encode(string);
// console.log(roughSizeOfObject(utf8Array))

function decode(index){
    const utf8Decoder = new TextDecoder();
    const decodedString = utf8Decoder.decode(utf8Array[0]);
    console.log(decodedString);
    }

//*******
    function appendStringToUint8Array(str) {
        // Convert string to Uint8Array
        const strAsUint8 = new TextEncoder().encode(str);
        // Create a new Uint8Array with the combined length of both arrays
        console.log("strle",strAsUint8.length)
        const combined = new Uint8Array(uint8Array.byteLength + strAsUint8.length);
        // Copy the original array to the new array
        combined.set(uint8Array);
        // Append the new Uint8Array to the combined array
        combined.set(strAsUint8, uint8Array.length);
        // Return the combined array
        console.log("This is nice",combined.byteLength)
        return combined;
    }
/* ENCODING CODE
const string = "Hello, World!";
const utf8Encoder = new TextEncoder();
const utf8Array = utf8Encoder.encode(string);

DECODING CODE
function(){
const utf8Decoder = new TextDecoder();
const decodedString = utf8Decoder.decode(utf8Array);
console.log(decodedString);
}

*/
    
function startFilesReadSystem(){
        
    const fileReadHandlingSystemThread =  new Worker('./FilesReadHandlingSystemThread');
    fileReadHandlingSystemThread.postMessage('start');
    fileReadHandlingSystemThread.on('message', (message) => {
        console.log("In Main: got message from THREAD: ", message)    
    });
    fileReadHandlingSystemThread.on('exit', (code) => {
        console.log(`In Main: SUCCESS: Thread Closed: fileReadHandlingSystemThread closed with code ${code}`);
    });

}
//surprisingle size for array is also coming out to be around 1.8 GB same as ArrayBuffer
function roughSizeOfObject( object ) {

    var objectList = [];

    var recurse = function( value )
    {
        var bytes = 0;

        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }
        else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes = 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList[ objectList.length ] = value;

            for( i in value ) {
                bytes+= 8; // an assumed existence overhead
                bytes+= recurse( value[i] )
            }
        }

        return bytes;
    }

    return recurse( object );
}