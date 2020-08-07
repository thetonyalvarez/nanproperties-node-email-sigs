const express       = require('express');
const router        = express.Router();
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

router.param('cityname', function (request, response, next, cityname) {
    console.log(
        'City param was is detected: ',
        cityname, "DONE!"
    )
    findCitybyCityname(
        cityname,
        function (error, city) {
            if (error) return next(error);
            request.city = city;
            // console.log("this is the city:", city);
            return next();
        }
    );
});

/* GET Global Properties Page. */
router.get('/', function (req, res, next) {
    res.render('global-properties', {
		countries: affiliateCountries.sort(),
		cities: affiliateValues
    });
});

router.get('/:regionname', function (request, response, next) {
    var finallist = request.region;
    // console.log("var is:", finallist, "DONE!")
    return response.render('global-properties-region', {
        cities: finallist.sort(),
		continent: finallist[0].Continent,
		countries: affiliateCountries
    });
});


router.get('/:regionname/:cityname', function (request, response, next) {
    var finallist = request.city;
    console.log(finallist[0].affiliateCity);

    return response.render('global-properties-region-city', {
        items: finallist,
        city: finallist[0].affiliateCity
    });

});


/*
var findRegionByRegionname = function (regionname, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!

    // const result = affiliateValues.map(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    // const result = affiliateValues.filter(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    const result = affiliatesRaw.filter(item => item.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'') === regionname);
    
    // console.log(result)
    console.log(typeof(result))

    if (!result)
        return callback(new Error(
            'No user matching ' +
            regionname

        ));

    return callback(null, result);

};

var findRegionByRegionnameMiddleware = function (request, response, next) {
    if (request.params.regionname) {
        console.log('Region param was detected: ', request.params.regionname)
        findRegionByRegionname(request.params.regionname, function (error, region) {
            if (error) return next(error);
            request.region = region;
            return next();
        })
    } else {
        return next();
    }
}

// The v2 routes that use the custom middleware
router.get('/:regionname', findRegionByRegionnameMiddleware, function(request, response, next) {
    return response.render('global-properties-region', request.region);
  });
*/


module.exports = router;

 