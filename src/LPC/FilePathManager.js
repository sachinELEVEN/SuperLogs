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
    }

     #createSingleDirectoryMultipleFilePaths(directoryPath,fileNameRegexArr,fpgArr){
        fileNameRegexArr.forEach(fileNameRegex => {
            const filePath = new FilePath(directoryPath,fileNameRegex,fpgArr);
            this.filePaths.push(file)
        });
    }
    
}