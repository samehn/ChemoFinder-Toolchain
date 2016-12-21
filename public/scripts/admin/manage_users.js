var url = window.location.origin;
$(document).ready(function(){
   $('#newAccountsTable').DataTable({
        "scrollX": true
    });
   $('#usersTable').DataTable({
        "scrollX": true
    });
   $('#suspensionHistory').DataTable({
        "scrollX": true
    });
   $('#timepicker1').timepicker();

	$('#timepicker2').timepicker();

	$("#typeUser").change(function() {
	    $('.error-form').remove();
	    $('.message-form').remove();
	    if ($("#typeUser option:selected").val() == "PHARMACY" || $("#typeUser option:selected").val() == "TREATMENT CENTER") {
	        $('.handle').css('display', 'inherit');
	    } else {
	        $('.handle').css('display', 'none');
	    }
	});
});

function approve(id) {
	if (confirm("Are you sure you want to approve this user ?") == true) {
        var data_array={};
		data_array['id'] = id;
		$.ajax({
	        type: "post",
	        url: url + '/admin/approveuser',
	        data : data_array,
	        success:  function(data){
	        	console.log(data);
	        	window.location = url + '/admin/manage_users';
	        }
		}); 
    }
}

function suspend(id) {
	if (confirm("Are you sure you want to suspend this user ?") == true) {
        var data_array={};
		data_array['id'] = id;
		data_array['suspension_reason'] = $('#suspend_message_' + id).val();
		var chk = $('#chk_'+id);
		if(chk.is(':checked'))
		{
			data_array['suspension_email'] = true;
		}
		else
		{
			data_array['suspension_email'] = false;	
		}
		 
		 console.log(data_array);
		$.ajax({
	        type: "post",
	        url: url + '/admin/suspenduser',
	        data : data_array,
	        success:  function(data){
	        	window.location = url + '/admin/manage_users';
	        }
		}); 
    }
}

function delete_user(id) {
  if (confirm("Are you sure you want to delete this user ?") == true) {
    var data_array={};
    data_array['id'] = id;
     
    console.log(data_array);
    $.ajax({
          type: "post",
          url: url + '/admin/deleteuser',
          data : data_array,
          success:  function(data){
            window.location = url + '/admin/manage_users';
          }
    }); 
  }
}


function activate(id) {
	if (confirm("Are you sure you want to activate this user ?") == true) {
        var data_array={};
		data_array['id'] = id;
		 
		 console.log(data_array);
		$.ajax({
	        type: "post",
	        url: url + '/admin/activateuser',
	        data : data_array,
	        success:  function(data){
	        	window.location = url + '/admin/manage_users';
	        }
		}); 
    }
}

function generate_password(element) {
	$.ajax({
        type: "get",
        url: url + '/generaterandompassword',
        success:  function(data){
        	console.log(data.random);
        	element.parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].value = data.random;
	    }
	}); 
}

function add_new_user() {
	var user_array={};
    
    var type = $('#typeUser');
    var name = $('#nameUser');
    var email = $('#emailUser');
    var password = $('#passwordUser');
    var street = $('#streetUser');
    var city = $('#cityUser');
    var state = $('#stateUser');
    var zip = $('#zipUser');

    user_array[type.attr('name')] = type.val();
    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    user_array[street.attr('name')] = street.val();
    user_array[city.attr('name')] = city.val();
    user_array[state.attr('name')] = state.val();
    user_array[zip.attr('name')] = zip.val();

    if(type.val() == "PHARMACY" || type.val() == "TREATMENT CENTER")
    {
        var phone = $('#phoneUser');
        var open_from = $('#timepicker1');
        var open_to = $('#timepicker2');
        user_array[phone.attr('name')] = phone.val();
        user_array[open_from.attr('name')] = open_from.val();
        user_array[open_to.attr('name')] = open_to.val();
    }
    console.log(user_array);
     $.ajax({
        type: "post",
        url: url + '/admin/addnewuser',
        data : user_array,
        success:  function(data){
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "success")
            {
                var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> The account is created successfuly</div>';
                $(message).insertBefore($('#typeUserForm'));
            }
            else if(data.message == "failed")
            {
               if(data.email_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
                  $(error_message).insertBefore($('#emailUserForm'));
               }
               if(data.password_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.password_error + '</div>';
                  $(error_message).insertBefore($('#passwordUserForm'));
               }
               if(data.type_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.type_error + '</div>';
                  $(error_message).insertBefore($('#typeUserForm'));
               }
               if(data.name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.name_error + '</div>';
                  $(error_message).insertBefore($('#nameUserForm'));
               }
               if(data.street_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.street_error + '</div>';
                  $(error_message).insertBefore($('#streetUserForm'));
               }
               if(data.city_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.city_error + '</div>';
                  $(error_message).insertBefore($('#cityUserForm'));
               }
               if(data.state_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.state_error + '</div>';
                  $(error_message).insertBefore($('#stateUserForm'));
               }
               if(data.zip_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.zip_error + '</div>';
                  $(error_message).insertBefore($('#zipUserForm'));
               }
               if(data.phone_number_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.phone_number_error + '</div>';
                  $(error_message).insertBefore($('#phoneUserForm'));
               }
               if(data.open_from_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_from_error + '</div>';
                  $(error_message).insertBefore($('#openFromUserForm'));
               }
               if(data.open_to_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_to_error + '</div>';
                  $(error_message).insertBefore($('#openToUserForm'));
               }
            }
        }
    });
}

function add_new_admin() {
	var user_array={};
    
    
    var name = $('#nameAdmin');
    var email = $('#emailAdmin');
    var password = $('#passwordAdmin');

   
    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
  
    console.log(user_array);
     $.ajax({
        type: "post",
        url: url + '/admin/addnewadmin',
        data : user_array,
        success:  function(data){
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "success")
            {
                var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> The account is created successfuly</div>';
                $(message).insertBefore($('#nameAdminForm'));
            }
            else if(data.message == "failed")
            {
               if(data.email_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
                  $(error_message).insertBefore($('#emailAdminForm'));
               }
               if(data.password_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.password_error + '</div>';
                  $(error_message).insertBefore($('#passwordAdminForm'));
               }
               
               if(data.name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.name_error + '</div>';
                  $(error_message).insertBefore($('#nameAdminForm'));
               }
            }
        }
    });
}
