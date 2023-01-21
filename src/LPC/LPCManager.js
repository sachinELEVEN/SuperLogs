const SLFilePathManager = require('./FilePathManager.js')

//SLLPCManager - SuperLogs LogPathCollection Manager
class SLLPCManager{

    

    constructor(){
        this.filePathManager = new SLFilePathManager();
    }

    async initialise(){
      await  this.filePathManager.initialise();
      await  this.fetchFilesBelongingToFPG();
    }


    async fetchFilesBelongingToFPG(){
    let list = await this.filePathManager.fetchFilesBelongingToFPG("important")
    console.log(list)
    }
    




}

module.exports = SLLPCManager;