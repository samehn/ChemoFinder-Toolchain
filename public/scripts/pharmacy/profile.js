var url = window.location.origin;

$('#timepicker1').timepicker();

$('#timepicker2').timepicker();

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
    var email = $('#email');
    var street = $('#street');
    var city = $('#city');
    var state = $('#state');
    var zip = $('#zip');
    var phone = $('#phone');
    var open_from = $('#timepicker1');
    var open_to = $('#timepicker2'); 

    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[street.attr('name')] = street.val();
    user_array[city.attr('name')] = city.val();
    user_array[state.attr('name')] = state.val();
    user_array[zip.attr('name')] = zip.val();
    user_array[phone.attr('name')] = phone.val();
    user_array[open_from.attr('name')] = open_from.val();
    user_array[open_to.attr('name')] = open_to.val();

    console.log(user_array);
    $('#loadingModal').modal('show');
    $.ajax({
      type: "post",
      url: url + '/pharmacy/updateprofile',
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
           if(data.email_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
              $(error_message).insertBefore($('#emailForm'));
           }
           if(data.name_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.name_error + '</div>';
              $(error_message).insertBefore($('#nameForm'));
           }
           if(data.street_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.street_error + '</div>';
              $(error_message).insertBefore($('#streetForm'));
           }
           if(data.city_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.city_error + '</div>';
              $(error_message).insertBefore($('#cityForm'));
           }
           if(data.state_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.state_error + '</div>';
              $(error_message).insertBefore($('#stateForm'));
           }
           if(data.zip_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.zip_error + '</div>';
              $(error_message).insertBefore($('#zipForm'));
           }
           if(data.phone_number_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.phone_number_error + '</div>';
              $(error_message).insertBefore($('#phoneForm'));
           }
           if(data.open_from_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_from_error + '</div>';
              $(error_message).insertBefore($('#openFromForm'));
           }
           if(data.open_to_error)
           {
              var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_to_error + '</div>';
              $(error_message).insertBefore($('#openToForm'));
           }
        }
      }
  });
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
    url: url + '/user/changepassword',
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