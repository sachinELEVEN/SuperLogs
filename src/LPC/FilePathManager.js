const { readFileSync } = require('fs');
var configFile = JSON.parse(readFileSync('./app.config'));

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
        this.#populateFilePaths();
        console.log("FilePaths added from app.config")
    }

    /**
     * Reads the app.config file and loads in the filepaths from configFile.FilePathCollection
     */
    #populateFilePaths(){
       var filePathsDict = {};
       let filePaths = configFile.FilePathCollection;
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
    
}

module.exports = SLFilePathManager;