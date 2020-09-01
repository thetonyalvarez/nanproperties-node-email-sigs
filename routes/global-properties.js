var express 				= require('express');
var router					= express.Router();
const fs 					= require('fs');
const readline 				= require('readline');
const {google} 				= require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds 				= require('../client_secret.json');

const got 					= require('got')
require('dotenv').config();

// Google Sheet ID for Affiliates Landing Pages Sheet
const googleSheetID = '1S8aCzi9qKU-4Z0P-6NTVIQpjk4aB_hQCy24vsCLgq9s';


const csvToJson     = require("csv-file-to-json");

// Convert the Master Affiliate Sheet to JSON
const affiliatesRaw        = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Global Properties_ Landing Pages - Affiliate List.csv",
        separator: ",",
        hasHeader: true
    }
);

// Convert the Affiliate Details Sheet to JSON
const affiliateInfoRaw    = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Global Properties_ Landing Pages - Affiliate Landing Pages.csv",
        separator: ",",
        hasHeader: true
    }
);

// Convert the Affiliate Details Sheet to JSON
// const affiliateCountries    = csvToJson(
//     { 
//         filePath: "./assets/csv/Christie's Global Properties_ Landing Pages - Affiliate Countries.csv",
//         separator: ",",
//         hasHeader: true
//     }
// );
const affiliateCountries    = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Global Properties_ Landing Pages - Affiliate Countries.csv",
        separator: ",",
        hasHeader: true
    }
);

let continentsRaw  = affiliatesRaw.map(a => a.Continent);
let continentsList = [...new Set(continentsRaw)]



const affiliates = affiliatesRaw.flat(Infinity)
const affiliateInfo     = affiliateInfoRaw.flat(Infinity)

const affiliateKeys         = Object.keys(affiliates);
const affiliateValues   = Object.values(affiliates);
const affiliateEntries      = Object.entries(affiliates);

const affiliateInfoValues   = Object.values(affiliateInfo);


var findRegionByRegionname = function (regionname, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!

    // const result = affiliateValues.map(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    // const result = affiliateValues.filter(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

	const result = affiliateValues.filter(item => item.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'') === regionname);
    // console.log(result)
    

    // console.log(result)
    // console.log(typeof(result))

    if (!result)
        return callback(new Error(
            'No region matching ' +
            regionname

        ));

    return callback(null, result);

};


var findCitybyCityname = function (cityname, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!

    // const result = affiliateValues.map(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    // const result = affiliateValues.filter(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));
    
    
    const result = affiliateInfoValues.filter(item => item.affiliateCity.toLowerCase().replace(/\s/g, '-').replace(/&./g,'') === cityname);
    
    // console.log(result)
    
    // console.log(typeof(result))

    if (!result)
        return callback(new Error(
            'No city matching ' +
            cityname

        ));

    return callback(null, result);

};


router.param('regionname', function (request, response, next, regionname) {
    console.log(
        'Region param was is detected: ',
        regionname
    )
    findRegionByRegionname(
        regionname,
        function (error, region) {
            if (error) return next(error);
            // console.log(region)
            request.region = region;
            return next();
        }
    );
});

// router.param('cityname', function (request, response, next, cityname) {
//     console.log(
//         'City param was is detected: ',
//         cityname, "DONE!"
//     )
//     findCitybyCityname(
//         cityname,
//         function (error, city) {
//             if (error) return next(error);
//             request.city = city;
//             // console.log("this is the city:", city);
//             return next();
//         }
//     );
// });

/* GET Global Properties Page. */
router.get('/', function (req, res, next) {
    res.render('global-properties', {
		countries: affiliateCountries.sort(),
		cities: affiliateValues
    });
});







var googleSheetsCall = async (sheetID, sheetIndex) => {
	console.log('Starting googleSheetsCall for [' + sheetID + ", " + sheetIndex + "]...")

	const ID = sheetID;
	const doc = new GoogleSpreadsheet(ID);

	console.log('Starting Google Sheet Authorization...')
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	await doc.loadInfo();
	const sheet = await doc.sheetsByIndex[sheetIndex]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
	const results = rows;
	console.log('GOOGLE SHEETS CALL RESULTS: ' + results)
	return results;
}

var googleSheetsCall_Cells = async (sheetID, sheetIndex, sheetCells) => {
	console.log('Starting googleSheetsCall_Cells for [', sheetID, sheetIndex, sheetCells, "]...")

	const ID = sheetID;
	const doc = new GoogleSpreadsheet(ID);

	console.log('Starting Google Sheets authorization...')
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[sheetIndex];
	await sheet.loadHeaderRow();
	await sheet.getRows();
	await sheet.loadCells(sheetCells);
	const rows 	= await sheet.getRows();
	
	const results = rows;
	(async () => {
		console.log('Google Sheets Call Results: ' + await sheet.getRows())
	})()

	return results;
}





var asyncContinents = async (request, response, callback) => {
	console.log('Starting MIDDLEWARE asyncContinents...')
	const sheetIndex = 3;
	const sheetCells = 'A1:E7';
	
	const results = googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells);

	request.continentResults = await results

	if (!results)
	return callback(new Error(
		'No list of continents: ' +
		results + " (asyncContinents)"
	));
	return callback(null, results);
	
}

var asyncCitiesByContinent = async (request, response, callback) => {
	console.log('Starting MIDDLEWARE asyncCitiesByContinent...')
	
	const sheetIndex = 4;
	const sheetCells = 'A1:BE1000';
	
	const results = await googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells);

	const devresult = await results.find(result => result.ContinentSlug === request.params.continent);

	request.devresult = await devresult;
	if (!devresult)
		return callback(new Error(
			'No continent matching ' +
			devresult + " (asyncCitiesByContinent)"
		));
	return callback(null, devresult);
}

var asyncfindContinentByName = async (continentname, callback) => {
	console.log('Starting asyncfindContinentByName...')
	console.log('The request is ' + continentname + '...')
	
	const sheetIndex = 3;
	const sheetCells = 'A1:E7';
	
	const results = await Promise.all([googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells)]);
	
	console.log('Continent search: ' + continentname);
	console.log('Sheet results: ' + results);
	
	const contResult = results.find(result => result["URL-Safe Name"] === continentname);
	
	
	if (! contResult)
	return callback(new Error(
		'No continent matching ' + 
		continentname + " (asyncfindContinentByName)"
		));
	console.log('Found ' + continentname + ' from googleSheetsCall_Cells in asyncfindContinentByName...');
	return await callback(null, contResult);
}


var findContinentByName = function (request, response, next) {
	console.log('Starting findContinentByName...');
	console.log('The request is ' + request.params.continentname);

	if (request.params.continentname) {
        asyncfindContinentByName(request.params.continentname, function (error, continentname) {
			if (error) return next(error);
			request.continentname = continentname;
			console.log('Found ' + continentname + ' in findContinentByName');
            return next();
        })
    } else {
        return next();
    }
}

var asyncCities = async function (request, response, callback) {
	console.log('Starting MIDDLEWARE asyncCities...')

	const sheetIndex = 4;
	const sheetCells = 'A1:BE1000';
	
	const results = await Promise.all([googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells)]);

	const devresult = results.filter(result => result.CityNameSlug === request.params.cityname);

	request.devresult = await devresult;
	if (!devresult)
		return callback(new Error(
			'No city matching ' +
			devresult + " (asyncCities)"
		));
	return callback(null, devresult);
}

var asyncfindAffiliateByCityName = async (cityname, callback) => {
	console.log('Starting asyncfindAffiliateByCityName...')

	const sheetIndex = 4;
	const sheetCells = 'A1:BE1000';

	const results = await Promise.all([googleSheetsCall(googleSheetID, sheetIndex)]);

	const cityResult = await results.filter(result => result.CityNameSlug === cityname);
	
	if (! cityResult)
		return callback(new Error(
			'No City matching ' + 
			cityname + " (asyncfindAffiliateByCityName)"
		));
	return callback(null, cityResult);

};

var findAffiliateByCityName = function (request, response, next) {
    if (request.params.cityname) {
        asyncfindAffiliateByCityName(request.params.cityname, function (error, cityname) {
			if (error) return next(error);
			request.cityname = cityname;
            return next();
        })
    } else {
        return next();
    }
}



// Get Continent page
router.get('/:continentname',
	findContinentByName,
	asyncCitiesByContinent,
	asyncContinents,
	(request, response, next) => {
		console.log(request.continent + " -> found all continents inside router.get function");
		return response.render('global-properties-region', {
			// items: request.continent,
			// cities: request.continent,
			continent: request.continent,
			countries: request.continentResults
		});
	}
);

// Get Individual Affiliate page by City Name
router.get('/:continentname/:cityname',
	findContinentByName,
	findAffiliateByCityName,
	asyncCities,
	(request, response, next) => {
		console.log(devresult + " -> found all cities inside router.get function");
		return response.render('global-properties-region-city', {
			items: devresult
		});
	}
);


// router.get('/:regionname', function (request, response, next) {
//     var finallist = request.region;
//     // console.log("var is:", finallist, "DONE!")
//     return response.render('global-properties-region', {
//         cities: finallist.sort(),
// 		continent: finallist[0].Continent,
// 		countries: affiliateCountries
//     });
// });

// router.get('/:regionname/:cityname', function (request, response, next) {
//     var finallist = request.city;
//     console.log(finallist[0].affiliateCity);

//     return response.render('global-properties-region-city', {
//         items: finallist,
//         city: finallist[0].affiliateCity
//     });
// });

module.exports = router;

 