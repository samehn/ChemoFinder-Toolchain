var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});

function confirm()
{
  var data = {};
  var data1 = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
      	if(pair[0] == 't') {
      		data['treatment_center'] = pair[1];
          data1['treatment_center'] = pair[1];
      	}
        if(pair[0] == 'pid'){
          data['pid'] = pair[1];
          data1['pid'] = pair[1];
        }
    }
    console.log(data);
    $.ajax({
        type: "post",
        url: url +'/doctor/shoppinglist/confirmShoppingList',
        data : data,
        success:  function(data){
          console.log(data);
          console.log(data.message);
          window.location.href = url + '/doctor/shoppinglist?t='+ data1['treatment_center'] + '&pid=' + data1['pid'] + '&conf=true';
        }
    });
}
function printPage() {
	window.print();
	return true;
}

$('#sendEmail').on('hidden.bs.modal', function () {
    $( ".modal-backdrop" ).remove();
})

function sendEmail() {
	var data = {};
	var email = $('#email');
	data[email.attr('name')] = email.val();
	var query = window.location.search.substring(1);
	var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
    	var pair = vars[i].split("=");
      	if(pair[0] == 't') {
      		data['treatment_center'] = pair[1];
      	}
    }
    $('#sendEmail').modal('hide');
	$('#loadingModal').modal('show');
	console.log(data);
    $.ajax({
        type: "post",
        url: url +'/doctor/shoppinglist/sendemail',
        data : data,
        success:  function(data){
          $('#loadingModal').modal('hide');
          $('#sendEmail').modal('show');
          console.log(data);
          console.log(data.message);
          $('.error-form').remove();
          $('.message-form').remove();
          if(data.message == "failed")
          {

	        if(data.email_error)
	        {
	            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
	        }
	        else {
	         	var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button> Failed to send email</div>';
	        }
	        $(error_message).insertBefore($('#email-box'));
          }
          else
          {
          	$('#sendEmail').modal('hide');
          	email.val('');
            $('#confirmEmail').modal('show');
          }
        }
    });
}

function sendAnotherEmail() {
	$('#confirmEmail').modal('hide');
	$('#sendEmail').modal('show');
}

function backHome() {
	$('#confirmEmail').modal('hide');
}
