controller 					= require('../controller');
user_model 	= require('../../models/user_model');
user_pharmacy_model  = require('../../models/user_pharmacy_model');
stock_list_model  = require('../../models/stock_list_model');
medicine_model = require('../../models/medicine_model');
tomodel = {};


process.on('message', function(message){
	var data = {};
	data.pharmacy_id = message.pharmacy_id;
	console.log('^^^^^^^ upload stocklist pharmacy id ' + message.pharmacy_id);
  medicine_model.insert_rows_stock_list_transaction_history(data);
	medicine_model.delete_rows_stock_list_by_pharmacy_id(data);
	controller.async.eachLimit(message.medicines, 1, function(medicine, callback) {
	    save_medicines_stock_list(medicine, message.pharmacy_id, function() {
	        console.log("done");
	        callback();
	    });
	}, function(err) {
	    if(err) {
	        console.log('A file failed to process');
	    }
	    else {
	        console.log('All files have been processed successfully');
					var allAdminEmailsAddresses = "";
					user_model.async_select_all_admin(function(user) {
						if(user.length > 0){
							for (var i = 0; i < user.length; i++) {
								console.log("**** admin email"+user[i].EMAIL);
								allAdminEmailsAddresses += user[i].EMAIL + ", "; //there will be extra comma will leave it for the user
								console.log("all email addresses = " + allAdminEmailsAddresses);
							}
						}
					});
	        tomodel.user_id = message.pharmacy_id;
	        user_model.async_select_user_by_id(tomodel, function(user) {
	            //Send Confirmation Email
	            var mailOptions = {
	                from: 'chemofinder@gmail.com', // sender address
	                to: user[0].EMAIL, // list of receivers
									cc: allAdminEmailsAddresses,
	                subject: 'Uploading Stock List Has Completed Successfully For ' + user[0].ENTITY_NAME, // Subject line
	                template: 'upload_stock_list_mail',
	                context: {
	                    link: message.link
	                }
	                //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
	            };
	            var nodemailer = require('nodemailer');
				var hbs = require('nodemailer-express-handlebars');
	            var transporter = nodemailer.createTransport({
	                service: 'Gmail',
	                auth: {
	                    user: 'chemofinder@gmail.com', // Your email id
	                    pass: 'chemofinder2016' // Your password
	                    //TODO remove password use encrypted token SAMEH
	                }
	            });
	            var options = {
	             viewEngine: {
	                 extname: '.hbs',
	                 layoutsDir: 'views/email/'
	             },
	             viewPath: 'views/email/',
	             extName: '.hbs'
	            };
	            transporter.use('compile', hbs(options));
	            transporter.sendMail(mailOptions, function(error, info){
	                if(error){
	                    console.log(error);
	                    return 'failed';
	                    //res.json({message: 'error'});
	                }else{
	                    console.log('Message sent: ' + info.response);
	                    return 'success';
	                    //res.json({message: info.response});
	                };
	                process.exit();
	            });
	        });
	    }
	});
});

var save_medicines_stock_list = function(medicine, user_id, callback) {
	console.log("*****************Start save medicine");
    medicine_model.async_select_medicine_by_main_keys(medicine, function(main_medicine) {
        if(main_medicine.length > 0) {
            medicine['medicine_id'] = main_medicine[0].ID;
            medicine['user_id']= user_id;
						console.log("***************** here medicine exist User ID =" + user_id);
            stock_list_model.async_select_stock_list_by_medicine(medicine, function(stock_list_medicine) {
                if(stock_list_medicine.length > 0) {
                    medicine['stock_id'] = stock_list_medicine[0].ID;
										console.log("found medicine stock id " + medicine['stock_id']);
                    stock_list_model.update_stock_record(medicine);
                    user_pharmacy_model.async_update_stock_time(medicine, function(rows) {
                            callback();
                        });
                }
                else {
                    stock_list_model.insert_new_record(medicine);
										callback();
                }
            });
        }
        else {
					var user_model_info = {};
					user_model_info.user_id = user_id;
					var user_info = user_model.select_user_by_id(user_model_info);
					console.log("***************** here medicine Does NOT exist in medicine table User ID =" + user_id);
            medicine_model.async_insert_new_medicine_by_main_keys(medicine, function(rows) {
                medicine_model.async_select_medicine_by_main_keys(medicine, function(medicine1) {
                    medicine['medicine_id'] = medicine1[0].ID;
                    stock_list_model.async_insert_new_record(medicine, function(rows) {
											//send email to admin
											user_model.async_select_all_admin(function(user) {
							            //Send Confirmation Email
													if(user.length > 0) {
								      			for (var i = 0; i < user.length; i++) {
															console.log("**** admin email"+user[i].EMAIL);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
															var mailOptions = {
																	from: 'chemofinder@gmail.com', // sender address
																	to: user[i].EMAIL, // list of receivers
																	subject: 'New Unapproved Medicine Was Loaded', // Subject line
																	template: 'upload_unapproved_medicines_mail',
																	context: {
																			link: "http://chemofinder.mybluemix.net/admin/login",//message.link
																			pharmacy_name: user_info[0].ENTITY_NAME,
																			Generic_name: medicine1[0].GENERIC_NAME,
																			Brand_name: medicine1[0].BRAND_NAME,
																			Manufacturer: medicine1[0].MANUFACTURER,
																			form: medicine1[0].FORM,
																			Strength: medicine1[0].STRENGTH,
																			Strength_unit: medicine1[0].STRENGTH_UNIT
																	}

																	//html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
															};

															var nodemailer = require('nodemailer');
															var hbs = require('nodemailer-express-handlebars');
															var transporter = nodemailer.createTransport({
																	service: 'Gmail',
																	auth: {
																			user: 'chemofinder@gmail.com', // Your email id
																			pass: 'chemofinder2016' // Your password
																			//TODO remove password use encrypted token SAMEH
																	}
															});
															var options = {
															 viewEngine: {
																	 extname: '.hbs',
																	 layoutsDir: 'views/email/'
															 },
															 viewPath: 'views/email/',
															 extName: '.hbs'
															};
															transporter.use('compile', hbs(options));
															transporter.sendMail(mailOptions, function(error, info){
																	if(error){
																			console.log(error);
																			return 'failed';
																			//res.json({message: 'error'});
																	}else{
																			console.log('Message sent: ' + info.response);
																			return 'success';
																			//res.json({message: info.response});
																	};
																	//process.exit();
															});





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
														}
													}
                        callback();
											});
                    });
                });
            });
        }
    });
}
