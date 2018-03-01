const moment = require('moment');
const express = require('express');
const router = express.Router();
const ensureAdmin = require('../helpers/auth').ensureAdmin;
const admin = require('../methods/admin');
const details = require('../methods/details');
const dashboard = require('../methods/dashboard');
const leaves = require('../methods/leaves');

router.get('/', ensureAdmin, (req, res) => {
    const userList = admin.getUserList({})
    .then(users => {       
        const pendingApprovals = admin.getPendingApprovals(users).length;
        const month = dashboard.getMonth(null).value;
        details.getExpenses(month)
        .then(expenses => {
            let totalExpense = 0;
            expenses.forEach(expense => totalExpense += expense.amount);
            res.render('admin/index', {
                pendingApprovals: pendingApprovals,
                totalExpense: totalExpense,

            });
        });
    });
});

router.get('/subscriptions', ensureAdmin, (req, res) => {
    const userList = admin.getUserList({})
    .then(users => {
        const subscribers = admin.getSubscribers(users);
        const pendingApprovals = admin.getPendingApprovals(users);
        res.render('admin/subscriptions', {
            subscribers: subscribers,
            pendingApprovals: pendingApprovals
        });
    });
});

router.post('/subscriptions', ensureAdmin, (req, res) => {
    if (req.body.userID) {
        admin.cancelSubscription(req.body.userID);
    }
    res.redirect('/admin/subscriptions');
});

router.post('/subscriptions/approvals',ensureAdmin , (req, res) => {
    if (req.body.userID && req.body.status) {
        if (req.body.status === 'true') {
            admin.approveSubscription(req.body.userID);
        } else if (req.body.status === 'false') {
            admin.rejectSubscription(req.body.userID);
        }
    }
    res.redirect('/admin/subscriptions');
});

router.get('/payment', ensureAdmin, (req, res) => {
    details.getHolidays({})
    .then(holidays => {
        admin.getUserList({subscriptionStatus: 1})
        .then(users => {
            const month = dashboard.getMonth(req.params.month);
            const userList = users.map(user => {
                const unpaidAmount = details.getUnpaidAmount(user, month.value, holidays);
                const totalAmount = unpaidAmount;
                user['amount'] = totalAmount;
                return user;
            });
            res.render('admin/payment', {
                userList: userList
            });
        });
    });
});

router.post('/payment', ensureAdmin, (req, res) => {
    if (req.body.userID && req.body.amount) {
        details.updatePayment(req.body.userID, req.body.amount);
    }
    res.redirect('/admin/payment');
});

router.get('/holidays', ensureAdmin, (req, res) => {
    details.getHolidays({})
    .then(holidays => res.render('admin/holidays', {
        holidays: holidays,
        currentDate: details.getCurrentDate()
    }));
});

router.post('/holidays', ensureAdmin, (req, res) => {
    if (req.body.date && req.body.title && req.body.description) {
        details.addHolidays(req.body.date, req.body.title, req.body.description);
    }
    res.redirect('/admin/holidays');
});

router.delete('/holidays', ensureAdmin, (req, res) => {
    if (req.body.holidayId) {
        details.deleteHoliday(req.body.holidayId);
    }
    res.redirect('/admin/holidays');
});

router.get('/expense/:month?', ensureAdmin, (req, res) => {
    const monthList = dashboard.getMonthList(true);
    month = (!req.params.month) ? dashboard.getMonth(null).value : req.params.month;
    details.getExpenses(month)
    .then(expenses => {
        res.render('admin/expense', {
            monthList: monthList,
            expenses: expenses
        });
    });
    
});

router.post('/expense', ensureAdmin, (req, res) => {
    if (req.body.amount && req.body.description) {
        details.addExpense(req.body.date, req.body.description, req.body.amount);
    }
    res.redirect('/admin/expense');
});

router.delete('/expense', ensureAdmin, (req, res) => {
    if (req.body.expenseId) {
        details.deleteExpense(req.body.expenseId);
    }
    res.redirect('/admin/expense');
});

router.get('/manage-guests', ensureAdmin, (req, res) => {
    details.getHolidays({})
    .then(holidays => {
        details.getGuests()
        .then(users => {
            const month = dashboard.getMonth(null);
            const userList = users.map(user => {
                const unpaidAmount = details.getUnpaidAmount(user, month.value, holidays);
                user['amount'] = unpaidAmount;
                return user;
            });
            res.render('admin/manage-guests', { guests: userList})
        });
    });
});

router.post('/manage-guests', ensureAdmin, (req, res) => {
    if (req.body.email && req.body.firstName && req.body.lastName) {
        details.addGuest(req.body.email, req.body.firstName, req.body.lastName, res);
    }
});

router.delete('/manage-guests', ensureAdmin, (req, res) => {
    details.deleteGuest(req.body.userID);
    res.redirect('/admin/manage-guests');
});

router.get('/manage-guests/leaves/:id', ensureAdmin, (req, res) => {
    dashboard.getUserData(req.params.id)
    .then(user => {
        if (user) {
            const leaveList = dashboard.getLeaveFormatted(user.leaves);
            res.render('admin/manage-guest-leaves',{
                userDetails: user,
                leaveList: leaveList,
                currentDate: details.getCurrentDate()
            });
        } else {
            res.redirect('/admin/manage-guests');
        }
    });
    
});

router.post('/manage-guests/leaves', ensureAdmin, (req, res) => {
    if (req.body.userID && req.body.date) {
        const newDate = moment(req.body.date);
        req.body.date = newDate.date();
        req.body.month = newDate.month()+1;
        leaves.submitLeave(req, res, '/admin/manage-guests/leaves/' + req.body.userID);
    } else {
        res.redirect('/admin/manage-guests');
    }
});
module.exports = router;