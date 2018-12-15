var express = require('express');
var router = express.Router();
var adminControllers = require('../controllers/AdminControllers')
var auth    = require('../Middleware/auth')
/* GET home page. */
router.get('/dashboard',auth.check_login_admin,auth.check_admin, adminControllers.getDashboard);

//profil
router.get('/profil', auth.check_login_admin,auth.check_admin, adminControllers.getProfil)
router.post('/profil', auth.check_login_admin,auth.check_admin, adminControllers.postProfil)

//login
router.get('/login', adminControllers.getLogin)
router.post('/login', adminControllers.postLogin)

//register
router.get('/register', auth.check_login_admin, auth.check_admin, adminControllers.getRegister)
router.post('/register', auth.check_login_admin, auth.check_admin, adminControllers.postRegister)

//deposit
router.get('/deposit', auth.check_login_admin, auth.check_admin, adminControllers.getDeposit)
router.get('/deposit/:tx_id/:status', auth.check_login_admin, auth.check_admin, adminControllers.getDeposit1)

//withdraw
router.get('/withdraw', auth.check_login_admin, auth.check_admin, adminControllers.getWithdraw)
router.get('/withdraw/:user/:status', auth.check_login_admin, auth.check_admin, adminControllers.getWithdraw1)

router.get('/logout.admin',auth.check_login_admin, auth.check_admin, adminControllers.getLogout)
module.exports = router;
