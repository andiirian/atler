var express = require('express');
var router = express.Router();
var usersController = require('../controllers/UsersController')
var auth = require('../Middleware/auth')

/* GET users listing. */
//login
router.get('/login', usersController.getLogin);
router.post('/login', usersController.postLogin);

//register
router.get('/register', usersController.getRegister);
router.get('/register/:ref',usersController.getRegisterRef);
router.post('/register', usersController.postRegister)

//dashboard
router.get('/dashboard',auth.check_login, (req, res, next) =>{res.render('users/dashboard')})

//profil
router.get('/profil',auth.check_login, usersController.getProfil)
router.post('/profil',auth.check_login, usersController.postProfil)

//referrals
router.get('/referrals',auth.check_login, usersController.getRef)

router.get('/withdraw', auth.check_login, usersController.getWithdraw)
router.get('/deposit', auth.check_login, usersController.getDeposit)
//logout
router.get('/logout.user', auth.check_login, usersController.getLogout)


module.exports = router;
