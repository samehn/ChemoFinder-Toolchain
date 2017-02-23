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

$('#register-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    register();
    return false;
  }
});

$('#tags').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    search();
    return false;
  }
});

$('#login-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    login();
    return false;
  }
});

$(document).click(function() {
    $('.error-form').remove();
});

$("#signup-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$("#search-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$("#login-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$("#Register").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

$("#Login").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

$( function() {
  $('#loadingModal').modal('show');
  $.ajax({
      type: "get",
      url: url + '/getapprovedmedicines',
      success:  function(data){
        // console.log(data);
        $('#loadingModal').modal('hide');
        var availableTags = [];
        //console.log(data.medicines[0].GENERIC_NAME);
        for (i = 0; i < data.medicines.length; i++) 
        {
            var tag = data.medicines[i].GENERIC_NAME + " " + data.medicines[i].FORM;
            // console.log(tag);
            availableTags.push(tag);
        }
        $( "#tags" ).autocomplete({
            source: availableTags
        });
        // console.log(data.random);
        // element.parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].value = data.random;
      }
  });
} );

function loginModal() {
   $('#Login').modal('show');
}

function registerModal() {
   $('#Register').modal('show');
}

function login() {
    
    var type = $('#login-type');
    var user_array={};
    var email = $('#uEmail');
    var password = $('#uPassword');
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    $('#loadingModal').modal('show');
     $.ajax({
        type: "post",
        url: url +'/user/login',
        data : user_array,
        success:  function(data){
          $('#loadingModal').modal('hide');    
          // console.log(data);
          // console.log(data.message);
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
    // console.log(user_array);
    $('#loadingModal').modal('show');
    $.ajax({
      type: "post",
      url: url + '/user/signup',
      data : user_array,
      success:  function(data){        
        $('#loadingModal').modal('hide');
        // console.log(data);
        // console.log(data.message);
        $('.error-form').remove();
        $('.message-form').remove();
        if(data.message == "success")
        {
            $('#Register').modal('hide');
            $('#confimSignup').modal('show');
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

function search() {
  $('#search-result-table').addClass('hidden');
  $('#search-result').html();
  $('.error-form').remove();
  var searchData = $('#tags').val();
  var splitedData = searchData.split(' ');
  if(splitedData.length == 2) {
    var data = {};
    data['generic_name'] = splitedData[0];
    data['form'] = splitedData[1];
    // console.log(data);
    $.ajax({
      type: "post",
      url: url + '/getmedicinebygenericandform',
      data : data,
      success:  function(result){  
        console.log(result);
        if(result.message == "success") {
          if(result.medicines.length > 0) {
            $('#search-result-table').removeClass('hidden');
            var html = '';
            for (var i = 0; i < result.medicines.length; i++) {
              var html = html + '<tr class="tr_search_row table-result-search">' +
                '<td class="td_search">' + result.medicines[i].GENERIC_NAME + '</td>' +
                '<td class="td_search">' + result.medicines[i].BRAND_NAME + '</td>' +
                '<td class="td_search">' + result.medicines[i].FORM + '</td>' +
                '<td class="td_search">' + result.medicines[i].STRENGTH + '</td>' +
                '<td class="td_search">' + result.medicines[i].STRENGTH_UNIT + '</td>' +
                '<td class="td_search">' + result.medicines[i].STRENGTH +' ' + result.medicines[i].STRENGTH_UNIT + '</td>' +
                '<td class="td_search">' + result.medicines[i].MANUFACTURER + '</td>' +
                '<td class="td_search"><button class="btn btn-primary" onclick="showPharmacies(' + result.medicines[i].ID + ')">' + lang.show_pharmacies + '</button></td>' +
              '</tr>';
            }
            $('#search-result').html(html); 
          }
          else {
            var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This medicine is not available in any pharmacy currently</div>';
            $(message).insertBefore($('#section-search'));
          }
        }
        else {
          var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This is not a valid medicine</div>';
          $(message).insertBefore($('#section-search'));            
        }
      }
    });
  }
  else{
    var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This is not a valid medicine</div>';
    $(message).insertBefore($('#section-search'));
    console.log('failed');
  }

}

function showPharmacies(id) {
  $('#pharmacies-result').html();
  $('.error-form').remove();
  var data = {};
  $('#loadingModal').modal('show');
  $.ajax({
    type: "post",
    url: url + '/getavailablepharmaciesbyid',
    data : {id: id},
    success:  function(data){
      console.log(data);        
      $('#loadingModal').modal('hide');
      $('#showPharmacies').modal('show');
      if(data.message == "success") {
          if(data.pharmacies.length > 0) {
            var html = '';
            for (var i = 0; i < data.pharmacies.length; i++) {
              var html = html + '<tr class="tr_search_row table-result-search">' +
                '<td class="td_search">' + data.pharmacies[i].NAME + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].PHONE_NUMBER + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].EMAIL + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].STREET + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].CITY + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].STATE + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].ZIP + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].OPEN_FROM + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].OPEN_TO + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].PRICE_PER_PACK + '</td>' +
                '<td class="td_search">' + data.pharmacies[i].LAST_UPDATE + '</td>' +
              '</tr>';
            }
            $('#pharmacies-result').html(html); 
          }
          else {
            var html = '<td style="text-align: center;" valign="top" colspan="11" class="empty_table td_search">No available pharmacies currently</td>';
            $('#pharmacies-result').html(html); 
          }
        }
        else {
          var html = '<td style="text-align: center;" valign="top" colspan="11" class="empty_table td_search">No available pharmacies currently</td>';
          $('#pharmacies-result').html(html);             
        }
    }
  });
}