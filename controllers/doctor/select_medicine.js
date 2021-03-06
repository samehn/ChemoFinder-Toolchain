controller 					= require('../controller');

function select_medicine(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
select_medicine.prototype.constructor = select_medicine;


select_medicine.prototype.select_medicine_page =  function(req, res) {
   var treatment_center_id = req.param('t');
   if(treatment_center_id && Number.isInteger(parseInt(treatment_center_id))) {
        tomodel.user_id = treatment_center_id;
        user_model.async_select_treatment_center_by_id(tomodel, function(treatment_center) {
            if(treatment_center.length > 0) {
                medicine_model.async_select_distinct_medicine_not_in_treatment_center(tomodel, function(medicines) {
									if(medicines.length > 0){
                    res.render('doctor/select_medicine', {medicines: medicines});
									}else{
										res.render('doctor/select_treatment_center', {treatmentCenters: req.session.treatmentCenters});
									}
                });
            }
            else {
                res.send("404 Not Found");
            }
        });
   }
   else {
        res.send("404 Not Found");
   }
}

select_medicine.prototype.select_medicine_details =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.generic_name = data.generic_name;
        tomodel.form = data.form;
				tomodel.medicine_id = data.medicine_id;
       medicine_model.async_select_medicine_by_generic_and_form_in_pharmacies(tomodel, function(medicines) {
					if(medicines.length > 0) {
							for(var i=0; i<medicines.length; i++){
								console.log("********** SELECT MEDICINES medicine_id " + medicines[i].MEDICINE_ID + " PHARMACY_ID : " + medicines[i].PHARMACY_ID);
							}
                res.send({message: "success", medicines: medicines})
            }
            else {
							    res.send({message: 'failed'});
							 }
        });
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

module.exports = new select_medicine();
