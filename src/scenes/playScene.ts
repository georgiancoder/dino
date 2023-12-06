
import {Player} from "../entities/player";
import {GameScene} from "./gameScene";
import {PRELOAD_CONFIG} from "../index";
import {SpriteWithDynamicBody} from "../types";

class PlayScene extends GameScene{
    ground: Phaser.GameObjects.TileSprite;
    startTrigger: any;
    player: Player;
    spawnInterval: number = 1500;
    spawnTime: number = 0;
    obstacles: Phaser.Physics.Arcade.Group;
    gameSpeed: number = 10;
    constructor() {
        super('PlayScene');
    }

    create(){
        this.createEnvironment();
        this.createPlayer();

        this.obstacles = this.physics.add.group();
        this.startTrigger = this.physics.add.sprite(0,10,null)
            .setAlpha(0)
            .setOrigin(0,1);

        this.physics.add.collider(this.obstacles, this.player, () => {
            this.physics.pause();
           this.isGameRunning = false;
           this.player.die();
        });

        this.physics.add.overlap(this.startTrigger, this.player, () => {
            if (this.startTrigger.y === 10){
                this.startTrigger.body.reset(0,this.gameHeight);
                return;
            }

            this.startTrigger.body.reset(9999,9999);

            const rollOutEvent = this.time.addEvent({
                delay: 1000/60,
                callback: () => {
                    this.player.setVelocityX(80);
                    this.player.playRunAnimations();
                    this.ground.width += 34;
                    if (this.ground.width >= this.gameWidth){
                       rollOutEvent.remove();
                       this.ground.width = this.gameWidth;
                       this.player.setVelocityX(0);
                       this.isGameRunning = true;
                    }
                },
                loop: true
            })
        });

    }

    createPlayer(){
        this.player = new Player(this, 0, this.gameHeight)
    }

    createEnvironment(){
        this.ground = this.add.tileSprite(0,this.gameHeight, 88, 26, 'ground')
            .setOrigin(0,1);
    }

    update(time: number, deltaTime: number ){
        if (!this.isGameRunning) return;

        this.spawnTime += deltaTime;
        if (this.spawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTime = 0;
        }

        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

        this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
           if (obstacle.getBounds().right < 0) {
               this.obstacles.remove(obstacle);
           }
        });

        this.ground.tilePositionX += this.gameSpeed;
    }

    spawnObstacle(){
        const obstacleNum = Math.floor(Math.random() * PRELOAD_CONFIG.cactusesCount) + 1;
        const distance = Phaser.Math.Between(600,900);
        this.obstacles.create(distance, this.gameHeight, `obstacle-${obstacleNum}`)
            .setOrigin(0,1)
            .setImmovable();
    }
}

export default PlayScene;
