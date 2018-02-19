controller                  = require('../controller');
admin_model  = require('../../models/admin_model');
medicine_model  = require('../../models/medicine_model');
stock_list_model  = require('../../models/stock_list_model');
tomodel = {};

//var dependency = JSON.parse(process.argv[2]);
process.on('message', function(message){
    medicine_model.disapprove_rsa();
    console.log("medicines length is " + message.medicines.length);
    var medicines_to_be_updated_list = [];
    var medicines_to_be_insert_list = [];
    var col_results = medicine_model.select_sra_medicine_by_main_keys_collection(message.medicines);
    console.log("collection results has been completed");
    for(var i=0; i<col_results.length; i++){
      if(col_results[i][0]['MCOUNT'] > 0){
        medicines_to_be_updated_list.push(message.medicines[i]);
      }else {
        medicines_to_be_insert_list.push(message.medicines[i]);
      }
    }
    submit_medicine_to_database(medicines_to_be_insert_list, medicines_to_be_updated_list,function(err){
     if( err ) {
     // One of the iterations produced an error.
     // All processing will now stop.
     console.log('A file failed to process');
     } else {

        console.log("the medicins to be updated length is " + medicines_to_be_updated_list.length);
        console.log("the medicins to be inserted length is " + medicines_to_be_insert_list.length);
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

var submit_medicine_to_database = function(medicines_to_be_insert_list, medicines_to_be_updated_list, callback){
  medicine_model.update_insert_sra_medicine_by_main_keys_collection(medicines_to_be_insert_list, medicines_to_be_updated_list);
  callback();
}
var save_medicines_list = function(medicine, update_list, insert_list, callback) {
    rows = medicine_model.async_select_sra_medicine_by_main_keys(medicine, callback);
    medicine.b_rsa_approve = true;
        if(rows != null && rows.length > 0) {
            medicine['medicine_id'] = rows[0].ID;
            update_list.push(medicine);
            //rows = medicine_model.async_SRA_update_medicine(medicine, callback);
            //callback();
        }
        else {
            insert_list.push(medicine);
            //medicine_model.insert_new_medicine(medicine);
            //callback();
        }
        //callback();
}
