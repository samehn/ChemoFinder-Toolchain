var url = window.location.origin;

$(document).click(function() {
    $('.error-form').remove();
});

$("#change-password-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$("#edit-profile-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$('#edit-profile-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    editProfile();
    return false;
  }
});

$('#change-password-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    changePassword();
    return false;
  }
});

function editProfile() {
  var user_array={};
    
  var name = $('#name');
  var position = $('#position');
  var entity_name = $('#entityName');
  var email = $('#email');
  var phone_number = $('#phone');

  var address = $('#address');
  var city = $('#city');
  var country = $('#country');

  user_array[name.attr('name')] = name.val();
  user_array[position.attr('name')] = position.val();
  user_array[entity_name.attr('name')] = entity_name.val();

  user_array[email.attr('name')] = email.val();
  user_array[phone_number.attr('name')] = phone_number.val();

  user_array[address.attr('name')] = address.val();
  user_array[city.attr('name')] = city.val();
  user_array[country.attr('name')] = country.val();
    

  console.log(user_array);
  $('#loadingModal').modal('show');
  $.ajax({
    type: "post",
    url: url + '/doctor/updateprofile',
    data : user_array,
    success:  function(data){        
      $('#loadingModal').modal('hide');
      console.log(data);
      console.log(data.message);
      $('.error-form').remove();
      $('.message-form').remove();
      if(data.message == "success")
      {
        $('#editProfile').modal('hide');
        $('#confimUpdate').modal('show');
      }
      else if(data.message == "failed")
      {
        showError(data.name_error, $('#nameForm'));
        showError(data.position_error, $('#positionForm'));
        showError(data.entity_name_error, $('#entityNameForm'));
        showError(data.email_error, $('#emailForm'));
        showError(data.phone_number_error, $('#phoneForm'));
        showError(data.address_error, $('#addressForm'));
        showError(data.city_error, $('#cityForm'));
        showError(data.country_error, $('#countryForm'));
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

function changePassword() {
	var user_array={};
	var old_password = $('#oldPassword');
	var new_password = $('#newPassword');
	var rnew_password =$('#rnewPassword');
	user_array[old_password.attr('name')] = old_password.val();
	user_array[new_password.attr('name')] = new_password.val();
	user_array[rnew_password.attr('name')] = rnew_password.val();
	console.log(user_array);
	$.ajax({
		type: "post",
		url: url + '/doctor/changepassword',
		data : user_array,
		success:  function(data){
			console.log(data);
			console.log(data.message);
			$('.error-form').remove();
			$('.message-form').remove();
			if(data.message == "failed")
			{
				if(data.old_password_error)
				{
					var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.old_password_error + '</div>';
					$(error_message).insertBefore($('#oldPasswordForm'));
				}
				if(data.new_password_error)
				{
					var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.new_password_error + '</div>';
					$(error_message).insertBefore($('#newPasswordForm'));
				}
				if(data.rnew_password_error)
				{
					var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.rnew_password_error + '</div>';
					$(error_message).insertBefore($('#rnewPasswordForm'));
				}
			}
			else if(data.message == "success")
			{
				$('#changePassword').modal('hide');
            	$('#confimChangePassword').modal('show');
			}
		}
	});
}