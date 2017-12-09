var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Sun Smart, Powered by Brooks, Kuan, Zawada.' });
});

module.exports = router;
