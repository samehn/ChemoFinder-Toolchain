var url = window.location.origin;
$(document).ready(function(){
   $('#stockListTable').DataTable({
        "scrollX": true
    });
});

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
    var sra = $('#sra');
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
    item_array[sra.attr('name')] = sra.val();
    item_array[pack_size.attr('name')] = pack_size.val();
    item_array[price.attr('name')] = price.val();
    item_array[quantity.attr('name')] = quantity.val();
    item_array[avg.attr('name')] = avg.val();
    
    console.log(item_array);
     $.ajax({
        type: "post",
        url: url + '/pharmacy/addnewmedicine',
        data : item_array,
        success:  function(data){
            console.log(data);
            console.log(data.message);
            $('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "success")
            {
                var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> The medicine is added successfuly</div>';
                $(message).insertBefore($('#genericNameForm'));
                setTimeout(function(){ location.reload(); }, 1000);
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
               if(data.sra_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.sra_error + '</div>';
                  $(error_message).insertBefore($('#sraForm'));
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