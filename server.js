// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var moment = require('moment');
var port     = process.env.PORT || 8080;
var path = require('path');
var passport = require('passport');
var flash    = require('connect-flash'); // store and retrieve messages in session store
var socketIo = require('socket.io')
var morgan       = require('morgan'); // logger
var cookieParser = require('cookie-parser'); // parse cookies
var bodyParser   = require('body-parser'); // parse posts
var session      = require('express-session'); // session middleware
var http = require('http');
var configDB = require('./config/database.js');
var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));
require('./config/passport')(passport); // pass passport for configuration
mongoose.connect(configDB.url);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// required for passport
app.use(session({ secret: 'ilovechocolatepeanutbuttercups'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//socketIo======================================================================
var server = http.createServer(app);
var io = socketIo.listen(server);

var line_history = [];
var chat_history = [];
var socketId = "";
var clientInfo = {};


// Sends current users to provided socket
function sendCurrentUsers(socket) {
    console.log("send users");
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


io.on('connection', function(socket) {

// Session started message
    socket.emit('message', {
        name: '',
        text: 'Session started',
        timestamp: moment().valueOf()
    });





    for (var i in line_history) {
        socket.emit('draw_line', line_history[i]);
    }
    socket.on('draw_line', function(data) {
    	var lineObject = {line: data.line, color: data.color, width: data.width};
        line_history.push(lineObject);
        io.emit('draw_line', lineObject);
        // This is version to emit to a specific room
        //io.to(data.room).emit('draw_line', { line: data.line });

    });

    socket.on('clearCanvas', function() {
    	line_history = [];
    	io.emit('clearCanvas', true);
    });

    for (var i in chat_history) {
        socket.emit('chatMessage', chat_history[i]);
    }

    // old version
    socket.on('chatMessage', function(msg) {
    	chat_history.push(msg);
    	io.emit('chatMessage', msg);
    });


    socket.on('message', function(message) {
        console.log('Message received: ' + message.text);
        if (message.text === '@currentUsers') {
            sendCurrentUsers(socket);
        } else {
            message.timestamp = moment().valueOf();
            io.to(clientInfo[socket.id].room).emit('message', message);
        }
    });





    socket.on('disconnect', function() {
        var userData = clientInfo[socket.id];
        console.log("disconnect");
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

    socket.on('joinRoom', function(req) {
        clientInfo[socket.id] = req;
        socketId = req.room;
        socket.join(req.room);


        // console.log(clientInfo[socket.id]);
        room = clientInfo[socket.id].room;
        console.log("joining room " + room);
        for (var i in line_history) {
            // console.log(line_history);
            io.to(req.room).emit('draw_line', { line: line_history[i] });
            //socket.broadcast.to(room).emit('draw_line', { line: line_history[i] });
            // socket.broadcast.to(socketId).emit('draw_line', { line: line_history[i] });
        }

        socket.broadcast.to(req.room).emit('message', {
            name: 'System',
            text: req.name + ' has entered the room.',
            timestamp: moment().valueOf()
        });
    });





});

// launch ======================================================================
server.listen(port);
console.log('app listening on ' + port);
