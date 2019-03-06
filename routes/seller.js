const express = require('express');
const router = express.Router();
const app = new express();
const validateseller = require('../validation/validateseller');
const generalvalidation = require('../validation/generalvalidation');
const config = require('../config');
const emmail = require('../email')
const multer = require('multer');
const jwt = require('jsonwebtoken');




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now())
  }
});
var upload = multer({ storage: storage, });






//login API

router.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let details = { ...req.body };
  var error = validateseller.loginvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }
  else {


    req.getConnection((err, conn) => {
      if (err)
        console.log('connection failed');
      else {
        conn.query('Select * from sellerinfo where email=? and password=?', [email, password], (err, result) => {
          if (err)
            console.log('error');
          else {
            if (result.length > 0) {

              let seller_id = result[0].seller_id;
              let seller_name = result[0].seller_name;

              jwt.sign({ name: seller_name, id: seller_id, email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                conn.query('update sellerinfo set token=? where email=? and password=?', [token, email, password], (err, re) => {

                  res.json({
                    status: 200,
                    message: 'Authentication successful!',
                    data: [{
                      token: token,
                      email: req.body.email
                    }]
                  });
                  let name = seller_name;
                  emmail.send_mail('/email-templates/login.ejs', name, details);


                });

              });
            }
            else
              res.json({
                status: 200,
                message: 'Incorrect email or password!',
                data: [{
                  email: req.body.email
                }]
              });
          }
        }
        );
      };
    });
  }
});






//signup API

router.post('/signup', (req, res) => {
  let seller_name = req.body.seller_name;
  let email = req.body.email;
  let password = req.body.password;
  let phone = req.body.phone;
  let country_code = req.body.country_code;

  let shop_address = req.body.shop_address;

  let details = { ...req.body };
  var error = validateseller.signupvalidation(details);
  if (error.length > 0) {
    // console.log(error);
    // console.log(error.length);
    res.send(error);


  }

  else {
    req.getConnection((err, conn) => {
      if (err)
        res.json({
          status: 403,
          message: 'Connection failed'

        });
      else {




        conn.query('Select * from sellerinfo where email=?', [email], (err, result) => {
          if (err)
            console.log('error');
          else {
            if (result.length > 0) {

              res.json({
                status: 403,
                message: 'You are already a user please login to continue!',
                data: [{
                  email: req.body.email
                }]
              });

            }

            else {

              jwt.sign({ email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {



                conn.query('INSERT INTO `sellerinfo`( `seller_name`, `email`, `password`, `phone`, `shop_address`, `token`, `country_code`) VALUES (?,?,?,?,?,?,?)', [seller_name, email, password, phone, shop_address, token, country_code], (err) => {
                  if (err)
                    console.log(err);
                  else {
                    // res.send({ status: 'success', message: 'Signup sucessfull' });

                    res.json({

                      status: 200,
                      message: 'Authentication successful!',
                      data: [{

                        token: token,
                        name: req.body.seller_name,
                        email: req.body.email,
                        phone: req.body.phone
                      }]


                    });
                    emmail.send_mail('/email-templates/signup.ejs', seller_name, details);
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











//product add API

router.post('/addproduct', generalvalidation.verifytoken, upload.array('images', 10), (req, res) => {



  let seller_id = req.data.id;
  let product_name = req.body.product_name;
  let price = req.body.price;
  let category = req.body.category;

  let availability = req.body.availability;
  let description = req.body.description;
  let details = { ...req.body };
  details.seller_id = seller_id;

  // console.log(details.seller_id)
  // return





  var error = validateseller.addproductvalidation(details);


  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((error, con) => {
      var promise = new Promise((resolve, reject) => {

        con.query('Select * from products where seller_id=? and product_name=?', [seller_id, product_name], (err, result, fields) => {
          if (result.length <= 0) {
            con.query('INSERT INTO `products`(`seller_id`, `product_name`, `price`, `category`,`availability`, `description`) VALUES (?,?,?,?,?,?)', [seller_id, product_name, price, category, availability, description], (err) => {

              if (err) throw err;
              else {
                console.log('Product added to database successfully');
                res.json({
                  status: 200,
                  success: true,
                  message: 'Product added successfully',
                  data: [{
                    seller_id: req.data.id,
                    product_name: req.body.product_name,
                    price: req.body.price,
                    availability: req.body.availability
                  }]


                });

                //sending email to seller after adding product
                seller_name = req.data.name;
                email = req.data.email;
                details.email = email;

                emmail.send_mail('/email-templates/addproduct.ejs', seller_name, details);


              }
            });
          }
          else {
            console.log("Product already exists");
            res.json({
              status: 403,
              success: false,
              message: 'Product already exists',
              data: [{
                seller_id: req.data.id,
                product_name: req.body.product_name,
              }]
            });



          }
        });
        resolve();
      }).then(() => {
        for (var key in req.files) {
          con.query('INSERT INTO `images`(`seller_id`, `product_name`, `image_name`) VALUES (?,?,?)', [seller_id, product_name, req.files[key].filename], (err) => {
          });
        }
      })



    });


  }
});







//product delete API

router.post('/deleteproduct', generalvalidation.verifytoken, (req, res) => {
  let seller_id = req.data.id;
  let product_id = req.body.product_id;

  let details = { ...req.body };
  var error = validateseller.deleteproductvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }

  else {
    req.getConnection((error, con) => {


      con.query('UPDATE products set isdelete=1 where seller_id=? and product_id=? and isdelete=0', [seller_id, product_id], (err, rows, fields) => {

        if (err) throw err;
        else {

          res.json({
            status: 200,
            success: true,
            message: 'Product deleted successfully',
            data: [{
              seller_id: req.data.id,
              product_id: req.body.product_id
            }]
          });

          email = req.data.email;
          seller_name = req.data.seller_name;
          details.email = email;
          details.seller_name = seller_name;

          emmail.send_mail('/email-templates/deleteproduct.ejs', seller_name, details);
        }
      });
    });
  }
});





//product update API

router.post('/updateproduct', generalvalidation.verifytoken, (req, res) => {
  let seller_id = req.data.id;
  let product_id = req.body.product_id;
  let price = req.body.price;
  let availability = req.body.availability;

  let details = { ...req.body };
  details.seller_id = seller_id
  var error = validateseller.updateproductvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }

  else {

    req.getConnection((error, con) => {

      con.query('UPDATE products set price=?, availability=? where seller_id=? and product_id=? and isdelete=0', [price, availability, seller_id, product_id], (err, rows, fields) => {

        if (err) throw err;

        else {

          console.log('Product updated successfully');


          res.json({
            status: 200,
            success: true,
            message: 'Product Updated Successfully',
            date: [{
              seller_id: req.body.seller_id,
              product_id: req.body.product_id,
              updated_price: req.body.price,
              updated_quantity: req.body.availability
            }]

          });
          email = req.data.email;
          seller_name = req.data.seller_name;
          details.email = email;
          details.seller_id = seller_id;
          details.seller_name = seller_name;


          emmail.send_mail('/email-templates/deleteproduct.ejs', seller_name, details);




        }

      });


    });
  }
});







//Show Products API

router.post('/showproduct', generalvalidation.verifytoken, (req, res) => {
  let seller_id = req.data.id;
  let limit=req.body.limit; 
  let page=req.body.page; 
  let offset=limit*page; 
 


    // let product_id = req.body.product_id;


    req.getConnection((error, con) => {

      con.query('SELECT * from products  where seller_id=? and isdelete=0  LIMIT '+limit+' OFFSET '+offset, [seller_id], (err, rows) => {

        if (err) throw err;

        else {

         
          res.json({
            status: 200,
            success: true,
            message: 'ALL PRODUCTS ARE SHOWN BELOW',
            data:rows
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
// // var multer=require('multer');
// // var FormData = require('form-data');


// // var storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //       cb(null, '/uploads')
// //     },
// //     filename: function (req, file, cb) {
// //       cb(null, file.fieldname + '-' + Date.now()+'.jpg')
// //     }
// //   });

// //   var upload = multer({ storage: storage }).array('image');



// //SELLER SIGNUP----ADDING SELLER DETAILS IN DATABASE
// router.post('/signup', [
//     check('seller_name','Name cannot be left empty').not().isEmpty(),
//     check('email','invalid Email').isEmail(),check('password','Name cannot be left empty').not().isEmpty(),
//     check('phone').isNumeric().isLength({ min:10 }),
//     check('shopaddress','address cannot be left empty').not().isEmpty()],(req, res)=> {


//   var seller_name = req.body.seller_name;
//   var email = req.body.email;
//   var password = req.body.password;
//   var phone = req.body.phone;
//   var shopaddress = req.body.shopaddress;

// //   {seller_name,email,password,phone,shopaddress} = req.body;


//   const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(422).json({ errors: errors.array() });
//  }

//   req.getConnection((error, con) =>{

//   con.query('INSERT INTO `sellerinfo`(`seller_name`, `email`, `password`, `phone`, `shopaddress`) VALUES (?,?,?,?,?)', [seller_name, email, password, phone, shopaddress], (err, result, fields) => {

//       if (err){
//           res.send("ERROR!!!!");
//       }
//       else{
//       res.send("Name:" + seller_name + ' ' + "Phone:" + phone + ' ' + "Email:" + email + ' ' + "Password:" + password);
//       }

//   });
// });

// });



// //SELLER LOGIN
// router.post('/login', 
// [check('email').isEmail(),
// check('password').not().isEmpty().isLength({ min:6 })],(req, res, next)=> {


//   var email = req.body.email;
//   var password = req.body.password;


//   const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(422).json({ errors: errors.array() });
//  }


//   req.getConnection(function(error, con) {


//     //CHECKING WHETHER SELLER EXISTS IN DATABASE OR NOT!!!
//   con.query('Select * from `sellerinfo` where email=? and password=?', [email, password], (err, result, fields) => {

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




// //ADDING PRODUCTS TO DATABASE


// router.post('/addproduct',
// [check('seller_id').isNumeric().not().isEmpty(),
// check('product_name').not().isNumeric().not().isEmpty(), 
// check('price').isNumeric().not().isEmpty(), 
// check('availability').isNumeric().not().isEmpty(),
// check('description').not().isEmpty()], (req, res)=> {


//     var seller_id = req.body.seller_id;
//     var product_name = req.body.product_name;
//     var price = req.body.price;
//     var availability = req.body.availability;
//     var description = req.body.description;

//     const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//    return res.status(422).json({ errors: errors.array() });
//  }

// //  upload(req,res, (err)=>{
// //      if(err){

// //      }
// //      res.json({
// //          success:true,
// //          message:'image uploaded'
// //      });
// //  });

//     req.getConnection((error, con) =>{


//         con.query('Select * from sellerinfo where seller_id=?', [seller_id], (err, result, fields) => {

//             if(result.length>0){


//                con.query('INSERT INTO `products`(`seller_id`, `product_name`, `price`, `availability`, `description`) VALUES (?,?,?,?,?)', [seller_id, product_name, price, availability, description], (err, rows, fields) => {

//                    if (err) throw err;

//                       res.send('Product added successfully');
//                           });
//                         }
//         else{
//             res.send("You are not a valid seller");
//         }                
//   });

//   });
// });



//   //DELETING PRODUCTS FROM PRODUCT TABLE


// router.post('/delproduct',(req, res)=> {


//     var seller_id = req.body.seller_id;
//     var product_id = req.body.product_id;


//     req.getConnection((error, con) =>{

//         // Checking that the seller who is deleting the product is one who has added that product.
//         con.query('Select * from products where seller_id=? and product_id=? and isdelete=0', [seller_id, product_id], (err, result, fields) => {

//             if(result.length>0){  
//                con.query('UPDATE products set isdelete=1 where seller_id=? and product_id=? and isdelete=0', [seller_id, product_id], (err, rows, fields) => {

//                    if (err) throw err;

//                       res.send('Product deleted successfully');
//                           });
//                               }
//             else{
//             res.send("You are not allowed to delete this product");
//                 }                
//   }); 
//   });
//   });



//     //UPDATING PRODUCTS FROM PRODUCT TABLE


// router.post('/updateproduct',(req, res)=> {


//     var seller_id = req.body.seller_id;
//     var product_id = req.body.product_id;
//     var price = req.body.price;
//     var availability = req.body.availability;  


//     req.getConnection((error, con) =>{

//         // Checking that the seller who is updating the product is one who has added that product.
//         con.query('Select * from products where seller_id=? and product_id=? and isdelete=0', [seller_id, product_id], (err, result, fields) => {

//             if(result.length>0){  
//                con.query('UPDATE products set price=?, availability=? where seller_id=? and product_id=? and isdelete=0', [price, availability, seller_id, product_id], (err, rows, fields) => {

//                    if (err) throw err;

//                       res.send('Product updated successfully');
//                           });
//                               }
//             else{
//             res.send("You are not allowed to update this product");
//                 }                
//   }); 
//   });
//   });






// module.exports = router;
