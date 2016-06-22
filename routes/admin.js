var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    models = require('../models');

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/admin/login');
    }
}

function notLoggedIn(req, res, next) {
    if (!req.user) {
        next();
    } else {
        res.redirect('/admin');
    }
}

router.get('/', loggedIn, function (req, res) {
    res.render('images_list', {
        title: 'Список загруженных изображений',
        currentUser: req.user
    });
});

router.get('/login', notLoggedIn, function (req, res) {
    res.render('login', {
            title: 'Авторизация',
            user: req.user
        }
    );
});

router.post('/login', notLoggedIn, passport.authenticate('local'), function (req, res) {
    res.redirect('/admin');
});

router.get('/logout', loggedIn, function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/create_test_user', function (req, res) {
    //models.User.create().then(function(newAdmin){
    models.User.register({login: 'admin4'}, 'password', function (err, user) {
        console.log(err);
        if (user) {
            return res.render('register', {account: user});
        }
        /* passport.authenticate('local')(req, res, function () {
         res.redirect('/');
         });*/
    });
    //});
    //res.send('respond with a resource');
});

module.exports = router;
