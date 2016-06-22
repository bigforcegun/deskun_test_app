"use strict";
var passportLocalSequelize = require('passport-local-sequelize');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        login: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        password_salt: DataTypes.STRING
    }, {
        classMethods: {
        }
    });
    passportLocalSequelize.attachToUser(User, {
        usernameField: 'login',
        hashField: 'password_hash',
        saltField: 'password_salt'
    });
    
    return User;
};