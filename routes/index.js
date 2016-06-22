var express = require('express'),
    router = express.Router();


router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
        currentUser: req.user,
        success: req.query.success,
        message: req.query.error
    });
});

module.exports = router;
