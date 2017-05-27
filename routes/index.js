var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendfile("./views/index.html");
});
/*router.get('/222', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendfile("./views/222.html");
});*/

module.exports = router;
