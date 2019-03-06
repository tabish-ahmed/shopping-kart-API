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

    if(generalvalidation.isname(details.seller_name)== false){}
    else
    error.push(generalvalidation.isname(details.seller_name));


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


const addproductvalidation=(details) =>{
     

    

    var error =generalvalidation.isempty(details);
    // if(generalvalidation.isnumeric(details.seller_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.seller_id));

    if(generalvalidation.isnumeric(details.price)== false){}
    else
    error.push(generalvalidation.isnumeric(details.price));

    if(generalvalidation.isnumeric(details.availability)== false){}
    else
    error.push(generalvalidation.isnumeric(details.availability));
    
    return error;
    

};


const deleteproductvalidation=(details) =>{

    var error =generalvalidation.isempty(details);
    // if(generalvalidation.isnumeric(details.seller_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.seller_id));

    if(generalvalidation.isnumeric(details.product_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.product_id));
    
    return error;
    

};

const updateproductvalidation=(details) =>{

    var error =generalvalidation.isempty(details);

    // if(generalvalidation.isnumeric(details.seller_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.seller_id));

    if(generalvalidation.isnumeric(details.product_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.product_id));

    if(generalvalidation.isnumeric(details.price)== false){}
    else
    error.push(generalvalidation.isnumeric(details.price));

    if(generalvalidation.isnumeric(details.availability)== false){}
    else
    error.push(generalvalidation.isnumeric(details.availability));
    
    return error;
};


const showproductvalidation=(details) =>{

    var error =generalvalidation.isempty(details);

    if(generalvalidation.isnumeric(details.seller_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.seller_id));

    // if(generalvalidation.isnumeric(details.product_id)== false){}
    // else
    // error.push(generalvalidation.isnumeric(details.product_id));

    
    
    return error;
};



module.exports.loginvalidation=loginvalidation;
module.exports.signupvalidation=signupvalidation;
module.exports.addproductvalidation=addproductvalidation;
module.exports.deleteproductvalidation=deleteproductvalidation;
module.exports.updateproductvalidation=updateproductvalidation;
module.exports.showproductvalidation=showproductvalidation;


