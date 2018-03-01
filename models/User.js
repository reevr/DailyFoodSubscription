const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    googleID: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email : {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    subscriptionStatus: {
        type: Number,
        required: true
    },
    subscriptions: [{
        month: {
            type: Number,
        },
        list: [{
            startDate: {
                type: Date,
                required: false,
            },
            endDate: {
                type: Date,
                required: false
            }
        }]
    }],
    previousBalance: {
        type: Number,
        default: 0,
        required: true
    },
    payments: [{
        paymentDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMonth: {
            type: Number,
            required: true
        }
    }],
    leaves:[{
        date: {
            type: Date
        },
        lunch: {
            type: Boolean
        },
        dinner: {
            type: Boolean
        },
        appliedOn: {
            type: Date,
            default: Date.now
        }
    }]
});

mongoose.model('users', UserSchema);