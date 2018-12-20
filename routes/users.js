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
router.get('/dashboard',auth.check_login,auth.check_user, usersController.getDashboard)

//profil
router.get('/profil',auth.check_login,auth.check_user, usersController.getProfil)
router.post('/profil',auth.check_login,auth.check_user, usersController.postProfil)

//referrals
router.get('/referrals',auth.check_login,auth.check_user, usersController.getRef)

//pembayaran
router.get('/payment-information',auth.check_login,auth.check_user, usersController.getPaymentInformation)
router.get('/payment-confirm/:id',auth.check_login,auth.check_user, usersController.getPaymentConfirm)
router.post('/payment-confirm/:id',auth.check_login,auth.check_user, usersController.postPaymentConfirm)



router.get('/withdraw', auth.check_login,auth.check_user, usersController.getWithdraw)
router.post('/withdraw', auth.check_login,auth.check_user, usersController.postWithdraw)

//deposit
router.get('/deposit', auth.check_login,auth.check_user, usersController.getDeposit)
router.post('/deposit', auth.check_login,auth.check_user, usersController.postDeposit)

//list
router.get('/investmentList', auth.check_login,auth.check_user, usersController.getInvestmentList)
router.get('/withdrawList', auth.check_login,auth.check_user, usersController.getWithdrawList)
router.get('/earningList', auth.check_login,auth.check_user, usersController.getEarningList)

//logout
router.get('/logout.user', auth.check_login,auth.check_user, usersController.getLogout)


module.exports = router;
