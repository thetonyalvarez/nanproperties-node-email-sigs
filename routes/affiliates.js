var express 				= require('express');
var router					= express.Router();
const fs 					= require('fs');
const readline 				= require('readline');
const {google} 				= require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds 				= require('../client_secret.json');

const got 					= require('got')

const metascraper = require('metascraper')([
    //- require('metascraper-author')(),
    //- require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    //- require('metascraper-clearbit')(),
    //- require('metascraper-publisher')(),
    //- require('metascraper-title')(),
    //- require('metascraper-url')()
])

const csvToJson     = require("csv-file-to-json");
const affiliatesRaw        = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Global Properties_ Landing Pages - Affiliate List.csv",
        separator: ",",
        hasHeader: true
    }
);

const affiliates = affiliatesRaw.flat(Infinity)
// console.log(affiliates)


// Grab all values matching Affiliate URL from objects
const affiliateKeys     = Object.keys(affiliates);
const affiliateValues   = Object.values(affiliates);
const affiliateEntries  = Object.entries(affiliates);




// Filter out only the listings that have Cross Marketing enabled
let crossMarketList = affiliateValues.filter(a => a.CrossMarket === "Yes");

// Grab all values from a specific key in all object and map it to a new array
// if you want to only show Cross Market-approved affiliates, then change 'crossMarketList' to 'affiliates' in the line below.
// Then go down to the router and make the same change too.
let countryRaw = affiliates.map(a => a.Country);
// then remove duplicates
const countryCleaned = [...new Set(countryRaw)];
// console.log(countryCleaned)

const affiliatesCleaned = [];

affiliateEntries.forEach(([key, value]) => {
    const list = value
    affiliatesCleaned.push(list)
});

/* GET Our Affiliates Page. */
router.get('/', function (req, res, next) {
    res.render('taxonomy-affiliates', {
        items: affiliates,
		regions: countryCleaned
    });
});

module.exports = router;