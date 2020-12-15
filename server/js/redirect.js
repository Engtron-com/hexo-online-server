function  redirectHandle(xhr) {
    if (xhr.status == 503) {
        window.location.href = '';
    }
}

$(function () {
    $(document).ajaxComplete(function (event, xhr, settings) {
        redirectHandle(xhr);
    })
})
