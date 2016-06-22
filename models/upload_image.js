"use strict";

module.exports = function(sequelize, DataTypes) {
    var UploadImage = sequelize.define("UploadImage", {
        filename: DataTypes.STRING,
        comment: DataTypes.STRING,
        client_ip: DataTypes.STRING,
        client_user_agent: DataTypes.STRING
    }, {
        classMethods: {

        }
    });


    return UploadImage;
};