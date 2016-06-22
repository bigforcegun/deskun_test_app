var express = require('express'),
    path = require('path'),
    engine = require('ejs-locals'),

    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),

    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    FileStore = require('session-file-store')(session),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,

    app = express(),
    expressWs = require('express-ws')(app),

    routes = require('./routes/index'),
    admin = require('./routes/admin'),
    backend = require('./routes/backend'),
    models = require('./models');

app.set('expressWs',expressWs);
// view engine setup
app.engine('ejs', engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    store: new FileStore({
        path:'./tmp/sessions'
    }),
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 24 * 5 * 10000}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(models.User.createStrategy());
passport.serializeUser(models.User.serializeUser());
passport.deserializeUser(models.User.deserializeUser());


app.use(require('node-sass-middleware')({
    src: __dirname + '/public/sass',
    dest: __dirname + '/public/stylesheets',
    prefix: '/stylesheets',
    debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', admin);
app.use('/backend', backend);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// database setup
/*db.serialize(function(){
 db.run('CREATE TABLE IF NOT EXISTS `image_uploads` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,`filename` TEXT NOT NULL,`client_ip`	TEXT,`client_user_agent` TEXT);');
 var userTable = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='users';";
 if(!userTable){
 db.run('CREATE TABLE `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `login` TEXT UNIQUE, `password_hash`	TEXT);');
 var stmt = db.prepare('INSERT INTO users VALUES (?,?)');
 for (var i = 0; i < 4; i++) {
 var pass = User.encryptPassword('password'+i);
 stmt.run('admin ' + i,pass);
 }
 stmt.finalize();

 }
 });*/
module.exports = app;
