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
  $('.message-form').remove();
});

$('#add-new-medicine-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    add_new_medicine();
    return false;
  }
});

$("#addNewMedicine").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

$("#updateMedicine").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

function getMedicine(medicine_id) {
  var item_array = {medicine_id: medicine_id};
  $.ajax({
    type: "get",
    url: url + '/admin/getmedicinebyid/' + medicine_id,
    data : item_array,
    success:  function(data){
      console.log(data);
      // var medicineInfo = data.result[0].GENERIC_NAME + " - " + data.result[0].FORM + " - " + data.result[0].STRENGTH + " - " + data.result[0].STRENGTH_UNIT + " - " + data.result[0].BRAND_NAME + " - " + data.result[0].MANUFACTURER;
      // $('#medicineInfo').html(medicineInfo);
      $('#genericNameUpdate').val(data.medicine[0].GENERIC_NAME);
      $('#brandNameUpdate').val(data.medicine[0].BRAND_NAME);
      $('#formUpdate').val(data.medicine[0].FORM);
      $('#strengthUpdate').val(data.medicine[0].STRENGTH);
      $('#strengthUnitUpdate').val(data.medicine[0].STRENGTH_UNIT);
      $('#routeUpdate').val(data.medicine[0].ROUTE);
      $('#manufacturerUpdate').val(data.medicine[0].MANUFACTURER);
      $('#sraUpdate').val(data.medicine[0].SRA);
      $('#approvalDateUpdate').val(data.medicine[0].APPROVAL_DATE);
      $('#sourceUpdate').val(data.medicine[0].SOURCE);
      $('#extractDateUpdate').val(data.medicine[0].EXTRACT_DATE);
      $('#update-medicine-btn').attr('onclick','updateMedicine(' + medicine_id + ')');
      $('#updateMedicine').modal('show');
    }
  });
}

function showDetails(medicine_id) {
  var item_array = {medicine_id: medicine_id};
  $.ajax({
    type: "get",
    url: url + '/admin/getmedicinebyid/' + medicine_id,
    data : item_array,
    success:  function(data){
      console.log(data);
      // var medicineInfo = data.result[0].GENERIC_NAME + " - " + data.result[0].FORM + " - " + data.result[0].STRENGTH + " - " + data.result[0].STRENGTH_UNIT + " - " + data.result[0].BRAND_NAME + " - " + data.result[0].MANUFACTURER;
      // $('#medicineInfo').html(medicineInfo);
      $('#genericNameShow').html(data.medicine[0].GENERIC_NAME);
      $('#brandNameShow').html(data.medicine[0].BRAND_NAME);
      $('#formShow').html(data.medicine[0].FORM);
      $('#strengthShow').html(data.medicine[0].STRENGTH);
      $('#strengthUnitShow').html(data.medicine[0].STRENGTH_UNIT);
      $('#routeShow').html(data.medicine[0].ROUTE);
      $('#manufacturerShow').html(data.medicine[0].MANUFACTURER);
      $('#sraShow').html(data.medicine[0].SRA);
      $('#approvalDateShow').html(data.medicine[0].APPROVAL_DATE);
      $('#sourceShow').html(data.medicine[0].SOURCE);
      $('#extractDateShow').html(data.medicine[0].EXTRACT_DATE);
      $('#medicineDetails').modal('show');
    }
  });
}

function deleteStockRecord(medicine_id, element) {
  if (confirm("Are you sure you want to remove this medicine from the medicines list?") == true) {
        var data_array={};
    data_array['medicine_id'] = medicine_id;
    $('#loadingModal').modal('show');
    $.ajax({
          type: "post",
          url: url + '/admin/deletemedicine',
          data : data_array,
          success:  function(data){
            $('#loadingModal').modal('hide');
            console.log(data);
            if(data.message == "success")
            {
              $('#confimDeleteMedicine').modal('show');
              // $(element).parent().parent().remove();
              // var message = '<div class="alert alert-success info-form"><button class="close" data-close="alert"></button>The medicine is deleted successfuly from the medicine list</div>';
              // $(message).insertAfter($('.page__subtitle'));
            }
            else {
              var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This is not a valid medicine </div>';
              $(message).insertAfter($('.page__subtitle'));
            }
          }
    }); 
  }
}

function updateMedicine(medicine_id) {
  var item_array={};
  var genericName = $('#genericNameUpdate');
  var brandName = $('#brandNameUpdate');
  var form = $('#formUpdate');
  var strength = $('#strengthUpdate');
  var strengthUnit = $('#strengthUnitUpdate');
  var route = $('#routeUpdate');
  var manufacturer = $('#manufacturerUpdate');
  var sra = $('#sraUpdate');
  var approval_date = $('#approvalDateUpdate');
  var source = $('#sourceUpdate');
  var extract_date = $('#extractDateUpdate');

  item_array['medicine_id'] = medicine_id;
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
      url: url + '/admin/updatemedicine',
      data : item_array,
      success:  function(data){
          $('#loadingModal').modal('hide');
          console.log(data);
          console.log(data.message);
          $('.error-form').remove();
          $('.message-form').remove();
          if(data.message == "success")
          {
            $('#confimUpdateMedicine').modal('show');
          }
          else if(data.message == "failed")
          {
             if(data.generic_name_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.generic_name_error + '</div>';
                $(error_message).insertBefore($('#genericNameFormUpdate'));
             }
             if(data.brand_name_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.brand_name_error + '</div>';
                $(error_message).insertBefore($('#brandNameFormUpdate'));
             }
             if(data.form_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.form_error + '</div>';
                $(error_message).insertBefore($('#formFormUpdate'));
             }
             if(data.strength_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.strength_error + '</div>';
                $(error_message).insertBefore($('#strengthFormUpdate'));
             }
             if(data.strength_unit_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.strength_unit_error + '</div>';
                $(error_message).insertBefore($('#strengthUnitFormUpdate'));
             }
             if(data.route_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.route_error + '</div>';
                $(error_message).insertBefore($('#routeFormUpdate'));
             }
             if(data.manufacturer_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.manufacturer_error + '</div>';
                $(error_message).insertBefore($('#manufacturerFormUpdate'));
             }
             if(data.sra_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.sra_error + '</div>';
                $(error_message).insertBefore($('#sraFormUpdate'));
             }
             if(data.approval_date_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.approval_date_error + '</div>';
                $(error_message).insertBefore($('#approvalDateFormUpdate'));
             }
             if(data.source_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.source_error + '</div>';
                $(error_message).insertBefore($('#sourceFormUpdate'));
             }
             if(data.extract_date_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.extract_date_error + '</div>';
                $(error_message).insertBefore($('#extractDateFormUpdate'));
             }
          }
      }
  });
}

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
