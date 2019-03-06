var express = require('express');
var router = express.Router();
var app = express();
const generalvalidation = require('../validation/generalvalidation');

//const { check ,validationResult} = require('express-validator/check');

const validatestatus = require('../validation/validatestatus');

//UPDATING STATUS
router.post('/', generalvalidation.verifytoken, (req, res) => {

  var order_id = req.body.order_id;
  var status = req.body.status;

  var details = { ...req.body };
  var error = validatestatus.statusvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }

  else {

    req.getConnection((error, con) => {

      con.query('UPDATE orderhistory set status=? where user_id=? ', [status, order_id], (err, rows, fields) => {

        if (err) {
          res.json({
            status: 403,
            success: false,
            message: 'Error in update query',
            date: [{
              order_id: req.body.order_id,
            }]

          });
        }
        else {
          console.log('Status updated successfully');
          res.json({
            status: 200,
            success: true,
            message: 'Status Updated Successfully',
            date: [{
              order_id: req.body.order_id,
              status: req.body.status,
            }]

          });
        }
      });
    });
  }
});

module.exports = router;