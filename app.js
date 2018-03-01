const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const {formatDate} = require('./helpers/hbs');

// mongoose connection and models
require('./models/User');
require('./models/Holiday');
require('./models/Expense');
mongoose.connect('mongodb://localhost/dailyfoodsubscription')
.then(_ => {
    console.log('connected to mongoDB');
});

const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();
mongoose.Promise = global.Promise;

// Passport config
require('./config/passport')(passport);

// Handlebars
app.engine('handlebars', exphbs({
    helpers: {
        formatDate: formatDate
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

/** Middlewares **/
// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser
app.use(bodyParser.urlencoded({ urlencoded: false}));
app.use(bodyParser.json());


// session and cookie initialization
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Method Override 
app.use(methodOverride('_method'));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Globals
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Router Variables
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const subscribeRoutes = require('./routes/subscribe');

// Routers 
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/subscribe', subscribeRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started at port : ${port}`);
});