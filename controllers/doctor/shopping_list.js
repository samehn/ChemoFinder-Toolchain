controller 					= require('../controller');

function shopping_list(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
		shopping_list_model = require('../../models/shopping_list_model');
};
shopping_list.prototype.constructor = shopping_list;


shopping_list.prototype.shopping_list_page =  function(req, res) {
    var data = controller.xssClean({treatment_center: req.param('t')});
    var validation_array = treatment_center_validations(data);
		//need to change that later
		req.session.pid = req.param('pid');
		req.session.tc = req.param('t');

		var conf = req.param('conf');
		var confirmedVal = false;
		if(conf == 'true'){
			confirmedVal = true;
		}
		console.log('******************************************************');
		console.log("doctor id for shopping list" + req.session.doctor_id);
		console.log('patient id = ' + req.session.pid);
		console.log('******************************************************');
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.user_id = data.treatment_center;
        user_model.async_select_treatment_center_by_id(tomodel, function(treatment_center) {
            if(treatment_center.length > 0) {
							req.session.treatmentCenter = treatment_center;
                res.render('doctor/medicines_shopping_list', {treatmentCenter: treatment_center, shoppinglist: req.session.shoppinglist, patientId: req.param('pid'), confirmed: confirmedVal});
            }
            else {
                res.send("404 Not Found");
            }
        });
    }
}


shopping_list.prototype.confirm_shopping_list = function(req, res) {
	console.log("############# about to call confirm shopping list #########################s");
	var data = controller.xssClean(req.body);
	console.log("patient id = " + req.session.pid);
	console.log('shopping list first med id ' + req.session.shoppinglist[0].medicine_id);
	console.log('shopping list first med id ' + req.session.shoppinglist[0].medicine.BRAND_NAME);

	const uuidv4 = require('uuid/v4');
  var uuid = uuidv4(); // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
  console.log("UUID " + uuid);

	for(var i=0; i<req.session.shoppinglist.length; i++){
		var data = {};
		var sub_uuid = uuidv4(); // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
		data.OPERATION_ID = uuid;
		data.SUB_OPERATION_ID = sub_uuid;
		data.MEDICINE_ID = req.session.shoppinglist[i].medicine_id;
		data.TREATMENT_CENTR_ID = req.session.tc;
		data.DOCTOR_ID = req.session.doctor_id;
		data.PATIENT_ID = req.session.pid;
		data.MEDICINE_QUANTITY = req.session.shoppinglist[i].quantity ;
		data.MEDICINE_GENERIC_NAME = req.session.shoppinglist[i].medicine.GENERIC_NAME ;
		data.MEDICINE_BRAND_NAME = req.session.shoppinglist[i].medicine.BRAND_NAME ;
		data.MEDICINE_FORM = req.session.shoppinglist[i].medicine.FORM ;
		data.MEDICINE_STRENGTH = req.session.shoppinglist[i].medicine.STRENGTH ;
		data.MEDICINE_STRENGTH_UNIT = req.session.shoppinglist[i].medicine.STRENGTH_UNIT ;
		data.MEDICINE_MANUFACTURER = req.session.shoppinglist[i].medicine.MANUFACTURER;
		shopping_list_model.insert_new_shopping_list_operation(data);
console.log('req.session.shoppinglist[i].pharmacies.lenght' + req.session.shoppinglist[i].pharmacies.length);
		for(var j=0; j<req.session.shoppinglist[i].pharmacies.length; j++){
			data.PHARMACY_ID = req.session.shoppinglist[i].pharmacies[j].ID;
			data.ENTITY_NAME = req.session.shoppinglist[i].pharmacies[j].ENTITY_NAME;
			data.PHONE_NUMBER  = req.session.shoppinglist[i].pharmacies[j].PHONE_NUMBER ;
			data.EMAIL  = req.session.shoppinglist[i].pharmacies[j].EMAIL ;
			data.ADDRESS  = req.session.shoppinglist[i].pharmacies[j].ADDRESS ;
			data.CITY  = req.session.shoppinglist[i].pharmacies[j].CITY ;
			data.COUNTRY  = req.session.shoppinglist[i].pharmacies[j].COUNTRY ;
			data.OPEN_FROM  = req.session.shoppinglist[i].pharmacies[j].OPEN_FROM ;
			data.OPEN_TO  = req.session.shoppinglist[i].pharmacies[j].OPEN_TO ;
			data.EXPIRY_DATE  = req.session.shoppinglist[i].pharmacies[j].EXPIRY_DATE ;
			data.PACK_SIZE  = req.session.shoppinglist[i].pharmacies[j].PACK_SIZE ;
			data.PRICE_PER_PACK  = req.session.shoppinglist[i].pharmacies[j].PRICE_PER_PACK ;
			shopping_list_model.insert_new_shopping_list_pharmacy(data);
	}
	}

  res.send('success');
	//res.render('doctor/medicines_shopping_list', {treatmentCenter: req.session.treatmentCenter, shoppinglist: req.session.shoppinglist, patientId: req.param('pid'), confirmed: true});
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
                    subject: 'ChemoFinder Shopping List', // Subject line
                    template: 'shopping_list',
                    context: {
                        treatmentCenter: treatment_center[0].ENTITY_NAME, patientId: req.session.pid, shoppinglist: req.session.shoppinglist
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
    console.log("*********save medicine session##########"+data);
		var validation_array = save_session_validations(data);
		console.log("checkpoint 01");
		if(Object.keys(validation_array).length > 0){
			console.log("checkpoint 02 ");
			for(var i=0; i<Object.keys(validation_array).length; i++){
				console.log(Object.keys(validation_array)[i]);
			}
			console.log("-------------------------------");
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
								item['medicine_id'] = data.medicine;
								var pharmacies = [];
                if(data.pharmacies) {
                    for (var i = 0; i < data.pharmacies.length; i++) {
                        tomodel.user_id = data.pharmacies[i];
                        var pharmacy = user_model.select_pharmacies_by_pharmacy_medicine_and_quantity_and_price(tomodel);
                        if(pharmacy.length > 0) {
                            pharmacies.push(pharmacy[0]);
                        }
                    }
                }
								console.log("checkpoint 1");
								item['pharmacies'] = pharmacies;
                if(req.session.shoppinglist == null) {
									console.log("checkpoint 2");
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

    /*var price = controller.validate({price: data.price},['required','integer']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }*/

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
