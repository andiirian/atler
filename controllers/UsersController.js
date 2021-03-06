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
                db.query(`SELECT SUM(pendapatan) AS pendapatan FROM tbl_investasi WHERE status > 1  AND ?`,
                            {user : session_store.username}
                            
                            ,(err, row) =>{
                                total.push(row)
                                db.query(`SELECT SUM(investasi) AS investasi FROM tbl_investasi WHERE status > 1 AND ?`, 
                                {user: session_store.username}
                               ,(err, row) =>{
                                   total.push(row)
                                    db.query(`SELECT SUM(withdraw) AS withdraw FROM tbl_withdraw WHERE status < 2 AND ?`, 
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
                    const t = {dompet: result[0][0].pendapatan - result[2][0].withdraw};
                    total.push(t)
                  
                    res.render('users/dashboard', {result: data, total: total, user: session_store.nama})
                })
    },


    //login
    getLogin: (req, res, next) =>{
        res.render('users/login',{message: null, csrfToken: req.csrfToken()});
    },
    postLogin: (req, res, next) =>{
        session_store = req.session
        db.query('SELECT password, nama, status FROM users WHERE ? ', {username: req.body.username}, (err, row)=> {
            if (row.length == 0) {
                res.render('users/login',{message: "username is not ready exist.",csrfToken: req.csrfToken()})
            }else{
                
                if (passwordhash.verify(req.body.password, row[0].password)) {
                  session_store.nama = row[0].nama
                  session_store.username = req.body.username
                  session_store.logged_in = true;
                  session_store.status = row[0].status
                  res.redirect('/dashboard')
                }else{
                    res.render('users/login', {message: "password is wrong.", csrfToken: req.csrfToken()})
                }
            }
        })
      
    },

    //register
    getRegister: (req, res, next) =>{
        res.render('users/register',{ref: null, message: null, csrfToken: req.csrfToken()})
    },
    getRegisterRef: (req, res, next) =>{
        res.render('users/register', {ref: req.params.ref,message: null,  csrfToken: req.csrfToken()})
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
            ref: req.body.ref,
            status: 0
        }
       
        db.query('insert into users set ?', data, (err, field) =>{
            if (err) {
                throw err
            }else{
              session_store.username = req.body.username
              session_store.logged_in = true;
              session_store.nama = req.body.nama
              session_store.status = 0;
              res.redirect('/dashboard')
            }
        })
            }else{ 
                res.render('users/register',{ref: req.body.ref, message: message,csrfToken: req.csrfToken()})
            }
        })

        // db.query("SELECT username FROM users WHERE ?", {username: req.body.username}, (err, result)=>{
        //     if (result.length != 0 ) {
        //         res.send('ada')
        //         // message = "username is a ready exist"      
        //     }
        //     else{
        //         res.send("tidak ada")
        //     }
        // })
        // var validate = async () =>{
        //     var message = [];
        //     await db.query("SELECT username FROM users WHERE ?", {username: req.body.username}, (err, result)=>{
        //         if (result.length != 0 ) {
        //             message.push("username is a ready exist")
        //             // message = "username is a ready exist"              
        //         }
        //     })
        //     await db.query("SELECT email FROM users WHERE ? ",{email: req.body.email},(err, result) =>{
        //         if (result.length != 0) {
        //             message.push("email is a ready exist")        
        //         }
        //     })
        //     return message

        // }

        // validate()
        //     .then((text) =>{
        //         res.send(text)
        //     })
        // var data = {
        //     username: req.body.username,
        //     nama    : req.body.nama,
        //     email   : req.body.email,
        //     password: passwordhash.generate(req.body.password),
        //     ref: req.body.ref,
        //     status: 0
        // }
       
        // db.query('insert into users set ?', data, (err, field) =>{
        //     if (err) {
        //         throw err
        //     }else{
        //       session_store.username = req.body.username
        //       session_store.logged_in = true;
        //       session_store.nama = req.body.nama
        //       session_store.status = 0;
        //       res.redirect('/users/dashboard')
        //     }
        // })
    },

    //profil
    getProfil: (req, res, next) => {
        session_store = req.session;
        db.query('SELECT * FROM users WHERE ?', {username: session_store.username}, (err, result) =>{
           
            res.render('users/profil',{result: result, user: session_store.nama, csrfToken: req.csrfToken()})
        })
        
    },
    postProfil: (req, res, next) =>{
        session_store = req.session
        if (req.body.password == "") {
            db.query('UPDATE users set ? where ?',[
                {
                    nama: req.body.nama,
                    contact: req.body.contact,
                    norek: req.body.norek,
                    bank: req.body.bank
                    
                },
                {
                    username: session_store.username
                }
            ], (err) =>{
                if (err) {
                    throw err
                }
                res.redirect('/profil')
            })
        }else{
        db.query('UPDATE users set ? where ?',[
            {
                nama: req.body.nama,
                contact: req.body.contact,
                norek: req.body.norek,
                password: passwordhash.generate(req.body.password),
                bank: req.body.bank
            },
            {
                username: session_store.username
            }
        ], (err) =>{
            if (err) {
                throw err
            }
            res.redirect('/profil')
        })
    }

        
       

    },

    //withdraw
    getWithdraw: (req, res, next) =>{
        session_store = req.session
        var data = [];
        const promiseWithdraw = new Promise((resolve, reject) =>{
            db.query(`SELECT * FROM tbl_withdraw WHERE ?`, {user: session_store.username}, (err, result) =>{
                if (err) {
                    throw err
                }
                resolve(result)           
            })
        })
        const promiseBank = new Promise((resolve, reject) =>{
            db.query("SELECT norek, bank FROM users WHERE ? ",{username: session_store.username},(err, result) =>{
                if (err) {
                    throw err
                }

                resolve(result)
            })
        })

        promiseWithdraw
            .then(result => {
                data.push(result)
                return promiseBank
            })
            .then(result=>{
                data.push(result)
                res.render('users/withdraw', {result: data, user: session_store.nama, csrfToken: req.csrfToken()})
                
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

          db.query(`SELECT SUM(pendapatan) AS dompet FROM tbl_investasi WHERE status > 1  AND ?`,
             {user : session_store.username},(err, row)=>{
                 if (err) {
                     throw err
                 }
                 
                data1.push(row)
                db.query(`SELECT SUM(withdraw) AS withdraw FROM tbl_withdraw WHERE status < 2 AND ?`, 
                {user: session_store.username}
              ,(err, row)=>{
                  if (err) {
                      throw err
                  }
               var data0 = data1[0][0].dompet - row[0].withdraw

                if (data0 > data.withdraw && data.withdraw > 15) {
                     db.query(`INSERT INTO tbl_withdraw set ?`, data, (err) =>{
                         if (err) {
                          throw err
                         }

                          res.redirect('/withdraw')
                     })
                }else{
                    res.redirect('/withdraw')
                }
              })
             

          })

       


    },
    

    //deposit
    getDeposit: (req, res, next) =>{
        db.query(`SELECT *, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo FROM tbl_investasi WHERE ?`, {user: session_store.username}, (err, result) =>{
            if(err) reject(err)
            res.render('users/deposit',{result: result, user: session_store.nama, csrfToken: req.csrfToken()})
        })

        
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
              if (i == 3200000) {
                  a = 200
              }else if (i == 8000000){
                  a = 500
              }else if(i == 16000000){
                  a = 1000
              }else if(i == 32000000){
                a = 2000
              }else if(i == 80000000){
                a = 5000
              }else if(i == 160000000){
                  a = 10000
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
              db.query("SELECT * FROM tbl_norek", (err, result) =>{
                 
                res.render('users/paymentInformation',{data: data, user: session_store.nama, result: result})
              })
            
          })
          
        },

    //payment
    getPaymentInformation: (req, res, next) =>{
        res.render('users/paymentInformation',{ user: session_store.nama})
    },
    getPaymentConfirm: (req, res, next) =>{
        // const tanggal = new Date()
        // const tgl = tanggal.getHours()+":"+tanggal.getMinutes()+":"+tanggal.getSeconds()
        
        // res.end(tgl)
        session_store = req.session
        db.query(`SELECT status,investasi, tx_id FROM tbl_investasi WHERE ? AND ?`,[{user: session_store.username}, {tx_id: req.params.id}],
        (err, row) =>{
            if (err) {
                throw err
            }
            else{
                if (row.length == 0 || row[0].status > 0) {
                    res.redirect('/dashboard')
                }else{
                    res.render('users/paymentConfirm', {result: row, user: session_store.nama})
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
               investasi: req.body.investasi,
               bank_pengirim: req.body.bank_pengirim,
               norek    : req.body.norek,
               nama_pengirim: req.body.nama_pengirim,
               total_pengirim: req.body.total_pengirim,
               bukti_transaksi: '/images/bukti/'+ req.file.filename,
               status: 0
           }
           db.query("SELECT dana FROM tbl_deposit WHERE ? ",{id: data.tx_id},(err, result) =>{
               if (err) {
                   throw err
               }
               if (result[0].dana != data.investasi) {
                   res.redirect("/dashboard")
               }else{
                db.query('INSERT INTO tbl_payment set ?', data,(err) =>{
                    if (err) {
                        throw err
                    }
      
                    db.query('UPDATE tbl_investasi set ? WHERE ? ', [{status: 1}, {tx_id: req.body.tx_id}], (err) =>{
                        if (err) {
                            throw err
                        }
                        res.redirect('/dashboard')
                    })
                 })
               }
           } )  
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
            res.render('users/referrals', {ref: session_store.username, result: result, user: session_store.nama})
        })
             
        
    },

    //list
    getWithdrawList: (req, res, next) =>{
        session_store = req.session
        db.query("SELECT id_trx, withdraw, status, date FROM tbl_withdraw WHERE ?", {user: session_store.username},(err, result) =>{
            if (err) {
                throw err
            }
            res.render('users/withdrawList', {result: result, user: session_store.nama})
        })
    },
    getInvestmentList: (req, res, next) =>{
        session_store = req.session
        db.query("SELECT tx_id, investasi, date, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo, status FROM tbl_investasi WHERE status >= 2 AND ?",
        
            {
                user: session_store.username
            }
        , (err, result) =>{
            if (err) {
                throw err
            }

            res.render('users/investmentList', {result: result, user: session_store.username})
        })
    },
    getEarningList: (req, res, next) =>{
        session_store = req.session
        db.query("SELECT tx_id, pendapatan, date, DATE_ADD(date, INTERVAL 124 DAY) AS jatuh_tempo, status FROM tbl_investasi WHERE status >= 2 AND ?",
        
            {
                user: session_store.username
            }
        , (err, result) =>{
            if (err) {
                throw err
            }

            res.render('users/earningList', {result: result, user: session_store.username})
        })
    }, 




    //logout

    getLogout: (req,res, next) =>{
        req.session.destroy(function(err) {
            if (err) {
                throw err
            }
            res.redirect('/')
          })
    }
}