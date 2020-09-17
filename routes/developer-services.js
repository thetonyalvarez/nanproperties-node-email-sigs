var express = require('express');
var router = express.Router();

/* GET services page. */
router.get('/services', function(req, res, next) {
    res.render('developer-services');
});
  
/* GET team page. */
router.get('/team', function(req, res, next) {
    res.render('developer-team');
});
  
/* GET team page. */
router.get('/builders', function(req, res, next) {
    res.render('developer-builders');
});
  
/* GET properties page. */
router.get('/properties', function(req, res, next) {
    res.render('developer-properties');
});
  
/* GET properties page. */
router.get('/', function(req, res, next) {
    res.render('developer-landing-page');
});
  
module.exports = router;