//this runs the file file system for reading the files in a separate node env which is outside of elctron
//This is the interface between the electron app and the pure node app

// In the Electron app:- Creating a child process to run node on that using a separate exec
//we need to give the node executable also in the package

const { spawn } = require('child_process');

let electronNodePath = process.execPath;//node executable bundled with electron, use the user's one if the have once
let nodeExecutablePath = '/Users/sachinjeph/.nvm/versions/node/v19.4.0/bin/node'
let pathToScript = './SystemFilesReadHandler.js'
console.log(pathToScript)
//const child = spawn(nodeExecutablePath, [pathToScript]);

const child = spawn(nodeExecutablePath, [pathToScript]);
//child.unref();

let result = '';

let identifier = 'TAG:'
child.stdout.on('data', (data) => {
    
    const dataString = data.toString();
    if (dataString.startsWith(identifier)) {//kind of like an identifier for the data
      // do something with the data
      let str = dataString.substr(4);
      console.log(str);
      result+=str;
    }
  });

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});

child.stderr.on('data', (data) => {
    console.error(`Child process stderr: ${data}`);
  });
  
  // Electron app's main process
child.on('message', (data) => {
    console.log(`Received data from child process: ${data.message}`);
  });
  