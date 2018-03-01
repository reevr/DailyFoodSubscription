const mongoose = require('mongoose');
const moment = require('moment');
const User = mongoose.model('users');
const Expenses = mongoose.model('expenses');
const dashboard = require('../methods/dashboard');
module.exports = {
    getUserList: (query) => {
        return User.find(query);
    },
    getExpenseList: (query) => {
        return Expenses.find(query);
    },
    getSubscribers: (users) => {
        return users.filter(user => {
            return user.subscriptionStatus === 1 && user.isAdmin !== true;
        });
    },
    getPendingApprovals: (users) => {
        return users.filter(user => {
            return user.subscriptionStatus === 2 && user.isAdmin !== true;
        });
    },
    approveSubscription: function (userID) {
        User.findById(userID)
        .then(user => {
            if (user) {
                const date = moment();
                user.subscriptionStatus = 1;
                let monthExists = false;
                user.subscriptions = user.subscriptions.map(subscription => {
                    if (subscription.month === (date.month() + 1)) {
                        monthExists = true;
                        subscription.list.push({
                            startDate: date
                        });
                    }
                    return subscription;
                });
                if (!monthExists) {
                    user.subscriptions.push({
                        month: date.month() + 1,
                        list: [{
                            startDate: date
                        }]
                    });
                }
                user.save()
                .then(_ => true);
            }
        });
        return true;
    },
    rejectSubscription: (userID) => {
        User.findById(userID)
        .then(user => {
            if (user) {
                user.subscriptionStatus = 0;
                user.save()
                .then(_ => true);
            }
        });
        return true;
    },
    cancelSubscription: function (userID) {
        User.findById(userID)
        .then(user => {
            if (user) {
                const date = moment();
                user.subscriptionStatus = 0;
                let monthExists = false;
                user.subscriptions = user.subscriptions.map(subscription => {
                    if (subscription.month === (date.month() + 1)) {
                        monthExists = true;
                        subscription.list.push({
                            endDate: date
                        });
                    }
                    return subscription;
                });
                if (!monthExists) {
                    user.subscriptions.push({
                        month: date.month() + 1,
                        list: [{
                            endDate: date
                        }]
                    });
                }
                user.save()
                .then(_ => true);
            }
        });
        return true;
    },
} 