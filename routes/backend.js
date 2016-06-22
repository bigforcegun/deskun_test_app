var express = require('express'),
    crypto = require('crypto'),
    path = require('path'),
    router = express.Router(),
    multer = require('multer'),
    models = require('../models');

var upload_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/images')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
        });
    }
});

var upload = multer({
    storage: upload_storage,
    limits: {fileSize: 8 * 1024 * 1024 * 8, files: 1},
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png'
            && file.mimetype !== 'image/jpg'
            && file.mimetype !== 'image/jpeg'
            && file.mimetype !== 'image/gif') {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
}).single('image');


function notifyWs(app, image) {
    app.get('expressWs').getWss('/backend/images').clients.forEach(function (client) {
        client.send(JSON.stringify({
                action: 'upload',
                record: image
            }));
    });
}

function processMessage(req,msg,clb) {
    if(!req.user) msg = 'not_authorised';
    switch (msg) {
        case 'get_list': getImagesList(clb);
            break;
        case 'not_authorised': errorCallback(clb,'Not Authorized');
            break;
        default: errorCallback(clb,'Undefined Action')
    }
}

function errorCallback(clb,message) {
    var data = {
        action: 'error',
        message:message
    };
    clb(data)
}

function getImagesList(clb) {
    models.UploadImage.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']]
    })
    .then(function(images){
        var data = {
            action: 'list',
            records: images
        };
        clb(data);
    })
}

router.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.redirect('/?success=false&error=' + err);
            return
        }
        models.UploadImage.create({
            filename: req.file.filename,
            comment: req.body.comment,
            client_ip: req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || req.client.remoteAddress,
            client_user_agent: req.get('User-Agent')
        }).then(function (image) {
                notifyWs(req.app, image);
                res.redirect('/?success=true');
            }
        );
        //res.send('respond with a resource');
    });

});

router.ws('/images', function(ws, req) {

    ws.on('message', function(msg) {
        processMessage(req,msg,function(data){
            data = JSON.stringify(data);
            ws.send(data)
        });
    });
});




module.exports = router;
