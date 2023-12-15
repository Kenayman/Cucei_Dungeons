(function () {
    var socket = io();
    var lobbyContainer = $('#lobby-container');

    // Manejar cuando se presiona el botón "Create new game"
    $('#game-container').on('click', '#btn-host-game', function() {
        socket.emit('host', socket.id, function(roomID) {
            initGame();
            hideLobby();
        });
    });

    $('#game-container').on('click', '#btn-join-game', function() {
        var roomID = $(this).data('button');
        socket.emit('join', roomID, function(data) {
            initGame();
            hideLobby();
        });
    });

    function hideLobby() {
        lobbyContainer.hide();
    }

    $('#game-container').on('submit', 'form', function() {

        socket.emit('chatMessage', $('#chat-box-input').val());

        $('#chat-box-input').val('');

        return false;
    });

    socket.on('debugMessage', function(msg) {
        $('#debug').append('<p>' + msg + '</p>');
    });

    socket.on('addChatMessage', function(msg, clientID, color) {
        $('#game').append('<p style="color:' + color + ';">' + clientID + ": " + '<span>' + msg);
        $('#game')[0].scrollTop = $('#game')[0].scrollHeight;
    });


    socket.on('update', function(rooms) {
        var room, key;
        $('.room-list-item').remove();
        for (key in rooms) {
            if (rooms.hasOwnProperty(key)) {
                room = rooms[key];
                addSingleRoomToList(room);
            }
        }
    });

    function addSingleRoomToList(room) {
        $('#game-list-table').append(
            '<tr class="room-list-item">'
            + '<td>' + room.id + '</td>'
            + '<td>' + room.clients.length + '/10</td>'
            + '<td><button id=btn-join-game data-button=' + room.id + '>Unirse</button></td>'
        );
    }

    function initGame() {
        $('#game-container').append(
            '<div id=game></div>' +
            '<div id=chat-box><form action=""><input autofocus id="chat-box-input" autocomplete="off" /><button>Enviar</button></form></div>' +
            `<div id="dungeons">
            <script src=/js/dungeons.js></script>
        </div>`);
    }



})();