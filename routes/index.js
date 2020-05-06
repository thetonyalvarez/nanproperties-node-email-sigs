var express = require('express');
var router = express.Router();





// const agentlist     = require("./assets/json/email-list.json"); //(with path)

const csvToJson     = require("csv-file-to-json");
const agents        = csvToJson(
    { 
        filePath: "./assets/csv/email-sigs-2020.csv",
        separator: ",",
        hasHeader: true
    }
);

//- console.log(agents)

// Convert JSON Objects to Array 
const objectArray = Object.entries(agents);
const outerList = [];

objectArray.forEach(([key, value]) => {
    //- console.log(key); // 'one'
    //- console.log(value); // 1

    const list = (value)
    // console.log(list)

    outerList.push(list)
        
});
    
var idList          = [];
var firstNameList   = [];
var lastNameList    = [];
var userNameList    = [];
var displayNameList = [];
var titleList       = [];
var cellList        = [];
var licenseList     = [];

const keysArray = (outerList);
keysArray.forEach(values => {

    idList.push(values["ID"])
    firstNameList.push(values["firstName"])
    lastNameList.push(values["lastName"])
    userNameList.push(values["userName"])
    displayNameList.push(values["displayName"])
    titleList.push(values["title"])
    cellList.push(values["cell"])
    licenseList.push(values["licenseNumber"])
});


// console.log(outerList)
// console.log(phonelist)


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { 
        items: outerList,
        displayNames: displayNameList
    });
});
  
module.exports = router;