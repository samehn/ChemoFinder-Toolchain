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

      if ($("#typeUser option:selected").val() == "pharmacy") {
        $('.handle').css('display', 'inherit');
        $('#entityNameUser').attr('placeholder', 'Pharmacy Name');
      } 
      else if($("#typeUser option:selected").val() == "treatment center") {
        $('.handle').css('display', 'inherit');
        $('#entityNameUser').attr('placeholder', 'Treatment Center Name');
      }
      else {
        $('.handle').css('display', 'none');
        $('#entityNameUser').attr('placeholder', 'Place of Work');
      }
	});
});

$(document).click(function() {
    $('.error-form').remove();
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

function showHistory(id) {
  var data_array={};
  data_array['id'] = id;       
  console.log(data_array);
  $.ajax({
        type: "post",
        url: url + '/admin/get_user_history',
        data : data_array,
        success:  function(data){
          $('#history_details').html('');
          if(data.message == "success"){
            for (var i = 0; i < data.results.length; i++) {
              var type = 'suspended';
              if(data.results[i].TYPE == 1){
                type = 'activated'
              }
              $('#history_details').append('<tr class="tr_history"> <td class="td_search">' + type + '</td><td class="td_search">' + data.results[i].SUSPENSION_REASON + '</td><td class="td_search">' + data.results[i].CREATED_AT + '</td></tr>');
            }
          }
          else{
            $('#history_details').html('<tr class="tr_search"><td id="empty_search" style="text-align: center;" valign="top" colspan="3" class="td_search">There are no history for this user</td></tr>');
          }

          $('#history').modal('show');
          console.log(data);
        }
  });
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
		data_array['suspension_reason'] = $('#suspend_message_' + id).val(); 
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
  var position = $('#positionUser');
  var entity_name = $('#entityNameUser');
  var phone = $('#phoneUser');
  var address = $('#addressUser');
  var city = $('#cityUser');
  var country = $('#countryUser');

  var email = $('#emailUser');
  var password = $('#passwordUser');

  user_array[type.attr('name')] = type.val();
  user_array[name.attr('name')] = name.val();
  user_array[position.attr('name')] = position.val();
  user_array[entity_name.attr('name')] = entity_name.val();
  user_array[phone.attr('name')] = phone.val();
  user_array[address.attr('name')] = address.val();
  user_array[city.attr('name')] = city.val();
  user_array[country.attr('name')] = country.val();
  user_array[email.attr('name')] = email.val();
  user_array[password.attr('name')] = password.val();
  
  if(type.val() == "pharmacy" || type.val() == "treatment center")
  {
    var open_from = $('#timepicker1');
    var open_to = $('#timepicker2');  
    user_array[open_from.attr('name')] = open_from.val();
    user_array[open_to.attr('name')] = open_to.val();
  }

  console.log(user_array);
  $.ajax({
    type: "post",
    url: url + '/admin/addnewuser',
    data : user_array,
    success:  function(data) {
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
        showError(data.type_error, $('#typeUserForm'));
        showError(data.name_error, $('#nameUserForm'));
        showError(data.position_error, $('#positionUser'));
        showError(data.entity_name, $('#entityNameUser'));
        showError(data.phone_number_error, $('#phoneUserForm'));
        showError(data.address_error, $('#addressUser'));
        showError(data.city_error, $('#cityUserForm'));
        showError(data.country_error, $('#countryUserForm'));
        showError(data.email_error, $('#emailUserForm'));
        showError(data.password_error, $('#passwordUserForm'));
        showError(data.open_from_error, $('#openFromUserForm'));
        showError(data.open_to_error, $('#openToUserForm'));
      }
    }
  });
}

function showError(error_data, position) {
  if(error_data)
  {
    var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + error_data + '</div>';
    $(error_message).insertBefore(position);
  }
}

function add_new_admin() {
	var user_array={};
    
    
    var name = $('#nameAdmin');
    var email = $('#emailAdmin');
    var password = $('#passwordAdmin');
    var type = $('#typeAdmin');
   
    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    user_array[type.attr('name')] = type.val();

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

               if(data.type_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.type_error + '</div>';
                  $(error_message).insertBefore($('#typeAdminForm'));
               }
            }
        }
    });
}
