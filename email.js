var fs = require("fs");
var nodemailer = require("nodemailer");
var ejs = require("ejs");
var cred=require('./cred')


function send_mail(templatename, name, details){



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: cred.user,
      pass: cred.password
        }
  });
    ejs.renderFile(__dirname + templatename, { name, details }, function (err, data) {
        if (err) {
            console.log(err);
          } else {
            var mainOptions = {
              from: 'tabishahmedd5@gmail.com',
              to: details.email,
              subject: 'Notification from APPKART',
              html: data
            };
            console.log(data);

            transporter.sendMail(mainOptions, function (err, info) {
              if (err) {
                console.log(err);
              } else {
                console.log('Message sent: ' + info.response);
              }
            });
          }

        });
}


module.exports.send_mail=send_mail;





































// var transporter = nodemailer.createTransport({
//     service:'gmail',
//     auth: {
//         user: 'tabishahmedd5@gmail.com',
//         pass: '123456'
//     }
// });

// ejs.renderFile(__dirname + "/email-templates/login.ejs", { name: 'Stranger', data:'' }, function (err, data) {
// if (err) {
//     console.log(err);
// } else {
//     var mainOptions = {
//         from: 'tabishahmedd5@gmail.com',
//         to: 'shivam.sharma@appventurez.com',
//         subject: subject,
//         html: data
//     };
//     console.log("html data ======================>", mainOptions.html);
//     transporter.sendMail(mainOptions, function (err, info) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log('Message sent: ' + info.response);
//         }
//     });
// }

// });


































// var nodemailer=require('nodemailer');
// // var cred=require('../cred');

// function emmail(){

// var transporter=nodemailer.createTransport({

//     service: 'gmail',
//     auth:{
//          user:'tabishahmedd5@gmail.com',
//          pass: ''
//     }
// });

// var mailOptions={
// from:'tabishahmedd5@gmail.com',
// to: 'shivam.sharma@appventurez.com',
// subject:'SUCCESSFULL',
// text: 'LOGIN SUCCESSFULL'
// };

// transporter.sendMail(mailOptions, (error, info)=>{

//     if(error){
//         console.log(error);
//     } else {
//         console.log('email sent:'+ info.response);
//     }
// });
// }

// module.exports=emmail;