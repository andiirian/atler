var express = require('express');
var router = express.Router();
var usersController = require('../controllers/UsersController')
var auth = require('../Middleware/auth')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
/* GET users listing. */
//login
router.get('/login', csrfProtection, usersController.getLogin, );
router.post('/login', csrfProtection, usersController.postLogin);

//register
router.get('/register', csrfProtection,usersController.getRegister);
router.get('/register/:ref',csrfProtection,usersController.getRegisterRef);
router.post('/register', csrfProtection,usersController.postRegister)

//dashboard
router.get('/dashboard',auth.check_login,auth.check_user, usersController.getDashboard)

//profil
router.get('/profil',auth.check_login,auth.check_user,csrfProtection, usersController.getProfil)
router.post('/profil',auth.check_login,auth.check_user,csrfProtection, usersController.postProfil)

//referrals
router.get('/referrals',auth.check_login,auth.check_user, usersController.getRef)

//pembayaran
router.get('/payment-information',auth.check_login,auth.check_user, usersController.getPaymentInformation)
router.get('/payment-confirm/:id',auth.check_login,auth.check_user, usersController.getPaymentConfirm)
router.post('/payment-confirm/:id',auth.check_login,auth.check_user, usersController.postPaymentConfirm)



router.get('/withdraw', auth.check_login,auth.check_user,csrfProtection, usersController.getWithdraw)
router.post('/withdraw', auth.check_login,auth.check_user,csrfProtection, usersController.postWithdraw)

//deposit
router.get('/deposit', auth.check_login,auth.check_user,csrfProtection, usersController.getDeposit)
router.post('/deposit', auth.check_login,auth.check_user,csrfProtection, usersController.postDeposit)

//list
router.get('/investmentList', auth.check_login,auth.check_user, usersController.getInvestmentList)
router.get('/withdrawList', auth.check_login,auth.check_user, usersController.getWithdrawList)
router.get('/earningList', auth.check_login,auth.check_user, usersController.getEarningList)

//logout
router.get('/logout.user', auth.check_login,auth.check_user, usersController.getLogout)


module.exports = router;
