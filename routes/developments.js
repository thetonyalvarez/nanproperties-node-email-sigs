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

	request.devresult = await devresult;
	if (!devresult)
		return callback(new Error(
			'Nothing matching ' +
			devresult
		));
	return callback(null, devresult);
}

const csvToJson = require("csv-file-to-json");
const { waitForDebugger } = require('inspector');

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

/* GET Our Developments: Builder: Community Page. */
router.get('/:builder',
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