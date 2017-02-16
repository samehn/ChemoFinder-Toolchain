var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});

$(".button-search").click(function(e) {
    e.stopPropagation();
    return false;
});

$("#next-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

$( function() {
    $('#myTable').DataTable({
        "scrollX": true,
        "fnPreDrawCallback": function( oSettings ) {
            $('.qty-20').empty();
            for (var i = 1; i <= 20; i++) {
                $('.qty-20').append('<option value="'+i+'">'+i+'</option>')
            }
        }
    });
    $.ajax({
        type: "get",
        url: url + '/doctor/getapprovedmedicines',
        success:  function(data){
            console.log(data);
            var availableTags = [];
            //console.log(data.medicines[0].GENERIC_NAME);
            for (i = 0; i < data.medicines.length; i++) 
            {
                var tag = data.medicines[i].GENERIC_NAME + " - " + data.medicines[i].BRAND_NAME + " - " + data.medicines[i].FORM + " - " + data.medicines[i].STRENGTH + " - " + data.medicines[i].STRENGTH_UNIT + " - " + data.medicines[i].MANUFACTURER;
                console.log(tag);
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

function addSearch() 
{
    var quantity = $('#quantity-search').val();
    var tags = $( "#tags" ).val();
    var tagsArray = tags.split(" - ");
    if(tagsArray.length == 6)
    {
        var generic_name = tagsArray[0];
        var brand_name = tagsArray[1];
        var form = tagsArray[2];
        var strength = tagsArray[3];
        var strength_unit = tagsArray[4];
        var manufacturer = tagsArray[5];
        var data = {generic_name: generic_name, brand_name: brand_name, form: form, strength: strength, strength_unit: strength_unit, manufacturer: manufacturer};
        $.ajax({
            type: "post",
            url: url + '/getmedicineid',
            data: data,
            success: function(data) {
                if(data.message == "success")
                {
                    $('#empty_search').remove();   
                    var id = data.medicine_id;
                    $('.search-bar').val("");
                    $('#quantity-search').val('1');
                    addMedicine(id, quantity);
                }
                else
                {
                    $('<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>Invalid Medicine</div>').insertBefore('#section-search');               
                }
            }
        });
    }
    else
    {
        $('<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>Invalid Medicine</div>').insertBefore('#section-search');
    }
}

function addTable(element, id) {
    var quantity = element.parentNode.parentNode.firstChild.firstChild.value;
    addMedicine(id, quantity);
}

function addMedicine(id, quantity) {
    $.ajax({
        type: "get",
        url: url + '/getmedicinebyid/'+id,
        success:  function(data){
            console.log(data);
            $('#empty_search').remove();
            var medicine = data.medicine[0];
            var generic_name = medicine.GENERIC_NAME;
            var brand_name = medicine.BRAND_NAME;
            var form = medicine.FORM;
            var strength = medicine.STRENGTH;
            var strength_unit = medicine.STRENGTH_UNIT;
            var manufacturer = medicine.MANUFACTURER;
            if ( $( "#table-search-" + id ).length ) {
                var newQuantity = parseInt($( "#table-search-" + id +" :first").text()) + parseInt(quantity);
                console.log(newQuantity);
                console.log($( "#table-search-" + id +" :first"));
                $( "#table-search-" + id +" :first").html();
                $( "#table-search-" + id +" :first").text(newQuantity);
                $( "#table-search-" + id).attr('data-quantity', newQuantity);
            }
            else
            {       
                $('#itemsToSearch').append('<tr id="table-search-' + id + '" data-id="' + id + '" data-quantity="' + quantity + '" class="tr_search table-result-search"><td class="td_search">' + quantity + '</td><td class="td_search">' + generic_name + '</td><td class="td_search">' + brand_name + '</td><td class="td_search">' + form + '</td><td class="td_search">' + strength + '</td><td class="td_search">' + strength_unit + '</td><td class="td_search">' + manufacturer + '</td><td class="td_search"><button onclick="removeMedicine(this)" class="form-control btn btn-primary">Remove</button></td></tr>'); 
            }
        }
    });
}

function removeMedicine(element) {
    console.log(element);
    element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
    if($('.table-result-search').length == 0){
        $('#itemsToSearch').append('<td id="empty_search" style="text-align: center;" valign="top" colspan="8" class="td_search">No medicines are added yet</td>');
    }
}

// function searchForResults() {
//     if($('.table-result-search').length > 0)
//     {
//         var ids = '?ids=';
//         var quantities = '&qs=';
//         $('.table-result-search').each(function(i, obj) {
//             console.log(obj.getAttribute('data-id'));
//             console.log(obj.getAttribute('data-quantity'));
//             ids = ids + obj.getAttribute('data-id');
//             quantities = quantities + obj.getAttribute('data-quantity');
//             if($('.table-result-search').length - 1 != i)
//             {
//                 ids = ids + '-';
//                 quantities = quantities + '-';
//             }
//         });
//         var query = ids + quantities;
//         console.log( url + "/doctor/getsearchresults" + query);
//         window.location.href = url + "/doctor/getsearchresults" + query;
//     }
// }

function nextStep() {
    
    if($('.table-result-search').length > 0)
    {
        var ids = '?ids=';
        var quantities = '&qs=';
        $('.table-result-search').each(function(i, obj) {
            console.log(obj.getAttribute('data-id'));
            console.log(obj.getAttribute('data-quantity'));
            ids = ids + obj.getAttribute('data-id');
            quantities = quantities + obj.getAttribute('data-quantity');
            if($('.table-result-search').length - 1 != i)
            {
                ids = ids + '-';
                quantities = quantities + '-';
            }
        });
        var query = ids + quantities;
        console.log( url + "/doctor/getsearchresults" + query);
        window.location.href = url + "/doctor/choosetreatmentcenter" + query;
    }
    else {        
        alert('No medicines are added to the search list');
        var html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No medicines are added to the search list</div>';
        $(html).insertBefore('#section-search');
    }
}
