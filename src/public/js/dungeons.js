var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'dungeons',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0, x: 0 }
    }
  },
  scene: { preload, create, update }
}

var game = new Phaser.Game(config)

function preload() {
  this.load.image('car', 'img/car.png')
  this.load.spritesheet('DinoTard', 'img/DinoSprites - tard.png', { frameWidth: 24, frameHeight: 24 });
  this.load.tilemapTiledJSON('map', 'img/mapa.json');
  this.load.image('tiles', 'img/ImageClassroom.png');
}
const playerName = 'Kenaymen'; // Aquí deberías tener almacenado el nombre del jugador
let playerText;

function create() {
  const mapa = this.make.tilemap({ key: 'map' });
  const tilesets = mapa.addTilesetImage('School', 'tiles');
  // Escalando las capas del mapa
  const scale = 2.4; // Factor de escala deseado, en este caso, 3

  const piso = mapa.createLayer('Piso', tilesets, 0);
  piso.setScale(scale);

  const layer3 = mapa.createLayer('Tile Layer 3', tilesets, 0);
  layer3.setScale(scale);

  const solidos = mapa.createLayer('Solidos', tilesets, 0);
  solidos.setCollisionByProperty({ Solido: true })
  solidos.setScale(scale);

  const accesories = mapa.createLayer('Accesories', tilesets, 0);
  accesories.setScale(scale);

  const spawnPoint = mapa.findObject("Objects", obj => obj.name === "Spawn Point");

  //Mapa
  const mapWidth = mapa.widthInPixels;
  const mapHeight = mapa.heightInPixels;
  const expandedMapWidth = mapWidth * scale;
  const expandedMapHeight = mapHeight * scale;


  // Aumenta el tamaño del mundo del juego expandiendo las dimensiones
  this.physics.world.setBounds(0, 0, expandedMapWidth, expandedMapHeight);
  const self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id], spawnPoint, solidos);
      } else {
        addOtherPlayers(self, players[id], spawnPoint);
        // Aquí se agrega el nombre del jugador al sprite de otros jugadores
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (players[id].playerId === otherPlayer.playerId) {
            otherPlayer.playerName = self.add.text(0, 0, players[id].name, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: '#ffffff',
              stroke: '#000000', // Color del contorno (negro)
              strokeThickness: 3 // Grosor del contorno
            });
            otherPlayer.playerName.setOrigin(0.5, 1.5); // Ajusta la posición vertical del nombre
          }
        });
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo, spawnPoint)
  })

  this.socket.on('playerDisconnected', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy()
      }
    })
  })
  this.socket.on('playerAnimation', function (data) {
    // Aplicar la animación al jugador correspondiente usando el ID recibido
    console.log('Datos de animacion recibida (CLIENTE): ', data);
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (data.id === otherPlayer.playerId) {
        console.log('Datos de animacion aplicados a: ', otherPlayer.playerId);
        otherPlayer.anims.play(data.anim, true);
      }
    });
  });
  this.socket.on('playerName', function (data) {
    // Actualizar el nombre del jugador específico
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (data.playerId === otherPlayer.playerId) {
        otherPlayer.playerName.setText(data.name);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys()

  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  // Agregar el texto del jugador
  playerText = this.add.text(0, 0, playerName, {
    fontFamily: 'Arial',
    fontSize: '14px',
    color: '#ffffff',
    stroke: '#000000', // Color del contorno (negro)
    strokeThickness: 3 // Grosor del contorno
  });


}

function addPlayer(self, playerInfo, spawnPoint, solidos) {
  self.player = self.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'DinoTard')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(60, 60)
    .setCollideWorldBounds(true)
    .setTint(playerInfo.color)
    .setDrag(1000);
  
  self.physics.add.collider(self.player, solidos);

  self.anims.create({
    key: 'walk',
    frames: self.anims.generateFrameNumbers('DinoTard', { start: 4, end: 9 }),
    frameRate: 10,
  });

  self.anims.create({
    key: 'idle',
    frames: self.anims.generateFrameNumbers('DinoTard', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1, // Repetir indefinidamente
  });

  self.player.anims.play('idle'); // Asegurarse de que la animación 'idle' se reproduzca al inicio
  self.cameras.main.startFollow(self.player);
}


function addOtherPlayers(self, playerInfo, spawnPoint) {
  const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, 'DinoTard')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(60, 60)
    .setRotation(playerInfo.rotation)
    .setTint(playerInfo.color);

  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.player && playerText) {
    // Actualizar la posición del texto para seguir al jugador
    playerText.x = this.player.x - playerText.width / 2;
    playerText.y = this.player.y - 40; // Ajusta la posición vertical según tu diseño
  }
  if (this.player) {
    const speed = 500;
    const player = this.player.body;

    // Resetear la velocidad del jugador
    player.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -speed;
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
      this.player.flipX = false;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
    }

    if ((this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) && (velocityX !== 0 || velocityY !== 0)) {
      // Movimiento diagonal, ajustar velocidad
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.7071; // Aproximadamente 1 / sqrt(2) para movimiento diagonal
        velocityY *= 0.7071;
      }
      this.player.anims.play('walk', true);
      this.socket.emit('playerAnimation', 'walk')

    } else {
      this.player.anims.play('idle', true);
      this.socket.emit('playerAnimation', 'idle')
    }
    player.setVelocityX(velocityX);
    player.setVelocityY(velocityY);

    const currPosition = {
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation
    };
    if (this.player.oldPosition && (
      currPosition.x !== this.player.oldPosition.x ||
      currPosition.y !== this.player.oldPosition.y ||
      currPosition.rotation !== this.player.oldPosition.rotation
    )) {
      this.socket.emit('playerMovement', currPosition);
    }
    this.player.oldPosition = currPosition;
    console.log(currPosition)
  }
}
