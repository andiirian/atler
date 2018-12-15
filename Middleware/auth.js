var Auth = {
    check_login: function (req, res, next)
    {
        if (!req.session.logged_in) {
            return res.redirect('/users/login');
        }

        next();
    },
    check_login_admin: (req, res, next) =>{
        if (!req.session.logged_in) {
            return res.redirect('/admin/login');
        }

        next();
    },
    check_admin: (req, res, next) =>{
        if(req.session.status != 1){
            return res.redirect('/admin/login');
        }
        next();
    },
    check_user: (req, res, next) =>{
        if (req.session.status != 0) {
            return res.redirect('/users/login');
        }
        next()
    }

};

module.exports = Auth;