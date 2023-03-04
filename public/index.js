//se usa para medir las casillas que tiene el png que contiene nuestro archivo de mapa
const TILE_SIZE = 16;
const TILE_IN_COLUMNA = 32;
//imagenes
const mapImage = new Image();
mapImage.src = "tileSets.png"

const knightImage = new Image();
knightImage.src = "Knight.png"

//obtener las medidas del mapa
const canvasEl  = document.getElementById('canvas')
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvas = canvasEl.getContext("2d")

const socket = io(`http://localhost:5000/`);

//iniciando mapa como un array 2d
let groundMap = [[]]
let decalMap = [[]]
let players = []

socket.on('connect',()=>{
    console.log('conectado');
});
//ver el mapa
socket.on("map",(loadedMap)=>{
    groundMap = loadedMap.ground;
    decalMap = loadedMap.decal;

})

socket.on('players',(serverPlayers)=>{
    players = serverPlayers
})
//inputs para mover al personaje
const inputs = {
    'up':false,
    'down':false,
    'left':false,
    'right':false,
};

window.addEventListener('keydown', (e)=>{
    console.log(e.key);
    if(e.key === 'w'){
        inputs["up"]=true;
    }
    else if(e.key === 's'){
        inputs["down"]=true;
    }
    else if(e.key === 'a'){
        inputs["left"]=true;
    }
    else if(e.key === 'd'){
        inputs["right"]=true;
    }
    socket.emit('inputs', inputs)
})
window.addEventListener('keyup', (e)=>{
    console.log(e.key);
    if(e.key === 'w'){
        inputs["up"]=false;
    }
    else if(e.key === 's'){
        inputs["down"]=false;
    }
    else if(e.key === 'a'){
        inputs["left"]=false;
    }
    else if(e.key === 'd'){
        inputs["right"]=false;
    }
    socket.emit('inputs', inputs)
})
//Mapa
function loop() {
    //refrescar la imagen de la pantalla
    canvas.clearRect(0,0,canvas.width,canvas.height)

    //Cargar cada posicion del mapa
    for(let fila = 0; fila< groundMap.length; fila++){
        for(let columna = 0; columna< groundMap[0].length; columna++){
            let {id} = groundMap[fila][columna]
            const imageFila = parseInt(id / TILE_IN_COLUMNA)
            const imageColumna = id % TILE_IN_COLUMNA
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);  //se usa para dibujar la imagen
            canvas.drawImage(mapImage,
                imageColumna*TILE_SIZE,
                imageFila*TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                columna* TILE_SIZE,
                fila* TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            )
        }
    } 

    for(let fila = 0; fila< decalMap.length; fila++){
        for(let columna = 0; columna< decalMap[0].length; columna++){
            let {id} = decalMap[fila][columna] ?? {id:undefined}
            const imageFila = parseInt(id / TILE_IN_COLUMNA)
            const imageColumna = id % TILE_IN_COLUMNA
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);  //se usa para dibujar la imagen
            canvas.drawImage(mapImage,
                imageColumna*TILE_SIZE,
                imageFila*TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                columna* TILE_SIZE,
                fila* TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            )
        }
    }
    for(const p of players){
    canvas.drawImage(knightImage, p.x, p.y)

    }
    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)