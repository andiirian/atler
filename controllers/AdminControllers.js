var db = require('../models/models')
var passwordhash = require('password-hash')
var session_store;
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
                   db.query('SELECT tx_id, investasi, date, status, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo  FROM tbl_investasi WHERE status = 2 OR STATUS = 4',
                    (err, result) =>{
                        data.push(result)
                        res.render('admin/dashboard', {result: data, user: session_store.nama})
                   })
                    
                })
               })
           })
        })
    },

    //Login
    getLogin: (req, res, next) =>{
        res.render('admin/login',{message: null, csrfToken: req.csrfToken()})
    },
    postLogin: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT password, nama, status FROM users WHERE ? AND ? ', [{username: req.body.username}, {status: 1}], (err, row)=> {
            if (row.length == 0) {
                res.render('admin/login',{message: "username is not ready exist.",csrfToken: req.csrfToken()})
            }else{
                
                if (passwordhash.verify(req.body.password, row[0].password)) {
                  session_store.username = req.body.username
                  session_store.nama = row[0].nama
                  session_store.logged_in = true;
                  session_store.status = row[0].status
                  res.redirect('/admin/dashboard')
                }else{
                    res.render('admin/login', {message: "password is wrong",csrfToken: req.csrfToken()})
                }
            }
        })
    },

    //register
    getRegister: (req, res, next) =>{
        res.render('admin/register',{user: session_store.nama, message: null, csrfToken: req.csrfToken()});
    },
    postRegister: (req, res, next) =>{
        session_store = req.session
        var message = [];
       const promiseA  = new Promise((resolve, reject) => {
           db.query("SELECT username FROM users WHERE ?", {username: req.body.username}, (err, result)=>{
               if (result.length != 0 ) {
                    resolve("username is a ready exist")          
                           // message = "username is a ready exist"      
                }
                    resolve(null)                
           })
       })
       const promiseB = new Promise((resolve, reject) =>{
        db.query("SELECT email FROM users WHERE ? ",{email: req.body.email},(err, result) =>{
                    if (result.length != 0) {
                        resolve("email is a ready exist")    
                    }
                    resolve(null)  
                })

       })

       promiseA
        .then((text)=>{
            message.push(text);
            return promiseB
        })
        .then((text)=> {
            message.push(text)
            if (message[0] == null && message[1] == null) {
           var data = {
            username: req.body.username,
            nama    : req.body.nama,
            email   : req.body.email,
            password: passwordhash.generate(req.body.password),
            
            status: 1
        }
       
        db.query('insert into users set ?', data, (err, field) =>{
            if (err) {
                throw err
            }else{
              
              res.redirect('/admin/dashboard')
            }
        })
            }else{ 
                res.render('admin/register',{user: session_store.username, message: message,csrfToken: req.csrfToken()})
            }
        })
    },
    getDeposit: (req, res, next) =>{
        var data = []
        db.query('SELECT * FROM tbl_payment WHERE status = 0',(err, result) =>{
            data.push(result);
        db.query('SELECT * FROM tbl_payment WHERE status > 0', (err, result) =>{
            data.push(result)
            // console.log(data[1])
            // res.end()
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
                    res.redirect('/admin/investment')
                })
            })
        }else if(req.params.status == 2){
            db.query(`UPDATE tbl_payment set status = ${req.params.status} WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                if (err) {
                    throw err
                }
                db.query(`UPDATE tbl_investasi set status = 3, investasi = 0 WHERE ?`, {tx_id: req.params.tx_id}, (err) =>{
                    if (err) {
                        throw err
                    }
                    res.redirect('/admin/investment')
                })
            })
        }else{
            res.redirect('/admin/investment')
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
            db.query(`UPDATE tbl_withdraw set status = ${req.params.status} WHERE ? `, {id_trx: req.params.id_trx}, (err) =>{
                res.redirect('/admin/withdraw')
            })
        }else if(req.params.status == 2){
            db.query(`UPDATE tbl_withdraw set status = ${req.params.status} WHERE ? `, {id_trx: req.params.id_trx}, (err) =>{
                res.redirect('/admin/withdraw')
            })
        }else{
            res.redirect('/admin/withdraw')
        }
    },

    getProfil: (req, res, next) =>{
        session_store = req.session;
        db.query('SELECT * FROM users WHERE ?', {username: session_store.username}, (err, result) =>{
           
            res.render('admin/profil',{result: result, user: session_store.nama, csrfToken: req.csrfToken()})
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
    //event
    getEvent: (req, res, next)=>{
        session_store = req.session
        res.render('admin/event',{user: session_store.username,message: null, csrfToken: req.csrfToken()})
    },
    postEvent: (req, res, next)=>{
        db.query(`set global event_scheduler = ${req.body.event}`, (err) =>{
            if (err) {
                throw err
            }
            if (req.body.event == 0) {
                const message = "Anda Baru saja Menonaktifkan Event!"
                res.render('admin/event',{user: session_store.username,message: message, csrfToken: req.csrfToken()})
            }else if(req.body.event == 1){
                const message = "Anda Baru saja Mengaktifkan Event!"
                res.render('admin/event',{user: session_store.username,message: message, csrfToken: req.csrfToken()})
            }
        })
    },


    //investment list
    getinvestmentList: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT tx_id, investasi, date, status, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo  FROM tbl_investasi WHERE status = 2 OR STATUS = 4',
                    (err, result) =>{
                       
                        res.render('admin/investmentList', {data: result, user: session_store.nama})
                   })
    },
    getwithdrawList: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT * FROM tbl_withdraw WHERE status = 1 OR status = 2', (err, result) =>{
            res.render('admin/withdrawList', {data: result, user: session_store.nama})
        })
    },

    getMemberList: (req, res, next) =>{
        session_store = req.session
        db.query("SELECT username, nama, email, contact, date FROM users WHERE ?",{status: 0}, (err, result)=>{
            if (err) {
                throw err
            }
            res.render('admin/memberList', {result: result, user: session_store.username})
        })
    },
    getAdminList: (req, res, next) =>{
        session_store = req.session
        db.query("SELECT username, nama, email, contact, date FROM users WHERE ?",{status: 1}, (err, result)=>{
            if (err) {
                throw err
            }
            res.render('admin/adminList', {result: result, user: session_store.username})
        })
    },

    getDeleteAdmin: (req, res, next) =>{
        db.query("SELECT username FROM users WHERE ? ", {username: req.params.username},(err, result) =>{
            if (result.length == 0) {
                res.redirect("/admin/adminList")
            }else{
                db.query("DELETE FROM users WHERE ? ", {username: req.params.username},(err) =>{
                    if (err) {
                        throw err
                    }
                    res.redirect('/admin/adminList')
                })
            }
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