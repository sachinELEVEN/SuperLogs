/*
We display the file as a grid, where we have the line column but also have additional columns which give
more information about that logline, that reoccurence count, no. of times error similar to that has occured(similarity between 2 string can
    be found using algorithms like some search algorithms), major issue or not based on some user tags, like 
    line containing error or exception is a major issue for example. one cell to basically click on row, one cell 
    on which clicking automatically searches that issue on google/chat gpt
*/
//const Slick = require('slick-grid');
//we need to make this path relative
//const {getRuntimeFPGLinedFiles} = require('electron').remote.require('/Users/sachinjeph/Desktop/superlogs/superlogs-app/src/FilesSystem/SystemFilesReadHandler.js');
var grid;
var data = [];
var columns = [
    {id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title"},
    {id: "duration", name: "Duration", field: "duration"},
    {id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar},
    {id: "status", name: "Status", field: "percentComplete", width: 50, resizable: false},
    {id: "start", name: "Start", field: "start", minWidth: 60},
    {id: "finish", name: "Finish", field: "finish", minWidth: 60},
    {id: "effort-driven", name: "Effort Driven", sortable: false, width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: Slick.Formatters.Checkmark}
];

var options = {
    editable: false,
    enableAddRow: false,
    enableCellNavigation: true,
    explicitInitialization: true
};

$(function () {
    for (var i = 0; i < 5000000; i++) {
        var d = (data[i] = {});

        d["title"] = "Task " + i;
        d["duration"] = "5 days";
        d["percentComplete"] = Math.min(100, Math.round(Math.random() * 110));
        d["start"] = "01/01/2009";
        d["finish"] = "01/05/2009";
        d["effortDriven"] = (i % 5 == 0);
    }

    grid = new Slick.Grid("#myGrid", data, columns, options);
      // The onBeforeAppendCell event returns text corresponding to the css class to add to the cell. 
    // It is called when first rendering the cell or when redrawing invalidated rows, so it can't respond to cell updates like a formatter.
    // It was intended to be a general formatting tool rather then being tied to a particular column, for example to allow validation formatting 
    // of cells. The idea was that formatting should remain in place until a subsequent validation.
    // Note that onBeforeAppendCell requires explicitInitialization: true so that the event can be wired up before the first render.
    
    grid.onBeforeAppendCell.subscribe(function (e, args) {
        if (grid.getColumns()[args.cell].id !== 'status') return null;
    
        if (args.value == null || args.value === "") {
          return null;
        } else if (args.value < 33) {
          return "red";
        } else if (args.value < 66) {
          return "orange";
        } else {
          return "green";
        }
        return null;
      }); 
      
      grid.init();
});
