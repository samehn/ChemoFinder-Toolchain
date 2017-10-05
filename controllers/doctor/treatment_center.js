controller 					= require('../controller');

function treatment_center(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
treatment_center.prototype.constructor = treatment_center;


treatment_center.prototype.treatment_center_page =  function(req, res) {
    req.session.shoppinglist = null;
    user_model.async_select_treatment_centers(function(treatmentCenters) {
				req.session.treatmentCenters = treatmentCenters;
        res.render('doctor/select_treatment_center', {treatmentCenters: treatmentCenters});
    });
}

treatment_center.prototype.get_treatment_center_details =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = treatment_center_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.user_id = data.id;
        user_model.async_select_treatment_center_by_id(tomodel, function(treatment_center) {
            if(treatment_center.length > 0) {
							medicine_model.async_count_medicine_not_in_treatment_center(tomodel, function (medicines_count) {
								console.log('*************** medicines count in treatment center is ' + medicines_count.length + ' *********************');
								res.send({ message: 'success', treatmentCenter: treatment_center, valideTreatmentCenter : medicines_count.length});
							});
            }
            else {
                res.send({message:'failed'});
            }
        });
    }
}

function treatment_center_validations(data) {
    var validation_array = {};
    var id = controller.validate({id: data.id},['required','integer']);
    if(id){
        validation_array = controller.mergeArrays(validation_array, id);
    }

    return validation_array;
}

module.exports = new treatment_center();
