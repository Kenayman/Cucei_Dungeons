class Game extends Phaser.Scene
{
    preload ()
    {
        this.load.spritesheet('DinoTard', 'img/DinoSprites - tard.png', {frameWidth: 24, frameHeight: 24});
    }

    create ()
    {
        player = this.physics.add.sprite(100, 100, 'DinoTard', 0);
        player.setScale(2.5);
        player.setCollideWorldBounds(true);
        
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
        player.body.setVelocity(0); // Restablece la velocidad en cada frame
    
        if (left.isDown) {
            player.body.setVelocityX(-speed);
            player.flipX = true;
            if (up.isDown) {
                player.body.setVelocityY(-diagonalSpeed);
            } else if (down.isDown) {
                player.body.setVelocityY(diagonalSpeed);
            }
        } else if (right.isDown) {
            player.body.setVelocityX(speed);
            player.flipX = false;
            if (up.isDown) {
                player.body.setVelocityY(-diagonalSpeed);
            } else if (down.isDown) {
                player.body.setVelocityY(diagonalSpeed);
            }
        } else if (up.isDown) {
            player.body.setVelocityY(-speed);
        } else if (down.isDown) {
            player.body.setVelocityY(speed);
        }

        if(left.isDown || right.isDown || up.isDown || down.isDown)
        {
        player.anims.play('walk', true)
        }
        else{
            player.anims.play('idle', true)
        }
    }

    
    
}

const config = {
    type: Phaser.AUTO,
    width: 1430,
    height: 900,
    autoResize: true,
    scene: Game,
    parent: 'dungeons',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0, x: 0}
        }
    }
};

const game = new Phaser.Game(config);
var player;
var up,down,left,right
const speed = 350;
const diagonalSpeed = Math.sqrt(speed * speed / 2);
