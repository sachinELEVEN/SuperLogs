/*This is a user editable file where they can list file paths of a log file they want to analyse
The structure for this file is has 3 important aspects -
1. DirectoryPath : Path of the directory containing the log file
2. FileNameRegex : A regular expression that matches your log file name in that same directory
3. FilePathGroups : A list of group names this file belongs to

"FilePathCollection": [
    {
        "DirectoryPath" : "/Users/sachinjeph/Desktop/superlogs/superlogs-app/src/LPC/",
        "FileNameRegex" : "^.*superlogs.*\.log$",//representing a file name that contains <superlogs> and ends with <.log>
        "FilePathGroups" : ["important","ui","clientFacing"]
    },
    {
        "DirectoryPath" : "/Users/sachinjeph/Desktop/superlogs/superlogs-app/src/LPC/",
        "FileNameRegex" : "^.*superlogs.*\.log$",//representing a file name that contains <superlogs> and ends with <.log>
        "FilePathGroups" : ["important","server","internal"]
    }
]



*/