var express = require('express');
var router = express.Router();
var app = express();
const { check, validationResult } = require('express-validator/check');
const generalvalidation = require('../validation/generalvalidation');


router.post('/orderhistory', generalvalidation.verifytoken, (req, res) => {

    var user_id = req.body.user_id;
    req.getConnection((error, con) => {

        var promise = new Promise((resolve, reject) => {

            con.query('INSERT INTO orderhistory (`user_id`, `product_id`, `quantity`, `price`,`total`) SELECT user_id, product_id, quantity, price, total FROM cartinfo WHERE user_id=?', [user_id], (err, rows, fields) => {
                if (err) {
                    res.send("!!!!ERROR!!!!!");
                    console.log(rows);
                }
                else {
                    res.send("Data inserted to ordered products")
                }
            });
            resolve();

        }).then(() => {
            con.query('Delete from cartinfo where user_id=?', [user_id], (err, rows, fields) => {

                if (err) throw err;
                console.log("cart empty");
            });
        });
    });
});
module.exports = router;
