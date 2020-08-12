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
var asyncBuilders = async function (request, response, callback) {
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

	const devresult = rows.filter(row => row.BuilderSlugURLforNanSite === request.params.builder);

	request.devresult = await devresult;
	
	if (!devresult)
		return callback(new Error(
			'Nothing matching ' +
			devresult
		));
	return callback(null, devresult);
}

var asyncfindBuilderByName = async function (builder, callback) {

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
	
	const result = await rows.find(row => row.BuilderSlugURLforNanSite === builder);
	
	if (! result)
		return callback(new Error(
			'No builder matching ' + 
			builder
		));
	return callback(null, result);

};

var findBuilderByNameMiddleware = function (request, response, next) {
    if (request.params.builder) {
        asyncfindBuilderByName(request.params.builder, function (error, builder) {
			if (error) return next(error);
			request.builder = builder;
            return next();
        })
    } else {
        return next();
    }
}


var getBuildersMiddleware = async function (request, response, callback) {

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

	var buildersActive 			= rows.filter(row => row.BuilderStatus !== "Inactive");
	var buildersActiveSingle 	= [];
	buildersActive.forEach(b => buildersActiveSingle.push(b.BuilderName));
	var buildersAll				= buildersActiveSingle.filter((dev, index) => buildersActiveSingle.indexOf(dev) === index);

	request.buildersActive = buildersActive;
	request.buildersAll = buildersAll;

	if (!buildersAll)
		return callback(new Error(
			'Nothing matching ' +
			buildersAll
		));
	return callback(null, buildersAll);

}

/////////////////////////
// END SEARCH BUILDER NAME //
/////////////////////////


/* GET Builder Page. */
router.get('/',
	getBuildersMiddleware,
	(request, response, next) => {
		return response.render('taxonomy-builders', {
			builders: request.buildersAll.sort(),
			devs: request.buildersActive
		});
	}
);

/* GET Builder Page. */
router.get('/:builder',
	findBuilderByNameMiddleware,
	asyncBuilders,
	(request, response, next) => {
		console.log(request.devresult + ": this is the result in the js file");
		return response.render('single-builder', {
			devs: request.devresult,
		});
	}
);


module.exports = router;