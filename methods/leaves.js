const moment = require('moment');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const dashboard = require('../methods/dashboard');
module.exports = {
    getMonth: dashboard.getMonth,
    getMonthList: dashboard.getMonthList,
    getUserData: dashboard.getUserData,
    getDateList: (month) => {
        let dateList = [];
        const totalDays = moment(month, 'MM YYYY').daysInMonth();
        for (let i = 1; i <= totalDays; i++) {
            dateList.push({date : i});
        }
        return dateList;
    },
    isValidDate: (date, month) => {
        const totalDays = moment(month, 'MM YYYY').daysInMonth();
        if (date > 0 && date <= totalDays) {
            return true;
        } else {
            return false;
        }
    },
    submitLeave: function(req, res, redirectURL) {
        if ((req.body.month && (req.body.month > 0 && req.body.month <= 12)) && (req.body.date && this.isValidDate(req.body.date, req.body.month))) {
            const momentObj = moment(`${req.body.month}-${req.body.date}`, 'MM-DD');
            const lunch = (req.body.lunch) ? true : false;
            const dinner = (req.body.dinner) ? true : false;
            const userID = (req.body.userID) ? req.body.userID : req.user._id 
            this.getUserData(userID)
            .then(user => {
                if (user) {
                    let leaveExist = false;
                    let leaves = [];
                    for (let i = 0; i < user.leaves.length; i++) {
                        const leaveDate = moment(user.leaves[i].date);
                        if (leaveDate.date() === momentObj.date() && leaveDate.year() === momentObj.year()) {
                            leaveExist = true;
                            if (lunch && user.leaves[i].lunch === false) {
                                user.leaves[i].lunch = true;
                            } else if (!lunch && user.leaves[i].lunch === true) {
                                user.leaves[i].lunch = false
                            }
                            if (dinner && user.leaves[i].dinner === false) {
                                user.leaves[i].dinner = true;
                            } else if (!dinner && user.leaves[i].dinner === true) {
                                user.leaves[i].dinner = false;
                            }
                        }
                        if (user.leaves[i].lunch || user.leaves[i].dinner) {
                            leaves.push(user.leaves[i]);
                        }
                    };
                    user.leaves = leaves;
                    if (!leaveExist && (lunch || dinner)) {
                        user.leaves.push({
                            date: momentObj.valueOf(),
                            lunch: lunch,
                            dinner: dinner
                        });
                    }
                    user.save()
                    .then(user => {
                        res.redirect(redirectURL);
                    });
                } else { res.redirect(redirectURL); }
            });
        } else {
            res.redirect(redirectURL);
        }
    },
    getLeaveFormatted: dashboard.getLeaveFormatted
};