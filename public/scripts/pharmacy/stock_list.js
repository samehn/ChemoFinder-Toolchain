var url = window.location.origin;
$(document).ready(function(){
   $('#stockListTable').DataTable({
        "scrollX": true
    });
});

$(document).click(function() {
  $('.error-form').remove();
  $('.info-form').remove();
});

$('#add-new-medicine-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    add_new_medicine();
    return false;
  }
});

$('#add-new-approved-medicine-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    add_new_approved_medicine();
    return false;
  }
});

$("#addNewMedicine").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

$("#addNewApprovedMedicine").on("show.bs.modal", function () {
  $("html").addClass("modal-open");
}).on("hidden.bs.modal", function () {
  $("html").removeClass("modal-open");
});

function getStockRecord(stock_id) {
  var item_array = {stock_id: stock_id};
  $.ajax({
    type: "post",
    url: url + '/pharmacy/getstockrecord',
    data : item_array,
    success:  function(data){
      console.log(data);
      var medicineInfo = data.result[0].GENERIC_NAME + " - " + data.result[0].FORM + " - " + data.result[0].STRENGTH + " - " + data.result[0].STRENGTH_UNIT + " - " + data.result[0].BRAND_NAME + " - " + data.result[0].MANUFACTURER;
      $('#medicineInfo').html(medicineInfo);
      $('#batchNumberUpdate').val(data.result[0].BATCH_NUMBER);
      $('#expiryDateUpdate').val(data.result[0].EXPIRY_DATE);
      $('#packSizeUpdate').val(data.result[0].PACK_SIZE);
      $('#priceUpdate').val(data.result[0].PRICE_PER_PACK);
      $('#quantityUpdate').val(data.result[0].AVAILABLE_STOCK);
      $('#avgMonthlyConsumptionUpdate').val(data.result[0].AVG_MONTHLY_CONSUMPTION);
      $('#update-stock-btn').attr('onclick','updateStockRecord(' + stock_id + ')');
      $('#updateMedicine').modal('show');
    }
  });
}

function showStockRecord(stock_id) {
  var item_array = {stock_id: stock_id};
  $.ajax({
    type: "post",
    url: url + '/pharmacy/getstockrecord',
    data : item_array,
    success:  function(data){
      console.log(data);
      $('#genericNameShow').html(data.result[0].GENERIC_NAME);
      $('#brandNameShow').html(data.result[0].BRAND_NAME);
      $('#formShow').html(data.result[0].FORM);
      $('#strengthShow').html(data.result[0].STRENGTH);
      $('#strengthUnitShow').html(data.result[0].STRENGTH_UNIT);
      $('#manufacturerShow').html(data.result[0].MANUFACTURER);
      $('#batchNumberShow').html(data.result[0].BATCH_NUMBER);
      $('#expiryDateShow').html(data.result[0].EXPIRY_DATE);
      $('#sraShow').html(data.result[0].SRA);
      $('#packSizeShow').html(data.result[0].PACK_SIZE);
      $('#priceShow').html(data.result[0].PRICE_PER_PACK);
      $('#quantityShow').html(data.result[0].AVAILABLE_STOCK);
      $('#avgMonthlyConsumptionShow').html(data.result[0].AVG_MONTHLY_CONSUMPTION);
      $('#specificationFormShow').html(data.result[0].SPECIFICATION_FORM);
      $('#packTypeShow').html(data.result[0].PACK_TYPE);
      $('#unitsPerPackShow').html(data.result[0].UNITS_PER_PACK);
      if(data.result[0].APPROVED) {
        $('#approveShow').html('Approved');
      }
      else {
        $('#approveShow').html('Not Approved'); 
      }
      $('#updateDateShow').html(data.result[0].LAST_UPDATE);
      $('#medicineDetails').modal('show');
    }
  });
}

function updateStockRecord(stock_id) {
  var item_array={};
    
  var batch = $('#batchNumberUpdate');
  var expiry_date = $('#expiryDateUpdate');
  var pack_size = $('#packSizeUpdate');
  var price = $('#priceUpdate');
  var quantity = $('#quantityUpdate');
  var avg = $('#avgMonthlyConsumptionUpdate');
  item_array['stock_id'] = stock_id;
  item_array[batch.attr('name')] = batch.val();
  item_array[expiry_date.attr('name')] = expiry_date.val();
  item_array[pack_size.attr('name')] = pack_size.val();
  item_array[price.attr('name')] = price.val();
  item_array[quantity.attr('name')] = quantity.val();
  item_array[avg.attr('name')] = avg.val();
  $('#loadingModal').modal('show');
  console.log(item_array);
  $.ajax({
    type: "post",
    url: url + '/pharmacy/updatemedicine',
    data : item_array,
    success:  function(data) {
      $('#loadingModal').modal('hide');
      $("body").addClass("modal-open");
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
        if(data.batch_number_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.batch_number_error + '</div>';
          $(error_message).insertBefore($('#batchNumberUpdateForm'));
        }
        if(data.expiry_date_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.expiry_date_error + '</div>';
          $(error_message).insertBefore($('#expiryDateUpdateForm'));
        }
        if(data.pack_size_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.pack_size_error + '</div>';
          $(error_message).insertBefore($('#packSizeUpdateForm'));
        }
        if(data.price_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.price_error + '</div>';
          $(error_message).insertBefore($('#priceUpdateForm'));
        }
        if(data.quantity_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.quantity_error + '</div>';
          $(error_message).insertBefore($('#quantityUpdateForm'));
        }
        if(data.avg_monthly_consumption_error)
        {
          var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.avg_monthly_consumption_error + '</div>';
          $(error_message).insertBefore($('#avgMonthlyConsumptionUpdateForm'));
        }
      }
    }
  });
}

function deleteStockRecord(stock_id, element) {
  if (confirm("Are you sure you want to remove this medicine from your stock ?") == true) {
        var data_array={};
    data_array['stock_id'] = stock_id;
    $.ajax({
          type: "post",
          url: url + '/pharmacy/deletemedicine',
          data : data_array,
          success:  function(data){
            console.log(data);
            if(data.message == "success")
            {
              $(element).parent().parent().remove();
              var message = '<div class="alert alert-success info-form"><button class="close" data-close="alert"></button>The medicine is deleted successfuly from your stock </div>';
              $(message).insertAfter($('.page__subtitle'));
            }
            else {
              var message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This is not a valid medicine </div>';
              $(message).insertAfter($('.page__subtitle'));
            }
          }
    }); 
  }
}

function add_new_medicine() {
	var item_array={};
    
  var genericName = $('#genericName');
  var form = $('#form');
  var strength = $('#strength');
  var strengthUnit = $('#strengthUnit');
  var brandName = $('#brandName');
  var manufacturer = $('#manufacturer');
  var batch = $('#batchNumber');
  var expiry_date = $('#expiryDate');
  var pack_size = $('#packSize');
  var price = $('#price');
  var quantity = $('#quantity');
  var avg = $('#avgMonthlyConsumption');

  item_array[genericName.attr('name')] = genericName.val();
  item_array[form.attr('name')] = form.val(); 
  item_array[strength.attr('name')] = strength.val();
  item_array[strengthUnit.attr('name')] = strengthUnit.val();
  item_array[brandName.attr('name')] = brandName.val();  
  item_array[manufacturer.attr('name')] = manufacturer.val();
  item_array[batch.attr('name')] = batch.val();
  item_array[expiry_date.attr('name')] = expiry_date.val();
  item_array[pack_size.attr('name')] = pack_size.val();
  item_array[price.attr('name')] = price.val();
  item_array[quantity.attr('name')] = quantity.val();
  item_array[avg.attr('name')] = avg.val();
  $('#loadingModal').modal('show');
  console.log(item_array);
  $.ajax({
    type: "post",
    url: url + '/pharmacy/addnewmedicine',
    data : item_array,
    success:  function(data){
      $('#loadingModal').modal('hide');
      $("body").addClass("modal-open");
      console.log(data);
      console.log(data.message);
      $('.error-form').remove();
      $('.message-form').remove();
      if(data.message == "success")
      {
          $('#confimAddNewMedicine').modal('show');
      }
      else if(data.message == "failed")
      {
         if(data.generic_name_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.generic_name_error + '</div>';
            $(error_message).insertBefore($('#genericNameForm'));
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
         if(data.brand_name_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.brand_name_error + '</div>';
            $(error_message).insertBefore($('#brandNameForm'));
         }
         if(data.manufacturer_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.manufacturer_error + '</div>';
            $(error_message).insertBefore($('#manufacturerForm'));
         }
         if(data.batch_number_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.batch_number_error + '</div>';
            $(error_message).insertBefore($('#batchNumberForm'));
         }
         if(data.expiry_date_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.expiry_date_error + '</div>';
            $(error_message).insertBefore($('#expiryDateForm'));
         }
         if(data.pack_size_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.pack_size_error + '</div>';
            $(error_message).insertBefore($('#packSizeForm'));
         }
         if(data.price_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.price_error + '</div>';
            $(error_message).insertBefore($('#priceForm'));
         }
         if(data.quantity_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.quantity_error + '</div>';
            $(error_message).insertBefore($('#quantityForm'));
         }
         if(data.avg_monthly_consumption_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.avg_monthly_consumption_error + '</div>';
            $(error_message).insertBefore($('#avgMonthlyConsumptionForm'));
         }
      }
    }
  });
}

function add_new_approved_medicine() {
  var item_array={};
    
  var medicine_id = $('#medicineApproved');
  var batch = $('#batchNumberApproved');
  var expiry_date = $('#expiryDateApproved');
  var pack_size = $('#packSizeApproved');
  var price = $('#priceApproved');
  var quantity = $('#quantityApproved');
  var avg = $('#avgMonthlyConsumptionApproved');

    
  item_array[medicine_id.attr('name')] = medicine_id.val();
  item_array[batch.attr('name')] = batch.val();
  item_array[expiry_date.attr('name')] = expiry_date.val();
  item_array[pack_size.attr('name')] = pack_size.val();
  item_array[price.attr('name')] = price.val();
  item_array[quantity.attr('name')] = quantity.val();
  item_array[avg.attr('name')] = avg.val();
  $('#loadingModal').modal('show');
  console.log(item_array);
  $.ajax({
    type: "post",
    url: url + '/pharmacy/addnewapprovedmedicine',
    data : item_array,
    success:  function(data){
      $('#loadingModal').modal('hide');
      
      console.log(data);
      console.log(data.message);
      $('.error-form').remove();
      $('.message-form').remove();
      if(data.message == "success")
      {
        $('#confimAddNewMedicine').modal('show');
      }
      else if(data.message == "failed")
      {
         if(data.medicine_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.medicine_error + '</div>';
            $(error_message).insertBefore($('#medicineFormApproved'));
         }
         if(data.batch_number_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.batch_number_error + '</div>';
            $(error_message).insertBefore($('#batchNumberFormApproved'));
         }
         if(data.expiry_date_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.expiry_date_error + '</div>';
            $(error_message).insertBefore($('#expiryDateFormApproved'));
         }
         if(data.pack_size_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.pack_size_error + '</div>';
            $(error_message).insertBefore($('#packSizeFormApproved'));
         }
         if(data.price_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.price_error + '</div>';
            $(error_message).insertBefore($('#priceFormApproved'));
         }
         if(data.quantity_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.quantity_error + '</div>';
            $(error_message).insertBefore($('#quantityFormApproved'));
         }
         if(data.avg_monthly_consumption_error)
         {
            var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.avg_monthly_consumption_error + '</div>';
            $(error_message).insertBefore($('#avgMonthlyConsumptionFormApproved'));
         }
      }
    }
  });
}