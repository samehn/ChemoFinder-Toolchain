module.exports = function(app){

	//Controllers++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var home_controller = require('../controllers/user/home');
	var user_authentication_controller = require('../controllers/user/authentication');
	var user_forgot_password_controller = require('../controllers/user/forgot_password');
	var user_reset_password_controller = require('../controllers/user/reset_password');
	var user_first_login_controller = require('../controllers/user/first_login');

	var admin_authentication_controller = require('../controllers/admin/authentication');
	var admin_forgot_password_controller = require('../controllers/admin/forgot_password');
	var admin_reset_password_controller = require('../controllers/admin/reset_password');
	var admin_manage_users_controller = require('../controllers/admin/manage_users');
	var admin_manage_medicines_controller = require('../controllers/admin/manage_medicines');
	var admin_manage_admins_controller = require('../controllers/admin/manage_admins');

	var pharmacy_profile_controller = require('../controllers/pharmacy/profile');
	var pharmacy_stock_controller = require('../controllers/pharmacy/stock');
	
	var doctor_profile_controller = require('../controllers/doctor/profile');
	var doctor_treatment_center_controller = require('../controllers/doctor/treatment_center');
	var doctor_select_medicine_controller = require('../controllers/doctor/select_medicine');
	var doctor_select_pharmacy_controller = require('../controllers/doctor/select_pharmacy');
	var doctor_shopping_list_controller = require('../controllers/doctor/shopping_list');
	
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	//Routes+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	app.get('/', home_controller.home_page);
	app.post('/getmedicinebygenericandform', home_controller.get_medicines_by_generic_and_form)
	app.post('/getavailablepharmaciesbyid', home_controller.get_pharmacies);
	app.get('/getapprovedmedicines', home_controller.get_medicines);
	app.post('/user/login', user_authentication_controller.login);
	app.post('/user/signup', user_authentication_controller.signup);
	app.get('/logout', user_authentication_controller.logout);
	app.get('/user/forgotpassword', user_forgot_password_controller.forgot_password_page);
	app.post('/user/forgotpassword', user_forgot_password_controller.forgot_password_process);
	app.get('/user/resetpassword/:token', user_reset_password_controller.reset_password_page);
	app.post('/user/resetpassword', user_reset_password_controller.reset_password_process);
	app.get('/user/first_changepassword', checkFirstLogin, user_first_login_controller.first_login_page);
	app.post('/user/first_changepassword', checkFirstLogin, user_first_login_controller.change_password);

	app.get('/admin/login', admin_authentication_controller.login_page);
	app.post('/admin/login', admin_authentication_controller.login);
	app.get('/admin/logout', admin_authentication_controller.logout);
	app.get('/admin/forgotpassword', admin_forgot_password_controller.forgot_password_page);
	app.post('/admin/forgotpassword', admin_forgot_password_controller.forgot_password_process);
	app.get('/admin/resetpassword/:token', admin_reset_password_controller.reset_password_page);
	app.post('/admin/resetpassword', admin_reset_password_controller.reset_password_process);
	app.get('/admin/manage_users', checkAdminSignIn, admin_manage_users_controller.manage_users_page);
	app.post('/admin/get_user_history', checkAdminSignIn, admin_manage_users_controller.get_user_history);
	app.post('/admin/addnewuser', checkAdminSignIn, admin_manage_users_controller.add_new_user);
	app.post('/admin/addnewadmin', checkAdminSignIn, admin_manage_users_controller.add_new_admin);
	app.post('/admin/approveuser', checkAdminSignIn, admin_manage_users_controller.approve_user);
	app.post('/admin/suspenduser', checkAdminSignIn, admin_manage_users_controller.suspend_user);
	app.post('/admin/activateuser', checkAdminSignIn, admin_manage_users_controller.activate_user);
	app.post('/admin/deleteuser', checkAdminSignIn, admin_manage_users_controller.delete_user);
	app.get('/admin/manage_medicines', checkAdminSignIn, admin_manage_medicines_controller.manage_medicines_page);
	app.post('/admin/addnewmedicine', checkAdminSignIn, admin_manage_medicines_controller.add_new_medicine);
	app.post('/admin/updatemedicine', checkAdminSignIn, admin_manage_medicines_controller.update_medicine);
	app.post('/admin/deletemedicine', checkAdminSignIn, admin_manage_medicines_controller.delete_medicine);
	app.get('/admin/getmedicinebyid/:id', checkAdminSignIn, admin_manage_medicines_controller.get_medicine_by_id);
	app.get('/admin/downloadtemplate', checkAdminSignIn, admin_manage_medicines_controller.download_medicines_template);
	app.post('/admin/uploadmedicines', checkAdminSignIn, admin_manage_medicines_controller.upload_medicines_list);
	app.post('/admin/uploadstocklist', checkAdminSignIn, admin_manage_medicines_controller.upload_stock_list);
	app.get('/admin/admins_list', checkAdminSignIn, admin_manage_admins_controller.admins_list_page);
	app.post('/admin/changetype', checkAdminSignIn, admin_manage_admins_controller.change_type);
	app.post('/admin/activateadmin', checkAdminSignIn, admin_manage_admins_controller.activate_admin);

	app.get('/pharmacy/profile', checkSignIn, pharmacy_profile_controller.profile_page);
	app.post('/pharmacy/updateprofile', checkSignIn, pharmacy_profile_controller.update_profile);
	app.post('/pharmacy/changepassword', checkSignIn, pharmacy_profile_controller.change_password);
	app.get('/pharmacy', checkSignIn, pharmacy_stock_controller.stock_page);
	app.post('/pharmacy/getstockrecord', checkSignIn, pharmacy_stock_controller.get_stock_record);
	app.post('/pharmacy/addnewmedicine', checkSignIn, pharmacy_stock_controller.add_new_medicine);
	app.post('/pharmacy/addnewapprovedmedicine', checkSignIn, pharmacy_stock_controller.add_new_approved_medicine);
	app.post('/pharmacy/updatemedicine', checkSignIn, pharmacy_stock_controller.update_medicine);
	app.post('/pharmacy/deletemedicine', checkSignIn, pharmacy_stock_controller.delete_medicine);
	app.post('/pharmacy/uploadstocklist', checkSignIn, pharmacy_stock_controller.upload_stock_list);
	app.get('/pharmacy/downloadtemplate', checkSignIn, pharmacy_stock_controller.download_stock_list_template);
	app.get('/pharmacy/downloadlaststock', checkSignIn, pharmacy_stock_controller.download_last_stock);

	app.get('/doctor/profile', checkSignIn, doctor_profile_controller.profile_page);
	app.post('/doctor/changepassword', checkSignIn, doctor_profile_controller.change_password);
	app.post('/doctor/updateprofile', checkSignIn, doctor_profile_controller.update_profile);
	app.get('/doctor', checkSignIn, doctor_treatment_center_controller.treatment_center_page);
	app.post('/doctor/gettreatmentcenter', checkSignIn, doctor_treatment_center_controller.get_treatment_center_details);
	app.get('/doctor/selectmedicine', checkSignIn, doctor_select_medicine_controller.select_medicine_page);
	app.post('/doctor/selectmedicinedetails', checkSignIn, doctor_select_medicine_controller.select_medicine_details);
	app.get('/doctor/selectpharmacy', checkSignIn, doctor_select_pharmacy_controller.select_pharmacy_page);
	app.get('/doctor/shoppinglist', checkSignIn, doctor_shopping_list_controller.shopping_list_page);
	app.post('/doctor/shoppinglist/sendemail', checkSignIn, doctor_shopping_list_controller.send_email);
	app.post('/doctor/savemedicinesession', checkSignIn, doctor_shopping_list_controller.save_medicine_session);
	
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function checkAdminSignIn(req, res, next){
	    if(req.session.admin_id){
	        next();     //If session exists, proceed to page 
	    } else {
	        var err = new Error("Not logged in!");
	        next(err);  //Error, trying to access unauthorized page!
	    }
	}

	function checkFirstLogin(req, res, next){
	    if(req.session.user_id){
	        if(req.session.user_first_login == '1')
	        {
	           next();     //If session exists, proceed to page 
	        }
	        else
	        {
	            var err = new Error("Home page");
	            next(err);  //Error, trying to access unauthorized page!    
	        }
	    } else {
	        var err = new Error("Not logged in!");
	        next(err);  //Error, trying to access unauthorized page!
	    }
	}

	function checkSignIn(req, res, next){
	    if(req.session.user_id){
	        if(req.session.user_first_login == '0')
	        {
	           next();     //If session exists, proceed to page 
	        }
	        else
	        {
	            var err = new Error("First Login");
	            next(err);  //Error, trying to access unauthorized page!    
	        }
	    } else {
	        var err = new Error("Not logged in!");
	        next(err);  //Error, trying to access unauthorized page!
	    }
	}
}