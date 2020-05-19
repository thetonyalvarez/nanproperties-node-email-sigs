const express = require('express');
const router = express.Router();

const csvToJson     = require("csv-file-to-json");
const affiliatesRaw        = csvToJson(
    { 
        filePath: "./assets/csv/Christie's Affiliates - cire-affiliates.csv",
        separator: ",",
        hasHeader: true
    }
);

let continentsRaw  = affiliatesRaw.map(a => a.Continent);
let continentsList = [...new Set(continentsRaw)]

/* GET Global Properties Page. */
router.get('/', function (req, res, next) {
    res.render('global-properties', {
        items: continentsList.sort()
    });
});

const affiliates = affiliatesRaw.flat(Infinity)

const affiliateKeys     = Object.keys(affiliates);
const affiliateValues   = Object.values(affiliates);
const affiliateEntries  = Object.entries(affiliates);


var findRegionByRegionname = function (regionname, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!

    // const result = affiliateValues.map(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    // const result = affiliateValues.filter(a => a.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'' === regionname));

    const result = affiliateValues.filter(item => item.Continent.toLowerCase().replace(/\s/g, '-').replace(/&./g,'') === regionname);
    

    // console.log(result)
    // console.log(typeof(result))

    if (!result)
        return callback(new Error(
            'No user matching ' +
            regionname

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
        cityname
    )
    findCityByCityname(
        cityname,
        function (error, city) {
            if (error) return next(error);
            request.city = city.substring(0, city.length - 1);;
            console.log(request.city)
            return next();
        }
    );
});

router.get('/:regionname', function (request, response, next) {
    var finallist = request.region;

    return response.render('global-properties-region', {
        items: finallist,
        continent: finallist[1].Continent
    });
});


router.get('/:regionname/:cityname', function (request, response, next) {
    var finallist = request.city;

    return response.render('global-properties-region-city', {
        items: finallist
        // continent: finallist[1].Continent,
        // locality: finallist[1].Locality
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

 