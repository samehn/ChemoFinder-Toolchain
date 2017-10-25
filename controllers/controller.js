var controller = function() {};
// controller.prototype.request = require('request');
controller.prototype.validator = require('validator');
controller.prototype.bcrypt = require('bcrypt');
controller.prototype.dateFormat = require('dateformat');
controller.prototype.format = require('string-format');
controller.prototype.moment = require("moment");
controller.prototype.XLSX = require('xlsx');
// controller.prototype.generatePassword = require("password-generator");
controller.prototype.xssFilters = require('xss-filters');
controller.prototype.saltRounds = 10;
controller.prototype.Excel = require("exceljs");
controller.prototype.randtoken = require('rand-token');
controller.prototype.async = require('async');
// controller.prototype.multer  = require('multer');
controller.prototype.fs = require('fs');
// controller.prototype.mv = require('mv');
// controller.prototype.deleteFolderRecursive = function(path) {
//   if( this.fs.existsSync(path) ) {
//     this.fs.readdirSync(path).forEach(function(file,index){
//       var curPath = path + "/" + file;
//       if(this.fs.lstatSync(curPath).isDirectory()) { // recurse
//         deleteFolderRecursive(curPath);
//       } else { // delete file
//         this.fs.unlinkSync(curPath);
//       }
//     });
//     this.fs.rmdirSync(path);
//   }
// };
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

controller.prototype.sendEmail = function (mailOptions) {
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
    });
};

controller.prototype.mergeArrays = function (array1, array2){
	var result ={};
	for (var key in array1){
	    if (typeof array1[key] !== 'function') {
	    	result[key] = array1[key];
	    }
	}
	for (var key in array2){
	    if (typeof array2[key] !== 'function') {
	    	result[key] = array2[key];
	    }
	}
	return result;
};
controller.prototype.xssClean = function (fields){
	var result ={};
	for (var key in fields){
	    if (typeof fields[key] !== 'function') {
	    	result[key] = this.xssFilters.inHTMLData(fields[key]);
	    }
	}
	return result;
};

controller.prototype.integer_validation = function(number) {
	if(!this.validator.isEmpty(number) && this.validator.isInt(number, {gt:0, allow_leading_zeroes: false }))
	{
		return true;
	}
	return false;
};

controller.prototype.validate = function (field, validations) {
	// reguired OR required||message
	if(checkKeyStartWith(validations, 'required'))
	{
		var suffix = getKeyStartWith(validations, 'required');
		if(required(field))
		{
			if(suffix == 'required') {
				return required(field);
			}
			else {
				var message = suffix.split('||')[1];
				return requiredWithMessage(field, message);
			}
		}
	}

	//email OR email||message
	if(checkKeyStartWith(validations, 'email'))
	{
		var suffix = getKeyStartWith(validations, 'email');
		if(isEmail(field))
		{
			if(suffix == 'email') {
				return isEmail(field);		
			}
			else {
				var message = suffix.split('||')[1];
				return isEmailWithMessage(field, message);	
			}
			
		}
	}

	//length:min-max OR length:min-max
	if(checkKeyStartWith(validations, 'length:'))
	{
		var suffix = getKeyStartWith(validations, 'length:');
		var suffixArray = suffix.split('||');
		var min = suffixArray[0].split(':')[1].split('-')[0];
		var max = suffixArray[0].split(':')[1].split('-')[1];
		if(isLength(field, min, max))
		{
			if(suffixArray.length == 1) {
				return isLength(field, min, max);
			}
			else {
				var message = suffixArray[1];
				return isLengthWithMessage(field, min, max, message);	
			}
		}
	}

	//match_regex:regex||message
	if(checkKeyStartWith(validations, 'match_regex:'))
	{
		var suffix = getKeyStartWith(validations, 'match_regex:');
		var blocks = suffix.split('||');
		var message = blocks[blocks.length - 1];
		var regex = suffix.slice('match_regex:'.length,(-message.length -2));
		message =  message;
		if(validateWithRegex(regex, message, field))
		{
			return (validateWithRegex(regex, message, field));
		}
	}

	//integer:min-max OR integer OR integer:min-max||message OR integer||message
	if(checkKeyStartWith(validations, 'integer'))
	{
		var suffix = getKeyStartWith(validations, 'integer');
		var options = {};
		var suffixArrayMessage = suffix.split('||');
		var suffixArray = suffixArrayMessage[0].split(':');
		if (suffixArray.length > 1) {
			var min = suffixArrayMessage[0].split(':')[1].split('-')[0];
			var max = suffixArrayMessage[0].split(':')[1].split('-')[1];
			options['min'] = min;
			options['max'] = max;
		}
		if(isInteger(field, options))
		{
			if(suffixArrayMessage.length == 1) {
				return isInteger(field, options);
			}
			else {
				var message = suffixArrayMessage[1];
				return isIntegerWithMessage(field, options, message);
			}
		}
	}

	//float:min-max OR float OR float:min-max||message OR float||message
	if(checkKeyStartWith(validations, 'float'))
	{
		var suffix = getKeyStartWith(validations, 'float');
		var options = {};
		var suffixArrayMessage = suffix.split('||');
		var suffixArray = suffixArrayMessage[0].split(':');
		if (suffixArray.length > 1) {
			var min = suffixArrayMessage[0].split(':')[1].split('-')[0];
			var max = suffixArrayMessage[0].split(':')[1].split('-')[1];
			options['min'] = min;
			options['max'] = max;
		}
		if(isFloat(field, options))
		{
			if(suffixArrayMessage.length == 1) {
				return isFloat(field, options);
			}

			else {
				var message = suffixArrayMessage[1];
				return isFloatWithMessage(field, options, message);
			}
		}
	}

	return false;
};

function validateWithRegex(strRegex, message, field) {
	var regex = new RegExp(strRegex);
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(!regex.test(field[key]))
			{
				var result = {[key+'_error']: message};
				return result;
			}
			return false;
	    }
	} 
}

function checkKeyStartWith(array, prefix) {
	for (var i = 0; i < array.length; i++) {
		if(array[i].startsWith(prefix))
		{
			return true;
		}
	}
	return false;
}

function getKeyStartWith(array, prefix) {
	for (var i = 0; i < array.length; i++) {
		if(array[i].startsWith(prefix))
		{
			return array[i];
		}
	}
	return false;
}

function required(field) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(controller.prototype.validator.isEmpty(field[key]))
			{
				var value = 'This filed is required';
				var result = {[key+'_error']: value};
				return result;
			}
			return false;
	    }
	}
}

function requiredWithMessage(field, message) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(controller.prototype.validator.isEmpty(field[key]))
			{
				var result = {[key+'_error']: message};
				return result;
			}
			return false;
	    }
	}
}

function isEmail(field) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(!controller.prototype.validator.isEmail(field[key]))
			{
				var value = 'This is not a valid email';
				var result = {[key+'_error']: value};
				return result;
			}
			return false;
	    }
	}
}

function isEmailWithMessage(field, message) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(!controller.prototype.validator.isEmail(field[key]))
			{
				var result = {[key+'_error']: message};
				return result;
			}
			return false;
	    }
	}
}

function isLength(field, min, max) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(!controller.prototype.validator.isLength(field[key], {min: min, max: max}))
			{
				var value = 'The length of this field should be between '+ min +' and ' + max;
				var result = {[key+'_error']: value};
				return result;
			}
			return false;
	    }
	}
}

function isLengthWithMessage(field, min, max, message) {
 	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(!controller.prototype.validator.isLength(field[key], {min: min, max: max}))
			{
				var result = {[key+'_error']: message};
				return result;
			}
			return false;
	    }
	}
}

function isInteger(field, options) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(Object.keys(options).length > 0){
	    		if(!controller.prototype.validator.isInt(field[key], {min: options['min'], max: options['max']}))
				{
					var value = 'This field should be an integer range between '+ options['min'] +' and ' + options['max'];
					var result = {[key+'_error']: value};
					return result;
				}
	    	}
	    	else{
	    		if(!controller.prototype.validator.isInt(field[key]))
				{
					var value = 'This field should be an integer';
					var result = {[key+'_error']: value};
					return result;
				}
	    	}
	    	
			return false;
	    }
	}
}

function isIntegerWithMessage(field, options, message) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(Object.keys(options).length > 0){
	    		if(!controller.prototype.validator.isInt(field[key], {min: options['min'], max: options['max']}))
				{
					var result = {[key+'_error']: message};
					return result;
				}
	    	}
	    	else{
	    		if(!controller.prototype.validator.isInt(field[key]))
				{
					var result = {[key+'_error']: message};
					return result;
				}
	    	}
	    	
			return false;
	    }
	}
}

function isFloat(field, options) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(Object.keys(options).length > 0){
	    		if(!controller.prototype.validator.isFloat(field[key], {min: options['min'], max: options['max']}))
				{
					var value = 'This field should be a float range between '+ options['min'] +' and ' + options['max'];
					var result = {[key+'_error']: value};
					return result;
				}
	    	}
	    	else{
	    		if(!controller.prototype.validator.isFloat(field[key]))
				{
					var value = 'This field should be a float';
					var result = {[key+'_error']: value};
					return result;
				}
	    	}
	    	
			return false;
	    }
	}
}

function isFloatWithMessage(field, options, message) {
	for (var key in field){
	    if (typeof field[key] !== 'function') {
	    	if(Object.keys(options).length > 0){
	    		if(!controller.prototype.validator.isFloat(field[key], {min: options['min'], max: options['max']}))
				{
					var result = {[key+'_error']: message};
					return result;
				}
	    	}
	    	else{
	    		if(!controller.prototype.validator.isFloat(field[key]))
				{
					var result = {[key+'_error']: message};
					return result;
				}
	    	}
	    	
			return false;
	    }
	}
}

// controller.prototype.paginate = function (page, limit, source, total, items) {
//     if(total > 0)
// 	{
// 		page = parseInt(page);
// 		var noItems = '';
// 		var numOfPages = Math.ceil(total/limit);
// 		var pagination ='';
// 		if(page == 1)
// 		{
// 			pagination = '<div class="box-footer clearfix"><ul class="pagination pagination-sm no-margin pull-right"><li><a class="disable-link" >First</a></li>';
// 			pagination = pagination + '<li><a class="disable-link" >&laquo;</a></li>';
// 		}
// 		else
// 		{
// 			pagination = '<div class="box-footer clearfix"><ul class="pagination pagination-sm no-margin pull-right"><li><a onclick="getPage(1, \'' + source + '\')" >First</a></li>';
// 			requestedPage = page - 1;
// 			pagination = pagination + '<li><a onclick="getPage('+ requestedPage +', \'' + source + '\')" >&laquo;</a></li>';
// 		}
		
// 		if(page == 1)
// 		{
// 			pagination = pagination + '<li><a class="selected-page disable-link">1</a></li>';
// 			if(numOfPages > 1)
// 			{
// 				pagination = pagination + '<li><a onclick="getPage(2, \'' + source + '\')">2</a></li>';
// 			}
// 			if(numOfPages > 2)
// 			{
// 				pagination = pagination + '<li><a onclick="getPage(3, \'' + source + '\')">3</a></li>';
// 			}
// 		}
// 		else if(page == numOfPages && page != 1)
// 		{
// 			if(numOfPages > 2)
// 			{
// 				requestedPage = page - 2;
// 				pagination = pagination + '<li><a onclick="getPage(' + requestedPage + ', \'' + source + '\')">' + requestedPage + '</a></li>';
// 			}
// 			if(numOfPages > 1)
// 			{
// 				requestedPage = page - 1;
// 				pagination = pagination + '<li><a onclick="getPage(' + requestedPage + ', \'' + source + '\')">' + requestedPage +'</a></li>';
// 			}
// 			pagination = pagination + '<li><a class="selected-page disable-link">' + page + '</a></li>';
// 		}
// 		else
// 		{
// 			requestedPage = page - 1;
// 			pagination = pagination + '<li><a onclick="getPage(' + requestedPage + ', \'' + source + '\')">' + requestedPage + '</a></li>';
// 			pagination = pagination + '<li><a class="selected-page disable-link">' + page + '</a></li>';
// 			requestedPage = page + 1;
// 			pagination = pagination + '<li><a onclick="getPage(' + requestedPage + ', \'' + source + '\')">' + requestedPage + '</a></li>';
// 		}
// 		if(page == numOfPages)
// 		{
// 			pagination = pagination + '<li><a class="disable-link">&raquo;</a></li>';
// 			pagination = pagination + '<li><a class="disable-link">Last</a></li></ul></div>';
// 		}
// 		else
// 		{
// 			requestedPage = page + 1;
// 			pagination = pagination + '<li><a onclick="getPage(' + requestedPage + ', \'' + source + '\')">&raquo;</a></li>';
// 			pagination = pagination + '<li><a onclick="getPage(' + numOfPages + ', \'' + source + '\')">Last</a></li></ul></div>';
// 		}	
// 	}
// 	else
// 	{
// 		var noItems = "<tr><td colspan = '14' style='text-align:center;color: rgba(0,0,0,0.3)'><h4><span class='glyphicon glyphicon-ban-circle'></span>&nbsp;&nbsp;There are no requests currently</h4></td></tr>"; 
// 		var pagination = '';
// 	}
	
// 	data  = {'pagination' : pagination, 'total' : total, 'items' : items, 'noItems': noItems, 'limit': limit, 'page': page};
// 	return data;
// };
module.exports = new controller();
