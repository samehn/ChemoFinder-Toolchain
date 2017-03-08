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

$('input[type="checkbox"][name="approve"]').change(function() {
     if(this.checked) {
        $('#sra').removeAttr("disabled");
     }
     else {
        $('#sra').val('');
        $('#sra').attr('disabled', 'disabled');
     }
 })

$('input[type="checkbox"][name="approve"]').change(function() {
     if(this.checked) {
        $('#sraUpdate').removeAttr("disabled");
     }
     else {
        $('#sraUpdate').val('');
        $('#sraUpdate').attr('disabled', 'disabled');
     }
 })

function getMedicine(medicine_id) {
  var item_array = {medicine_id: medicine_id};
  $.ajax({
    type: "get",
    url: url + '/admin/getmedicinebyid/' + medicine_id,
    data : item_array,
    success:  function(data){
      console.log(data);
      if(data.message == "success") {
        var forms = ['Ampule', 'Caps', 'Eye Drops', 'Syringe', 'Vial', 'Tablets', 'Film', 'Solution', 'Other'];
        var strength_units = ['Mcg', 'Mg', 'Gr', 'Mcg/ml', 'Mg/ml', 'Gr/ml', 'ml', 'IU', 'MU', '%', 'Other'];
        var form = data.medicine[0].FORM;
        if(forms.indexOf(form) < 0) {
          form = 'Other';
        }
        var strength_unit = data.medicine[0].STRENGTH_UNIT;
        if(strength_units.indexOf(strength_unit) < 0) {
          strength_unit = 'Other';
        }
        console.log(form);
        console.log(strength_unit);
        $('#genericNameUpdate').val(data.medicine[0].GENERIC_NAME);
        $('#brandNameUpdate').val(data.medicine[0].BRAND_NAME);
        $('#formUpdate').val(form);
        $('#strengthUpdate').val(data.medicine[0].STRENGTH);
        $('#strengthUnitUpdate').val(strength_unit);
        $('#routeUpdate').val(data.medicine[0].ROUTE);
        $('#manufacturerUpdate').val(data.medicine[0].MANUFACTURER);
        $('#sraUpdate').val(data.medicine[0].SRA);
        $('#approvalDateUpdate').val(data.medicine[0].APPROVAL_DATE);
        $('#sourceUpdate').val(data.medicine[0].SOURCE);
        $('#extractDateUpdate').val(data.medicine[0].EXTRACT_DATE);
        $('#specificationFormUpdate').val(data.medicine[0].SPECIFICATION_FORM);
        $('#packTypeUpdate').val(data.medicine[0].PACK_TYPE);
        $('#unitsPerPackUpdate').val(data.medicine[0].UNITS_PER_PACK);
        $('#statusUpdate').val(data.medicine[0].STATUS);
        $('#commentsUpdate').val(data.medicine[0].COMMENTS);
        if(data.medicine[0].APPROVED) {
          $("#approveUpdate").attr("checked", true);
          $('#sraUpdate').removeAttr("disabled");
        }
        else {
          $("#approveUpdate").attr("checked", false);
          $('#sraUpdate').attr('disabled', 'disabled'); 
        }
        $('#update-medicine-btn').attr('onclick','updateMedicine(' + medicine_id + ')');
        $('#updateMedicine').modal('show');
      }
      // var medicineInfo = data.result[0].GENERIC_NAME + " - " + data.result[0].FORM + " - " + data.result[0].STRENGTH + " - " + data.result[0].STRENGTH_UNIT + " - " + data.result[0].BRAND_NAME + " - " + data.result[0].MANUFACTURER;
      // $('#medicineInfo').html(medicineInfo);
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
      $('#specificationFormShow').html(data.medicine[0].SPECIFICATION_FORM);
      $('#packTypeShow').html(data.medicine[0].PACK_TYPE);
      $('#unitsPerPackShow').html(data.medicine[0].UNITS_PER_PACK);
      $('#statusShow').html(data.medicine[0].STATUS);
      $('#commentsShow').html(data.medicine[0].COMMENTS);
      $('#medicineDetails').modal('show');
    }
  });
}

function deleteApprovedStockRecord(medicine_id, element) {
  if (confirm("Are you sure you want to remove this medicine from the medicines list?") == true) {
        var data_array={};
    data_array['medicine_id'] = medicine_id;
    $('#loadingModal').modal('show');
    $.ajax({
          type: "post",
          url: url + '/admin/deleteapprovedmedicine',
          data : data_array,
          success:  function(data){
            $('#loadingModal').modal('hide');
            console.log(data);
            if(data.message == "success")
            {
              if(data.action == "delete") {
                
                $('#confimDeleteMedicine').modal('show');  
              }
              else if(data.action == "non_approved") {
                
                $('#confimDeleteNonApprovedMedicine').modal('show');
              }
              else if(data.action == "no_delete") {

                $('#confimNoDeleteMedicine').modal('show');
              }
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

function deleteNonApprovedStockRecord(medicine_id, element) {
  if (confirm("Are you sure you want to remove this medicine from the medicines list?") == true) {
        var data_array={};
    data_array['medicine_id'] = medicine_id;
    $('#loadingModal').modal('show');
    $.ajax({
          type: "post",
          url: url + '/admin/deletenonapprovedmedicine',
          data : data_array,
          success:  function(data){
            $('#loadingModal').modal('hide');
            console.log(data);
            if(data.message == "success")
            {
              if(data.action == "delete") {
                
                $('#confimDeleteMedicine').modal('show');  
              } 
              else if(data.action == "non_approved") {
                
                $('#confimDeleteNonApprovedMedicine').modal('show');
              }
              else if(data.action == "no_delete") {
                
                $('#confimNoDeleteMedicine').modal('show');
              }
              // $(element).parent().parent().remove();
              // var message = '<div class="alert alert-success info-form"><button class="close" data-close="alert"></button>The medicine is deleted successfuly from the medicine list</div>';
              // $(message).insertAfter($('.page__subtitle'));
            }
            else {
              var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.medicine_error + ' </div>';
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

  var specification_form = $('#specificationFormUpdate');
  var pack_type = $('#packTypeUpdate');
  var units_per_pack = $('#unitsPerPackUpdate');
  var approve = $('#approveUpdate');
  var status = $('#statusUpdate');
  var comments = $('#commentsUpdate');

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
  item_array[specification_form.attr('name')] = specification_form.val();
  item_array[pack_type.attr('name')] = pack_type.val();
  item_array[units_per_pack.attr('name')] = units_per_pack.val();
  item_array[status.attr('name')] = status.val();
  item_array[comments.attr('name')] = comments.val();

  if (approve.is(":checked"))
  {
    item_array[approve.attr('name')] = true;
  }
  else {
    item_array[approve.attr('name')] = false; 
  }

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
             if(data.specification_form_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.specification_form_error + '</div>';
                $(error_message).insertBefore($('#specificationFormFormUpdate'));
             }
             if(data.pack_type_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.pack_type_error + '</div>';
                $(error_message).insertBefore($('#packTypeFormUpdate'));
             }
             if(data.units_per_pack_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.units_per_pack_error + '</div>';
                $(error_message).insertBefore($('#unitsPerPackFormUpdate'));
             }
             if(data.status_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.status_error + '</div>';
                $(error_message).insertBefore($('#statusFormUpdate'));
             }
             if(data.comments_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.comments_error + '</div>';
                $(error_message).insertBefore($('#commentsFormUpdate'));
             }
             if(data.approve_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.approve_error + '</div>';
                $(error_message).insertBefore($('#sraFormUpdate'));
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

  var specification_form = $('#specificationForm');
  var pack_type = $('#packType');
  var units_per_pack = $('#unitsPerPack');
  var approve = $('#approve');
  var status = $('#status');
  var comments = $('#comments');

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

  item_array[specification_form.attr('name')] = specification_form.val();
  item_array[pack_type.attr('name')] = pack_type.val();
  item_array[units_per_pack.attr('name')] = units_per_pack.val();
  item_array[status.attr('name')] = status.val();
  item_array[comments.attr('name')] = comments.val();

  if (approve.is(":checked"))
  {
    item_array[approve.attr('name')] = true;
  }
  else {
    item_array[approve.attr('name')] = false; 
  }
  
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

             if(data.specification_form_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.specification_form_error + '</div>';
                $(error_message).insertBefore($('#specificationFormForm'));
             }
             if(data.pack_type_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.pack_type_error + '</div>';
                $(error_message).insertBefore($('#packTypeForm'));
             }
             if(data.units_per_pack_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.units_per_pack_error + '</div>';
                $(error_message).insertBefore($('#unitsPerPackForm'));
             }
             if(data.status_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.status_error + '</div>';
                $(error_message).insertBefore($('#statusForm'));
             }
             if(data.comments_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.comments_error + '</div>';
                $(error_message).insertBefore($('#commentsForm'));
             }
             if(data.approve_error)
             {
                var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.approve_error + '</div>';
                $(error_message).insertBefore($('#sraForm'));
             }
          }
      }
  });
}
