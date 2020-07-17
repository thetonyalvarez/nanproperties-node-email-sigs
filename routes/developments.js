var express = require('express');
var router = express.Router();

const got = require('got')

const metascraper = require('metascraper')([
    //- require('metascraper-author')(),
    //- require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    //- require('metascraper-logo')(),
    //- require('metascraper-clearbit')(),
    //- require('metascraper-publisher')(),
    //- require('metascraper-title')(),
    //- require('metascraper-url')()
])




const csvToJson = require("csv-file-to-json");
const developmentsall = csvToJson({
    filePath: "./assets/csv/developments-landing-page/Our Developments_ Landing Page - Export Sheet.csv",
    separator: ",",
    hasHeader: true
});

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
// console.log(developmentsvalues[1])
const developmentsCleaned = [];
developmentsvalues.forEach(value => {
    
    // objectArray.find(item => item.builderName)
    // builderNameCleaned = value.replace(/ +/g, "")
    const builderNameLower = value.BuilderName.toLowerCase()
    const builderNameCleaned = builderNameLower.replace(/ +/g, "-")
    
    value.builderNameCleaned = builderNameCleaned
    
    // console.log(developmentsvalues)
    
    const list = developmentsvalues
    // console.log(Array.isArray(list))

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

// console.log(cityList);

/* GET Our Developments Page. */
// router.get('/', function (req, res, next) {
//     res.render('taxonomy-developments', {
//         developments: developments
//     });
// });



// console.log(developmentsCleaned.flat().length)

var findAllDevelopments = function (request, response, callback) {
    // if (request.params.builder) {
		
		const devs = developmentsall;
		const devresult = devs.filter(dev => dev['Builder Slug URL (for Nan Site)'] === request.params.builder);
		request.devresult = devresult;
		if (!devresult)
			return callback(new Error(
				'Nothing matching ' +
				request
			));
		return callback(null, devresult);
	
}


var findBuilderByBuilderName = function (builder, callback) {


	const devresult = developmentsall.filter(dev => dev['BuilderSlugURL(forNanSite)'] === builder);


    const developmentsCleaned2 = developmentsCleaned.flat()
    // developmentsall.forEach(element => console.log(element))
	
    const result = developmentsCleaned2.find(item => item.builderNameCleaned === builder);

    // const getVideoId = require('get-video-id');

    // const videoUrl = result.listingVideo

    // result.videoid = (getVideoId(videoUrl).id)

    
    // Get Video ID from YouTube link
    // const getVideoId = require('get-video-id');
    // const videoUrl = result.builderVideoLink
    // result.videoid = (getVideoId(videoUrl).id)

    if (!result)
        return callback(new Error(
            'No builder matching ' +
            builder
        ));

    return callback(null, devresult);

    };




// var findBuilderByBuilderName2 = function (builder, callback) {
//     // Perform database query that calls callback when it's done
//     // This is our fake database!

//     const result = builders.find(item => item.builderUrlSlug === builder);
//     console.log(builders)
//     // console.log(result.BuilderDevelopmentLink1)

//     const getVideoId = require('get-video-id');

//     const videoUrl = result.builderVideoLink

//     // console.log(getVideoId(videoUrl).id)

//     result.videoid = (getVideoId(videoUrl).id)

//     const link1Image = []
    

//     /* SCRAPING SCRIPT
//     let testing = async xyz => {
//         const {
//             body: html,
//             url
//         } = await got(xyz)
//         const metadata = await metascraper({
//             html,
//             url
//         })
//         console.log(metadata)
//         return metadata
//     }
    
    
//     testing(result.BuilderDevelopmentLink1).then(
//         async () => {
//             const image1 = await testing(result.BuilderDevelopmentLink1)
//             // result.image1link = Object.values(image1)
//             result.image1link = (image1.image)

//         }
//     )


    
//     testing(result.BuilderDevelopmentLink2).then(
//         async () => {
//             const image2 = await testing(result.BuilderDevelopmentLink2)
//             // result.image1link = Object.values(image1)
//             result.image2link = (image2.image)
//             //console.log((image2))

//         }
//     )


     
//     testing(result.BuilderDevelopmentLink3).then(
//         async () => {
//             const image3 = await testing(result.BuilderDevelopmentLink3)
//             // result.image1link = Object.values(image1)
//             result.image3link = (image3.image)
//             // console.log((image3))

//         }
//     )
//     */



//     if (!result)
//         return callback(new Error(
//             'No builder matching ' +
//             builder
//         ));

//     return callback(null, result);

// };

var findBuilderByBuilderNameMiddleware = function (request, response, next) {
    if (request.params.builder) {
        // console.log('Builder param was detected: ', request.params.builder)
        findBuilderByBuilderName(request.params.builder, function (error, user) {
			if (error) return next(error);
			
			// request.devs = devs;
			// console.log(request.devresult)

			request.user = user;
            return next();
        })
    } else {
        return next();
    }
}


/* GET Our Developments Ads Page. */
router.get('/', function (req, res, next) {
	// Remove inactive listings + 
	var aa = developments.filter(d => d.DevelopmentStatus !== "-- REMOVE");

	var a = aa.filter(d => d.DevelopmentCityorNeighborhood !== "");

	// console.log(a)
	
	var d = [];
	a.forEach(b => d.push(b.DevelopmentCityorNeighborhood)) ;
	
	var e = d.filter((c, index) => d.indexOf(c) === index);
	
	// console.log(e);

	res.render('taxonomy-developments-ads', {
        devs: developments,
        cities: e.sort()
    });
});


// The v2 routes that use the custom middleware
router.get('/:builder',
    findBuilderByBuilderNameMiddleware,  findAllDevelopments,
    function (request, response, next) {
		// console.log(request.user);
		return response.render('single-builder', {
			builder: request.user[0],
			devs: request.user
		});
    }
);



/* GET Our Developments: Builder: Community Page. */
router.get('/:builderName/:communityName', function (req, res, next) {
    res.render('single-development', {
        developments: developments
    });
});

module.exports = router;