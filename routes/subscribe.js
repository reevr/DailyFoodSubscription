const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('users');
const ensureStatus = require('../helpers/auth').ensureStatus;

router.get('/', ensureStatus, (req, res) => {
    console.log('subscribe page');
    User.findOne({_id: req.user._id})
    .then(user => {
        if (user.subscriptionStatus === 1) {
            res.redirect('/dashboard');
        } else if (user.subscriptionStatus === 0) {
            res.render('subscribe/index', {
                status: 'Unsubscribed',
                message: `Seems like you haven't subscribed.`,
                confirm: true
            });
        } else if (user.subscriptionStatus === 2) {
            res.render('subscribe/index', {
                status: 'Pending',
                message: `Your subscription is sent for approval by the admin.`,
                confirm: false
            });
        }
    });
});

router.post('/', ensureStatus, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 2 })
    .then(user => {
        console.log(user);
        res.redirect('/subscribe');
    });
});

module.exports = router;