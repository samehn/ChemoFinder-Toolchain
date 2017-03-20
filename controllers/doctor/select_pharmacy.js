controller 					= require('../controller');

function select_pharmacy(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
select_pharmacy.prototype.constructor = select_pharmacy;


select_pharmacy.prototype.select_pharmacy_page =  function(req, res) {
    var data = controller.xssClean({treatment_center: req.param('t'), quantity: req.param('q'), medicine: req.param('m'), price: req.param('p')});
    var validation_array = parameters_validations(data);
    if(Object.keys(validation_array).length > 0){
        res.send("404 Not Found");
    }
    else {
        tomodel.medicine_id = data.medicine;
        var medicine = medicine_model.select_approved_medicine_by_id(tomodel);
        if(medicine.length == 0) {
            res.send("404 Not Found");
        }
        else {
            tomodel.quantity = data.quantity;
            tomodel.price = data.price;
            var pharmacies = user_model.select_pharmacies_by_medicine_and_quantity_and_price(tomodel);
            res.render('doctor/select_pharmacy', {medicine: medicine, pharmacies: pharmacies});
        }
    }
}

function parameters_validations(data) {
    var validation_array = {};
    console.log(data);
    var treatment_center = controller.validate({treatment_center: data.treatment_center},['required','integer']);
    if(treatment_center){
        validation_array = controller.mergeArrays(validation_array, treatment_center);
    }
    else {
        tomodel.user_id = data.treatment_center;
        var treatment_center = user_model.select_treatment_center_by_id(tomodel);
        if(treatment_center.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {treatment_center_error: 'This is not a valid Treatment Center'});
        }
    }

    var quantity = controller.validate({quantity: data.quantity},['required','integer']);
    if(quantity){
        validation_array = controller.mergeArrays(validation_array, quantity);
    }
    
    var medicine = controller.validate({medicine: data.medicine},['required','integer']);
    if(medicine){
        validation_array = controller.mergeArrays(validation_array, medicine);
    }

    var price = controller.validate({price: data.price},['required','integer']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }
    return validation_array;
}
module.exports = new select_pharmacy();
