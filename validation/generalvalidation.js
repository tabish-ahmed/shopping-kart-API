const express = require('express');
const app = express();
var _ = require('lodash');
// var anymatch=require('anymatch');
const jwt = require('jsonwebtoken');
const config = require('../config');



//validation to check emptiness
const isempty = (details) => {
    var error = [];
    for (var key in details) {
        if (details[key] != 'undefined') {
            if (details[key] != '') {
            }
            else {
                error.push('Value of ' + key + ' cannot be left empty ');
            }

        }
        else
            error.push('Error');
    }
    return error;

}

const isnumeric = (details) => {
    

    
    if (!details.match(/^\d+/)) {
        return details + '  is not a valid number';
    }
    else
        return false;

};

const isname = (details) => {
    if (!details.match(/^[a-zA-Z ]*$/)) {
        return details + '  is not valid name';
    }
    else
        return false;

};




const isemail = (details) => {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(details) == true) {
        return false;
    }
    else
        return 'Invalid Email ID';
};



//MIDDLEWARE FOR TOKEN VERIFICATION
function verifytoken(req, res, next) {

    const accesstoken = req.headers['accesstoken'];
    //console.log(req.headers['authorization']);

    if (typeof (accesstoken) != 'undefined') {
        jwt.verify(accesstoken, config.secretkey, (err, authData) => {
            if (err) {
                res.json({
                    status:401,
                    message:'access token not verified'
                })
            }
            else {

                req.data={name:authData.name,
                    id:authData.id,
                    email:authData.email
                }
                 next();
            };

        })

    }
    else {
        res.json({
            status: 403,
            success: false,
            message: 'Authentication Unsuccessfull',
           

        });
    }

}


module.exports = { isempty, isnumeric, isemail, isname, verifytoken }