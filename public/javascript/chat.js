var socket  = io();

socket.on('chatMessage', function(msg) {
	$('#messages').prepend($('<li>').text(msg));
});

$('#chatButton').on('click', function(){
	socket.emit('chatMessage', $('#message').val());
	$('#message').val('');
	return false;
});
// 
