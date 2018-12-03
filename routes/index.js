var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('users/dashboard');
});
router.get('/withdraw', (req, res, next) =>{
  res.render('users/withdraw')
})
router.get('/deposit', (req, res, next) =>{
  res.render('users/deposit')
})

module.exports = router;
