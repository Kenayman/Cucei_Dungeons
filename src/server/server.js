// use express to initialize a function handler to be passed to a new node HTTP server
process.env.PORT = process.env.PORT || 3000;

var Server = function() {
    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    // express static file middleware
    app.use(express.static(__dirname + '/../public'));

    // listen for get requests on the root directory and respond
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/../public/index.html');
    });

    // all we need is the io handle for client server communication - encapsulate the rest
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('host', function (data, callback) {
            // Aquí almacenamos el nombre del jugador con su ID
            socket.playerName = data.playerName;
            console.log(socket.playerName + ' has joined as host');
            callback('roomID'); // Reemplaza 'roomID' con la lógica adecuada
        });

        socket.on('join', function (data, callback) {
            // Aquí almacenamos el nombre del jugador con su ID
            socket.playerName = data.playerName;
            console.log(socket.playerName + ' has joined');
            callback('roomID'); // Reemplaza 'roomID' con la lógica adecuada
        });

        // Resto de tu código para gestionar otras acciones del socket...
    });

    http.listen(process.env.PORT, function () {
        console.log('listening on *:' + process.env.PORT);
    });

    return io;
};

module.exports = Server;
