var generalvalidation=require('../validation/generalvalidation');


const loginvalidation=(details) =>{

    var error =generalvalidation.isempty(details);
    if(generalvalidation.isemail(details.email)== false){}
    else
    error.push(generalvalidation.isemail(details.email));
    return error;
    

};


const signupvalidation=(details) =>{

    var error =generalvalidation.isempty(details);


    if(generalvalidation.isname(details.user_name)== false){}
    else
    error.push(generalvalidation.isname(details.user_name));


    if(generalvalidation.isnumeric(details.phone)== false){}
    else
    error.push(generalvalidation.isnumeric(details.phone));

    if(generalvalidation.isemail(details.email)== false){}
    else
    error.push(generalvalidation.isemail(details.email));

    if(generalvalidation.isnumeric(details.country_code)== false){}
    else
    error.push(generalvalidation.isnumeric(details.country_code));


    return error;
    

};

const addcartvalidation=(details) =>{

    var error =generalvalidation.isempty(details);

    // if(generalvalidation.isnumeric(details.user_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.user_id));

    if(generalvalidation.isnumeric(details.product_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.product_id));

    if(generalvalidation.isnumeric(details.quantity)== false){}
    else
    error.push(generalvalidation.isnumeric(details.quantity));

    // if(generalvalidation.isnumeric(details.price)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.price));
    return error;
    

};



const deletecartvalidation=(details) =>{

    var error =generalvalidation.isempty(details);

    // if(generalvalidation.isnumeric(details.user_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.user_id));

    if(generalvalidation.isnumeric(details.product_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.product_id));

    // if(generalvalidation.isnumeric(details.quantity)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.quantity));

    // if(generalvalidation.isnumeric(details.price)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.price));
    return error;
    

};


module.exports.addcartvalidation=addcartvalidation;
module.exports.loginvalidation=loginvalidation;
module.exports.signupvalidation=signupvalidation;
module.exports.deletecartvalidation=deletecartvalidation;
