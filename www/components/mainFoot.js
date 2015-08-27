$('.tooltipped').tooltip({delay: 50});
$(".dropdown-button").dropdown({hover:false});
$('.collapsible').collapsible();
$(".fancybox").fancybox();
socket.emit('getPhotosPath');