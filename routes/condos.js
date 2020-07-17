var express = require('express');
var router = express.Router();
const csvToJson = require("csv-file-to-json");

// Compile All Condo List CSV to an array
const condosAll = csvToJson({
    filePath: "./assets/csv/condos/Condo Search Results - Har.com - Filtered.csv",
    separator: ",",
    hasHeader: true
});

// Compile Featured Buildings List CSV to an array
const featuredBuildings = csvToJson({
    filePath: "./assets/csv/condos/Condos Landing Page_ Content - Featured Condo Buildings.csv",
    separator: ",",
    hasHeader: true
});

// Compile Price Ranges List CSV to an array
const priceRanges = csvToJson({
    filePath: "./assets/csv/condos/Condos Landing Page_ Content - Price Ranges.csv",
    separator: ",",
    hasHeader: true
});

// Compile Search By Other Options List CSV to an array
const otherOptions = csvToJson({
    filePath: "./assets/csv/condos/Condos Landing Page_ Content - Search By Other Options.csv",
    separator: ",",
    hasHeader: true
});

// Compile More Options List CSV to an array
const moreOptionsAll = csvToJson({
    filePath: "./assets/csv/condos/Condos Landing Page_ Content - More Options.csv",
    separator: ",",
    hasHeader: true
});



const objectArray = Object.entries(condosAll);
const condos = [];
objectArray.forEach(([key, value]) => {

    const list = (value)

    condos.push(list)

});

/* GET Our Developments Ads Page. */
router.get('/', function (req, res, next) {
    res.render('condos', {
        condos: condos,
        featuredBuildings: featuredBuildings,
        priceRanges: priceRanges,
        otherOptions: otherOptions,
        moreOptionsAll: moreOptionsAll
    });
});




module.exports = router;