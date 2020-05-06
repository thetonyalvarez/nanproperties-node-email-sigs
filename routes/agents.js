const express = require('express');
const router = express.Router();

/*
router.get('/', function(req, res, next) {
    res.send('respond with a resourc2e');
  });

module.exports = router;
*/


const csvToJson     = require("csv-file-to-json");
const agents        = csvToJson(
    { 
        filePath: "./assets/csv/email-sigs-2020.csv",
        separator: ",",
        hasHeader: true
    }
);


// Convert JSON Objects to Array 
const objectArray = Object.entries(agents);
const outerList = [];

objectArray.forEach(([key, value]) => {
    const list = (value)
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






/* GET agent page. */
router.get('/', function(req, res, next) {
    res.render('agents', { 
        title: 'All Agents',
        items: outerList,
        ids: idList,
        firstNames: firstNameList,
        lastNames: lastNameList,
        userNames: userNameList,
        displayNames: displayNameList,
        titles: titleList,
        cells: cellList,
        licenses: licenseList
    });
});





var findUserByUsername = function (username, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!
    
    const result = outerList.find(item => item.userName === username);

    const cellformat = result.cell;

    let formatPhoneNumber = (str) => {
        //Filter only numbers from the input
        let cleaned = ('' + str).replace(/\D/g, '');
        
        //Check if the input is of correct length
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      
        if (match) {
            // return '(' + match[1] + ') ' + match[2] + '-' + match[3]
            return match[1] + '.' + match[2] + '.' + match[3]
        };
      
        return null
    };


    result.cellformat = (formatPhoneNumber(cellformat))

    console.log(result)

    if (!result)
        return callback(new Error(
        'No user matching '
            + username
            
        )
    );

    return callback(null, result);

  };
  
  var findUserByUsernameMiddleware = function(request, response, next){
    if (request.params.username) {
      console.log('Username param was detected: ', request.params.username)
      findUserByUsername(request.params.username, function(error, user){
        if (error) return next(error);
        request.user = user;
        return next();
      })
   } else {
     return next();
   }
  }
  // The v2 routes that use the custom middleware
router.get('/:username',
    findUserByUsernameMiddleware,
    function(request, response, next){
    return response.render('single-agent', request.user);
  });

  


  
/*
router.get('/:agentName', 
    function(req, res, next) {
        res.render('single-agent', {
            title: outerList[0]["Timestamp"]
        }
        )
    }
);
*/


module.exports = router;

