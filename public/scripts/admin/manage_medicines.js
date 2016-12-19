var url = window.location.origin;
$(document).ready(function(){
   $('#approvedMedicinesTable').DataTable({
        "scrollX": true
    });
   $('#nonApprovedMedicinesTable').DataTable({
        "scrollX": true
    });
});

$(document).click(function() {
  $('.error-form').remove();
});

$('#add-new-medicine-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    add_new_medicine();
    return false;
  }
});
// function lolo() {
//   $('#approvedMedicinesTable').DataTable().destroy();
  
//   $('#approvedMedicinesTable').DataTable({'bPaginate' : false});
//   console.log('bobo');
// }

function add_new_medicine() {
	var item_array={};
    
    var genericName = $('#genericName');
    var brandName = $('#brandName');
    var form = $('#form');
    var strength = $('#strength');
    var strengthUnit = $('#strengthUnit');
    var route = $('#route');
    var manufacturer = $('#manufacturer');
    var sra = $('#sra');
    var approval_date = $('#approvalDate');
    var source = $('#source');
    var extract_date = $('#extractDate');

    item_array[genericName.attr('name')] = genericName.val();
    item_array[brandName.attr('name')] = brandName.val();
    item_array[form.attr('name')] = form.val();
    item_array[strength.attr('name')] = strength.val();
    item_array[strengthUnit.attr('name')] = strengthUnit.val();
    item_array[route.attr('name')] = route.val();
    item_array[manufacturer.attr('name')] = manufacturer.val();
    item_array[sra.attr('name')] = sra.val();
    item_array[approval_date.attr('name')] = approval_date.val();
    item_array[source.attr('name')] = source.val();
    item_array[extract_date.attr('name')] = extract_date.val();
    $('#loadingModal').modal('show');
    console.log(item_array);
     $.ajax({
        type: "post",
        url: url + '/admin/addnewmedicine',
        data : item_array,
        success:  function(data){
            $('#loadingModal').modal('hide');
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "success")
            {
              $('#confimAddMedicine').modal('show');
            }
            else if(data.message == "failed")
            {
               if(data.generic_name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.generic_name_error + '</div>';
                  $(error_message).insertBefore($('#genericNameForm'));
               }
               if(data.brand_name_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.brand_name_error + '</div>';
                  $(error_message).insertBefore($('#brandNameForm'));
               }
               if(data.form_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.form_error + '</div>';
                  $(error_message).insertBefore($('#formForm'));
               }
               if(data.strength_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.strength_error + '</div>';
                  $(error_message).insertBefore($('#strengthForm'));
               }
               if(data.strength_unit_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.strength_unit_error + '</div>';
                  $(error_message).insertBefore($('#strengthUnitForm'));
               }
               if(data.route_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.route_error + '</div>';
                  $(error_message).insertBefore($('#routeForm'));
               }
               if(data.manufacturer_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.manufacturer_error + '</div>';
                  $(error_message).insertBefore($('#manufacturerForm'));
               }
               if(data.sra_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.sra_error + '</div>';
                  $(error_message).insertBefore($('#sraForm'));
               }
               if(data.approval_date_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.approval_date_error + '</div>';
                  $(error_message).insertBefore($('#approvalDateForm'));
               }
               if(data.source_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.source_error + '</div>';
                  $(error_message).insertBefore($('#sourceForm'));
               }
               if(data.extract_date_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.extract_date_error + '</div>';
                  $(error_message).insertBefore($('#extractDateForm'));
               }
            }
        }
    });
}