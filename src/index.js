
const SPEED = 6;
const TICK_RATE = 30;
const SWORD_SPEED = 10;
const PLAYER_SIZE = 16;
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
  //Velocidad de la espada
  for (const sword of swords){
    sword.x += Math.cos(sword.angle)*SWORD_SPEED;
    sword.y += Math.sin(sword.angle)*SWORD_SPEED;
    sword.timeLeft -= delta;
    //Esto sera guardado para los mounstros,por el momento afectara jugadores
    for(const player of players){
      if(player.id === sword.playerId) continue;
      //Aqui calculara la distancia entre el XY del arma contra la del jugador en base a su pocision actual
      const distancia = Math.sqrt(
        (player.x + PLAYER_SIZE/2 - sword.x )**2 + (player.y + PLAYER_SIZE/2 - sword.y)**2

      );
      //Cantidad de cuadros requeridos para ejecutarlo
      if(distancia <=PLAYER_SIZE/2){
        player.x=0;
        player.y=0;
        //para que solo colisione con un solo jugador a la vez
        sword.timeLeft = -1;
        break;
      }
    }
  }

swords = swords.filter(sword => sword.timeLeft >= 0)

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
  socket.on('swords', (angle) => {
    const player = players.find(player => player.id ===socket.id)
    swords.push({
      angle,
      x: player.x,
      y: player.y,
      timeLeft: 700,
      playerId: socket.id
    })
  })


  socket.on('inputs',(inputs)=>{
    inputsMap[socket.id]=inputs;
  })
  socket.on('disconnect',()=>{
    players= players.filter((player)=> player.id !== socket.id)
  })
});

app.use(express.static("public"))

httpServer.listen(5000);

let lastUpdate = Date.now();
setInterval(()=>{
  const now = Date.now()
  const delta = now - lastUpdate
  tick(delta)
  lastUpdate = now
},1000/TICK_RATE);
}
main();
