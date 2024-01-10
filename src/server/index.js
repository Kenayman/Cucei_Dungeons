// node module includes
var uuid = require('node-uuid');
// include our custom server configuration
var Server = require('./server.js');
var Room = require('./room.js');

// local variables
var rooms = {};
var clients = {};
var playersInRooms = {}; // Registro de jugadores en las salas

var server = new Server();

server.on('connection', function (client) {
    clients[client.id] = {id: client.id, room: null, isHost: false, color: '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6)};
    client.emit('update', rooms);
    broadcastDebugMsg(client.id + ' has joined the server');

    client.on('disconnect', function () {
        if (clients[client.id]) {
            var room = findRoomByID(client.id, rooms);
            if (room) {
                if (clients[client.id].isHost) {
                    var newHostID = room.chooseNewHost(client.id);
                    if (newHostID) {
                        clients[newHostID].isHost = true;
                        broadcastDebugMsg(`${clients[newHostID].playerName} is the new host.`);
                    }
                }
                room.removeClient(client.id);
                if (room.isEmpty()) {
                    delete rooms[room.id]; // Eliminar la sala si está vacía
                    broadcastDebugMsg(`Room ${room.id} has been deleted.`);
                }
                server.sockets.emit('update', rooms);
            }
            delete clients[client.id];
        }
    });
    
    // Room.prototype.chooseNewHost
    Room.prototype.chooseNewHost = function (disconnectedClientID) {
        if (this.hostID === disconnectedClientID) {
            if (this.clients.length > 0) {
                // Asignar el rol de anfitrión al siguiente jugador más antiguo en la sala
                var newHostID = this.clients[0]; // El primer jugador en la lista se convierte en el nuevo anfitrión
                this.hostID = newHostID;
                return newHostID;
            }
        }
        return null;
    };
    
    Room.prototype.isEmpty = function () {
        return this.clients.length === 0;
    };
    client.on('host', function(data, callback) {
        var playerName = data.playerName;
        var newRoomID = uuid.v4();
        if (connectClientToRoom(newRoomID, client.id, playerName, true)) {
            callback(newRoomID);
        }
    });
    
    client.on('createRoom', function () {
        var roomID = uuid.v4();
        var playerID = uuid.v4(); // Generar un ID único para el jugador al crear una sala
    
        if (playersInRooms[client.id]) {
            client.emit('roomCreationFailed', { message: 'Ya estás en una sala.' });
            return;
        }
    
        client.join(roomID); // Unir al socket a la nueva sala
    
        rooms[roomID] = new Room(roomID, client.id, playerID); // Guardar el ID del jugador al crear la sala
        clients[client.id] = { id: client.id, room: roomID, isHost: true, playerName: null, playerID: playerID }; // Definir solo el ID del jugador
        broadcastDebugMsg(client.id + ' has created room: ' + roomID);
    
        server.sockets.emit('update', rooms);
        client.emit('roomCreated', roomID, playerID); // Enviar el ID generado al cliente
        playersInRooms[client.id] = true;
    });
    
    client.on('join', function(data, callback) {
        var playerName = data.playerName;
        var roomID = data.roomID;
        if (connectClientToRoom(roomID, client.id, playerName, false)) {
            callback(roomID);
        }
    });

    client.on('chatMessage', function(msg) {
    var room = findRoomByID(client.id, rooms);
    var playerName = clients[client.id].playerName; // Obtener el nombre del jugador
    server.sockets.in(room.id).emit('addChatMessage', msg, playerName, clients[client.id].color);
});


    function connectClientToRoom(roomID, clientID, playerName, isHost) {
        if (clients[clientID].isHost || clients[clientID].room) {
            return false;
        }
    
        client.join(roomID, function(err) {
            if (!err) {
                clients[client.id].isHost = isHost;
                clients[client.id].room = roomID;
                clients[client.id].playerName = playerName; // Guardar el nombre del jugador
    
                if (isHost) {
                    rooms[roomID] = new Room(roomID, clientID);
                    broadcastDebugMsg(playerName + ' has created room: ' + roomID);
                } else {
                    rooms[roomID].addClient(clientID);
                    broadcastDebugMsg(playerName + ' has joined room: ' + roomID);
                }
                server.sockets.emit('update', rooms);
            } else {
                // error
            }
        });
    
        return true;
    }

    function broadcastDebugMsg(msg) {
        server.sockets.emit('debugMessage', msg);
    }

    function findRoomByID(clientID, rooms) {
        var key, room;
        for (key in rooms) {
            if (rooms.hasOwnProperty(key)) {
                room = rooms[key];
                for (var i = 0; i < room.clients.length; i++) {
                    if (room.clients[i] === clientID) {
                        return room;
                    }
                }
            }
        }
        return null;
    }
});
