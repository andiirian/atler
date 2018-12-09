var db = require('../models/models')
var passwordhash = require('password-hash')

var session_store;
module.exports = {
    //login
    getLogin: (req, res, next) =>{
        res.render('users/login');
    },
    postLogin: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT password FROM users WHERE ? ', {username: req.body.username}, (err, row)=> {
            if (row.length == 0) {
                res.send('tidakada')
            }else{
                
                if (passwordhash.verify(req.body.password, row[0].password)) {
                  session_store.username = req.body.username
                  session_store.logged_in = true;
                  res.redirect('/users/dashboard')
                }else{
                    res.send('salah')
                }
            }
        })
      
    },

    //register
    getRegister: (req, res, next) =>{
        res.render('users/register',{ref: null})
    },
    getRegisterRef: (req, res, next) =>{
        res.render('users/register', {ref: req.params.ref})
    },
    postRegister: (req, res, next) =>{
        session_store = req.session
        var data = {
            username: req.body.username,
            nama    : req.body.nama,
            email   : req.body.email,
            password: passwordhash.generate(req.body.password),
            ref: req.body.ref[0]
        }
       
        db.query('insert into users set ?', data, (err, field) =>{
            if (err) {
                throw err
            }else{
              session_store.username = req.body.username
              session_store.logged_in = true;
              res.redirect('/users/dashboard')
            }
        })
    },

    //profil
    getProfil: (req, res, next) => {
        session_store = req.session;
        db.query('SELECT * FROM users WHERE ?', {username: session_store.username}, (err, result) =>{
           
            res.render('users/profil',{result: result})
        })
        
    },
    postProfil: (req, res, next) =>{
        session_store = req.session
        db.query('UPDATE users set ? where ?',[
            {
                nama: req.body.nama,
                contact: req.body.contact,
                norek: req.body.norek,
                password: passwordhash.generate(req.body.password)
            },
            {
                username: session_store.username
            }
        ], (err) =>{
            if (err) {
                throw err
            }
            res.redirect('/users/dashboard')
        })
        

        
       

    },

    //withdraw
    getWithdraw: (req, res, next) =>{
        res.render('users/withdraw')
    },

    //deposit
    getDeposit: (req, res, next) =>{
        res.render('users/deposit')
    },

    getRef: (req, res, next) => {
        session_store = req.session
        db.query('select * from users where ? ', {ref: session_store.username}, (err, result) =>{
            if (err) {
                throw err
            }
            res.render('users/referrals', {ref: session_store.username, result: result})
        })
             
        
    },
    //logout

    getLogout: (req,res, next) =>{
        req.session.destroy(function(err) {
            if (err) {
                throw err
            }
            res.redirect('/users/login')
          })
    }
}