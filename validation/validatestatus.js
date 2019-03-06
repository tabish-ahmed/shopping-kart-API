var generalvalidation=require('../validation/generalvalidation');


const statusvalidation=(details) =>{

    var error =generalvalidation.isempty(details);

    if(generalvalidation.isnumeric(details.order_id)== false){}
    else
    error.push(generalvalidation.isnumeric(details.order_id));

    if(generalvalidation.isname(details.status)== false){}
    else
    error.push(generalvalidation.isname(details.status));


    return error;
    

};


module.exports.statusvalidation=statusvalidation;