const {fs} = require('fs');
const fsPromises = require('fs').promises;
//var configFile = JSON.parse(readFile('./app.config'));
const path = require('path');
const configFilePath = './app.config'

class SFFile{
    constructor(){
        this.filePath = filePath;
        this.fileName = fileName;
    }
}

class SLFilePath{

    constructor(directoryPath,fileNameRegex, fpgArr){
        this.directoryPath = directoryPath;
        this.fileNameRegex = fileNameRegex;
        this.fpgArr = fpgArr;//a file path can belong to a number of FPGs
    }
}


class SLFilePathManager{
   
    constructor(){
        this.filePaths = [];
        this.fpgToFilesMapping = {};
        this.configFile =  {}
        console.log("** SLFilePathManager initialised")
    }

    /**
    * Loads the file paths from app.config
    */
    async initialise(){
        let success = await this.#loadConfig();
        if(success){
            this.#populateFilePaths();
            console.log("** FilePaths added from app.config")
        }
        
    }

    async #loadConfig(){
        try{
            const fileData = await fsPromises.readFile(configFilePath);
            this.configFile = JSON.parse(fileData);
            console.log("** app.config loaded successfully")
            return true;
        }catch(err){
            console.log("Error reading app.config ",err)
            return false;
        }
       
    }

    /**
     * Reads the app.config file and loads in the filepaths from configFile.FilePathCollection
     */
    #populateFilePaths(){
       var filePathsDict = {};
       let filePaths = this.configFile.FilePathCollection;
        if(filePaths && Array.isArray(filePaths)){
            filePaths.forEach(filePath => {
                let valid = filePath.DirectoryPath && filePath.FileNameRegex && !filePathsDict[filePath.DirectoryPath+filePath.FileNameRegex];
                if(valid){
                    let fpgArr = Array.isArray(filePath.FilePathGroups) ? filePath.FilePathGroups : [];
                    this.#createSingleDirectorySingleFilePath(filePath.DirectoryPath, filePath.FileNameRegex,fpgArr);
                    filePathsDict[filePath.DirectoryPath + filePath.FileNameRegex] = 1;
                }else{
                    console.log("Invalid FilePathCollection element! DirectoryPath: ",filePath.DirectoryPath, " FileNameRegex: ",filePath.FileNameRegex);
                }
            });  
        }
    }

    /**
     * Creates a SLFilePath instance and add it to the SLFilePathManager.filePaths
     */
    #createSingleDirectorySingleFilePath(directoryPath,fileNameRegex,fpgArr){
        const filePath = new SLFilePath(directoryPath,fileNameRegex,fpgArr);
        this.filePaths.push(filePath)
        console.log("File path added: ",filePath);
    }
    

    /**
     * Fetches all the files belonging to the particular fpgGroup async and add them to the fpgToFilesMapping cache
     */
    async fetchFilesBelongingToFPG(fpgName){
       
        if(this.fpgToFilesMapping[fpgName]){
            console.log("Providing FPG files avaialable in cache")
            return this.fpgToFilesMapping[fpgName]
        }
        const matchingFiles = {};// dict of {dirPath: set of filenames}
       
        await Promise.all(this.filePaths.map(async (filePath) => {
            if(!filePath.fpgArr.includes(fpgName)){
                return;
            }
            const fileNameList = await this.#getFileListInDirectoryMatchingFileNameRegex(filePath.directoryPath, filePath.fileNameRegex);
           
           //populating matching files while making sure a single file is not duplicated 
            let dirSet = matchingFiles[filePath.directoryPath];
            if(!dirSet){
                console.log("/fetchFilesBelongingToFPG Directory set pre-exists: false")
                let newDirSet = new Set();
                fileNameList.forEach(fileName => {
                    newDirSet.add(fileName);
                });
                matchingFiles[filePath.directoryPath] = newDirSet;
            }else{ 
                console.log("/fetchFilesBelongingToFPG Directory set pre-exists: true")
                fileNameList.forEach(fileName => {
                    dirSet.add(fileName);
                });
                matchingFiles[filePath.directoryPath] = dirSet;
            }  
          }));

        this.fpgToFilesMapping[fpgName]=matchingFiles;
        console.log(`Returning Matching files for FPG ${fpgName} and saved to cache: ${matchingFiles}`); 
        return matchingFiles;
    }

    /**
     * asynchronously fetches all the file names belonging to the particular directory whose files follow the provided regex
    */
    async #getFileListInDirectoryMatchingFileNameRegex(dirPath, fileNameRegex){
        try{
            let fileNameList = await fsPromises.readdir(dirPath);
            console.log("Files ",fileNameList)
            let regex = new RegExp(fileNameRegex);
            return fileNameList.filter(fileName => regex.test(fileName));
     }catch(err){
            console.log("Error: /getFileListInDirectoryMatchingFileNameRegex ",err)
            return [];
        } 
    };


    resetFPGFileListCache(){
        this.fpgToFilesMapping = {};
    }

    #removeFilesBelongingToFPG(fpgName){}


}

module.exports = SLFilePathManager;