//Creado por Kenayman
//Muy papu el pedo

//Escena y fisicas del juego
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    backgroundColor: 'white',
    parent: 'Juego_nave',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [{
        preload: preload,
        create: create,
        update: update
    }]
};
//Variables Globales
var game = new Phaser.Game(config);
var rojo;
var sombra
var arriba,derecha,izquierda,abajo,correr;
var velocidad= 200;
var escala = 2;
var mapa;

//Cargar los archivos al juego
function preload() {
    this.load.spritesheet('Rojin','assets/sprites/Rojin.png',{frameWidth: 32, FrameHeight:32 });
    this.load.tilemapTiledJSON('mapa','assets/mapa/mapa.json');
    this.load.image('tiles','assets/mapa/mapaTiles.png');
    this.load.image('sombra','assets/sprites/sombra.png');
    this.load.audio('fondo', 'assets/music/dungeon.mp3');
}

function create() {
    //mapa
    mapa = this.make.tilemap({key:'mapa'});
    var tilesets = mapa.addTilesetImage('mapaTiles','tiles')

    var colision = mapa.createDynamicLayer('colision', tilesets, 0,0)
    colision.setScale(4)
    // Agregar colisiones con las paredes
    colision.setCollisionBetween(0, 100);
    //agregar Piso
    var piso = mapa.createDynamicLayer('piso', tilesets, 0,0)
    piso.setScale(4)
    
    // Agrega la sombra debajo del personaje
    sombra = this.add.image(100, 100, 'sombra');
    sombra.setScale(escala);
    sombra.setOrigin(0.5, 1.1); // Cambia la posición de la sombra
    sombra.setAlpha(0.5);
    //fisicas del personaje
    rojo = this.physics.add.sprite(100,100,'Rojin',0);
    rojo.setCollideWorldBounds(true);
    rojo.setScale(escala);
    // Ajustar la hitbox
    rojo.setSize(8, 16);
    //animaciones
    this.anims.create({
        key: 'caminar',
        frames: this.anims.generateFrameNumbers('Rojin',{start:16, end:19}),
        frameRate:10
    })
    this.anims.create({
        key: 'correr',
        frames: this.anims.generateFrameNumbers('Rojin',{start:24, end:31}),
        frameRate:10
    })
    this.anims.create({
        key: 'idle',
        frames: [
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 0 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 1 },
            { key: 'Rojin', frame: 8 },
            { key: 'Rojin', frame: 8 },
            { key: 'Rojin', frame: 9 },
            { key: 'Rojin', frame: 9 },
        ],
        frameRate: 7,
        repeat: -1
    });

    // Agregar colisión entre el personaje y las paredes
    this.physics.add.collider(rojo, colision);

    //movimientos
    derecha = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    izquierda = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    arriba = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    abajo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    correr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    //musica
    this.fondoMusica = this.sound.add('fondo', { volume: 0.5 });
    this.fondoMusica.play();
    this.fondoMusica = this.sound.add('fondo', { loop: true, volume: 0.5 });
    




}
function update() {
    rojo.body.setVelocityX(0);
    rojo.body.setVelocityY(0);
    sombra.x = rojo.x;
    sombra.y = rojo.y + 50;
    //velocidad
    if(correr.isDown){
        velocidad=300
    } else {
        velocidad=200
    }
    //movimiento xy
    if (izquierda.isDown) {
        rojo.body.setVelocityX(-velocidad);
        rojo.setScale(-escala, escala); // Se volteará hacia la izquierda
    }
    else if (derecha.isDown) {
        rojo.body.setVelocityX(velocidad);
        rojo.setScale(escala); // Volverá a mirar hacia la derecha
    }
    else if (abajo.isDown) {
        rojo.body.setVelocityY(velocidad);
    }
    else if (arriba.isDown) {
        rojo.body.setVelocityY(-velocidad);
    }

    // Movimiento en diagonales
    if (izquierda.isDown && abajo.isDown) {
        rojo.body.setVelocityX(-velocidad);
        rojo.body.setVelocityY(velocidad);
        rojo.setScale(-escala, escala); // Se volteará hacia la izquierda
    }
    else if (izquierda.isDown && arriba.isDown) {
        rojo.body.setVelocityX(-velocidad);
        rojo.body.setVelocityY(-velocidad);
        rojo.setScale(-escala, escala); // Se volteará hacia la izquierda
    }
    else if (derecha.isDown && abajo.isDown) {
        rojo.body.setVelocityX(velocidad);
        rojo.body.setVelocityY(velocidad);
        rojo.setScale(escala); // Volverá a mirar hacia la derecha
    }
    else if (derecha.isDown && arriba.isDown) {
        rojo.body.setVelocityX(velocidad);
        rojo.body.setVelocityY(-velocidad);
        rojo.setScale(escala); // Volverá a mirar hacia la derecha
    }

    if ((izquierda.isDown || derecha.isDown || abajo.isDown || arriba.isDown) && correr.isDown) {
        rojo.anims.play('correr', true);
    } else if (izquierda.isDown || derecha.isDown || abajo.isDown || arriba.isDown) {
        rojo.anims.play('caminar', true);
    } else {
        rojo.anims.play('idle',true);
    }
}