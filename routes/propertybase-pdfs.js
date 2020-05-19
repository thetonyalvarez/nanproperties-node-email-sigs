const express   = require('express');
const app       = express()
const router    = express.Router();
const path      = require('path');





const csvToJson         = require("csv-file-to-json");
const propertybaseData  = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Affiliates - cire-affiliates.csv",
        separator: ",",
        hasHeader: true
    }
);



const listingData = require("../assets/json/pdf-listing.json")

// console.log(listingData.listing.media[0].file)

router.get('/multiple-pdf-4-images', function (req, res, next) {
    res.render('pdfs/multiple-pdf-4-images.liquid', {
        listing: listingData.listing,
        user: listingData.user
    });
});
router.get('/multiple-pdf', function (req, res, next) {
    res.render('pdfs/multiple-pdf-4-images.liquid', {
        listing: listingData.listing,
        user: listingData.user
    });
});



module.exports = router;
