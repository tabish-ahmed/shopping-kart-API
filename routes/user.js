const express = require('express');
//var app = new express();
const router = express.Router();
const validateuser = require('../validation/validateuser');
const generalvalidation = require('../validation/generalvalidation');
const jwt = require('jsonwebtoken');
const config = require('../config');
let emmail = require('../email')


//user login API
router.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  var details = { ...req.body };
  var error = validateuser.loginvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }
  else {

    req.getConnection((err, conn) => {
      if (err)
        console.log('connection failed');
      else {
        conn.query('Select * from userinfo where email=? and password=?', [email, password], (err, result) => {
          if (err)
            console.log('error');
          else {
            if (result.length > 0) {
              let user_id = result[0].user_id;
              let user_name = result[0].user_name;

              jwt.sign({ name: user_name, id: user_id, email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                conn.query('update userinfo set token=? where email=? and password=?', [email, password, token], (err, result) => {

                  res.json({
                    status: 200,
                    success: true,
                    token: token,
                    email: req.body.email
                  });
                });
                emmail.send_mail('/email-templates/login.ejs', user_name, details);

              });

            }

            else
              res.send(403).json({
                success: false,
                message: 'Incorrect email or password'
              });
          }
        }
        );
      };
    });
  }
});



//user signup API
router.post('/signup', (req, res) => {
  let user_name = req.body.user_name;
  let email = req.body.email;
  let password = req.body.password;
  let phone = req.body.phone;
  let address = req.body.address;
  let country_code = req.body.country_code;



  let details = { ...req.body };
  var error = validateuser.signupvalidation(details);
  if (error.length > 0) {
    console.log(error.length);
    res.send(error);

  }

  else {
    req.getConnection((err, conn) => {
      if (err) {
        console.log('connection failed');
        res.json({
          success: false,
          Status: 403,
          data: [{
            message: 'error connecting to database'
          }]

        });
      }
      else {


        conn.query('Select * from userinfo where email=?', [email], (err, result) => {
          if (err)
            res.json({
              success: false,
              Status: 403,
              data: [{
                message: 'error in query'
              }]

            });
          else {
            if (result.length > 0) {
              res.json({
                success: false,
                Status: 403,
                data: [{
                  message: 'You are already registered, please login to continue'
                }]

              });
            }


            else {
              jwt.sign({ user_name: user_name, email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {


                conn.query('INSERT INTO `userinfo`( `user_name`, `email`, `password`, `phone`, `address`, `token`, `country_code`) VALUES (?,?,?,?,?,?,?)', [user_name, email, password, phone, address, token, country_code], (err, result) => {
                  if (err) {
                    res.json({
                      success: false,
                      Status: 403,
                      data: [{
                        message: 'error in insertion query'
                      }]

                    });
                    console.log(err);
                  }

                  else {
                    console.log({ status: 'success', message: 'Signup sucessfull' });
                    res.json({
                      success: true,
                      Status: 200,
                      token: token,
                      data: [{
                        name: req.body.user_name,
                        email: req.body.email
                      }]

                    });
                    emmail.send_mail('/email-templates/signup.ejs', user_name, details);
                    

                  }



                });



              });
            }
          }
        });

      }
    });
  }

});






//ADDING PRODUCTS TO CART

router.post('/addtocart', generalvalidation.verifytoken, (req, res) => {


  let user_id = req.data.id;
  let product_id = req.body.product_id;
  let quantity = req.body.quantity;


  var details = { ...req.body };
  details.user_id = user_id
  var error = validateuser.addcartvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }

  else {
    req.getConnection((error, con) => {



      con.query('Select * from products where product_id=? and isdelete=0 ', [product_id], (err, rows, fields) => {

        if (rows.length > 0) {


          con.query('Select * from products where product_id=? and isdelete=0 and  availability>=?', [product_id, quantity], (err, rows, fields) => {

            if (rows.length > 0) {
              let seller_id = rows[0].seller_id;
              let product_name = rows[0].product_name;
              let category = rows[0].category;
              let price = rows[0].price;
              let total = price * quantity;

              con.query('INSERT INTO `cartinfo`(`seller_id`, `user_id`, `product_id`, `product_name`, `category`,`quantity`, `price`, `total`) VALUES (?,?,?,?,?,?,?,?)', [seller_id, user_id, product_id, product_name, category, quantity, price, total], (err, rows, fields) => {

                if (err) throw err;
                else {
                  res.json({
                    status: 200,
                    success: true,
                    message: 'Product added to cart',
                    data: [{
                      productId: req.body.product_id,
                      Quantity: req.body.quantity,
                      Price: req.body.price,
                      total: total

                    }]

                  });

                }
              });
            }
            else {
              res.json({
                status: 403,
                success: false,
                message: 'Select Less Quantity',
                data: [{
                  productId: req.body.product_id,
                  Quantity: req.body.quantity,
                }]
              });

            }
          });
        }
        else {
          res.json({
            status: 403,
            success: false,
            message: 'Product does not exist',
            data: [{
              productId: req.body.product_id,
            }]
          });
        }
      });


    });
  }
});




//When user deletes product from Cart

router.post('/deletefromcart', generalvalidation.verifytoken, (req, res) => {


  var user_id = req.data.id;
  var product_id = req.body.product_id;
  var details = { ...req.body };
  details.user_id = user_id;
  var error = validateuser.deletecartvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }

  else {
    req.getConnection((error, con) => {

      con.query('Select * from cartinfo where product_id=? and user_id=? ', [product_id, user_id], (err, rows, fields) => {

        if (rows.length > 0) {

          con.query('DELETE FROM `cartinfo` WHERE user_id=? and product_id=? ', [user_id, product_id], (err, rows, fields) => {

            if (err) throw err;
            else {
              res.json({
                status: 200,
                success: true,
                message: 'Product deleted from cart',
                data: [{
                  productId: req.body.product_id,
                }]
              });

            }
          });

        }
        else {
          res.json({
            status: 403,
            success: false,
            message: 'Product doesnot exist in cart',
            data: [{
              productId: req.body.product_id,
            }]
          });
        }
      });
    });
  }
});


//show products in cart
router.post('/showproduct', generalvalidation.verifytoken, (req, res) => {
  let user_id = req.data.id;



  req.getConnection((error, con) => {

    con.query('SELECT * from cartinfo  where user_id=?  ', [user_id], (err, rows) => {

      if (err) throw err;

      else {
        res.json({
          status: 200,
          success: true,
          message: 'ALL PRODUCTS ARE SHOWN BELOW',
          data: rows
        });
      }

    });


  });

});


module.exports = router;






// var express = require('express');
// var router = express.Router();
// var app=express();
// const { check ,validationResult} = require('express-validator/check');




// router.post('/signup', 
// [check('user_name','Name cannot be left empty').not().isEmpty(),
// check('email','invalid Email').isEmail(),
// check('password','Name cannot be left empty').not().isEmpty(),
// check('phone').isNumeric(),
// check('shopaddress','address cannot be left empty').not().isEmpty()],(req, res)=> {


//   var user_name = req.body.user_name;
//   var email = req.body.email;
//   var password = req.body.password;
//   var phone = req.body.phone;
//   var address = req.body.address;

//   const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(422).json({ errors: errors.array() });
//  }


//   req.getConnection((error, con) =>{

//   con.query('INSERT INTO `userinfo`(`user_name`, `email`, `password`, `phone`, `address`) VALUES (?,?,?,?,?)', [user_name, email, password, phone, address], (err, rows, fields) => {

//       if (err) throw err;

//       res.send("Name:" + user_name + ' ' + "Phone:" + phone + ' ' + "Email:" + email + ' ' + "Password:" + password);


//   });
// });

// });


// router.post('/login',
// [check('email').isEmail(),
// check('password').not().isEmpty()],(req, res, next)=> {


//   var email = req.body.email;
//   var password = req.body.password;

//   const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(422).json({ errors: errors.array() });
//  }

//   req.getConnection(function(error, con) {

//   con.query('Select * from `userinfo` where email=? and password=?', [email, password], (err, result, fields) => {

//   console.log(result);
//   if(!err)
//   {
//       if(result.length>0)
//           {
//               res.send("Login Successfull");
//           }
//        else{
//            res.send("Invalid login details");
//        }   
//   }
//   else{ res.send("ERROR!!!!");}
// });

// });
// });



// module.exports = router;