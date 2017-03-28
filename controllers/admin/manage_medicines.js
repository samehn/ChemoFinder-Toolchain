controller 					= require('../controller');

function manage_medicines(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
    stock_list_model  = require('../../models/stock_list_model');
};
manage_medicines.prototype.constructor = manage_medicines;


manage_medicines.prototype.manage_medicines_page =  function(req, res) {
	medicine_model.async_select_approved_medicines(function(approved_medicines) {
		medicine_model.async_select_non_approved_medicines(function(non_approved_medicines) {
			var data = {approved_medicines: approved_medicines,  non_approved_medicines: non_approved_medicines};
		    if(req.session.uploading_message)
            {
                data['uploading_message'] = req.session.uploading_message;
                req.session.uploading_message = null;
            }
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
		});
	});
}

manage_medicines.prototype.add_new_medicine =  function(req, res) {
	var data = controller.xssClean(req.body);
	data.approval_date = req.body.approval_date;
	if(controller.moment(data.approval_date, 'YYYY-MM-DD').isValid()) {
		data.approval_date = controller.moment(data.approval_date).format('DD/MM/YYYY');
	}
	data.extract_date = req.body.extract_date;
	if(controller.moment(data.extract_date, 'YYYY-MM-DD').isValid()) {
		data.extract_date = controller.moment(data.extract_date).format('DD/MM/YYYY');
	}
	console.log(data);
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
    	medicine_model.async_select_medicine_by_main_keys(tomodel, function(medicine) {
    		if(medicine.length == 0) {
	    		tomodel.route = data.route;
	    		tomodel.sra = data.sra;
	    		if(controller.moment(data.approval_date, 'DD/MM/YYYY').isValid()) {
					tomodel.approval_date = data.approval_date;
				}
				else {
					tomodel.approval_date = controller.moment(new Date()).format('DD/MM/YYYY');		
				}
	    		tomodel.source = data.source;
	    		tomodel.extract_date = data.extract_date;
	    		tomodel.specification_form = data.specification_form;
	    		tomodel.pack_type = data.pack_type;
	    		tomodel.units_per_pack = data.units_per_pack;
	    		if(!data.units_per_pack) {
	    			tomodel.units_per_pack = 0;
	    		}
	    		tomodel.status = data.status;
	    		tomodel.comments = data.comments;
	    		if(data.approve == 'true') {
	    			tomodel.approve = true;
	    		}
	    		else {
	    			tomodel.approve = false;
	    		}
	    		medicine_model.async_insert_new_medicine(tomodel, function(rows) {
	    			res.send({message: 'success'});
	    		});
	    	}
	    	else {
	    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This Medicine is already exists', message:'failed'});
	    		res.send(result);
	    	}
    	});
    }                  
}

manage_medicines.prototype.update_medicine =  function(req, res) {
	var data = controller.xssClean(req.body);
	data.approval_date = req.body.approval_date;
	if(controller.moment(data.approval_date, 'YYYY-MM-DD').isValid()) {
		data.approval_date = controller.moment(data.approval_date).format('DD/MM/YYYY');
	}
	data.extract_date = req.body.extract_date;
	if(controller.moment(data.extract_date, 'YYYY-MM-DD').isValid()) {
		data.extract_date = controller.moment(data.extract_date).format('DD/MM/YYYY');
	}
    var validation_array = medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
    	if(data.medicine_id && Number.isInteger(parseInt(data.medicine_id))) {
    		tomodel.medicine_id = data.medicine_id;
	    	medicine_model.async_select_medicine_by_id(tomodel, function(medicine) {
	    		if(medicine.length > 0) {
		    		tomodel.generic_name = data.generic_name;
			    	tomodel.brand_name = data.brand_name;
			    	tomodel.form = data.form;
			    	tomodel.strength = data.strength;
			    	tomodel.strength_unit = data.strength_unit;
			    	tomodel.manufacturer = data.manufacturer;
			    	tomodel.route = data.route;
		    		tomodel.sra = data.sra;
		    		if(controller.moment(data.approval_date, 'DD/MM/YYYY').isValid()) {
						tomodel.approval_date = data.approval_date;
					}
					else {
						tomodel.approval_date = controller.moment(new Date()).format('DD/MM/YYYY');		
					}
		    		tomodel.source = data.source;
		    		tomodel.extract_date = data.extract_date;
		    		tomodel.specification_form = data.specification_form;
		    		tomodel.pack_type = data.pack_type;
		    		tomodel.units_per_pack = data.units_per_pack;
		    		if(!data.units_per_pack) {
		    			tomodel.units_per_pack = 0;
		    		}
		    		tomodel.status = data.status;
		    		tomodel.comments = data.comments;
		    		if(data.approve == 'true') {
		    			tomodel.approve = true;
		    		}
		    		else {
		    			tomodel.approve = false;
		    		}
		    		medicine_model.async_update_medicine(tomodel, function(rows) {
		    			res.send({message: 'success'});
		    		});
		    	}
		    	else {
		    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This is not a valid medicine', message:'failed'});
		    		res.send(result);
		    	}
	    	});
    	}
    	else {
    		var result = controller.mergeArrays(validation_array, {generic_name_error: 'This is not a valid medicine', message:'failed'});
	    	res.send(result);
    	}
    }
}

manage_medicines.prototype.delete_approved_medicine =  function(req, res) {
	if(req.body.medicine_id && Number.isInteger(parseInt(req.body.medicine_id))) {
		tomodel.medicine_id = req.body.medicine_id;
    	medicine_model.async_select_medicine_by_id(tomodel, function(medicine) {
    		if(medicine.length > 0) {
	    		stock_list_model.async_select_stocks_by_medicine_id(tomodel, function(stocks) {
	    			var result = {message: "success"};
		    		if(stocks.length > 0) {
		    			result['action'] = 'non_approved';
		    			tomodel.approve = 'FALSE';
		    			medicine_model.async_update_medicine_approval(tomodel, function(rows) {
		    				res.send(result);
		    			});
		    		}
		    		else {
		    			result['action'] = 'delete';
		    			medicine_model.async_delete_medicine(tomodel, function(rows) {
		    				res.send(result);
		    			});
		    		}
	    		});
	    	}
	    	else {
	    		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	    	}
    	});
	}
	else {
		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	}
}

manage_medicines.prototype.delete_non_approved_medicine =  function(req, res) {
	if(req.body.medicine_id && Number.isInteger(parseInt(req.body.medicine_id))) {
		tomodel.medicine_id = req.body.medicine_id;
    	medicine_model.async_select_medicine_by_id(tomodel, function(medicine) {
    		if(medicine.length > 0) {
	    		stock_list_model.async_select_stocks_by_medicine_id(tomodel, function(stocks) {
	    			var result = {message: "success"};
		    		if(stocks.length > 0) {
		    			result['action'] = "no_delete";
		    			res.send(result);
		    		}
		    		else {
		    			result['action'] = 'delete';
		    			medicine_model.async_delete_medicine(tomodel, function(rows) {
		    				res.send(result);
		    			});
		    		}
	    		});
	    	}
	    	else {
	    		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	    	}
    	});
	}
	else {
		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	}
}

manage_medicines.prototype.get_medicine_by_id =  function(req, res) {
	if(req.params.id && Number.isInteger(parseInt(req.params.id))) {
		tomodel.medicine_id = req.params.id;
    	medicine_model.async_select_medicine_by_id(tomodel, function(medicine) {
    		if(medicine.length > 0) {
	    		res.send({message: "success", medicine: medicine});
	    	}
	    	else {
	    		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	    	}
    	});
	}
	else {
		res.send({message: "failed", medicine_error: "This is not a valid medicine"});
	}
}

manage_medicines.prototype.download_medicines_template =  function(req, res) {
	var file = './public/downloads/medicinelist_example_data.xlsx';
  	res.download(file); // Set disposition and send it.
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
                req.session.success_message = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> The file is uploaded successfuly</div>'
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
                var medicines = parsing_approved_medicines(req, res);
                console.log('File uploaded!');
                if(medicines.length > 0) {
				    req.session.uploading_message = "<div class='alert alert-success'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + medicines.length + " medicines will be added/updated in the background you will be notify by an email once this operation is done</div>";
                	res.redirect('/admin/manage_medicines');
				    controller.async.eachLimit(medicines, 5, function(medicine, callback){                      
				        save_medicines_list(req, res, medicine, function() {
                            console.log("done");
				        	callback();
                        });
				        
				    },function(err){
			          	if( err ) {
			             // One of the iterations produced an error.
			             // All processing will now stop.
			             console.log('A file failed to process');
			          	} else {
			              	console.log('All files have been processed successfully');
			              	tomodel.admin_id = req.session.admin_id;
			              	admin_model.async_select_admin_by_id(tomodel, function(admin) {
                                //Send Confirmation Email
                                var link = req.protocol + '://' + req.get('host') + '/admin/manage_medicines';
                                var mailOptions = {
                                    from: 'chemofinder@gmail.com', // sender address
                                    to: admin[0].EMAIL, // list of receivers
                                    subject: 'Uploading Medicines List is Completed Successfully', // Subject line
                                    template: 'upload_medicines_list_mail',
                                    context: {
                                        link: link
                                    }
                                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                                };
                                controller.sendEmail(mailOptions);
                            });
			          	}
				    });
                }
                else {
                	res.redirect('/admin/manage_medicines');
                }
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/admin/manage_medicines');
    }
}

function parsing_approved_medicines(req, res) {
	var medicines = [];
	var workbook = controller.XLSX.readFile('./public/uploads/medicines/approved_medicines.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    if(validate_medicine_list_sheet(worksheet)) {
    	var flag = true;
	    var format_error_flag = false;
    	var i = 2;
	    var warning_message = "<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Some medicines cannot be added/updated due to the following: <ul>";
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

	        var specification_form_address = 'G'+i;
	        var specification_form_cell = worksheet[specification_form_address];
	        if(specification_form_cell != undefined)
	        {
	            data['specification_form'] = specification_form_cell.v;
	        }
	        else
	        {
	            data['specification_form'] = '';
	        }

	        var pack_type_address = 'H'+i;
	        var pack_type_cell = worksheet[pack_type_address];
	        if(pack_type_cell != undefined)
	        {
	            data['pack_type'] = pack_type_cell.v;
	        }
	        else
	        {
	            data['pack_type'] = '';
	        }

	        var units_per_pack_address = 'I'+i;
	        var units_per_pack_cell = worksheet[units_per_pack_address];
	        if(units_per_pack_cell != undefined)
	        {
	            data['units_per_pack'] = units_per_pack_cell.v;
	        }
	        else
	        {
	            data['units_per_pack'] = 0;
	        }

	        var route_address = 'J'+i;
	        var route_cell = worksheet[route_address];
	        if(route_cell != undefined)
	        {
	            data['route'] = route_cell.v;
	        }
	        else
	        {
	            data['route'] = '';
	        }

	        var manufacturer_address = 'K'+i;
	        var manufacturer_cell = worksheet[manufacturer_address];
	        if(manufacturer_cell != undefined)
	        {
	            data['manufacturer'] = manufacturer_cell.v;
	        }
	        else
	        {
	            data['manufacturer'] = '';
	        }

	        var sra_address = 'L'+i;
	        var sra_cell = worksheet[sra_address];
	        if(sra_cell != undefined)
	        {
	        	data['approve'] = 'true';
	            data['sra'] = sra_cell.v;
	        }
	        else
	        {
	            data['sra'] = '';
	            data['approve'] = 'false';
	        }

	        var approval_date_address = 'M'+i;
	        var approval_date_cell = worksheet[approval_date_address];
	        if(approval_date_cell != undefined)
	        {
	            data['approval_date'] = "'" +approval_date_cell.w + "'";
	        }
	        else
	        {
	            data['approval_date'] = '';
	        }

	        var source_address = 'N'+i;
	        var source_cell = worksheet[source_address];
	        if(source_cell != undefined)
	        {
	            data['source'] = source_cell.v;
	        }
	        else
	        {
	            data['source'] = '';
	        }

	        var extract_date_address = 'O'+i;
	        var extract_date_cell = worksheet[extract_date_address];
	        // console.log(extract_date_cell);
	        if(extract_date_cell != undefined)
	        {
	            data['extract_date'] = "'" + extract_date_cell.w + "'";
	        }
	        else
	        {
	            data['extract_date'] = '';
	        }

	        var status_address = 'P'+i;
	        var status_cell = worksheet[status_address];
	        if(status_cell != undefined)
	        {
	            data['status'] = status_cell.v;
	        }
	        else
	        {
	            data['status'] = '';
	        }

	        var comments_address = 'Q'+i;
	        var comments_cell = worksheet[comments_address];
	        if(comments_cell != undefined)
	        {
	            data['comments'] = comments_cell.v;
	        }
	        else
	        {
	            data['comments'] = '';
	        }

	        var new_data = controller.xssClean(data);
	        new_data['extract_date'] = new Date(data.extract_date);
	        new_data['approval_date'] = new Date(data.approval_date);
    		var validation_array = medicine_validations(new_data);
	        // console.log(new_data);
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
		    	var medicine = {};
		    	medicine['generic_name'] = new_data.generic_name;
		    	medicine['brand_name'] = new_data.brand_name;
		    	medicine['form'] = new_data.form;
		    	medicine['strength'] = new_data.strength;
		    	medicine['strength_unit'] = new_data.strength_unit; 
		    	medicine['manufacturer'] = new_data.manufacturer;
		    	medicine['route'] = new_data.route;
		    	medicine['sra'] = new_data.sra;
		    	if(controller.moment(new_data.approval_date).isValid()) {
    				medicine['approval_date'] = controller.moment(new_data.approval_date).format('DD/MM/YYYY');
    			}
    			else {
    				medicine['approval_date'] = controller.moment(new Date()).format('DD/MM/YYYY');		
    			}
    			medicine['source'] = new_data.source;
    			medicine['extract_date'] = controller.moment(new_data.extract_date).format('DD/MM/YYYY');
    			medicine['specification_form'] = new_data.specification_form;
	    		medicine['pack_type'] = new_data.pack_type;
	    		medicine['units_per_pack'] = new_data.units_per_pack;
	    		if(!new_data.units_per_pack) {
	    			medicine['units_per_pack'] = 0;
	    		}
	    		medicine['status'] = new_data.status;
	    		medicine['comments'] = new_data.comments;
	    		if(new_data.approve == 'true') {
	    			medicine['approve'] = true;
	    		}
	    		else {
	    			medicine['approve'] = false;
	    		}
	    		medicines.push(medicine);
		    }
	        i++;
	    }	
    }
    else {
    	req.session.format_error = "<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Wrong format please download the template and follow the convention </div>";
    }
    return medicines;
}

var save_medicines_list = function(req, res, medicine, callback) {
	medicine_model.async_select_medicine_by_main_keys(medicine, function(rows) {
		if(rows.length > 0) {
			medicine['medicine_id'] = rows[0].ID;
			medicine_model.async_update_medicine(medicine, function(rows) {
				callback();
			});
		}
		else {
			medicine_model.async_insert_new_medicine(medicine, function(rows) {
				callback();
			});
		}
	});
}


function validate_medicine_list_sheet(worksheet) {
	var str = "ABCDEFGHIJKLMNOPQ";
	var titles = ["id", "generic name", "brand name", "form", "strength", "strength unit", "specification form", "pack type", "units per pack", "route", "manufacturer", "current stringent regulatory authority", "approval date", "source", "extract date", "status", "comments"];
    for(var i=0; i<str.length; i++)
    {
        var char = str.charAt(i);
		var address = char + '1';
   		var cell = worksheet[address];
	    if(cell == undefined)
	    {
	        return false;
	    }
	    else
	    {
	        if(!(cell.v && cell.v.toLowerCase().startsWith(titles[i]))) {
	        	return false;
	        }
	    }
	}
	return true;
}


function medicine_validations(data) {
	console.log(data);
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

    var strength = controller.validate({strength: data.strength},['required', 'float']);
    if(strength){
        validation_array = controller.mergeArrays(validation_array, strength);
    }

    var strength_unit = controller.validate({strength_unit: data.strength_unit},['required', 'length:0-20']);
    if(strength_unit){
        validation_array = controller.mergeArrays(validation_array, strength_unit);
    }

	var manufacturer = controller.validate({manufacturer: data.manufacturer},['required', 'length:0-60']);
    if(manufacturer){
        validation_array = controller.mergeArrays(validation_array, manufacturer);
    }

    if(data.approve == 'true') {
    	var sra = controller.validate({sra: data.sra},['required', 'length:0-100']);
	    if(sra){
	        validation_array = controller.mergeArrays(validation_array, sra);
	    }
    }

    var source = controller.validate({source: data.source},['length:0-2000']);
    if(source){
        validation_array = controller.mergeArrays(validation_array, source);
    }
 	
 	var route = controller.validate({route: data.route},['length:0-200']);
    if(route){
        validation_array = controller.mergeArrays(validation_array, route);
    }
    
    if(!controller.moment(data.extract_date, 'DD/MM/YYYY', true).isValid() && !controller.moment(data.extract_date, 'DD-MM-YYYY', true).isValid() && !controller.moment(data.extract_date, 'DD-MMM-YYYY', true).isValid()) {
    	validation_array = controller.mergeArrays(validation_array, {extract_date_error: 'This is not a valid date'});
    	// data.extract_date = controller.moment(data.extract_date).format('MM/DD/YYYY');
    }

    if(data.approval_date && data.approval_date.length > 0) {
		if(!controller.moment(data.approval_date, 'DD/MM/YYYY', true).isValid() && !controller.moment(data.approval_date, 'DD-MM-YYYY', true).isValid() && !controller.moment(data.approval_date, 'DD-MMM-YYYY', true).isValid()) {
	    	validation_array = controller.mergeArrays(validation_array, {approval_date_error: 'This is not a valid date'});
	    	// data.approval_date = controller.moment(data.approval_date).format('MM/DD/YYYY');
	    }
    }
    
    var specification_form = controller.validate({specification_form: data.specification_form},['length:0-60']);
    if(specification_form){
        validation_array = controller.mergeArrays(validation_array, specification_form);
    }

    var pack_type = controller.validate({pack_type: data.pack_type},['length:0-60']);
    if(pack_type){
        validation_array = controller.mergeArrays(validation_array, pack_type);
    }

    if(data.units_per_pack && data.units_per_pack.length > 0) {
		var units_per_pack = controller.validate({units_per_pack: data.units_per_pack},['required', 'integer']);
	    if(units_per_pack){
	        validation_array = controller.mergeArrays(validation_array, units_per_pack);
	    }	
    }
    

    var status = controller.validate({status: data.status},['length:0-60']);
    if(status){
        validation_array = controller.mergeArrays(validation_array, status);
    }

    var comments = controller.validate({comments: data.comments},['length:0-2000']);
    if(comments){
        validation_array = controller.mergeArrays(validation_array, comments);
    }

    return validation_array;
}

module.exports = new manage_medicines();
