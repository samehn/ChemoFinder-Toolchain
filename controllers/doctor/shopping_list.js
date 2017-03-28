controller 					= require('../controller');

function shopping_list(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
shopping_list.prototype.constructor = shopping_list;


shopping_list.prototype.shopping_list_page =  function(req, res) {
    var data = controller.xssClean({treatment_center: req.param('t')});
    var validation_array = treatment_center_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.user_id = data.treatment_center;
        user_model.async_select_treatment_center_by_id(tomodel, function(treatment_center) {
            if(treatment_center.length > 0) {
                res.render('doctor/medicines_shopping_list', {treatmentCenter: treatment_center, shoppinglist: req.session.shoppinglist});
            }
            else {
                res.send("404 Not Found");
            }
        });
    }
}

shopping_list.prototype.send_email =  function(req, res) {                    
    var data = controller.xssClean(req.body);
    var validation_array = send_email_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        console.log(result);
        res.send(result);
    }
    else {
        tomodel.user_id = data.treatment_center;
        user_model.async_select_treatment_center_by_id(tomodel, function(treatment_center) {
            if(treatment_center.length > 0) {
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: data.email, // list of receivers
                    subject: 'Chemofinder Shopping List', // Subject line
                    template: 'shopping_list',
                    context: {
                        treatmentCenter: treatment_center[0].NAME, shoppinglist: req.session.shoppinglist
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                controller.sendEmail(mailOptions);
                res.send({message: 'success'});
            }
            else {
                var result = controller.mergeArrays(validation_array, {message:'failed'});
                res.send(result);       
            }
        });
    }
}

shopping_list.prototype.save_medicine_session =  function(req, res) {
    var data = req.body;
    console.log(data);
    var validation_array = save_session_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.medicine_id = data.medicine;
        medicine_model.async_select_approved_medicine_by_id(tomodel, function(medicine) {
            if(medicine.length > 0) {
                var item = {};
                item['medicine'] = medicine[0];
                item['quantity'] = data.quantity;
                item['price'] = data.price;
                if(data.pharmacies) {
                    var pharmacies = [];
                    for (var i = 0; i < data.pharmacies.length; i++) {
                        tomodel.user_id = data.pharmacies[i];
                        var pharmacy = user_model.select_pharmacies_by_medicine_and_quantity_and_price(tomodel);
                        if(pharmacy.length > 0) {
                            pharmacies.push(pharmacy[0]);
                        }
                    }
                    item['pharmacies'] = pharmacies;    
                }
                
                if(req.session.shoppinglist == null) {
                    req.session.shoppinglist = [];
                }
                req.session.shoppinglist.push(item);
                res.send({message:"success", shoppinglist: req.session.shoppinglist});
            }
            else {
                var result = controller.mergeArrays(validation_array, {message:'failed'});
                res.send(result);
            }
        });
    }
}

function treatment_center_validations(data) {
    var validation_array = {};
    var treatment_center = controller.validate({treatment_center: data.treatment_center},['required','integer']);
    if(treatment_center){
        validation_array = controller.mergeArrays(validation_array, treatment_center);
    }

    return validation_array;
}

function save_session_validations(data) {
    console.log(data);
    var validation_array = {};
    var medicine = controller.validate({medicine: data.medicine},['required','integer']);
    if(medicine){
        validation_array = controller.mergeArrays(validation_array, medicine);
    }

    var quantity = controller.validate({quantity: data.quantity},['required','integer']);
    if(quantity){
        validation_array = controller.mergeArrays(validation_array, quantity);
    }

    var price = controller.validate({price: data.price},['required','integer']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }

    if(data.pharmacies && data.pharmacies.length > 0){
        var validPharmacies = data.pharmacies.every(function checkInteger(pharmacy) { return Number.isInteger(parseInt(pharmacy));});
        if(!validPharmacies) {
            validation_array = controller.mergeArrays(validation_array, {pharmacies_error: 'Pharmacies have to be integer'});
        }   
    }

    return validation_array;
}

function treatment_center_validations(data) {
    var validation_array = {};
    var treatment_center = controller.validate({treatment_center: data.treatment_center},['required','integer']);
    if(treatment_center){
        validation_array = controller.mergeArrays(validation_array, treatment_center);
    }

    return validation_array;
}

function send_email_validations(data) {
    var validation_array = {};
    var treatment_center = controller.validate({treatment_center: data.treatment_center},['required','integer']);
    if(treatment_center){
        validation_array = controller.mergeArrays(validation_array, treatment_center);
    }

    var email = controller.validate({email: data.email},['required','email', 'length:0-60']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }

    return validation_array;
}

module.exports = new shopping_list();
