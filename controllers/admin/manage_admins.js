controller 					= require('../controller');

function manage_admins(){
	tomodel = {};
	admin_model 	= require('../../models/admin_model');
};
manage_admins.prototype.constructor = manage_admins;

manage_admins.prototype.admins_list_page =  function(req, res) {
    var admins = admin_model.select_admins();
    var data = {admins: admins, admin_type: req.session.admin_type, admin_id: req.session.admin_id};  
    res.render('admin/admins_list', data);
}

manage_admins.prototype.change_type =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = admin_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {
        tomodel.admin_id = data.id;
        tomodel.type = data.type;
        admin_model.change_admin_type(tomodel);
        res.send({message: "success"});
    }
}

manage_admins.prototype.activate_admin =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = admin_activation_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {
        tomodel.admin_id = data.id;
        tomodel.active = data.active;
        admin_model.update_admin_active(tomodel);
        res.send({message: "success"});
    }
}

function admin_validations(data) {
    var validation_array = {};
    var id = controller.validate({id: data.id},['required', 'integer']);
    if(id){
        validation_array = controller.mergeArrays(validation_array, id);
    }
    
    var type = controller.validate({type: data.type},['required', 'integer']);
    if(type){
        validation_array = controller.mergeArrays(validation_array, type);
    }
    else {
       var types = [0, 1];
       if(!types.includes(parseInt(data.type))) {
            validation_array = controller.mergeArrays(validation_array, {type_error: 'This is not a valid type'});       
       } 
    }

    return validation_array;
}

function admin_activation_validations(data) {
    var validation_array = {};
    var id = controller.validate({id: data.id},['required', 'integer']);
    if(id){
        validation_array = controller.mergeArrays(validation_array, id);
    }
    
    var active = controller.validate({active: data.active},['required', 'integer']);
    if(active){
        validation_array = controller.mergeArrays(validation_array, active);
    }
    else {
       var active_types = [0, 1];
       if(!active_types.includes(parseInt(data.active))) {
            validation_array = controller.mergeArrays(validation_array, {active_error: 'This is not a valid activation type'});       
       } 
    }

    return validation_array;
}

module.exports = new manage_admins();
