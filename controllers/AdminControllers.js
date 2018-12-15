var db = require('../models/models')
var passwordhash = require('password-hash')
module.exports = {

    getDashboard: (req, res, next) =>{
        session_store = req.session
        var data = []
        db.query('SELECT sum(investasi) AS investasi FROM tbl_investasi WHERE status = 2 OR status = 4 ', (err, result) =>{
           data.push(result)
           db.query('SELECT sum(withdraw) AS withdraw FROM tbl_withdraw WHERE status = 1', (err, result) =>{
               data.push(result)
               db.query('SELECT * FROM users WHERE status = 1',(err, result) => {
                   data.push(result)
                   db.query('SELECT * FROM users WHERE status = 0',(err, result) => {
                    data.push(result)
                   
                    res.render('admin/dashboard', {result: data, user: session_store.nama})
                })
               })
           })
        })
    },

    //Login
    getLogin: (req, res, next) =>{
        res.render('admin/login')
    },
    postLogin: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT password, nama, status FROM users WHERE ? AND ? ', [{username: req.body.username}, {status: 1}], (err, row)=> {
            if (row.length == 0) {
                res.send('tidakada')
            }else{
                
                if (passwordhash.verify(req.body.password, row[0].password)) {
                  session_store.username = req.body.username
                  session_store.nama = row[0].nama
                  session_store.logged_in = true;
                  session_store.status = row[0].status
                  res.redirect('/admin/dashboard')
                }else{
                    res.send('salah')
                }
            }
        })
    },

    //register
    getRegister: (req, res, next) =>{
        res.render('admin/register',{user: session_store.nama});
    },
    postRegister: (req, res, next) =>{
        var data = {
            username: req.body.username,
            nama    : req.body.nama,
            email   : req.body.email,
            password: passwordhash.generate(req.body.password),
            contact: req.body.contact,
            status  : 1
        }

        db.query('INSERT INTO users set ? ',data, (err) =>{
            if (err) {
                throw err
            }
            res.redirect('/admin/dashboard')
        })
    },
    getDeposit: (req, res, next) =>{
        var data = []
        db.query('SELECT * FROM tbl_payment WHERE status = 0',(err, result) =>{
            data.push(result);
        db.query('SELECT * FROM tbl_payment WHERE status > 0', (err, result) =>{
            data.push(result)
            res.render('admin/deposit', {result: data, user: session_store.nama})
        })
        })
    },
    getDeposit1: (req, res, next) =>{
        if (req.params.status == 1) {
            db.query(`UPDATE tbl_payment set status = ${req.params.status}  WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                if (err) {
                    throw err
                }
                db.query(`UPDATE tbl_investasi set status = 2, date = CURRENT_TIMESTAMP() WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                    if (err) {
                        throw err
                    }
                    res.redirect('/admin/deposit')
                })
            })
        }else if(req.params.status == 0){
            db.query(`UPDATE tbl_payment set status = ${req.params.status} WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                if (err) {
                    throw err
                }
                db.query(`UPDATE tbl_investasi set status = 3 WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                    if (err) {
                        throw err
                    }
                    res.redirect('/admin/deposit')
                })
            })
        }else{
            res.redirect('/admin/deposit')
        }
    },

    //withdraw 
    getWithdraw: (req, res, next) =>{
        var data = [];
        db.query('SELECT * FROM tbl_withdraw WHERE status = 0', (err, result) =>{
            if (err) {
                throw err
            }
            data.push(result)
            db.query('SELECT * FROM tbl_withdraw WHERE status = 1 OR status = 2', (err, result) =>{
                if (err) {
                    throw err
                }
                data.push(result)
                res.render('admin/withdraw', {result: data, user: session_store.nama})
            })
        })
    },
    getWithdraw1: (req, res, next) =>{
        if (req.params.status == 1) {
            db.query(`UPDATE tbl_withdraw set status = ${req.params.status} WHERE ? `, {user: req.params.user}, (err) =>{
                res.redirect('/admin/withdraw')
            })
        }else if(req.params.status == 2){
            db.query(`UPDATE tbl_withdraw set status = ${req.params.status} WHERE ? `, {user: req.params.user}, (err) =>{
                res.redirect('/admin/withdraw')
            })
        }else{
            res.redirect('/admin/withdraw')
        }
    },

    getProfil: (req, res, next) =>{
        session_store = req.session;
        db.query('SELECT * FROM users WHERE ?', {username: session_store.username}, (err, result) =>{
           
            res.render('admin/profil',{result: result, user: session_store.nama})
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
            res.redirect('/admin/dashboard')
        })
        

        
       

    },

    getLogout: (req,res, next) =>{
        req.session.destroy(function(err) {
            if (err) {
                throw err
            }
            res.redirect('/admin/login')
          })
    }
}