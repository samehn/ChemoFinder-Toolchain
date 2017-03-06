controller 					= require('../controller');

function manage_medicines(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
};
manage_medicines.prototype.constructor = manage_medicines;


manage_medicines.prototype.manage_medicines_page =  function(req, res) {
	var approved_medicines = medicine_model.select_approved_medicines();
	var non_approved_medicines = medicine_model.select_non_approved_medicines();
    var data = {approved_medicines: approved_medicines,  non_approved_medicines: non_approved_medicines};
    if(req.session.extention_error)
    {
        data['extention_error'] = true;
        req.session.extention_error = null;
    }
    if(req.session.format_error)
    {
        data['format_error'] = req.session.format_error;
        req.session.format_error = null;
    }  
    if(req.session.success_message)
    {
        data['success_message'] = req.session.success_message;
        req.session.success_message = null;
    } 
    res.render('admin/manage_medicines', data);
}

manage_medicines.prototype.add_new_medicine =  function(req, res) {
	var data = controller.xssClean(req.body);
    var validation_array = medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
    	tomodel.generic_name = data.generic_name;
    	tomodel.brand_name = data.brand_name;
    	tomodel.form = data.form;
    	tomodel.strength = data.strength;
    	tomodel.strength_unit = data.strength_unit;
    	tomodel.manufacturer = data.manufacturer;
    	var medicine = medicine_model.select_medicine_by_main_keys(tomodel);
    	if(medicine.length == 0) {
    		tomodel.route = data.route;
    		tomodel.sra = data.sra;
    		if(!data.approval_date) {
    			data.approval_date = '01/01/0001';
    		}
    		tomodel.approval_date = data.approval_date;
    		tomodel.source = data.source;
    		tomodel.extract_date = data.extract_date;
    		medicine_model.insert_new_medicine(tomodel);
            res.send({message: 'success'});
    	}
    	else {
    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This Medicine is already exists', message:'failed'});
    		res.send(result);
    	}
    }                  
}

manage_medicines.prototype.update_medicine =  function(req, res) {
	var data = controller.xssClean(req.body);
    var validation_array = medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
    	if(data.medicine_id && Number.isInteger(parseInt(data.medicine_id))) {
    		tomodel.medicine_id = data.medicine_id;
	    	var medicine = medicine_model.select_medicine_by_id(tomodel);
	    	if(medicine.length > 0) {
	    		tomodel.generic_name = data.generic_name;
		    	tomodel.brand_name = data.brand_name;
		    	tomodel.form = data.form;
		    	tomodel.strength = data.strength;
		    	tomodel.strength_unit = data.strength_unit;
		    	tomodel.manufacturer = data.manufacturer;
		    	tomodel.route = data.route;
	    		tomodel.sra = data.sra;
	    		if(!data.approval_date) {
	    			data.approval_date = '01/01/0001';
	    		}
	    		tomodel.approval_date = data.approval_date;
	    		tomodel.source = data.source;
	    		tomodel.extract_date = data.extract_date;
	    		medicine_model.update_medicine(tomodel);
	    		res.send({message: 'success'});
	    	}
	    	else {
	    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This is not a valid medicine', message:'failed'});
	    		res.send(result);
	    	}
    	}
    	else {
    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This is not a valid medicine', message:'failed'});
	    	res.send(result);
    	}
    }
}

manage_medicines.prototype.delete_medicine =  function(req, res) {
	if(req.body.medicine_id && Number.isInteger(parseInt(req.body.medicine_id))) {
		tomodel.medicine_id = req.body.medicine_id;
    	var medicine = medicine_model.select_medicine_by_id(tomodel);
    	if(medicine.length > 0) {
    		medicine_model.delete_medicine(tomodel);
    		res.send({message: "success"});
    	}
    	else {
    		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
    	}
	}
	else {
		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	}
}

manage_medicines.prototype.get_medicine_by_id =  function(req, res) {
	if(req.params.id && Number.isInteger(parseInt(req.params.id))) {
		tomodel.medicine_id = req.params.id;
    	var medicine = medicine_model.select_medicine_by_id(tomodel);
    	if(medicine.length > 0) {
    		res.send({message: "success", medicine: medicine});
    	}
    	else {
    		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
    	}
	}
	else {
		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	}
}

manage_medicines.prototype.download_medicines_template =  function(req, res) {
	var file = './public/downloads/medicinelist_example_data.xlsx';
  	res.download(file); // Set disposition and send it.
}

manage_medicines.prototype.upload_medicines_list =  function(req, res) {
	var sampleFile;
    if (!req.files) {
        res.send('No files were uploaded.');
        console.log('No files were uploaded.');
        return;
    }
    sampleFile = req.files.sampleFile;
    var fileArray = sampleFile.name.split('.');
    var extension = fileArray[fileArray.length - 1];
    if(extension == "xlsx")
    {
        sampleFile.mv('./public/uploads/medicines/approved_medicines.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                parsing_approved_medicines(req, res);
                res.redirect('/admin/manage_medicines');
                console.log('File uploaded!');
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/admin/manage_medicines');
    }
}

manage_medicines.prototype.upload_stock_list =  function(req, res) {
	var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        console.log('No files were uploaded.');
        return;
    }
    sampleFile = req.files.sampleFile;
    var fileArray = sampleFile.name.split('.');
    var extension = fileArray[fileArray.length - 1];
    if(extension == "xlsx")
    {
        sampleFile.mv('./public/downloads/stocklist_example_data.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                req.session.success_message = '<div class="alert alert-success message-form"> The file is uploaded successfuly</div>'
                res.redirect('/admin/manage_medicines');
                console.log('File uploaded!');
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/admin/manage_medicines');
    }
}

function validate_medicine_list_sheet(worksheet) {
	return true;
}

function parsing_approved_medicines(req, res) {
	var workbook = controller.XLSX.readFile('./public/uploads/medicines/approved_medicines.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    if(validate_medicine_list_sheet(worksheet)) {
    	var flag = true;
	    var format_error_flag = false;
    	var i = 2;
	    var warning_message = "<div class='alert alert-danger error-form'> Some medicines cannot be added/updated due to the following: <ul>";
	    while(flag)
	    {
	        var wm = "<li> On line " + i + ":";

	        var data = {};

	        var id_address = 'A'+i;
	        var id_cell = worksheet[id_address];
	        
	        if(id_cell == undefined)
	        {
	            flag = false;
	            warning_message = warning_message + '</ul></div>';
	            if(format_error_flag)
	            {
	                req.session.format_error = warning_message;
	            }
	            break;
	        }
	        else
	        {
	            data['id'] = id_cell.v;
	        }

	        var generic_name_address = 'B'+i;
	        var generic_name_cell = worksheet[generic_name_address];
	        if(generic_name_cell != undefined)
	        {
	            data['generic_name'] = generic_name_cell.v;
	        }
	        else
	        {
	            data['generic_name'] = '';
	        }

	        var brand_name_address = 'C'+i;
	        var brand_name_cell = worksheet[brand_name_address];
	        if(brand_name_cell != undefined)
	        {
	            data['brand_name'] = brand_name_cell.v;
	        }
	        else
	        {
	            data['brand_name'] = '';
	        }
	        
	        var form_address = 'D'+i;
	        var form_cell = worksheet[form_address];
	        if(form_cell != undefined)
	        {
	            data['form'] = form_cell.v;
	        }
	        else
	        {
	            data['form'] = '';
	        }

	        var strength_address = 'E'+i;
	        var strength_cell = worksheet[strength_address];
	        if(strength_cell != undefined)
	        {
	            data['strength'] = strength_cell.v;
	        }
	        else
	        {
	            data['strength'] = '';
	        }
	        
	        var strength_unit_address = 'F'+i;
	        var strength_unit_cell = worksheet[strength_unit_address];
	        if(strength_unit_cell != undefined)
	        {
	            data['strength_unit'] = strength_unit_cell.v;
	        }
	        else
	        {
	            data['strength_unit'] = '';
	        }

	        var route_address = 'G'+i;
	        var route_cell = worksheet[route_address];
	        if(route_cell != undefined)
	        {
	            data['route'] = route_cell.v;
	        }
	        else
	        {
	            data['route'] = '';
	        }

	        var manufacturer_address = 'H'+i;
	        var manufacturer_cell = worksheet[manufacturer_address];
	        if(manufacturer_cell != undefined)
	        {
	            data['manufacturer'] = manufacturer_cell.v;
	        }
	        else
	        {
	            data['manufacturer'] = '';
	        }

	        var sra_address = 'I'+i;
	        var sra_cell = worksheet[sra_address];
	        if(sra_cell != undefined)
	        {
	            data['sra'] = sra_cell.v;
	        }
	        else
	        {
	            data['sra'] = '';
	        }

	        var approval_date_address = 'J'+i;
	        var approval_date_cell = worksheet[approval_date_address];
	        if(approval_date_cell != undefined)
	        {
	            data['approval_date'] = "'" +approval_date_cell.w + "'";
	        }
	        else
	        {
	            data['approval_date'] = '';
	        }

	        var source_address = 'K'+i;
	        var source_cell = worksheet[source_address];
	        if(source_cell != undefined)
	        {
	            data['source'] = source_cell.v;
	        }
	        else
	        {
	            data['source'] = '';
	        }

	        var extract_date_address = 'L'+i;
	        var extract_date_cell = worksheet[extract_date_address];
	        console.log(extract_date_cell);
	        if(extract_date_cell != undefined)
	        {
	            data['extract_date'] = "'" + extract_date_cell.w + "'";
	        }
	        else
	        {
	            data['extract_date'] = '';
	        }

	        data = controller.xssClean(data);
    		var validation_array = medicine_validations(data);
	        if(Object.keys(validation_array).length > 0){
	        	format_error_flag = true;
		        var result = validation_array;
		        for (var key in result) {
				  if (result.hasOwnProperty(key)) {
				  	wm = wm + result[key] + ', ';
				  }
				}
		        wm = wm.slice(0, -2) + '</li>';
	            warning_message = warning_message + wm;
		    }
		    else {
		    	tomodel.generic_name = data.generic_name;
		    	tomodel.brand_name = data.brand_name;
		    	tomodel.form = data.form;
		    	tomodel.strength = data.strength;
		    	tomodel.strength_unit = data.strength_unit;
		    	tomodel.manufacturer = data.manufacturer;
		    	var medicine = medicine_model.select_medicine_by_main_keys(tomodel);
		    	tomodel.route = data.route;
	    		tomodel.sra = data.sra;
	    		if(!data.approval_date) {
	    			data.approval_date = '01/01/0001';
	    		}
	    		tomodel.approval_date = data.approval_date;
	    		tomodel.source = data.source;
	    		tomodel.extract_date = data.extract_date;
		    	if(medicine.length == 0) {
		    		medicine_model.insert_new_medicine(tomodel);
		    	}
		    	else {
		    		tomodel.medicine_id = medicine[0].ID;
		    		medicine_model.update_medicine(tomodel);
		    	}
		    }
	        i++;
	    }	
    }
    else {
    	req.session.format_error = "<div class='alert alert-danger error-form'> Wrong format please download the template and follow the convention </div>";
    }
}

function medicine_validations(data) {
    var validation_array = {};
    
    var generic_name = controller.validate({generic_name: data.generic_name},['required','length:0-60']);
    if(generic_name){
        validation_array = controller.mergeArrays(validation_array, generic_name);
    }

    var brand_name = controller.validate({brand_name: data.brand_name},['required', 'length:0-60']);
    if(brand_name){
        validation_array = controller.mergeArrays(validation_array, brand_name);
    }

    var form = controller.validate({form: data.form},['required', 'length:0-60']);
    if(form){
        validation_array = controller.mergeArrays(validation_array, form);
    }
    else {
    	var forms = ['vial', 'tab', 'other'];
	    if(!forms.includes(data.form.toLowerCase())) {
	        validation_array = controller.mergeArrays(validation_array, {form_error: 'This is not a valid type'});
	    }
    }

    var strength = controller.validate({strength: data.strength},['required', 'float']);
    if(strength){
        validation_array = controller.mergeArrays(validation_array, strength);
    }

    var strength_unit = controller.validate({strength_unit: data.strength_unit},['required', 'length:0-60']);
    if(strength_unit){
        validation_array = controller.mergeArrays(validation_array, strength_unit);
    }

	var manufacturer = controller.validate({manufacturer: data.manufacturer},['required', 'length:0-60']);
    if(manufacturer){
        validation_array = controller.mergeArrays(validation_array, manufacturer);
    }  

    var sra = controller.validate({sra: data.sra},['required', 'length:0-60']);
    if(sra){
        validation_array = controller.mergeArrays(validation_array, sra);
    }

    var source = controller.validate({source: data.source},['length:0-2000']);
    if(source){
        validation_array = controller.mergeArrays(validation_array, source);
    }
 	
 	var route = controller.validate({route: data.route},['length:0-100']);
    if(route){
        validation_array = controller.mergeArrays(validation_array, route);
    }
    
    if(data.extract_date && data.extract_date.length > 0) {
    	data.extract_date = new Date(data.extract_date);
    	data.extract_date = controller.dateFormat(data.extract_date, "dd/mm/yyyy").toString();
    }

    var extract_date = controller.validate({extract_date: data.extract_date},['required', 'match_regex:^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$||This is not a valid date format']);
    if(extract_date){
        validation_array = controller.mergeArrays(validation_array, extract_date);
    }

    if(data.approval_date && data.approval_date.length > 0) {
    	data.approval_date = new Date(data.approval_date);
    	data.approval_date = controller.dateFormat(data.approval_date, "dd/mm/yyyy").toString();
    }

    if(data.approval_date && data.approval_date.length > 0) {
    	var approval_date = controller.validate({approval_date: data.approval_date},['match_regex:^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$||This is not a valid date format']);
	    if(approval_date){
	        validation_array = controller.mergeArrays(validation_array, approval_date);
	    }
    }
    

    return validation_array;
}

module.exports = new manage_medicines();
