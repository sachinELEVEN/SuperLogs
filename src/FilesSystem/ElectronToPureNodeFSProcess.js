//complete working on this commit on performance branch 5f70303272eeea434eec55b183c66cb26ebf762d
//Wow this separating the process on a different env/executable really worked, our 1 GB now again takes around 3s instead >60s in electron
const { fork } = require('child_process');
const path = require('path')

class ElectronToPureNodeFSProcess {
    constructor() {
        this.electronNodePath = process.execPath;
        this.nodeExecutablePath = '/Users/sachinjeph/.nvm/versions/node/v19.4.0/bin/node';
        this.pathToScript = path.join(__dirname,"SystemFilesReadHandler.js")
        this.result = '';
        this.child = null;
    }

    //the callback method start giving you file parts as they get loaded, each part already contains the previous
    //part's content, so user of this method only has to keep track of the latest data returned in the callback
    start(callback) {
        this.child = fork(this.pathToScript, {
            execPath: this.nodeExecutablePath
        });

        this.child.on('close', (code) => {
            console.log(`Child process exited with code: ${code}`);
        });

        this.child.on('exit', (code) => {
            console.log(`Child process exited with code: ${code}`);
        });

        this.child.on('error', (error) => {
            console.error(`Child process error: ${error}`);
        });

        this.child.on('message', (data) => {
            console.log(`Received data from child process: ${data.message.filesData}`);// i am almost sure that this data cant be used as is
            if(data.message.filesData){
                callback(data.message.filesData)
            }
            
        });
    }

    stop() {//it is the responsibility of the child to tell when to kill the itself, necessary to do it #IMPORTANT
        this.child.kill();
    }
}

module.exports = ElectronToPureNodeFSProcess;
// let obj = new ElectronToPureNodeFSProcess()
// obj.start(function(data){
//     console.log("Reading this alpha")
// })