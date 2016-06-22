"use strict";

var fs = require("fs"),
    path = require("path"),
    Sequelize = require("sequelize"),
    env = process.env.NODE_ENV || "development",
    config = require(path.join(__dirname, '..', 'config', 'config.json'))[env],
    sequelize = new Sequelize(config.database, config.username, config.password, config),
    db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.seed = function(){
    db.User.findOne({
        where: {login: 'admin'}
    }).then(function(admin) {
        if (admin == null){
            db.User.register({login: 'admin'}, 'password',function () {
               //pass
            });
        }
    });

};

module.exports = db;