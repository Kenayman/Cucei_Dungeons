function Room(id, clientID) {
    this.id = id;
    this.hostID = clientID;
    this.clients = [clientID]; // Inicialmente, el anfitrión es el único cliente en la sala
}

Room.prototype.addClient = function (clientID) {
// Verificar si el cliente ya está en la sala antes de agregarlo
if (!this.clients.includes(clientID)) {
    this.clients.push(clientID);
}
};

Room.prototype.removeClient = function (clientID) {
const index = this.clients.indexOf(clientID);
if (index !== -1) {
    this.clients.splice(index, 1);
}
};

Room.prototype.isClientInRoom = function (clientID) {
return this.clients.includes(clientID);
};

module.exports = Room;
