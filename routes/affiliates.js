const express = require('express');
const router = express.Router();

const got = require('got')

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






//////////// unused code


/*
var URL = 'http://christiesrehudsonvalley.com'

let scrapeURL = async xyz => {
    const {
        body: html,
        url
    } = await got(xyz)
    const metadata = await metascraper({
        html,
        url
    })
    return metadata
}

scrapeURL(URL).then(
    async () => {
        const data = await scrapeURL(URL)

        // result.image1link = Object.values(image1)
        // affiliates.logolink = (image1.logo)
        console.log(data)
    }
)

// */







/*
let operation = async () => {
    await new Promise(function(resolve, reject) {

        affiliateEntries.forEach(([key,value]) => {

            const URL = value.AffiliateURL

            if (URL) {

                let scrapeURL = async xyz => {
                    const {
                        body: html,
                        url
                    } = await got(xyz)
                    const metadata = await metascraper({
                        html,
                        url
                    })
                    return metadata
                }
            
                scrapeURL(URL).then(
                    async () => {
                        const data = await scrapeURL(URL)
            
                        // result.image1link = Object.values(image1)
                        // affiliates.logolink = (image1.logo)
                        // console.log(data)
                        value.description = data.description
                        value.image = data.image
                        value.logo = data.logo
                        const list = value
                        // affiliatesFinal.push(list)
                        resolve(list)

                        // console.log((typeof list))
                    
                    }
                )

            }

        });
        // resolve(list)

    })

}

// operation().then(console.log)

// let resolved = async () => {
//     const waiting = await operation()

//     console.log(waiting)
// }

// resolved();

// operation(function (list) {
    // affiliatesFinal.push(list)
    // router.get('/', function (req, res, next) {
    //     res.render('taxonomy-affiliates', {
    //         items: list
    //     });
    // });
// })
// */




// console.log((affiliatesCleaned.flat()).length)
// console.log((affiliateValues)[1])


// Scrape for logos
// let testing = async xyz => {
//     const {
//         body: html,
//         url
//     } = await got(xyz)
//     const metadata = await metascraper({
//         html,
//         url
//     })
//     // console.log(metadata)
//     return metadata
// }



// testing(affiliates[1].AffiliateURL).then(
//     async () => {
//         const image1 = await testing(affiliates[2].AffiliateURL)
//         // result.image1link = Object.values(image1)
//         affiliates.logolink = (image1.logo)
//         // console.log(affiliates.logolink)
//     }
// )




/*
testing(result[1]['Affiliate URL']).then(
    async () => {
        const image1 = await testing(result[1]['Affiliate URL'])
        // result.image1link = Object.values(image1)
        result.image1link = (image1.image)

    }
)
*/

