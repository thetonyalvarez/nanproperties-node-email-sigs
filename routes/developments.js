var express 				= require('express');
var router					= express.Router();
const fs 					= require('fs');
const readline 				= require('readline');
const {google} 				= require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds 				= require('../client_secret.json');

const got 					= require('got')





var asyncDevelopments = async function (request, response, callback) {

	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	
	await doc.useServiceAccountAuth(creds);
	
	await doc.loadInfo();
	
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	await sheet.loadCells('A1:AH1000'); // A1 range
	const rows 	= await sheet.getRows();

	const devresult = rows.filter(row => row.SingleDevelopmentURLSlug === request.params.builder);

	// console.log(z);

	request.devresult = await devresult;
	if (!devresult)
		return callback(new Error(
			'Nothing matching ' +
			devresult
		));
	return callback(null, devresult);

	// const cells = await sheet.loadCells();


	// Writing an async waitFor function to wait for the results from rows variable to then show in console.log
	// Taken from: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
	// const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

	// async function asyncForEach(array, callback) {
	// 	for (let index = 0; index < array.length; index++) {
	// 	  	await callback(array[index], index, array);
	// 	}
	// }

	// const start = async () => {
	// 	await asyncForEach(rows, async (b) => {
	// 		await waitFor(50);
	// 		const c = (b.DevelopmentStatus);
	// 		// console.log(c)
	// 		// await return c
	// 	});
	// 	console.log('Dev Sheet Async Done')
	// }

	// const y = await start();

	// console.log(y)

	// (async()  => {
	// 	const y = await start()
	// 	console.log(y)
	// })()

	// start();

}


const csvToJson = require("csv-file-to-json");
const { waitForDebugger } = require('inspector');

const developmentsall = csvToJson({
    filePath: "./assets/csv/developments-landing-page/Our Developments_ Landing Page - Export Sheet.csv",
    separator: ",",
    hasHeader: true
});

// console.log(developmentsall)

const buildersall = csvToJson({
    filePath: "./assets/csv/Our Developments_ Landing Page - Builders.csv",
    separator: ",",
    hasHeader: true
});

// Convert JSON Objects to Array 
const objectArray = Object.entries(developmentsall);
const developments = [];
objectArray.forEach(([key, value]) => {
    const list = (value)
    developments.push(list)
});

const developmentsvalues = Object.values(developmentsall);
const developmentsCleaned = [];
developmentsvalues.forEach(value => {
    const builderNameLower = value.BuilderName.toLowerCase()
    const builderNameCleaned = builderNameLower.replace(/ +/g, "-")
    value.builderNameCleaned = builderNameCleaned
    const list = developmentsvalues
    developmentsCleaned.push(list)
});


const buildersArray = Object.entries(buildersall);
const builders = [];

buildersArray.forEach(([key, value]) => {
    const list = (value)
    builders.push(list)
});

var idList = [];
var firstNameList = [];
var lastNameList = [];
var userNameList = [];
var Preferred_NameList = [];
var titleList = [];
var cellList = [];
var licenseList = [];
var cityList = [];

const keysArray = (developments);
keysArray.forEach(values => {

    idList.push(values["ID"])
    firstNameList.push(values["firstName"])
    lastNameList.push(values["lastName"])
    userNameList.push(values["Username"])
    Preferred_NameList.push(values["Preferred_Name"])
    titleList.push(values["Title"])
    cellList.push(values["Cell"])
    licenseList.push(values["License_Number"])
    cityList.push(values["DevelopmentCityorNeighborhood"])
});

// var findAllDevelopments = (request, response, callback) => {
// 		const devs = developmentsall;
// 		const devresult = devs.filter(dev => dev['Builder Slug URL (for Nan Site)'] === request.params.builder);

// 		request.devresult = devresult;
// 		if (!devresult)
// 			return callback(new Error(
// 				'Nothing matching ' +
// 				request
// 			));
// 		return callback(null, devresult);
// }

// var findBuilderByBuilderName = function (builder, callback) {
// 	const devresult = developmentsall.filter(dev => dev['BuilderSlugURL(forNanSite)'] === builder);
//     const developmentsCleaned2 = developmentsCleaned.flat()
//     const result = developmentsCleaned2.find(item => item.builderNameCleaned === builder);
//     if (!result)
//         return callback(new Error(
//             'No builder matching ' +
//             builder
//         ));
//     return callback(null, devresult);
// };

// var findBuilderByBuilderNameMiddleware = function (request, response, next) {
//     if (request.params.builder) {
//         findBuilderByBuilderName(request.params.builder, function (error, user) {
// 			if (error) return next(error);
// 			request.user = user;
//             return next();
//         })
//     } else {
//         return next();
//     }
// }



var findDevelopmentByName = function (builder, callback) {
	// const result = developmentsall.filter(dev => dev['SingleDevelopmentURLSlug'] === builder);
    const developmentsCleaned2 = developmentsall.flat()
    const result = developmentsCleaned2.find(dev => dev['SingleDevelopmentURLSlug'] === builder);
    if (!result)
        return callback(new Error(
            'No builder matching ' +
            builder
        ));
    return callback(null, result);
};


var asyncfindDevelopmentByName = async function (builder, callback) {

	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
	
	const result = await rows.find(row => row.SingleDevelopmentURLSlug === builder);
	
	if (! result)
		return callback(new Error(
			'No builder matching ' + 
			builder
		));
	return callback(null, result);

};

var findDevelopmentByNameMiddleware = function (request, response, next) {
    if (request.params.builder) {
        asyncfindDevelopmentByName(request.params.builder, function (error, development) {
			if (error) return next(error);
			request.development = development;
            return next();
        })
    } else {
        return next();
    }
}


var getDevelopmentsMiddleware = async function (request, response, callback) {

	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
		
	var approvedDevs 	= rows.filter(row => row.DevelopmentStatus !== "-- Inactive");
	var devsWithCity	= approvedDevs.filter(row => row.DevelopmentCityorNeighborhood !== "");
	// var allDevCities 	= [];
	// devsWithCity.forEach(dev => allDevCities.push(dev.DevelopmentCityorNeighborhood));
	// var finalDevCities	= allDevCities.filter((dev, index) => allDevCities.indexOf(dev) === index);
	
	request.devsWithCity = devsWithCity;

	if (!devsWithCity)
		return callback(new Error(
			'Nothing matching ' +
			devsWithCity
		));
	return callback(null, devsWithCity);

}





var getCitiesMiddleware = async function (request, response, callback) {

	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
		
	var approvedDevs 	= rows.filter(row => row.DevelopmentStatus !== "-- Inactive");
	var devsWithCity	= approvedDevs.filter(row => row.DevelopmentCityorNeighborhood !== "");
	var allDevCities 	= [];
	devsWithCity.forEach(dev => allDevCities.push(dev.DevelopmentCityorNeighborhood));
	var finalDevCities	= allDevCities.filter((dev, index) => allDevCities.indexOf(dev) === index);
	
	request.finalDevCities = finalDevCities;

	if (!finalDevCities)
		return callback(new Error(
			'Nothing matching ' +
			finalDevCities
		));
	return callback(null, finalDevCities);
}

/* GET Our Developments Ads Page. */
router.get('/', 
	getCitiesMiddleware,
	getDevelopmentsMiddleware,
	(request, response, next) => {
		console.log(request.finalDevCities)
		return response.render('taxonomy-developments-ads', {
			devs: request.devsWithCity,
			cities: request.finalDevCities.sort()
		})
	}
);


// The v2 routes that use the custom middleware
// router.get('/:builder',
// 	findBuilderByBuilderNameMiddleware,  
// 	findAllDevelopments,
//     (request, response, next) => {
// 		// console.log(request.development);
// 		return response.render('single-builder', {
// 			builder: request.development[0],
// 			devs: request.development
// 		});
//     }
// );



/* GET Our Developments: Builder: Community Page. */
router.get('/developments-c/:builder',
	findDevelopmentByNameMiddleware,
	asyncDevelopments,
	(request, response, next) => {
		console.log(request.devsWithCity + 'done!!');
		return response.render('single-development-c', {
			devs: request.development,
			// z: request.z
		});
	}
);




module.exports = router;