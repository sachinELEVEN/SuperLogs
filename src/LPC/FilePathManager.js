const { readFileSync } = require('fs');
var configFile = JSON.parse(readFileSync('./app.config'));
///Users/sachinjeph/Desktop/superlogs/superlogs-app/app.config
///Users/sachinjeph/Desktop/superlogs/superlogs-app/src/LPC/FilePathManager.js

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
        this.#populateFilePaths();// fetch from FilePathCollection.js
    }

    #populateFilePaths(){
        /*read FilePathCollection.js and call createSingleDirectoryMultipleFilePaths
        for each directory entry
        */
       console.log("Starting populating data ", configFile)
       var filePathsDict = {};
       let filePaths = configFile.FilePathCollection;
        if(filePaths && Array.isArray(filePaths)){
            filePaths.forEach(filePath => {
                let valid = filePath.DirectoryPath && filePath.FileNameRegex && !filePathsDict[filePath.DirectoryPath+filePath.FileNameRegex];
                console.log("Invalid FilePathCollection element! DirectoryPath: ",filePath.DirectoryPath, " FileNameRegex: ",filePath.FileNameRegex);
                if(valid){
                    let fpgArr = Array.isArray(filePath.FilePathGroups) ? filePath.FilePathGroups : [];
                    this.#createSingleDirectorySingleFilePath(filePath.DirectoryPath, filePath.FileNameRegex,fpgArr);
                    filePathsDict[filePath.DirectoryPath + filePath.FileNameRegex] = 1;
                    console.log("filePath dict key ",filePath.DirectoryPath + filePath.FileNameRegex);
                }
            });
            
        }

    }

    #createSingleDirectorySingleFilePath(directoryPath,fileNameRegex,fpgArr){
        const filePath = new SLFilePath(directoryPath,fileNameRegex,fpgArr);
        this.filePaths.push(filePath)
        console.log("File path added: ",filePath);
    }
    
}

module.exports = SLFilePathManager;