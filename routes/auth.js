const express = require('express');
const router = express.Router();
const passport = require('passport');

/** Routes **/
router.get('/google',passport.authenticate('google', { scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    console.log('User logged in');
    res.redirect('/subscribe');
});

router.get('/logout', (req, res) => {
    console.log(req.user);
    req.logout();
    res.redirect('/');
});

module.exports = router;