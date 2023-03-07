
const SPEED = 10;
const TICK_RATE = 30;
const SWORD_SPEED = 7;
const PLAYER_SIZE = 32;
const TILE_SIZE = 32;
//Require
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const loadMap = require('./mapLoader')

//inputs
let players = [];
const inputsMap = {};
let swords = [];
//mapa
async function main(){
  const {ground2D,decal2D} = await loadMap();
//Ticks del server, cuanto tarda en moverse un personaje o hacer una accion
function tick(delta){
  for(const player of players){
    const inputs = inputsMap[player.id]
    if(inputs.up){
      player.y -= SPEED;
    }
    else if(inputs.down){
      player.y += SPEED
    }

    if(inputs.left){
      player.x -= SPEED;
    }
    else if(inputs.right){
      player.x += SPEED
    }
  }
  io.emit('players', players)
  io.emit('swords',swords)
}

  //server
io.on('connect',(socket)=>{
  console.log("Usuario Conectado",socket.id);

  inputsMap[socket.id]={
    up:false,
    down:false,
    left:false,
    right:false,
  }
  //posicion de los jugadores por su id (en que lugar de la rejilla se encuentran al inicio)
  players.push({
    id:socket.id,
    x: 0,
    y: 0,
  });
  //emite al server
  socket.emit('map',{
    ground: ground2D,
    decal: decal2D,
  })
  io.emit('players', players)
  //Ubicar el punto de donde se lanzaran las espadas, donde se encuentra el jugador
  socket.on('swords', angle => {
    const player= players.find(player => player.id ===socket.id)
    swords.push({
      angle,
      x: player.x,
      y: player.y
    })
  })
  //Velocidad de la espada
  for (const sword of swords){
    sword.x += Math.cos(sword.angle)*SWORD_SPEED;
    sword.y += Math.sin(sword.angle)*SWORD_SPEED;
  }

  socket.on('inputs',(inputs)=>{
    inputsMap[socket.id]=inputs;
  })
  socket.on('disconnect',()=>{
    players= players.filter((player)=> player.id !== socket.id)
  })
});

app.use(express.static("public"))

httpServer.listen(5000);

setInterval(tick,1000/TICK_RATE);
}
main();
