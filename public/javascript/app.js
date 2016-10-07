//       Client side


// Chat
var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();




// // Draw
//    var mouse = { 
//       click: false,
//       move: false,
//       pos: {x:0, y:0},
//       pos_prev: false
//    };
//    // get canvas element and create context
//    var canvas  = document.getElementById('drawing');
//    var context = canvas.getContext('2d');
//    var width   = window.innerWidth;
//    var height  = window.innerHeight;
//    // var socket  = io.connect();

//    // set canvas to full browser width/height
//    canvas.width = width;
//    canvas.height = height;

//    // register mouse event handlers
//    canvas.onmousedown = function(e){ mouse.click = true; };
//    canvas.onmouseup = function(e){ mouse.click = false; };

//    canvas.onmousemove = function(e) {
//       // normalize mouse position to range 0.0 - 1.0
//       mouse.pos.x = e.clientX / width;
//       mouse.pos.y = e.clientY / height;
//       mouse.move = true;
//    };


// Chat
console.log(name + ' wants to join ' + room);

// Update room tag
jQuery('.room-title').text(room);

socket.on('connect', function () {
   console.log('Conncted to socket.io server!');
   socket.emit('joinRoom', {
      name: name,
      room: room
   });
});

socket.on('message', function (message) {
   var momentTimestamp = moment.utc(message.timestamp);
   var $messages = jQuery('.messages');

   console.log('New message:');
   console.log(message.text);



   $messages.prepend('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong></p>');
   $messages.prepend('<p>' + message.text + '</p>');
   $messages.prepend($messages);
});

// Handles submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function (event) {
   event.preventDefault();

   var $message = $form.find('input[name=message]');

   socket.emit('message', {
      name: name,
      text: $message.val()
   });

   $message.val('');
});








// // draw
//   // draw line received from server
//    socket.on('draw_line', function (data) {
//       var line = data.line;
//       context.beginPath();
//       context.moveTo(line[0].x * width, line[0].y * height);
//       context.lineTo(line[1].x * width, line[1].y * height);
//       context.stroke();
//    });
   
//    // main loop, running every 25ms
//    function mainLoop() {
//       // check if the user is drawing
//       if (mouse.click && mouse.move && mouse.pos_prev) {
//          // send line to to the server
//          socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ],name: name,
//       room: room });
//          mouse.move = false;
//       }
//       mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
//       setTimeout(mainLoop, 25);
//    }
//    mainLoop();

