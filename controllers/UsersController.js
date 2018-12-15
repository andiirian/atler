var db = require('../models/models')
var passwordhash = require('password-hash')
var multer = require('multer')
var path         = require('path')

var session_store;
module.exports = {
    //Dashboard
    getDashboard: (req, res, next) =>{
        session_store = req.session
       

        var data = [];
        const total= [];

            const promiseA = new Promise((resolve, reject) =>{
                db.query(`SELECT *, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo FROM tbl_investasi WHERE ?`, {user: session_store.username}, (err, result) =>{
                    if(err) reject(err)
                    resolve(result)
                })
            })
            const promiseB = new Promise((resolve, reject) =>{
                db.query(`SELECT SUM(dompet) AS dompet, SUM(pendapatan) AS pendapatan FROM tbl_investasi WHERE status > 1  AND ?`,
                            {user : session_store.username}
                            
                            ,(err, row) =>{
                                total.push(row)
                                db.query(`SELECT SUM(investasi) AS investasi FROM tbl_investasi WHERE status > 1 AND ?`, 
                                {user: session_store.username}
                               ,(err, row) =>{
                                   total.push(row)
                                    db.query(`SELECT SUM(withdraw) AS withdraw FROM tbl_withdraw WHERE status = 1 AND ?`, 
                                         {user: session_store.username}
                                       ,(err, row) =>{
                                       if (row.length == 0) {
                                           const i = [{withdraw: 0}]
                                           total.push(i)
                                       }else{
                                           total.push(row)
                                           resolve(total)
                                       }
                                       });
                                });
                            });
            })
            promiseA
                .then(result =>{
                    data.push(result);
                 
                    return promiseB
                })
                .then(result =>{
                    const t = {dompet: result[0][0].dompet - result[2][0].withdraw};
                    total.push(t)
                  
                    res.render('users/dashboard', {result: data, total: total})
                })
    },


    //login
    getLogin: (req, res, next) =>{
        res.render('users/login');
    },
    postLogin: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT password, status FROM users WHERE ? ', {username: req.body.username}, (err, row)=> {
            if (row.length == 0) {
                res.send('tidakada')
            }else{
                
                if (passwordhash.verify(req.body.password, row[0].password)) {
                  session_store.username = req.body.username
                  session_store.logged_in = true;
                  session_store.status = row[0].status
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
              session_store.status = 0;
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
        db.query(`SELECT * FROM tbl_withdraw WHERE ?`, {user: session_store.username}, (err, result) =>{
            if (err) {
                throw err
            }
           
            res.render('users/withdraw', {result: result})
        })
    },
    postWithdraw: (req, res, next) =>{
        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMfhjbnxfnfgfNOPQRSTUVWXYZabcdefgsgdfdhfgdrhdvcxdfghjmnSDGFHUJMNBVvfgffbvcdfhyuiuoipiiuydgnbvnrewxbcbvmhhijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < 30; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
          }
          var data1 = [];
          

          var data = {
                id_trx: 'TRX'+makeid(),
                user  : session_store.username,
                bank  : req.body.bank,
                norek : req.body.norek,
                withdraw : req.body.amount,
                status  : 0  
          }

          db.query(`SELECT SUM(dompet) AS dompet FROM tbl_investasi WHERE status > 1  AND ?`,
             {user : session_store.username},(err, row)=>{
                 if (err) {
                     throw err
                 }
                 
                data1.push(row)
                db.query(`SELECT SUM(withdraw) AS withdraw FROM tbl_withdraw WHERE status = 1 AND ?`, 
                {user: session_store.username}
              ,(err, row)=>{
                  if (err) {
                      throw err
                  }
               var data0 = data1[0][0].dompet - row[0].withdraw

                if (data0 > data.withdraw) {
                     db.query(`INSERT INTO tbl_withdraw set ?`, data, (err) =>{
                         if (err) {
                          throw err
                         }

                          res.redirect('/users/withdraw')
                     })
                }else{
                    res.redirect('/users/withdraw')
                }
              })
             

          })

       


    },
    

    //deposit
    getDeposit: (req, res, next) =>{
        res.render('users/deposit')
    },

    postDeposit: (req, res, next) =>{
        session_store = req.session
        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMfhjbnxfnfgfNOPQRSTUVWXYZabcdefgsgdfdhfgdrhdvcxdfghjmnSDGFHUJMNBVvfgffbvcdfhyuiuoipiiuydgnbvnrewxbcbvmhhijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < 30; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
          }
          function dana(i) {
              var a;
              if (i == 500000) {
                  a = 500
              }else if (i == 1000000){
                  a = 1000
              }else if(i == 1500000){
                  a = 1500
              }

              return a;
          }
          var data = {
              id  : 'TDX'+makeid(),
              user: session_store.username,
              amount: req.body.amount,
              dana  : dana(req.body.amount)

          }
          var data1 = {
              tx_id: data.id,
              user : session_store.username,
              dompet: dana(req.body.amount),
              investasi: dana(req.body.amount),
              status: 0,
              pendapatan: 0
          }
          
          var asy = async () =>{
           await db.query("INSERT INTO tbl_deposit set ?", data)
           await db.query("INSERT INTO tbl_investasi set ?", data1)
          }

          asy().then(()=>{
          })
          res.render('users/paymentInformation',{data: data})
        },

    //payment
    getPaymentInformation: (req, res, next) =>{
        res.render('users/paymentInformation')
    },
    getPaymentConfirm: (req, res, next) =>{
        // const tanggal = new Date()
        // const tgl = tanggal.getHours()+":"+tanggal.getMinutes()+":"+tanggal.getSeconds()
        
        // res.end(tgl)
        session_store = req.session
        db.query(`SELECT status, tx_id FROM tbl_investasi WHERE ? AND ?`,[{user: session_store.username}, {tx_id: req.params.id}],
        (err, row) =>{
            if (err) {
                throw err
            }
            else{
                if (row.length == 0 || row[0].status > 0) {
                    res.redirect('/users/dashboard')
                }else{
                    res.render('users/paymentConfirm', {result: row})
                }

            }
        })
            
        
    },

    postPaymentConfirm: (req, res, next)=>{
        session_store = req.session;

        const storage = multer.diskStorage({
            destination : path.join(__dirname + './../public/images/bukti/'),
            filename: function(req, file, cb){
                cb(null, file.fieldname + '-' + Date.now() +
                '.jpg');
            }
        });
    
        const upload = multer({
            storage : storage
        }).single('foto-bukti');
    
       var run =  async () =>{
        await upload(req, res, err => {
           if (err) {
               throw err
           }

           var data = {
               tx_id: req.body.tx_id,
               user : session_store.username,
               bank_pengirim: req.body.bank_pengirim,
               norek    : req.body.norek,
               nama_pengirim: req.body.nama_pengirim,
               total_pengirim: req.body.total_pengirim,
               bukti_transaksi: '/images/bukti/'+ req.file.filename
           }

           db.query('INSERT INTO tbl_payment set ?', data,(err) =>{
              if (err) {
                  return false
              }

              db.query('UPDATE tbl_investasi set ? WHERE ? ', [{status: 1}, {tx_id: req.body.tx_id}], (err) =>{
                  if (err) {
                      throw err
                  }
                  res.redirect('/users/dashboard')
              })
           })   
           
         });
       }

       run()
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