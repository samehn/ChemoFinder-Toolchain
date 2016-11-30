var url = window.location.origin;

$('#timepicker1').timepicker();

$('#timepicker2').timepicker();

$("#type").change(function() {
    $('.error-form').remove();
    $('.message-form').remove();
    if ($("#type option:selected").val() == "PHARMACY" || $("#type option:selected").val() == "TREATMENT CENTER") {
        $('.handle').css('display', 'inherit');
    } else {
        $('.handle').css('display', 'none');
    }
});


function login() {
    
    var type = $('#login-type');
    var user_array={};
    var email = $('#uEmail');
    var password = $('#uPassword');
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
   
     $.ajax({
        type: "post",
        url: url +'/user/login',
        data : user_array,
        success:  function(data){
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "failed")
            {
               if(data.login_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.login_error + '</div>';
                  $(error_message).insertBefore($('#emailLoginForm'));
               }
            }
            else if(data.message == "success")
            {
                if( data.type == 'PHARMACY' || data.type == 'TREATMENT CENTER')
                {
                    window.location = url + '/pharmacy';
                }
                else if(data.type == 'DOCTOR' || data.type == 'NAVIGATOR')
                {
                    window.location = url + '/doctor';
                }
            }
        }
    });
}

function register() {
    var user_array={};
    
    var type = $('#type');
    var name = $('#name');
    var email = $('#email');
    var password = $('#password');
    var rpassword = $('#rpassword');
    var street = $('#street');
    var city = $('#city');
    var state = $('#state');
    var zip = $('#zip');

    user_array[type.attr('name')] = type.val();
    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    user_array[rpassword.attr('name')] = rpassword.val();
    user_array[street.attr('name')] = street.val();
    user_array[city.attr('name')] = city.val();
    user_array[state.attr('name')] = state.val();
    user_array[zip.attr('name')] = zip.val();

    if(type.val() == "PHARMACY" || type.val() == "TREATMENT CENTER")
    {
        var phone = $('#phone');
        var open_from = $('#timepicker1');
        var open_to = $('#timepicker2');
        user_array[phone.attr('name')] = phone.val();
        user_array[open_from.attr('name')] = open_from.val();
        user_array[open_to.attr('name')] = open_to.val();
    }
    console.log(user_array);
     $.ajax({
        type: "post",
        url: url + '/user/signup',
        data : user_array,
        success:  function(data){
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "success")
            {
                var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> You registration is done successfuly, wait for the admin approval</div>';
                $(message).insertBefore($('#typeRegisterForm'));
            }
            else if(data.message == "failed")
            {
               if(data.email_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
                  $(error_message).insertBefore($('#emailRegisterForm'));
               }
               if(data.password_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.password_error + '</div>';
                  $(error_message).insertBefore($('#passwordRegisterForm'));
               }
               if(data.rpassword_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.rpassword_error + '</div>';
                  $(error_message).insertBefore($('#rpasswordRegisterForm'));
               }
               if(data.type_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.type_error + '</div>';
                  $(error_message).insertBefore($('#typeRegisterForm'));
               }
               if(data.name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.name_error + '</div>';
                  $(error_message).insertBefore($('#nameRegisterForm'));
               }
               if(data.street_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.street_error + '</div>';
                  $(error_message).insertBefore($('#streetRegisterForm'));
               }
               if(data.city_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.city_error + '</div>';
                  $(error_message).insertBefore($('#cityRegisterForm'));
               }
               if(data.state_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.state_error + '</div>';
                  $(error_message).insertBefore($('#stateRegisterForm'));
               }
               if(data.zip_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.zip_error + '</div>';
                  $(error_message).insertBefore($('#zipRegisterForm'));
               }
               if(data.phone_number_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.phone_number_error + '</div>';
                  $(error_message).insertBefore($('#phoneRegisterForm'));
               }
               if(data.open_from_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_from_error + '</div>';
                  $(error_message).insertBefore($('#openFromRegisterForm'));
               }
               if(data.open_to_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.open_to_error + '</div>';
                  $(error_message).insertBefore($('#openToRegisterForm'));
               }
            }
        }
    });
}
