controller 					= require('../controller');

function stock(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    user_pharmacy_model  = require('../../models/user_pharmacy_model');
    stock_list_model  = require('../../models/stock_list_model');
    medicine_model = require('../../models/medicine_model');
};
stock.prototype.constructor = stock;

stock.prototype.stock_page =  function(req, res) {
    tomodel.user_id = req.session.pharmacy_id;
    var stock_list = stock_list_model.select_stock_list_by_id(tomodel);
    var data = {stock_list: stock_list};
    if(req.session.stock_uploading_message)
    {
        data['uploading_message'] = req.session.stock_uploading_message;
        req.session.stock_uploading_message = null;
    }
    if(req.session.stock_extention_error)
    {
        data['extention_error'] = true;
        req.session.stock_extention_error = null;
    }
    if(req.session.stock_format_error)
    {
        data['format_error'] = req.session.stock_format_error;
        req.session.stock_format_error = null;
    }
    res.render('pharmacy/stock_list', data);
}

stock.prototype.get_medicines_generic_and_form =  function(req, res) {
    medicine_model.async_select_approved_medicines_distinct_generic_name(function(medicines) {
        if(medicines.length > 0) {
            res.send({message: "success", medicines: medicines});
        }
        else {
            res.send({message: "failed"});
        }
    });
}

stock.prototype.get_medicine_by_generic_and_form =  function(req, res) {
    var data = controller.xssClean(req.body);
    tomodel.generic_name = data.generic_name;
    tomodel.form = data.form;
    medicine_model.async_select_medicine_by_generic_and_form(tomodel, function(medicines) {
        if(medicines.length > 0) {
            res.send({message: "success", medicines: medicines});
        }
        else {
            res.send({message: "failed"});
        }
    });
}

stock.prototype.get_stock_record =  function(req, res) {
    if(Number.isInteger(parseInt(req.body.stock_id))) {
        tomodel.stock_id = req.body.stock_id;
        tomodel.user_id = req.session.pharmacy_id; 
        stock_list_model.async_select_stock_list_record_by_id(tomodel, function(stock_list_record) {
            if(stock_list_record.length > 0){
                res.send({message:"success", result: stock_list_record});
            }
            else{
                res.send({message:"failed"});        
            }
        });
    }
    else{
        res.send({message:"failed"});
    }
}

stock.prototype.add_new_medicine =  function(req, res) {
    var data = controller.xssClean(req.body);
    data.expiry_date = req.body.expiry_date;
    if(controller.moment(data.expiry_date, 'YYYY-MM-DD').isValid()) {
        data.expiry_date = controller.moment(data.expiry_date).format('DD/MM/YYYY');
    }
    var validation_array = new_medicine_validations(data);
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
            tomodel.batch_number = data.batch_number;
            tomodel.expiry_date = data.expiry_date;
            tomodel.pack_size = data.pack_size;
            tomodel.price = data.price;
            tomodel.quantity = data.quantity;
            tomodel.avg_monthly_consumption = data.avg_monthly_consumption;
            tomodel.user_id = req.session.pharmacy_id;
            if(medicine.length > 0) {
                tomodel.medicine_id = medicine[0].ID;
                tomodel.user_id = req.session.pharmacy_id;
                stock_list_model.async_select_stock_list_by_medicine(tomodel, function(stock_list_medicine) {
                    if(stock_list_medicine.length > 0) {
                        res.send({message: "failed", generic_name_error: "This Medicine is already exists in your stock"});
                    }
                    else {
                        stock_list_model.async_insert_new_record(tomodel, function(rows) {
                            res.send({message: "success"});
                        });
                    }
                });
            }
            else {
                medicine_model.async_insert_new_medicine_by_main_keys(tomodel, function(rows) {
                    medicine_model.async_select_medicine_by_main_keys(tomodel, function(medicine) {
                        tomodel.medicine_id = medicine[0].ID;
                        stock_list_model.async_insert_new_record(tomodel, function(rows) {
                            res.send({message: "success"});
                        });
                    });
                });
            }
        });
    }    
}

stock.prototype.add_new_approved_medicine =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = approved_medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.medicine_id = data.medicine;
        tomodel.user_id = req.session.pharmacy_id;
        stock_list_model.async_select_stock_list_by_medicine(tomodel, function(stock_list_medicine) {
            if(stock_list_medicine.length > 0) {
                res.send({message: "failed", medicine_error: "This Medicine is already exists in your stock"});
            }
            else {
                tomodel.batch_number = data.batch_number;
                tomodel.expiry_date = data.expiry_date;
                tomodel.pack_size = data.pack_size;
                tomodel.price = data.price;
                tomodel.quantity = data.quantity;
                tomodel.avg_monthly_consumption = data.avg_monthly_consumption;
                stock_list_model.async_insert_new_record(tomodel, function(rows) {
                    res.send({message: "success"});
                });
            }
        });
    }     
}

stock.prototype.update_medicine =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = updated_medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.stock_id = data.stock_id;
        tomodel.user_id = req.session.pharmacy_id;
        stock_list_model.async_select_stock_record_by_pharmacy(tomodel, function(stock_list_record) {
            if(stock_list_record.length > 0) {
                tomodel.batch_number = data.batch_number;
                tomodel.expiry_date = data.expiry_date;
                tomodel.pack_size = data.pack_size;
                tomodel.price = data.price;
                tomodel.quantity = data.quantity;
                tomodel.avg_monthly_consumption = data.avg_monthly_consumption;
                stock_list_model.async_update_stock_record(tomodel, function(rows) {
                    user_pharmacy_model.async_update_stock_time(tomodel, function(rows) {
                        res.send({message: "success"});
                    });
                });
            }
            else {
                res.send({message: "failed", batch_number_error: "This Medicine is not exists in your stock"});
            }
        });
    }
}

stock.prototype.delete_medicine =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = deleted_medicine_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.stock_id = data.stock_id;
        tomodel.user_id = req.session.pharmacy_id;
        stock_list_model.async_select_stock_record_by_pharmacy(tomodel, function(stock_list_record) {
            if(stock_list_record.length > 0) {
                stock_list_model.async_delete_stock_record(tomodel, function(rows) {
                    res.send({message: "success"});
                });
            }
            else {
                res.send({message: "failed", medicine_error: "This Medicine is not exists in your stock"});
            }
        });
    } 
}

stock.prototype.download_stock_list_template =  function(req, res) {
    var file = './public/downloads/stocklist_example_data.xlsx';
    res.download(file); // Set disposition and send it.
}

stock.prototype.download_last_stock =  function(req, res) {
    // create workbook by api.
    var workbook = new controller.Excel.Workbook();

    // must create one more sheet.
    var worksheet = workbook.addWorksheet("Sheet1");
    
    worksheet.views = [
        {zoomScale:66}
    ];
    // Add a row by contiguous Array (assign to columns A, B & C)
    worksheet.addRow(['ID', 'Generic Name', 'Form', 'Strength', 'Strength unit', 'Brand name', 'Manufacturer', 'Batch Number', 'Expiry Date (dd-mm-yyyy)', 'Current Stringent Regulatory Authority (SRA) Approvals', 'Pack Size', 'Price per Pack', 'Available Stock (Packs)', 'Average Monthly Consumption (AMC) in Packs']);
    
    var str = "ABCDEFGHIJKLMN";
    for(var i=0; i<str.length; i++)
    {
        var char = str.charAt(i);
        worksheet.getCell(char + '1').fill = {
            type: 'pattern',
            pattern:'solid',
            // fgColor:{argb:'0001'},
            fgColor:{argb:'FF203764'}
        };
        // for the wannabe graphic designers out there
        worksheet.getCell(char + '1').font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            // family: 4,
            size: 10,
            bold: true
        };
        worksheet.getCell(char + '1').alignment = { wrapText: true }; 
        var dobCol = worksheet.getColumn(char);
        if(char == 'B' || char == 'E' || char == 'F'|| char == 'I'|| char == 'J'|| char == 'N') {
            dobCol.width = 30; 
        }
        else {
            dobCol.width = 20;
        }       
    }
    tomodel.user_id = req.session.pharmacy_id;

    stock_list_model.async_select_stock_list_by_id(tomodel, function(stock_list) {
        if(stock_list.length > 0) {
            for (var i = 0; i < stock_list.length; i++) {
                worksheet.addRow([stock_list[i].ID, stock_list[i].GENERIC_NAME, stock_list[i].FORM, stock_list[i].STRENGTH, stock_list[i].STRENGTH_UNIT, stock_list[i].BRAND_NAME, stock_list[i].MANUFACTURER, stock_list[i].BATCH_NUMBER, stock_list[i].EXPIRY_DATE, stock_list[i].SRA, stock_list[i].PACK_SIZE, stock_list[i].PRICE_PER_PACK, stock_list[i].AVAILABLE_STOCK, stock_list[i].AVG_MONTHLY_CONSUMPTION]);
            }
            var path = './public/uploads/stocks/stock_list_' + req.session.pharmacy_id + '_' + Date.now() + '.xlsx';
            if(controller.fs.existsSync(path)) {
                controller.fs.unlinkSync(path);
            }
            // you can create xlsx file now.
            workbook.xlsx.writeFile(path).then(function() {
                console.log("xlsx file is written.");
                res.download(path, 'stock_list.xlsx', function(err){
                  //CHECK FOR ERROR
                  controller.fs.unlink(path);
                });
            });
        }    
        else {
            req.session.stock_format_error = '<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> You have no previous stocks to be downloaded </div>';
            res.redirect('/pharmacy');
        }
    });
}

stock.prototype.upload_stock_list =  function(req, res) {
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
        sampleFile.mv('./public/uploads/stocks/stock_list_' + req.session.pharmacy_id + '.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                var medicines = parsing_stock_list(req, res);
                console.log(medicines);
                console.log('File uploaded!');
                if(medicines.length > 0) {
                    req.session.stock_uploading_message = "<div class='alert alert-success'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" + medicines.length + " medicines will be added/updated in the background you will be notify by an email once this operation is done</div>";
                    res.redirect('/pharmacy');
                    controller.async.eachLimit(medicines, 1, function(medicine, callback) {
                        save_medicines_stock_list(req, res, medicine, function() {
                            console.log("done");
                            callback();
                        });
                    }, function(err) {
                        if(err) {
                            console.log('A file failed to process');
                        }
                        else {
                            console.log('All files have been processed successfully');
                            tomodel.user_id = req.session.pharmacy_id;
                            user_model.async_select_user_by_id(tomodel, function(user) {
                                //Send Confirmation Email
                                var link = req.protocol + '://' + req.get('host') + '/pharmacy';
                                var mailOptions = {
                                    from: 'chemofinder@gmail.com', // sender address
                                    to: user[0].EMAIL, // list of receivers
                                    subject: 'Uploading Stock List is Completed Successfully', // Subject line
                                    template: 'upload_stock_list_mail',
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
                    res.redirect('/pharmacy');
                }
            }
        });
    }
    else
    {
        req.session.stock_extention_error = true;
        res.redirect('/pharmacy');
    }
}

function validate_stock_list_sheet(worksheet) {
    var str = "ABCDEFGHIJKLMN";
    var titles = ["id", "generic name", "form", "strength", "strength unit", "brand name", "manufacturer", "batch number", "expiry date", "current stringent regulatory authority", "pack size", "price per pack", "available stock", "average monthly consumption"];
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

var save_medicines_stock_list = function(req, res, medicine, callback) {
    medicine_model.async_select_medicine_by_main_keys(medicine, function(main_medicine) {
        if(main_medicine.length > 0) {
            medicine['medicine_id'] = main_medicine[0].ID;
            medicine['user_id']= req.session.pharmacy_id;
            stock_list_model.async_select_stock_list_by_medicine(medicine, function(stock_list_medicine) {
                if(stock_list_medicine.length > 0) {
                    medicine['stock_id'] = stock_list_medicine[0].ID;
                    stock_list_model.async_update_stock_record(medicine, function(rows) {
                        user_pharmacy_model.async_update_stock_time(medicine, function(rows) {
                            callback();
                        });
                    });
                }
                else {
                    stock_list_model.async_insert_new_record(medicine, function(rows) {
                        callback();
                    });
                }
            });
        }
        else {
            medicine_model.async_insert_new_medicine_by_main_keys(medicine, function(rows) {
                medicine_model.async_select_medicine_by_main_keys(medicine, function(medicine) {
                    medicine['medicine_id'] = medicine[0].ID;
                    stock_list_model.async_insert_new_record(medicine, function(rows) {
                        callback();
                    });
                });
            });
        }
    });
}


function parsing_stock_list(req, res) {
    var medicines = [];
    var workbook = controller.XLSX.readFile('./public/uploads/stocks/stock_list_' + req.session.pharmacy_id + '.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    if(validate_stock_list_sheet(worksheet)) {
        var warning_message = "<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Some medicines cannot be added due to the following: <ul>";
        var flag = true;
        var format_error_flag = false;
        var i = 2;
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
                    req.session.stock_format_error = warning_message;
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

            var form_address = 'C'+i;
            var form_cell = worksheet[form_address];
            if(form_cell != undefined)
            {
                data['form']= form_cell.v;
            }
            else
            {
                data['form'] = '';
            }

            var strength_address = 'D'+i;
            var strength_cell = worksheet[strength_address];
            if(strength_cell != undefined)
            {
                data['strength'] = strength_cell.v;
            }
            else
            {
                data['strength'] = '';
            }
            
            var strength_unit_address = 'E'+i;
            var strength_unit_cell = worksheet[strength_unit_address];
            if(strength_unit_cell != undefined)
            {
                data['strength_unit'] = strength_unit_cell.v;
            }
            else
            {
                data['strength_unit'] = '';
            }

            var brand_name_address = 'F'+i;
            var brand_name_cell = worksheet[brand_name_address];
            if(brand_name_cell != undefined)
            {
                data['brand_name'] = brand_name_cell.v;
            }
            else
            {
                data['brand_name'] = '';
            }

            var manufacturer_address = 'G'+i;
            var manufacturer_cell = worksheet[manufacturer_address];
            if(manufacturer_cell != undefined)
            {
                data['manufacturer'] = manufacturer_cell.v;
            }
            else
            {
                data['manufacturer'] = '';
            }

            var batch_number_address = 'H'+i;
            var batch_number_cell = worksheet[batch_number_address];
            if(batch_number_cell != undefined)
            {
                data['batch_number'] = batch_number_cell.v;
            }
            else
            {
                data['batch_number'] = '';
            }

            var expiry_date_address = 'I'+i;
            var expiry_date_cell = worksheet[expiry_date_address];
            if(expiry_date_cell != undefined)
            {
                data['expiry_date'] = "'" +expiry_date_cell.w + "'";
            }
            else
            {
                data['expiry_date'] = '';
            }

            var sra_address = 'J'+i;
            var sra_cell = worksheet[sra_address];
            if(sra_cell != undefined)
            {
                data['sra'] = sra_cell.v;
            }
            else
            {
                data['sra'] = '';
            }

            var pack_size_address = 'K'+i;
            var pack_size_cell = worksheet[pack_size_address];
            if(pack_size_cell != undefined)
            {
                data['pack_size'] = pack_size_cell.v;
            }
            else
            {
                data['pack_size'] = '';
            }

            var price_address = 'L'+i;
            var price_cell = worksheet[price_address];
            if(price_cell != undefined)
            {
                data['price'] = price_cell.v;
            }
            else
            {
                data['price'] = '';
            }

            var quantity_address = 'M'+i;
            var quantity_cell = worksheet[quantity_address];
            if(quantity_cell != undefined)
            {
                data['quantity'] = quantity_cell.v;
            }
            else
            {
                data['quantity'] = '';
            }

            var avg_monthly_consumption_address = 'N'+i;
            var avg_monthly_consumption_cell = worksheet[avg_monthly_consumption_address];
            if(avg_monthly_consumption_cell != undefined)
            {
                data['avg_monthly_consumption'] = avg_monthly_consumption_cell.v;
            }
            else
            {
                data['avg_monthly_consumption'] = '';
            }

            var new_data = controller.xssClean(data);
            new_data['expiry_date'] = new Date(data.expiry_date);
            console.log(new_data);
            var validation_array = new_medicine_validations(new_data);
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
                medicine['batch_number'] = new_data.batch_number;
                medicine['expiry_date'] = controller.moment(new_data.expiry_date).format('DD/MM/YYYY');
                medicine['pack_size'] = new_data.pack_size;
                medicine['price'] = new_data.price;
                medicine['quantity'] = new_data.quantity;
                medicine['avg_monthly_consumption'] = new_data.avg_monthly_consumption;
                medicine['user_id'] = req.session.pharmacy_id;
                medicines.push(medicine);
            }
            i++;
        }
    }
    else {
        req.session.stock_format_error = "<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> Wrong format please download the template and follow the convention </div>";
    }
    return medicines;
}

function deleted_medicine_validations(data) {
    var validation_array = {};  

    var stock_id = controller.validate({stock_id: data.stock_id},['required', 'integer']);
    if(stock_id){
        validation_array = controller.mergeArrays(validation_array, stock_id);
    }
    else {
        tomodel.stock_id = data.stock_id;
        var stock_list_record = stock_list_model.select_stock_record_by_id(tomodel);
        if(stock_list_record.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {medicine_error: "This is not a vaild medicine"});       
        }
    }

    return validation_array;
}

function updated_medicine_validations(data) {
    var validation_array = {};  

    var stock_id = controller.validate({stock_id: data.stock_id},['required', 'integer']);
    if(stock_id){
        validation_array = controller.mergeArrays(validation_array, stock_id);
    }
    else {
        tomodel.stock_id = data.stock_id;
        var stock_list_record = stock_list_model.select_stock_record_by_id(tomodel);
        if(stock_list_record.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {medicine_error: "This is not a vaild medicine"});       
        }
    }

    var pack_size = controller.validate({pack_size: data.pack_size},['required', 'integer', 'length:0-60']);
    if(pack_size){
        validation_array = controller.mergeArrays(validation_array, pack_size);
    }
    
    var batch_number = controller.validate({batch_number: data.batch_number},['required', 'length:0-100']);
    if(batch_number){
        validation_array = controller.mergeArrays(validation_array, batch_number);
    }
    
    data.expiry_date = new Date(data.expiry_date);
    if(controller.moment(data.expiry_date).isValid()) {
        data.expiry_date = controller.moment(data.expiry_date).format('DD/MM/YYYY');
        if(!controller.moment(data.expiry_date, 'DD/MM/YYYY',true).isValid()) {
            validation_array = controller.mergeArrays(validation_array, {expiry_date_error: 'This is not a valid date'});
        }
    }
    else {
        validation_array = controller.mergeArrays(validation_array, {expiry_date_error: 'This is not a valid date'});
    }

    var price = controller.validate({price: data.price},['required', 'float']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }

    var quantity = controller.validate({quantity: data.quantity},['required', 'integer']);
    if(quantity){
        validation_array = controller.mergeArrays(validation_array, quantity);
    }

    var avg_monthly_consumption = controller.validate({avg_monthly_consumption: data.avg_monthly_consumption},['required', 'float']);
    if(avg_monthly_consumption){
        validation_array = controller.mergeArrays(validation_array, avg_monthly_consumption);
    }

    return validation_array;
}

function approved_medicine_validations(data) {
    var validation_array = {};  

    var medicine = controller.validate({medicine: data.medicine},['required', 'integer']);
    if(medicine){
        validation_array = controller.mergeArrays(validation_array, medicine);
    }
    else {
        tomodel.medicine_id = data.medicine;
        var medicine = medicine_model.select_medicine_by_id(tomodel);
        if(medicine.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {batch_number_error: "This is not a vaild medicine"});       
        }
    }

    var pack_size = controller.validate({pack_size: data.pack_size},['required', 'integer', 'length:0-60']);
    if(pack_size){
        validation_array = controller.mergeArrays(validation_array, pack_size);
    }
    
    var batch_number = controller.validate({batch_number: data.batch_number},['required', 'length:0-100']);
    if(batch_number){
        validation_array = controller.mergeArrays(validation_array, batch_number);
    }
    
    data.expiry_date = new Date(data.expiry_date);
    if(controller.moment(data.expiry_date).isValid()) {
        data.expiry_date = controller.moment(data.expiry_date).format('DD/MM/YYYY');
        if(!controller.moment(data.expiry_date, 'DD/MM/YYYY',true).isValid()) {
            validation_array = controller.mergeArrays(validation_array, {expiry_date_error: 'This is not a valid date'});
        }
    }
    else {
        validation_array = controller.mergeArrays(validation_array, {expiry_date_error: 'This is not a valid date'});
    }

    var price = controller.validate({price: data.price},['required', 'float']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }

    var quantity = controller.validate({quantity: data.quantity},['required', 'integer']);
    if(quantity){
        validation_array = controller.mergeArrays(validation_array, quantity);
    }

    var avg_monthly_consumption = controller.validate({avg_monthly_consumption: data.avg_monthly_consumption},['required', 'float']);
    if(avg_monthly_consumption){
        validation_array = controller.mergeArrays(validation_array, avg_monthly_consumption);
    }

    return validation_array;
}

function new_medicine_validations(data) {
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

    var strength_unit = controller.validate({strength_unit: data.strength_unit},['required', 'length:0-60']);
    if(strength_unit){
        validation_array = controller.mergeArrays(validation_array, strength_unit);
    }

    var manufacturer = controller.validate({manufacturer: data.manufacturer},['required', 'length:0-60']);
    if(manufacturer){
        validation_array = controller.mergeArrays(validation_array, manufacturer);
    }

    var pack_size = controller.validate({pack_size: data.pack_size},['required', 'integer', 'length:0-60']);
    if(pack_size){
        validation_array = controller.mergeArrays(validation_array, pack_size);
    }
    
    var batch_number = controller.validate({batch_number: data.batch_number},['required', 'length:0-100']);
    if(batch_number){
        validation_array = controller.mergeArrays(validation_array, batch_number);
    }

    if(!controller.moment(data.expiry_date, 'DD/MM/YYYY', true).isValid() && !controller.moment(data.expiry_date, 'DD-MM-YYYY', true).isValid() && !controller.moment(data.expiry_date, 'DD-MMM-YYYY', true).isValid()) {
        validation_array = controller.mergeArrays(validation_array, {expiry_date_error: 'This is not a valid date'});
        // data.expiry_date = controller.moment(data.expiry_date).format('MM/DD/YYYY');
    }

    var price = controller.validate({price: data.price},['required', 'float']);
    if(price){
        validation_array = controller.mergeArrays(validation_array, price);
    }

    var quantity = controller.validate({quantity: data.quantity},['required', 'integer']);
    if(quantity){
        validation_array = controller.mergeArrays(validation_array, quantity);
    }

    var avg_monthly_consumption = controller.validate({avg_monthly_consumption: data.avg_monthly_consumption},['required', 'float']);
    if(avg_monthly_consumption){
        validation_array = controller.mergeArrays(validation_array, avg_monthly_consumption);
    }

    return validation_array;
}

module.exports = new stock();
