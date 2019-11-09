module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Please Log In To View That Resource')
        res.redirect('/login');
    },
    forwardAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            return next();
        }
        res.redirect('/home')
    }
}