controller 					= require('../controller');

function select_pharmacy(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
select_pharmacy.prototype.constructor = select_pharmacy;


select_pharmacy.prototype.select_pharmacy_page =  function(req, res) {
		console.log("########### select pharmacy page check 0");
		var data = controller.xssClean({treatment_center: req.param('t'), quantity: req.param('q'), medicine: req.param('m'), price: req.param('p')});
    var validation_array = parameters_validations(data);
		console.log("########### select pharmacy page check 1");
		if(Object.keys(validation_array).length > 0){
				console.log("########### select pharmacy page check 2");
        res.send("404 Not Found");
    }
    else {
				console.log("########### select pharmacy page check 3");
        tomodel.medicine_id = data.medicine;
        medicine_model.async_select_approved_medicine_by_id(tomodel, function(medicine) {
            if(medicine.length == 0) {
                res.send("404 Not Found");
            }
            else {
                tomodel.quantity = data.quantity;
                tomodel.price = data.price;
                user_model.async_select_pharmacies_by_medicine_and_quantity_and_price(tomodel, function(pharmacies) {
                    res.render('doctor/select_pharmacy', {medicine: medicine, pharmacies: pharmacies});
                });
            }
        });
    }
}

function parameters_validations(data) {
		console.log("########### select pharmacy page check x1");
    var validation_array = {};
    console.log(data);
    var treatment_center = controller.validate({treatment_center: data.treatment_center},['required','integer']);
    if(treatment_center){
					console.log("########### select pharmacy page check x2");
        validation_array = controller.mergeArrays(validation_array, treatment_center);
    }
    else {
					console.log("########### select pharmacy page check x3");
        tomodel.user_id = data.treatment_center;
        var treatment_center = user_model.select_treatment_center_by_id(tomodel);
        if(treatment_center.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {treatment_center_error: 'This is not a valid Treatment Center'});
        }
    }
		console.log("########### select pharmacy page check x4");
    var quantity = controller.validate({quantity: data.quantity},['required','integer']);
    if(quantity){
					console.log("########### select pharmacy page check x41");
        validation_array = controller.mergeArrays(validation_array, quantity);
    }
		console.log("########### select pharmacy page check x5");
    var medicine = controller.validate({medicine: data.medicine},['required','integer']);
    if(medicine){
					console.log("########### select pharmacy page check x51");
        validation_array = controller.mergeArrays(validation_array, medicine);
    }

    /*var price = controller.validate({price: data.price},['required','integer']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }*/
    return validation_array;
}
module.exports = new select_pharmacy();
