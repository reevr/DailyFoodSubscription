$(document).ready(function() {
    $('select').material_select();
    $('.dashboard-month-selector').on('change',(event) => {
        if (event.target.value && event.target.value > 0 && event.target.value <= 12) {
            document.location.href = "/dashboard/" + event.target.value;
        }
    });
    $('.leaves-month-selector').on('change',(event) => {
        if (event.target.value && event.target.value > 0 && event.target.value <= 12) {
            document.location.href = "/leaves/" + event.target.value;
        }
    });
    $('.dashboard-month-selector').on('change', (event) => {
        if (event.target.value && event.target.value > 0 && event.target.value <= 12) {
            document.location.href = "/admin/expense/" + event.target.value;
        }
    });
});