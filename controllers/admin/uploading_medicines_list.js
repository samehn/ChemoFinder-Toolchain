controller                  = require('../controller');
admin_model  = require('../../models/admin_model');
medicine_model  = require('../../models/medicine_model');
stock_list_model  = require('../../models/stock_list_model');
tomodel = {};
//var dependency = JSON.parse(process.argv[2]);
process.on('message', function(message){
    controller.async.eachLimit(message.medicines, 5, function(medicine, callback){                      
        save_medicines_list(medicine, function() {
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
         tomodel.admin_id = message.admin_id;
         admin_model.async_select_admin_by_id(tomodel, function(admin) {
            //Send Confirmation Email
            
            var mailOptions = {
                from: 'chemofinder@gmail.com', // sender address
                to: admin[0].EMAIL, // list of receivers
                subject: 'Uploading Medicines List is Completed Successfully', // Subject line
                template: 'upload_medicines_list_mail',
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

var save_medicines_list = function(medicine, callback) {
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
