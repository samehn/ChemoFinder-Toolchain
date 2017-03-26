var url = window.location.origin;

$(document).click(function() {
    $('.error-form').remove();
});

$("#change_password_btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function change_password(user_type) {
  var user_array={};
  var password = $('#password');
  var rpassword =$('#rpassword');
  user_array[password.attr('name')] = password.val();
  user_array[rpassword.attr('name')] = rpassword.val();
  $('#loadingModal').modal('show');
  console.log(user_array);
  $.ajax({
    type: "post",
    url: url + '/'+ user_type +'/first_changepassword',
    data : user_array,
    success:  function(data){
      console.log(data);
      console.log(data.message);
      $('.error-form').remove();
      $('.message-form').remove();
      $('#loadingModal').modal('hide');
      if(data.message == "failed")
      {
         if(data.password_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.password_error + '</div>';
            $(error_message).insertBefore($('#passwordForm'));
         }
         if(data.rpassword_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.rpassword_error + '</div>';
            $(error_message).insertBefore($('#rpasswordForm'));
         }
      }
      else if(data.message == "success")
      {
        $('#confimChangePassword').modal('show');
      }
    }
  });
}
