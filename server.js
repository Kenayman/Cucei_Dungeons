//conexiones  a servidores
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//acceso a arcivos estaticos del juego
app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));


//se le da el archivo raiz
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

//que puerto debe de escuchar
server.listen(process.env.PORT || 8081,function(){ //se utiliza el puerto 8081
    console.log('Listening on '+server.address().port);
});


server.lastPlayderID = 0;
io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };
        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('click',function(data){
            console.log('click to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}