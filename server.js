if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const app = express();

require('./config/passport')(passport);

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => console.log('[+]Connected To Mongoose...'))

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

const indexRouter = require('./routes/index');
const homeRouter = require('./routes/home');

app.use('/', indexRouter);
app.use('/home', homeRouter);

app.listen(process.env.PORT || 3000, function(){
    console.log("[+]Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});