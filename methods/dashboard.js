const moment = require('moment');
const price = require('../config/price');
const mongoose = require('mongoose');
const User = mongoose.model('users');

module.exports = {
    getMonth: (month) => {
        if (month && month > 0 && month <= 12) {
            return { value: month, text: moment(month, 'MM').format('MMMM') };
        }
        const date = moment();
        return { value: date.month() + 1, text: date.format('MMMM') };
    },
    getDaysPerMonth: function(month, user = null) {
        let totalDays = 0;
        if (user) {
            let subscription = user.subscriptions.filter(subscription => {
                return subscription.month === month;
            });
            subscription = (subscription.length === 0) ? null : subscription[0];
            if (subscription) {
                totalDays = this.getSubscribedDays(subscription.list);
            } else {
                totalDays = moment(month, 'MM YYYY').daysInMonth();
            }
        }
        return totalDays;
    },
    getSubscribedDays: function(subscription) {
        let totalDays = 0;
        let startDate,endDate;
        for (let i = 0; i< subscription.length; i++) {
            if (subscription[i].endDate) {
                endDate = moment(subscription[i].endDate);
                if (!startDate) {
                    startDate = moment(subscription[i].endDate).startOf('month');
                    totalDays += this.getDaysBetweenDates(startDate, endDate);
                }
            } else if (subscription[i].startDate){
                startDate = moment(subscription[i].startDate);
                endDate = (subscription[i+1]) ? (subscription[i+1].endDate) ? moment(subscription[i+1].endDate) : null : null;
                if (!endDate) {
                    endDate = moment(subscription[i].startDate).endOf('month');
                }
                totalDays += this.getDaysBetweenDates(startDate, endDate);
            }
            endDate = null;
        }
        return totalDays;
    },
    getDaysBetweenDates: function(firstDate, secondDate) {
        return secondDate.diff(firstDate, 'days') + 1;
    },
    getTotalLunchPrice: (totalDays, totalWeekends, totalHolidays, leaveList) => {
        const leaveCount = leaveList.filter((leave) => leave.lunch == 'Applicable' || leave.lunch == true).length;
        const holidays = totalWeekends + totalHolidays + leaveCount;
        const difference = totalDays - holidays;
        const actualDays = (difference > 0) ? difference : totalDays;
        return price.lunchPrice * actualDays;
    },
    getTotalDinnerPrice: (totalDays, totalWeekends, totalHolidays, leaveList) => {
        const leaveCount = leaveList.filter((leave) => leave.dinner == 'Applicable' || leave.dinner == true).length;
        const holidays = totalWeekends + totalHolidays + leaveCount;
        const difference = totalDays - holidays;
        const actualDays = (difference > 0) ? difference : totalDays;
        return price.dinnerPrice * actualDays;
    },
    getUserData: (userID) => {
        return User.findOne({_id: userID});
    },
    getMonthList: (complete = false) => {
        const month = (moment().month()+1);
        let monthList = [];
        const startPoint = (complete) ? 1 : month;
        for (let i = startPoint; i <= 12; i++) {
            monthList.push({value: i, text: moment(i, 'MM').format('MMMM')});
        }
        return monthList;
    },
    getLeaveFormatted: (leaveList) => {
        return leaveList.map(leave => {
            const newLeave = {};
            newLeave.lunch = (leave.lunch) ? 'Applicable' : 'N/A';
            newLeave.dinner = (leave.dinner) ? 'Applicable' : 'N/A';
            const newDate = moment(leave.date);
            const day = newDate.date();
            const month = newDate.format('MMMM');
            const year = newDate.year();
            newLeave.date = `${day} ${month} ${year}`;
            return newLeave;
        });
    },
    getNumberOfWeekends: (month) => {
        let day = 1;
        let weekends = 0;
        let date = moment(`${month}-${day}`, 'MM-DD');
        do {
            if (date.day() === 0 || date.day() === 6) {weekends++;}
            day++;
            date = moment(`${month}-${day}`, 'MM-DD');
        } while (day <= date.daysInMonth())
        return weekends;
    },
    getHolidayCount: (month, holidays) => {
        return holidays.filter(holiday => {
            const date = moment(holiday.date);
            return month === date.month()+1;
        }).length;
    },
    getLeavesPerMonth: (leaves, month) => {
        return leaves.filter(leave => {
            const date = moment(month, 'MM');
            return moment(leave.paymentDate).month() === date.month();
        });
    },
}