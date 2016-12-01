var url = window.location.origin;
$( function() {
    $('#myTable').DataTable();
    $('#myTable2').DataTable();
    $.ajax({
        type: "get",
        url: url + '/getapprovedmedicines',
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
    $('#empty_search').remove();
    console.log($( "#tags" ).val());
    var tags = $( "#tags" ).val();
    var tagsArray = tags.split(" - ");
    var generic_name = tagsArray[0];
    var brand_name = tagsArray[1];
    var form = tagsArray[2];
    var strength = tagsArray[3];
    var strength_unit = tagsArray[4];
    var manufacturer = tagsArray[5];
   $('#itemsToSearch').append('<tr class="tr_search"><td class="td_search">' + generic_name + '</td><td class="td_search">' + brand_name + '</td><td class="td_search">' + form + '</td><td class="td_search">' + strength + '</td><td class="td_search">' + strength_unit + '</td><td class="td_search">' + manufacturer + '</td></tr>');
}

function addMedicine(id) {
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
           $('#itemsToSearch').append('<tr class="tr_search"><td class="td_search">' + generic_name + '</td><td class="td_search">' + brand_name + '</td><td class="td_search">' + form + '</td><td class="td_search">' + strength + '</td><td class="td_search">' + strength_unit + '</td><td class="td_search">' + manufacturer + '</td></tr>');
        }
    });
}
