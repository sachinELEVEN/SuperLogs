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
   /**
    * Loads the file paths from app.config
    */
    constructor(){
        this.filePaths = [];
        this.fpgToFilesMapping = {};
        this.configFile =  {}
        this.#loadConfig();
        console.log("** SLFilePathManager initialised")
    }

    async #loadConfig(){
        try{
            const fileData = await fsPromises.readFile(configFilePath);
            this.configFile = JSON.parse(fileData);
            console.log(this.configFile)
            this.#populateFilePaths();
            console.log("** FilePaths added from app.config")
        }catch(err){
            console.log("Error reading app.config ",err)
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
    fetchFilesBelongingToFPG(fpgName){
        return new Promise((resolve, reject) => {
            if(this.fpgToFilesMapping[fpgName]){
                console.log("Providing FPG files avaialable in cache")
                return this.fpgToFilesMapping[fpgName]
            }
            this.filePaths.forEach(filePath => {
                if(filePath.fpgArr.includes(fpgName)){
                    this.#getFileListInDirectoryMatchingFileNameRegex(filePath.directoryPath, filePath.fileNameRegex)
                        .then(matchingFiles => {
                            console.log(`Returning Matching files and saved to cache: ${matchingFiles}`);
                            this.fpgToFilesMapping[fpgName]=matchingFiles;
                            resolve(matchingFiles);
                        })
                        .catch(err => {
                            console.error(`Error in finding Matching files : ${err}`);
                            reject('operation failed');
                        });
                }
            });
        });
    }

    /**
     * asynchronously fetches all the file names belonging to the particular directory whose files follow the provided regex
     */
     #getFileListInDirectoryMatchingFileNameRegex = (dirPath, regex) => {
        return new Promise((resolve, reject) => {
          fs.readdir(dirPath, (err, files) => {
            if (err) {
              reject(err);
            } else {
              const matchingFiles = files.filter(file => regex.test(file));
              resolve(matchingFiles);
            }
          });
        });
      };

      resetFPGFileListCache(){
        this.fpgToFilesMapping = {};
      }

    #removeFilesBelongingToFPG(fpgName){}


}

module.exports = SLFilePathManager;