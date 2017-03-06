controller 					= require('../controller');

function treatment_center(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
treatment_center.prototype.constructor = treatment_center;


treatment_center.prototype.treatment_center_page =  function(req, res) {
    req.session.shoppinglist = null;
    var treatmentCenters = user_model.select_treatment_centers();
    res.render('doctor/select_treatment_center', {treatmentCenters: treatmentCenters});
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
        var treatment_center = user_model.select_treatment_center_by_id(tomodel);
        if(treatment_center.length > 0) {
            res.send({ message: 'success', treatmentCenter: treatment_center});
        }
        else {
            res.send({message:'failed'});
        }
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