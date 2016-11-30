var url = window.location.origin;

$('#timepicker1').timepicker();

$('#timepicker2').timepicker();

$("#type").change(function() {
    $('.error-form').remove();
    $('.message-form').remove();
    if ($("#type option:selected").text() == "Pharmacy") {
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
    var url2 = '';
    if(type.val() == "pharmacy")
    {
        url2 = '/pharmacy/login';
    }
    else if(type.val() == "doctor")
    {
        url2 = '/doctor/login';
    }
     $.ajax({
        type: "post",
        url: url + url2,
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
                if( url2 == '/pharmacy/login')
                {
                    window.location = url + '/pharmacy';
                }
                else if( url2 == '/doctor/login')
                {
                    window.location = url + '/doctor';
                }
            }
        }
    });
}

function register() {
    var type = $('#type');
    var user_array={};
    
    var name = $('#name');
    var email = $('#email');
    var password = $('#password');
    var rpassword = $('#rpassword');
    

    user_array[name.attr('name')] = name.val();
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    user_array[rpassword.attr('name')] = rpassword.val();
    
    var url2 = '';
    if(type.val() == "pharmacy")
    {
        url2 = '/pharmacy/signup';
        var address = $('#address');
        var phone = $('#phone');
        var open_from = $('#timepicker1');
        var open_to = $('#timepicker2');
        user_array[address.attr('name')] = address.val();
        user_array[phone.attr('name')] = phone.val();
        user_array[open_from.attr('name')] = open_from.val();
        user_array[open_to.attr('name')] = open_to.val();
    }
    else if(type.val() == "doctor")
    {
        url2 = '/doctor/signup';
    }
     $.ajax({
        type: "post",
        url: url + url2,
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
               if(data.name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.name_error + '</div>';
                  $(error_message).insertBefore($('#nameRegisterForm'));
               }
               if(data.address_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.address_error + '</div>';
                  $(error_message).insertBefore($('#addressRegisterForm'));
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