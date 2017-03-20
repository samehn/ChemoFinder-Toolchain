controller 					= require('../controller');

function home(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
home.prototype.constructor = home;


home.prototype.home_page =  function(req, res) {
	res.render('user/home');
}

home.prototype.terms_and_conditions_page =  function(req, res) {
    var filePath = "./public/downloads/chemofinder_terms_and_conditions.pdf";
    console.log(filePath);
    controller.fs.readFile(filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
}

home.prototype.get_pharmacies =  function(req, res) {
	if(Number.isInteger(parseInt(req.body.id))) {
		tomodel.medicine_id = req.body.id;
		var pharmacies = user_model.select_pharmacy_by_medicine_id(tomodel);
        if(pharmacies.length != 0)
        {
            var result = {message: "success"};
            result['pharmacies'] = pharmacies; 
            res.send(result);
        }
        else {
            res.send({message: "failed"});    
        }
    }
    else {
        res.send({message: "failed"});
    }
}

home.prototype.get_medicines = function(req, res) {
	var medicines = medicine_model.select_approved_medicines_distinct_generic_name();
	res.send({medicines: medicines});
}

home.prototype.get_medicines_by_generic_and_form = function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.generic_name = data.generic_name;
        tomodel.form = data.form
        var medicines = medicine_model.select_medicine_by_generic_and_form_in_pharmacies(tomodel);
        var result = {message: "success"};
        result['medicines'] = medicines; 
        res.send(result);
    }
}

function medicine_validations(data) {
    var validation_array = {};
    var generic_name = controller.validate({generic_name: data.generic_name},['required','length:0-60']);
    if(generic_name){
        validation_array = controller.mergeArrays(validation_array, generic_name);
    }

    var form = controller.validate({form: data.form},['required', 'length:0-60']);
    if(form){
        validation_array = controller.mergeArrays(validation_array, form);
    }

    return validation_array;
}

module.exports = new home();