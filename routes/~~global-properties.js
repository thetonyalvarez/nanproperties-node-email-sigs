const express 				= require('express');
const router					= express.Router();
const fs 					= require('fs');
const readline 				= require('readline');
const {google} 				= require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds 				= require('../client_secret.json');
const got 					= require('got');
const { promises } = require('dns');
require('dotenv').config();

// Google Sheet ID for Affiliates Landing Pages Sheet
const googleSheetID = '1S8aCzi9qKU-4Z0P-6NTVIQpjk4aB_hQCy24vsCLgq9s';

// Google Sheets Lookup Cells Function
// ----------------------------------
const googleSheetsCall_Cells = async (sheetID, sheetIndex, sheetCells) => {
	console.log('Starting call to Google Sheets...');
	console.log('Sheet ID:', sheetID);
	console.log('Sheet Page Index:', sheetIndex);
	console.log('Sheet Cell Range:', sheetCells);

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
	const rows 	= await sheet.getRows()
	
	const sheetResults = rows;
	// console.log('Google Sheets Call Results: ', sheetResults)

	return sheetResults;
}
// ----------------------------------
// End Google Sheets Lookup Cells Function

// Google Sheets Lookup Rows Function
// ----------------------------------
const googleSheetsCall_Rows = async (sheetID, sheetIndex) => {
	console.log('Starting call to Google Sheets...');
	console.log('Sheet ID:', sheetID);
	console.log('Sheet Page Index:', sheetIndex);
	// console.log('Sheet Cell Range:', sheetCells);

	const ID = sheetID;
	const doc = new GoogleSpreadsheet(ID);

	console.log('Starting Google Sheets authorization...')
	await doc.useServiceAccountAuth({
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	});
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[sheetIndex];
	// await sheet.loadHeaderRow();
	await sheet.getRows();
	const rows 	= await sheet.getRows()

	// console.log('how many rows?', rows.length)
	// console.log('first row:', rows[0].Region)
	
	const sheetResults = rows;
	// console.log('Google Sheets Call Results: ', sheetResults)

	return sheetResults;
}
// ----------------------------------
// End Google Sheets Lookup Rows Function

// Search for Continent match in Google Sheets
// -------------------------------------------------
const asyncfindContinentByName = async (continentname, callback) => {
	console.log('Passing', continentname, 'to Google Sheets to begin lookup...')
	console.log('The request is ' + continentname + '...')
	
	const sheetIndex = 3; // "Affiliate Countries"
	const sheetCells = 'A1:E7';

	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells));
	let continentResult = (results.find(result => result["URL-Safe Name"] === continentname))
	
	console.log('Continent search: ', continentname);
	// console.log('Sheet results: ', results);
	// console.log("Matching Result:", continentResult)

	if (! continentResult)
	return callback(new Error(
		'No continent matching', continentname
	));
	
	console.log('Found', continentname, 'in Google Sheet ID:', googleSheetID);
	return await callback(null, continentResult);
}

const findContinentByName = async (request, response, next) => {
	console.log('Starting search for slug:', request.params.continentname);
	if (request.params.continentname) {
        await (asyncfindContinentByName(request.params.continentname, function (error, continentname) {
			if (error) return next(error);
			request.continentname = continentname;
			console.log('Passing Continent value to next middleware:', continentname);
            return next();
        }))
    } else {
        return next();
    }
}
// -------------------------------------------------
// End Search for Continent match in Google Sheets

// Search for Cities inside Continent match
// -------------------------------------------------
const getCitiesinContinent = async (request, response, callback) => {
	console.log('Starting search for cities...')
	
	const sheetIndex = 4; // "Export Sheet"
	const sheetCells = 'A1:BE1000';
	
	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells))

	let citiesResult = results.filter(result => result.ContinentSlug === request.params.continentname);
	
	console.log('citiesResult =', citiesResult)
	
	request.citiesResult = citiesResult;
	if (!citiesResult)
		return callback(new Error(
			'No cities found in',
			request.params.continentname
		));
	return callback(null, citiesResult);
}
// -------------------------------------------------
// End Search for Cities inside Continent match

// Get all Continents in Google Sheet
// -------------------------------------------------
const getContinents = async (request, response, callback) => {
	console.log('Getting all Continents...')

	const sheetIndex = 3;
	const sheetCells = 'A1:E7';
	
	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells));

	request.allContinents = results;

	if (!results)
	return callback(new Error(
		'No continents found'
	));
	return callback(null, results);
}
// -------------------------------------------------
// End Get all Continents in Google Sheet

// Get Continent page
// ------------------
router.get('/:continentname',
	findContinentByName,
	getCitiesinContinent,
	getContinents,
	(request, response, next) => {
		return response.render('global-properties-region', {
			continent: request.continentname,
			countries: request.allContinents,
			cities: request.citiesResult
		});
	}
);
// ------------------
// End Continent page






// Get all Cities in Google Sheet
// -------------------------------------------------
// const getCities = async (request, response, callback) => {
// 	console.log('Getting all cities...')

// 	const sheetIndex = 4; // "Export Sheet"
// 	const sheetCells = 'A1:BD1000';
	
// 	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells));

// 	console.log('getCities results =', results)

// 	let allCities = results.filter(result => result.CityNameSlug === request.params.cityname);
	
// 	console.log('allCities =', allCities)
	
// 	request.allCities = allCities

// 	if (!results)
// 		return callback(new Error(
// 			'No cities found'
// 		));
// 	return callback(null, results);
// }
const getCities = async (request, response, callback) => {
	console.log('Getting all Cities...')

	const sheetIndex = 4;
	const sheetCells = 'A1:BD1000';
	
	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells));

	request.allCities = results;

	if (!results)
	return callback(new Error(
		'No cities found'
	));
	return callback(null, results);
}
// -------------------------------------------------
// End Get all Cities in Google Sheet

// Search for Affiliate match in Google Sheets
// -------------------------------------------------
const asyncfindAffiliateByCityName = async (cityname, callback) => {
	console.log('Passing', cityname, 'to Google Sheets to begin lookup...')
	console.log('The request is ' + cityname + '...')

	const sheetIndex = 4; // "Export Sheet"
	const sheetCells = 'A1:BD6';

	let results = await (googleSheetsCall_Cells(googleSheetID, sheetIndex, sheetCells));
	// let cityResult = (results.find(result => result.CityNameSlug === cityname))

	// TEMPORARY fix while i fix bug. Remove this to troubleshoot
	let cityResult = 'pass'

	if (! cityResult)
	return callback(new Error(
		'No city matching',  cityname
	));
	
	console.log('Found', cityname, 'in Google Sheet ID:', googleSheetID);
	return await callback(null, cityResult);
};
// -------------------------------------------------
// EndSearch for Affiliate match in Google Sheets

// Find Affiliate By City Name
// ------------------------------
const findAffiliateByCityName = async (request, response, next) => {
	console.log('Starting search for slug:', request.params.cityname);
	if (request.params.cityname) {
        await (asyncfindAffiliateByCityName(request.params.cityname, function (error, cityname) {
			if (error) return next(error);
			request.cityname = cityname;
			console.log('Passing City value to next middleware:', cityname)
			return next();
		}))
    } else {
        return next();
    }
}
// ------------------------------
// Find Affiliate By City Name

// Get Affiliate page by City Name
// ---------------------------------------
router.get('/:continentname/:cityname',
	findContinentByName,
	findAffiliateByCityName,
	// getCities,
	(request, response, next) => {
		const vegas = {
			CrossMarket:'Yes',
			AffiliateName:'Elite Homes',
			StreetAddress:'6763 West Charleston Blvd.­',
			Locality:'Las Vegas­',
			Region:'NV,­',
			PostalCode:'89146',
			Country:'United States',
			Continent:'North & Central America',
			ContinentSlug:'north-central-america',
			CityNameSlug:'las-vegas­',
			NanAffiliateURLSlug:'/global-properties/north-central-america/las-vegas',
			AffiliateURL:'http://www.elitehomes.us',
			Principal:'Elite Homes US, LLC',
			ReferralContactPhone:'+1 702 787 8061',
			ReferralContactEmail:'lisa@lisasongsutton.com',
			LogoUrl:'',
			HeaderImage:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/ckeditor_assets/pictures/root/Elite_Homes_Landing_Page/247318/Untitled_design__2_.png',
			MarketArea:'Las Vegas, Nevada',
			affiliateName:'Elite Homes',
			affiliateStreetAddress:'6763 W Charleston Blvd',
			affiliateCity:'Las Vegas',
			affiliateState:'Nevada',
			affiliateBio:'The team of Lisa Song Sutton and Catherine Kuo is a vibrant partnership recognized for million-dollar sales and unparalleled client service to the most discerning of buyers and sellers, including celebrities, professional athletes, casino owners, CEOs and other high-net-worth individuals including buyers and sellers in the growing Chinese market. Both are deeply entrenched in the fabric of the city, with Sutton being a former Miss Las Vegas, penning national articles for Forbes, and hosting a daily television show airing across the city. Kuo, in addition to proven success in real estate, has extensive experience in commercial and residential investments, property management, commercial leasing, investment sales, and 1031 exchanges.',
			affiliateWebsite:'https://www.elitehomes.us/',
			affiliateLogoUrl:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/ckeditor_assets/pictures/root/Affiliate_Logos/247315/Screen_Shot_2020-08-11_at_2.13.29_PM.png',
			affiliateHeaderImage:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/assets/uploads/page/banner_image/1822273/cdea8440b82d2035409d07da1b0369a8.jpg',
			listing1StreetAddress:'La Villa Gialla',
			listing1City:'Henderson',
			listing1State:'Nevada ',
			listing1Description:'Positioned on an exclusive parcel in the double-gated Marseilles South Shore neighborhood of Lake Las Vegas, La Villa Gialla is introduced to the market for the first time. Built in 2005, the Mediterranean-inspired estate is being offered by Elite Homes, the exclusive Las Vegas affiliate of Christie\'s International Real Estate. The estate\'s interiors are the work of celebrated designer Tony Grant of Las Vegas\'s award-winning Grant Design Group. The home boasts a variety of imported custom finishes throughout, including a main-level floor of ¾-inch-thick Jerusalem gold-hued natural stone imported from Italy. Many of the home\'s appointments are hand-made and custom-designed, including the entry door of hand-forged iron; a main staircase of hand-crafted balustrades and handrails; an imported dining-room table; a chandelier of hand-blown Murano glass imported from Italy; as well as a majority of its furnishings – including chairs, sofas, tables, and headboards. The furniture can be included in the sale.The three-level home, built on a cascading lot to optimize the views, is entered by a gated stone driveway from the fairway side of the property and is distinguished by its elegant aged-stone columns and arches. A generous living room and raised formal dining room are ideal for entertaining, complete with a modern chef\'s kitchen, butler\'s pantry and a lower level wine cellar, adjacent to the home theatre, offering storage for hundreds of bottles. No detail was spared in accommodating grandeur. Ornate crown molding, customized for each bedroom fill the property. A beautiful library and office space are also found on the main floor. All 3 levels of the home feature spacious laundry rooms and easy access to the elevator. The entire third floor of the home is devoted to the master suite, with an ornate aged-stone fireplace as the bedroom\'s centerpiece.',
			listing1Price:'$7,950,000',
			listing1Image:'https://img.gtsstatic.net/reno/imagereader.aspx?imageurl=http%3A%2F%2FRealEstateAdminImages.gabriels.net%2F170%2F82541%2F170-120200309015149154-633.jpg&option=N&idlisting=listingmedia&w=1600&permitphotoenlargement=false&fallbackimageurl=https%3A%2F%2Fstatic-christiesrealestate-cms-production.gtsstatic.net%2Fresources%2F_responsive%2Fimages%2Fcommon%2Fnophoto%2Flisting.jpg',
			listing1Url:'https://www.christiesrealestate.com/sales/detail/170-l-82541-2003090029080098/la-villa-gialla-lake-las-vegas-henderson-nv-89011',
			listing2StreetAddress:'2885 Red Arrow Drive',
			listing2City:'Las Vegas ',
			listing2State:'Nevada',
			listing2Description:'Situated against the foothills of Las Vegas, Red Rock Canyon National Park, this 5-bedroom estate built by Leroy Loerwald is located in the premier, double guard-gated community of Red Rock Country Club. Meticulously designed landscaping surrounds a wide stone walkway leading to the impressive two-story grand portico. Travertine floors, a beautiful wrought-iron spiraling staircase, and high ceilings with crown molding greet you at the front entry, along with an open floor plan that allows for mountain and golf course views from large windows and glass doors showcasing the main back patio. The home offers both style and comfort in its bright, airy spaces filled with exquisite premium finishes like the family room\'s built-in entertainment center and the large stone fireplace in the main living area. Being so close to Red Rock Canyon, yet near the city, you may be surprised to see the occasional wildlife criss-crossing your property',
			listing2Price:'$2,490,000',
			listing2Image:'https://img.gtsstatic.net/reno/imagereader.aspx?imageurl=http%3A%2F%2FRealEstateAdminImages.gabriels.net%2F170%2F82541%2F170-2020030519162212-243.jpg&option=N&idlisting=listingmedia&w=1600&permitphotoenlargement=false&fallbackimageurl=https%3A%2F%2Fstatic-christiesrealestate-cms-production.gtsstatic.net%2Fresources%2F_responsive%2Fimages%2Fcommon%2Fnophoto%2Flisting.jpg',
			listing2Url:'https://www.christiesrealestate.com/sales/detail/170-l-82541-2003051837039241/2885-red-arrow-drive-summerlin-las-vegas-nv-89135',
			listing3StreetAddress:'',
			listing3City:'',
			listing3State:'',
			listing3Description:'',
			listing3Price:'',
			listing3Image:'',
			listing3Url:'',
			affiliateToDo1Title:'Visit The Hoover Damn',
			affiliateToDo1Description:'When you\'re in Las Vegas, visiting the Hoover Dam is a must-see. You have plenty of photo ops at prime lookout points and be back in Sin City for more entertainment in less than 45 minutes. You can enjoy an incredible birds eye view of the Dam and Colorado River. ',
			affiliateToDo1Image:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/ckeditor_assets/pictures/root/Elite_Homes_Landing_Page/247322/Untitled_design__2__copy.png',
			affiliateToDo2Title:'See a Show ',
			affiliateToDo2Description:'No matter who you are or what you like, odds are Las Vegas has a show you will enjoy. With preformers form all ages and genres, there\'s truly something for everyone on the Las Vegas show strip. Las Vegas shows are known around the world for being some of the most ',
			affiliateToDo2Image:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/ckeditor_assets/pictures/root/Elite_Homes_Landing_Page/247324/Untitled_design__2__copy_2.png',
			affiliateToDo3Title:'Hit the Casinos ',
			affiliateToDo3Description:'Nortious for their night life and abundence of casinos, there\'s no palce better to hit the slots than Las Vegas itself! ',
			affiliateToDo3Image:'https://b386363e680359b5cc19-97ec1140354919029c7985d2568f0e82.ssl.cf1.rackcdn.com/ckeditor_assets/pictures/root/Elite_Homes_Landing_Page/247326/Untitled_design__2__copy_3.png'
		};
		console.log(request.cityname + " -> found all cities inside router.get function");
		return response.render('global-properties-region-city', {
			cities: vegas
		});
	}
);
// ---------------------------------------
// Get Affiliate page by City Name


















module.exports = router;

 