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
    var players = {}

io.on('connection', function (socket) {
  console.log('player [' + socket.id + '] connected')

  players[socket.id] = {
    rotation: 0,
    x: 401.5879113843,
    y: 170.06018696376,
    playerId: socket.id,
    color: getRandomColor()
  }
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', players[socket.id])
 
  socket.on('disconnect', function () {
    console.log('player [' + socket.id + '] disconnected')
    delete players[socket.id]
    io.emit('playerDisconnected', socket.id)
  })

  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x
    players[socket.id].y = movementData.y
    players[socket.id].rotation = movementData.rotation

    socket.broadcast.emit('playerMoved', players[socket.id])
  })
  socket.on('playerAnimation', function (data) {
    // Transmitir la animación a todos los clientes excepto al jugador que la envía
    // console.log('Datos de animacion recibidos (SERVER): ', data);
    socket.broadcast.emit('playerAnimation', data);
});
socket.on('playerName', function (data) {
  // Transmitir el nombre a todos los clientes excepto al jugador que lo envía
  socket.broadcast.emit('playerName', data);
});
})

function getRandomColor() {
  return '0x' + Math.floor(Math.random() * 16777215).toString(16)
}

    http.listen(process.env.PORT, function () {
        console.log('listening on *:' + process.env.PORT);
    });

    return io;
};

module.exports = Server;