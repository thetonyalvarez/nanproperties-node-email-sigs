var express 				= require('express');
var router					= express.Router();
const fs 					= require('fs');
const readline 				= require('readline');
const {google} 				= require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds 				= require('../client_secret.json');

const got 					= require('got')


/////////////////////////
// SEARCH BUILDER NAME //
/////////////////////////

var searchGoogleSheetForBuilderDevelopments = async function (builder, callback) {
	console.log('Launching Google Sheets search for ' + builder + "...")
	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');

	// use service account creds
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	console.log('Google Sheet found: ' + sheet)
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
	console.log('Google Sheet Rows found: ' + rows)
	
	// const result = await rows.find(row => row.BuilderSlugURLforNanSite === builder);
	const result = rows.filter(row => row.BuilderSlugURLforNanSite === builder);

	request.builderInfoResult = await result[0];

	console.log('Found these results in Google Sheets for ' + builder + ': ' + result)
	console.log('This is the Builder\'s Name: ' + result[0].BuilderName)

	if (! result)
		return callback(new Error(
			'No builder matching ' + 
			builder
		));
	return callback(null, result);

};

var findBuilderByNameMiddleware = function (request, response, next) {
	console.log('Searching for ' + request.params.builder + "...")
	if (request.params.builder) {
        searchGoogleSheetForBuilderDevelopments(request.params.builder, function (error, builder) {
			if (error) return next(error);
			request.builder = builder;
			console.log('Found ' + request.builder + "... Looking for records...")
            return next();
        })
    } else {
        return next();
    }
}
/////////////////////////
// END SEARCH BUILDER NAME //
/////////////////////////



var asyncDevelopments = async function (request, response, callback) {
	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	
	// await doc.useServiceAccountAuth(creds);

	// use service account creds
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	
	await doc.loadInfo();
	
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	await sheet.loadCells('A1:AH1000'); // A1 range
	const rows 	= await sheet.getRows();

	const devresult = rows.filter(row => row.SingleDevelopmentURLSlug === request.params.development);

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
const { request } = require('express');

var asyncfindDevelopmentByName = async function (development, callback) {

	// Identifying which document we'll be accessing/reading from
	const doc = new GoogleSpreadsheet('1gPOPrWA9QbBduEj72JMTQ_XQHzk08d9A1y_l4q6RiYs');
	// await doc.useServiceAccountAuth(creds);

	// use service account creds
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	
	await doc.loadInfo();
	const sheet = await doc.sheetsByIndex[3]; // or use doc.sheetsById[id]
	await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows();
	
	const result = await rows.find(row => row.SingleDevelopmentURLSlug === development);
	
	if (! result)
		return callback(new Error(
			'No development matching ' + 
			development
		));
	return callback(null, result);

};


var findDevelopmentByNameMiddleware = function (request, response, next) {
    if (request.params.development) {
        asyncfindDevelopmentByName(request.params.development, function (error, development) {
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
	// await doc.useServiceAccountAuth(creds);

	// use service account creds
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	
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
	// await doc.useServiceAccountAuth(creds);

	// use service account creds
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	
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


/* GET Builder Page. */
router.get('/:builder',
	findBuilderByNameMiddleware,
	(request, response, next) => {
		console.log('This is the Builder\'s Info: ' + request.builderInfoResult)
		console.log('Sending this builder\'s development request to router: ' + request.builder + '...');
		return response.render('single-builder', {
			devs: request.builder,
			builder: request.builderInfoResult
			// z: request.z
		});
	}
);

/* GET Our Developments: Builder: Community Page. */
router.get('/:builder/:development',
	findBuilderByNameMiddleware,
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