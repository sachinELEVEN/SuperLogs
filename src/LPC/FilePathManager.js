const fsPromises = require('fs').promises;
//var configFile = JSON.parse(readFile('./app.config'));
const path = require('path');
const configFilePath = './app.config'
const defaultFPGGroups = ["all"]//all the filePaths will have be part of these FPGs

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
        this.fpgSet = new Set();
        //runtimeFPG represents current files user is viewing/using
        this.runtimeFPG = {};//dictionary of dictionary {'fpgName': {'dirName':set of files in that directory which are needed}}
        console.log("** SLFilePathManager initialised")
    }

    /**
    *PUBLIC: Loads the file paths from app.config
    */
    async initialise(){
        let success = await this.#loadConfig();
        if(success){
            this.#populateFilePaths();
            console.log("** FilePaths added from app.config")
        }

        //LATER
        //this.runtimeFPG = fetch state from db later, do a promise.all async await 
        console.log("** RuntimeFPG initialisation NOT IMPLEMENTED ")
        
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
        //Adding defaultFPGGroups
        fpgArr = fpgArr.concat(defaultFPGGroups);
        //Add to FPGSet
        this.fpgSet = new Set(fpgArr.concat([...this.fpgSet]));
        console.log("FPGSet: ",this.fpgSet);
        const filePath = new SLFilePath(directoryPath,fileNameRegex,fpgArr);
        this.filePaths.push(filePath)
        console.log("File path added: ",filePath);
    }
    
    /** RUNTIME FPG  */

    /**
    * PUBLIC: returns runTimeFPG instance, which is a dictionary of dictionary {'fpgName': {'dirName':set of files in that directory which are needed}}
    * This can also be treated as the recents FPG
    */
    getRuntimeFPG(){
        return this.runtimeFPG;
    }
    /**
     * PUBLIC: Adds all the files belonging to the particular fpgGroup async in runtimFPG
     */
    async addFPGtoRuntimeFPG(fpgName){//we need to initially load it from memory
        let list = await this.filePathManager.fetchFilesBelongingToFPG(fpgName);
        this.runtimeFPG[fpgName]=list;
        //matchingFiles is dict where key is the directory and value is set containing fileNames
        console.log("**Added FPG to runtimeFPG")
        this.#saveRuntimeFPGState();
    }

    /**
     * PUBLIC: remove FPG from runtimFPG
     */
    removeFPGtoRuntimeFPG(fpgName){
        if (this.runtimeFPG.hasOwnProperty(fpgName)) {
            delete this.runtimeFPG[fpgName];
            console.log("**Removed FPG from runtimeFPG");
            this.#saveRuntimeFPGState();
        } else {
            console.log(`FPG with name ${fpgName} not found in runtimeFPG`);
        }
    }

    /**
     * PUBLIC: Adds a the files to runtimFPG
     */
    addFilePathtoRuntimeFPG(directoryPath, fileName, fpgName){
        //matchingFiles is dict where key is the directory and value is set containing fileNames
        if (!this.runtimeFPG[fpgName]) {
            this.runtimeFPG[fpgName] = { matchingFiles: {} }
        }
        if (!this.runtimeFPG[fpgName].matchingFiles[directoryPath]) {
            this.runtimeFPG[fpgName].matchingFiles[directoryPath] = new Set();
        }
        this.runtimeFPG[fpgName].matchingFiles[directoryPath].add(fileName);
        this.#saveRuntimeFPGState();
        console.log("**Added single file to runtimeFPG")
    }

    /**
     * PUBLIC: Adds a the files to runtimFPG
     */
    removeFilePathtoRuntimeFPG(directoryPath, fileName, fpgName){
        if (this.runtimeFPG[fpgName] && this.runtimeFPG[fpgName].matchingFiles[directoryPath]) {
            this.runtimeFPG[fpgName].matchingFiles[directoryPath].delete(fileName);
            console.log("**Removed file from runtimeFPG");
            this.#saveRuntimeFPGState();
        } else {
            console.log(`Error: /removeFilePathtoRuntimeFPG. File with name ${fileName} in directory ${directoryPath} not found in FPG ${fpgName}`);
        }
    }

    /**
     * Saves runtimeFPG state in db
     */
    #saveRuntimeFPGState(){
        //LATER
        console.log("**runtimeFPG state saving NOT IMPLEMENTED")
    }
    

    /** ****************** */

    /**
     * PUBLIC: Fetches all the files belonging to the particular fpgGroup async and add them to the fpgToFilesMapping cache
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
        console.log(`Returning Matching files for FPG '${fpgName}' and saved to cache`); 
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

    /**
     *PUBLIC: Returns a list of all FPGs 
    */
    getFPGList(){
        return this.fpgSet;
    }

    resetFPGFileListCache(){
        this.fpgToFilesMapping = {};
    }

    #removeFilesBelongingToFPG(fpgName){}


}

module.exports = SLFilePathManager;