var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var csv = require('csv-parse');

var upload = multer({dest: 'assets/csv/'});

//with multer...//post
//name of the attr...

router.post('/csv', upload.single('myfile'), function (req,res) {

    var file = req.file;

    //read
    fs.createReadStream(file.path).pipe(csv()).on('data', function (data){

        res.json(data);
        
    });
});

module.exports = router;