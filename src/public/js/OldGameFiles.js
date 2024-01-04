
module.exports = Server;

const socket = io();

class Game extends Phaser.Scene {
    
    preload ()
    {
        this.load.spritesheet('DinoTard', 'img/DinoSprites - tard.png', {frameWidth: 24, frameHeight: 24});
        this.load.tilemapTiledJSON('map','img/mapa.json');
        this.load.image('tiles', 'img/ImageClassroom.png');
    }

    create ()
    {
        const mapa = this.make.tilemap({ key: 'map' });
        const tilesets = mapa.addTilesetImage('School', 'tiles');

        // Escalando las capas del mapa
        const scale = 2.4; // Factor de escala deseado, en este caso, 3

        const piso = mapa.createLayer('Piso', tilesets, 0);
        piso.setScale(scale);

        const layer3 = mapa.createLayer('Tile Layer 3', tilesets, 0);
        layer3.setScale(scale);

        const solidos = mapa.createLayer('Solidos', tilesets, 0);
        solidos.setCollisionByProperty({ Solido: true})
        solidos.setScale(scale);

        const accesories = mapa.createLayer('Accesories', tilesets, 0);
        accesories.setScale(scale);

        //Mapa
        const mapWidth = mapa.widthInPixels;
        const mapHeight = mapa.heightInPixels;
        const expandedMapWidth = mapWidth * scale;
        const expandedMapHeight = mapHeight * scale;

        //Nombre del jugador
        const playerName = 'Kenaymen'; // Aquí deberías tener almacenado el nombre del jugador
        const playerText = this.add.text(0, 0, playerName, { 
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000', // Color del contorno (negro)
            strokeThickness: 3 // Grosor del contorno
        });
        playerText.setOrigin(0.5, 1); // Establece el origen en la base del texto
        playerText.setDepth(1); // Asegura que el texto esté sobre el jugador


        player = this.physics.add.sprite(100, 100, 'DinoTard', 0);
        player.setScale(2.5);
        player.setSize(16, 16); // Establece un tamaño más pequeño para el collider
        player.setOffset(4, 4); // Ajusta el offset para centrar el collider
        //Colision
        this.physics.add.overlap(player, solidos, () => {
            // Asegura que el texto esté sobre el jugador
            playerText.x = player.x;
            playerText.y = player.y - player.height * 0.8 -10; // Ajusta la posición vertical del texto para que esté sobre el jugador
        });

        this.physics.add.collider(player, solidos);

        // Aumenta el tamaño del mundo del juego expandiendo las dimensiones
        this.physics.world.setBounds(0, 0, expandedMapWidth, expandedMapHeight);

        // Establece la cámara para seguir al jugador dentro del nuevo mapa expandido
        this.cameras.main.setBounds(0, 0, expandedMapWidth, expandedMapHeight);
        this.cameras.main.startFollow(player);
        //Animator

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('DinoTard', {start: 4, end: 9}),
            frameRate: 10,
        })

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('DinoTard', {start: 0, end: 3}),
            frameRate: 10
        })

        this.physics.world.enable(player);

        up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    }
    update() {
        player.body.setVelocity(0); // Reset velocity each frame
    
        let velocityX = 0;
        let velocityY = 0;
        if (left.isDown) {
            velocityX = -speed;
            player.flipX = true;
        } else if (right.isDown) {
            velocityX = speed;
            player.flipX = false;
        }
        if (up.isDown) {
            velocityY = -speed;
        } else if (down.isDown) {
            velocityY = speed;
        }
        if ((left.isDown || right.isDown || up.isDown || down.isDown) && (velocityX !== 0 || velocityY !== 0)) {
            // Moving diagonally, adjust speed
            if (velocityX !== 0 && velocityY !== 0) {
                velocityX *= 0.7071; // Approximately 1 / sqrt(2) for diagonal movement
                velocityY *= 0.7071;
            }
            player.anims.play('walk', true);
        } else {
            player.anims.play('idle', true);
        }
        player.body.setVelocityX(velocityX);
        player.body.setVelocityY(velocityY);
    }
    addPlayer(playerInfo) {
        player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'DinoTard', 0);
        // Configurar jugador local
    }

    addOtherPlayers(playerInfo) {
        const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'DinoTard', 0);
        otherPlayer.playerId = playerInfo.playerId;
        // Configurar otros jugadores
        this.otherPlayers.add(otherPlayer);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1430,
    height: 900,
    autoResize: true,
    scene: [Game],
    parent: 'dungeons',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0, x: 0 }
        }
    }
};


const game = new Phaser.Game(config);
var player;
var up,down,left,right
const speed = 350;
const diagonalSpeed = Math.sqrt(speed * speed / 2);
