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
  
module.exports = router;