const mongoose = require('mongoose');
const moment = require('moment');
const User = mongoose.model('users');
const Holidays = mongoose.model('holidays');
const Expenses = mongoose.model('expenses');
const dashboard = require('../methods/dashboard');
const admin = require('../methods/admin');
module.exports = {
    updatePayment: function (userID, amount) {
        User.findById(userID)
        .then(user => {
            if (user) {
                const month = dashboard.getMonth(null);
                user.payments.push({
                    amount: amount,
                    paymentMonth: month.value,
                });
                user.save();
            }
        });
        return true;
    },
    getUnpaidAmount: function (user, month, holidays) {
        let subscribed = false;
        const validMonths = [1,2,3,4,5,6,7,8,9,10,11,12].filter(m => {
            const subscription = user.subscriptions[0];
            if (subscription.month === m) {
                subscribed =  true;
            }
            return m <= month && subscribed;
        });
        let finalAmount = 0
        const monthlyAmountData = validMonths.map(month => {
            const amountByMonth = this.getAmountByMonth(user, month, holidays);
            const monthlyPayments = user.payments.filter(payment => {
                return payment.paymentMonth === month;
            });
            let monthlyPaymentAmount = monthlyPayments.map(payment => payment.amount);
            monthlyPaymentAmount = (monthlyPaymentAmount.length > 0) ? monthlyPaymentAmount.reduce((sum,value)  => sum + value) : 0;
            finalAmount += amountByMonth - monthlyPaymentAmount;
            return amountByMonth - monthlyPaymentAmount;
        });
        return finalAmount;
    },
    getAmountByMonth: function (user, month, holidays) {
        const leaves = user.leaves;
        const totalDays = dashboard.getDaysPerMonth(month, user);
        const totalWeekends = dashboard.getNumberOfWeekends(month);
        const leavesPerMonth = dashboard.getLeavesPerMonth(leaves, month);
        const totalHolidays = dashboard.getHolidayCount(month, holidays);
        const totalLunchPrice = dashboard.getTotalLunchPrice(totalDays, totalWeekends, totalHolidays, leavesPerMonth);
        const totalDinnerPrice = dashboard.getTotalDinnerPrice(totalDays, totalWeekends, totalHolidays, leavesPerMonth);
        return totalDinnerPrice + totalLunchPrice;
    },
    getHolidays: function(query) {
        return Holidays.find(query);
    },
    addHolidays: function(date, title, description) {
        date = moment(date);
        if (date.isValid()) {
            Holidays.findOne({date: date, title: title})
            .then(holidays => {
                console.log(holidays);
                if (!holidays) {
                    new Holidays({
                        title: title,
                        description: description,
                        date: date
                    })
                    .save();
                }
            });
        }
    },
    getDateInWords: function(date) {
        return moment(date).format('MMMM do YYYY');
    },
    getCurrentDate: function() {
        return moment().format('YYYY-MM-DD');
    },
    deleteHoliday: function(holidayId) {
        Holidays.findOne({_id: holidayId}).remove().exec();
        return true;
    },
    getExpenses: function(month) {
       const  startDate = moment(month,'MM').startOf('month');
       const  endDate = moment(month,'MM').endOf('month');
       return Expenses.find({date: {$gte: startDate, $lt: endDate}});
    },
    addExpense: function(date, description, amount) {
        const newExpense = {
            description: description,
            amount: amount
        };
        if (date) {
            newExpense.date = date;
        }
        new Expenses(newExpense).save();
    },
    deleteExpense: function(expenseId) {
        Expenses.findOne({_id: expenseId}).remove().exec();
        return true;
    },
    getGuests: function() {
        return User.find({ subscriptionStatus: 4 });
    },
    addGuest: function(email, firstName, lastName, res) {
        User.findOne({email: email})
        .then(user => {
            const date = moment();
            let subscriptions= [{
                month: date.month() + 1,
                list: [{
                    startDate: date
                }]
            }];
            if (!user) {
                new User({
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    isAdmin: false,
                    subscriptionStatus: 4,
                    subscriptions: subscriptions
                }).save()
                .then(user => res.redirect('/admin/manage-guests'));
            } else {
                    if (user.subscriptionStatus == 0) {
                        user.subscriptionStatus = 4;
                        user.subscriptions = subscriptions;
                    user.save()
                    .then(_ => res.redirect('/admin/manage-guests'));
                } else { res.redirect('/admin/manage-guests');}
            }
        })
    },
    deleteGuest: function(userID) {
        admin.cancelSubscription(userID);
    }
}