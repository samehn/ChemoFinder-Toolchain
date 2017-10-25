controller 					= require('../controller');
user_model 	= require('../../models/user_model');
user_pharmacy_model  = require('../../models/user_pharmacy_model');
stock_list_model  = require('../../models/stock_list_model');
medicine_model = require('../../models/medicine_model');
tomodel = {};


process.on('message', function(message){
	var data = {};
	data.pharmacy_id = message.pharmacy_id;
	console.log('^^^^^^^ upload out of stocklist pharmacy id ' + message.pharmacy_id);
  medicine_model.insert_rows_out_of_stock_list_transaction_history(data);
	medicine_model.delete_rows_out_of_stock_list_by_pharmacy_id(data);
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
	        tomodel.user_id = message.pharmacy_id;
	        user_model.async_select_user_by_id(tomodel, function(user) {
	            //Send Confirmation Email

	            var mailOptions = {
	                from: 'chemofinder@gmail.com', // sender address
	                to: user[0].EMAIL, // list of receivers
	                subject: 'Uploading Stock List is Completed Successfully', // Subject line
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
	console.log("********** about to update out of stock list ***************");
	medicine['quantity'] = 0;
	//medicine['expiry_date'] = '01-01-2000';
	//medicine['pack_size'] = 0.0;
	//medicine['price'] = 0.0;
	//medicine['avg_monthly_consumption'] = '';
    medicine_model.async_select_medicine_by_main_keys(medicine, function(main_medicine) {
			console.log("medicine to update =>\n" + main_medicine );
        if(main_medicine.length > 0) {
						console.log("main medicine id is " + main_medicine[0].ID);
            medicine['medicine_id'] = main_medicine[0].ID;
            medicine['user_id']= user_id;
						stock_list_model.async_select_stock_list_by_medicine(medicine, function(stock_list_medicine) {
                if(stock_list_medicine.length > 0) {
                    medicine['stock_id'] = stock_list_medicine[0].ID;
										console.log("******* stock list medicine stock is " + medicine['quantity']);
										medicine['quantity'] = 0;
										//medicine['expiry_date'] = '01-01-2000';
										console.log("******* stock list medicine after update is " + medicine['quantity'] + " EXPIRY_DATE " + medicine['expiry_date']);
                    stock_list_model.async_update_stock_record(medicine, function(rows) {

                        user_pharmacy_model.async_update_stock_time(medicine, function(rows) {
                            callback();
                        });
                    });
                }
                else {
									medicine['quantity'] = 0;
                    stock_list_model.async_insert_out_of_stock_new_record(medicine, function(rows) {
                        callback();
                    });
                }
            });
        }
        else {
            medicine_model.async_insert_new_medicine_by_main_keys(medicine, function(rows) {
                medicine_model.async_select_medicine_by_main_keys(medicine, function(rmedicine) {
                    medicine['medicine_id'] = rmedicine[0].ID;
										medicine['quantity'] = 0;
                    stock_list_model.async_insert_out_of_stock_new_record(medicine, function(rows) {
                        callback();
                    });
                });
            });
        }
    });
}
