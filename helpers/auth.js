module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated() && (req.user.subscriptionStatus === 1 || req.user.subscriptionStatus === 4)) {
            return next();
        }
        res.redirect('/subscribe');
    },
    ensureGuest: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/dashboard');
        }
    },
    ensureStatus: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin === true) {
            res.redirect('/admin');
        } else if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    },
    ensureAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin === true) {
            return next();
        } else {
            res.redirect('/');
        }
    }
}