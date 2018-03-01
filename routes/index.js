const moment = require('moment');
const express = require('express');
const router = express.Router();
const dashboard = require('../methods/dashboard');
const leaves = require('../methods/leaves');
const details = require('../methods/details');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

/** Routes **/
router.get('/',ensureGuest , (req, res) => {
    res.render('index/index');
});

router.get('/dashboard/:month?', ensureAuthenticated, (req, res) => {
    details.getHolidays({})
    .then(holidays => {
        dashboard.getUserData(req.user._id)
        .then(user => {
            const month = dashboard.getMonth(req.params.month);
            const unpaidAmount = details.getUnpaidAmount(user, month.value, holidays);
            const totalAmount = unpaidAmount;
            const leaveList = dashboard.getLeaveFormatted(user.leaves);
            const monthList = dashboard.getMonthList();

            // let lunchPrice = 

            res.render('index/dashboard', {
                month: month,
                // totalLunchPrice: totalLunchPrice,
                // totalDinnerPrice: totalDinnerPrice,
                totalAmount: totalAmount,
                monthList: monthList,
                leaveList: leaveList
            });
        });
    });
});

router.get('/leaves/:month?', ensureAuthenticated, (req, res) => {
    leaves.getUserData(req.user._id)
    .then(user => {
        const monthList = leaves.getMonthList();
        const month = leaves.getMonth(req.params.month);
        const dateList = leaves.getDateList(month.value);
        // console.log(dateList);
        const leaveList = dashboard.getLeaveFormatted(user.leaves);
        res.render('index/leaves', {
            month: month,
            monthList: monthList,
            dateList: dateList,
            leaveList: leaveList
        });
    });
});

router.post('/leaves', ensureAuthenticated, (req, res) => {
    leaves.submitLeave(req, res, '/leaves');
});

module.exports = router;