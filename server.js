var PORT = process.env.PORT || 3000;
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var verboseServer = true;

app.use(express.static(__dirname + '/public'));
// array of all lines drawn
var line_history = [];
var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];

    if (typeof info === 'undefined') {
        return;
    }

    Object.keys(clientInfo).forEach(function(socketId) {
        var userInfo = clientInfo[socketId];

        if (info.room === userInfo.room) {
            users.push(userInfo.name);
        }
    });

    socket.emit('message', {
        name: 'System',
        text: 'Current users: ' + users.join(', '),
        timestamp: moment().valueOf()
    });
}


// io start



io.on('connection', function(socket) {
    verboseServer && console.log('User connected via socket.io!');
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }
    socket.on('disconnect', function() {
        var userData = clientInfo[socket.id];
        verboseServer && console.log("disconnect");
        if (typeof userData !== 'undefined') {
            socket.leave(userData.room);
            io.to(userData.room).emit('message', {
                name: 'System',
                text: userData.name + ' has left the room.',
                timestamp: moment().valueOf()
            });
            delete clientInfo[socket.id];
        }
    });
   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });
    socket.on('joinRoom', function(req) {
        clientInfo[socket.id] = req;
        socket.join(req.room);
        socket.broadcast.to(req.room).emit('message', {
            name: 'System',
            text: req.name + ' has entered the room.',
            timestamp: moment().valueOf()
        });
    });

    socket.on('message', function(message) {
        verboseServer && console.log('Message received: ' + message.text);
        if (message.text === '@currentUsers') {
            sendCurrentUsers(socket);
        } else {
            message.timestamp = moment().valueOf();
            io.to(clientInfo[socket.id].room).emit('message', message);
        }
    });

    // timestamp property - JavaScript timestamp (milliseconds)

    socket.emit('message', {
        name: '',
        text: 'Session started',
        timestamp: moment().valueOf()
    });
});

http.listen(PORT, function() {
    verboseServer && console.log("ChatServer Started");
});
