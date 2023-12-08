
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
    score: number = 0;
    scoreDeltaTime: number = 0;
    scoreInterval: number = 50;
    obstacles: Phaser.Physics.Arcade.Group;
    gameSpeed: number = 10;
    gameSpeedModifier: number = 1;
    scoreText: Phaser.GameObjects.Text;
    hightScoreText: Phaser.GameObjects.Text;

    progressSound: Phaser.Sound.HTML5AudioSound;

    clouds: Phaser.Physics.Arcade.Group;
    gameOverContainer: Phaser.GameObjects.Container;
    gameOverText: Phaser.GameObjects.Image;
    restartText: Phaser.GameObjects.Image;
    constructor() {
        super('PlayScene');
    }

    create(){
        this.createEnvironment();
        this.createPlayer();
        this.createObstacles();
        this.createGameOverContainer();
        this.createAnimations();
        this.createScore();

        this.handleGameStart();
        this.handleObstacleCollisions();
        this.handleGameRestart();

        this.progressSound = this.sound.add('progress', {volume: .2}) as Phaser.Sound.HTML5AudioSound;
    }

    createPlayer(){
        this.player = new Player(this, 0, this.gameHeight)
    }

    createEnvironment(){
        this.ground = this.add.tileSprite(0,this.gameHeight, 88, 26, 'ground')
            .setOrigin(0,1);

        this.clouds = this.physics.add.group();

        this.clouds = this.clouds.addMultiple([
            this.add.image(this.gameWidth / 2, 170, 'cloud'),
            this.add.image(this.gameWidth - 80, 80, 'cloud'),
            this.add.image(this.gameWidth / 1.3, 100, 'cloud')
        ]);
        this.clouds.setAlpha(0);
    }

    update(time: number, deltaTime: number ){
        if (!this.isGameRunning) return;

        this.scoreDeltaTime += deltaTime;
        if (this.scoreDeltaTime >= this.scoreInterval){
            this.score++;
            this.scoreDeltaTime = 0;
            if (this.score % 100 == 0){
                this.gameSpeedModifier += .2;
                this.tweens.add({
                    targets: this.scoreText,
                    duration: 150,
                    repeat: 3,
                    alpha: 0,
                    yoyo: true
                });
                this.progressSound.play();
            }
        }
        this.spawnTime += deltaTime;
        if (this.spawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTime = 0;
        }

        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed * this.gameSpeedModifier);
        Phaser.Actions.IncX(this.clouds.getChildren(), -.5);

        const score = Array.from(String(this.score), Number);

        for (let i = 0; i < 5 - String(this.score).length; i++){
            score.unshift(0);
        }

        this.scoreText.setText(score.join(''));

        this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
           if (obstacle.getBounds().right < 0) {
               this.obstacles.remove(obstacle);
           }
        });

        this.clouds.getChildren().forEach((cloud: SpriteWithDynamicBody) => {
            if (cloud.getBounds().right < 0) {
                cloud.x = this.gameWidth + 30;
            }
        });

        this.ground.tilePositionX += (this.gameSpeed * this.gameSpeedModifier);
    }

    spawnObstacle(){
        const obstacleNum = Math.floor(Math.random() * PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount) + 1;
        const distance = Phaser.Math.Between(150,300);

        let obstacle;
        if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
            const enemyPosibleHeight = [20, 70];
            const enemyHeight = enemyPosibleHeight[Math.floor(Math.random() * 2)];
            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight - enemyHeight, `enemy-bird`);
            obstacle.play('enemy-bird-fly');
        } else {
            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight, `obstacle-${obstacleNum}`);
        }

        obstacle.setOrigin(0,1)
            .setImmovable();

    }

    private createObstacles() {
        this.obstacles = this.physics.add.group();
    }

    private createGameOverContainer() {
        this.gameOverText = this.add.image(0,0,'game-over');
        this.restartText = this.add.image(0,80,'restart').setInteractive();

        this.gameOverContainer = this.add.container(this.gameWidth / 2, (this.gameHeight / 2) - 50)
            .add([this.gameOverText, this.restartText])
            .setAlpha(0);
    }

    private handleGameStart() {
        this.startTrigger = this.physics.add.sprite(0,10,null)
            .setAlpha(0)
            .setOrigin(0,1);

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
                        this.clouds.setAlpha(1);
                        this.scoreText.setAlpha(1);
                        this.isGameRunning = true;
                    }
                },
                loop: true
            })
        });
    }

    private handleObstacleCollisions() {
        this.physics.add.collider(this.obstacles, this.player, () => {
            this.physics.pause();
            this.isGameRunning = false;
            this.anims.pauseAll();
            this.player.die();
            this.score = 0;

            const newHighScore = this.hightScoreText.text.substring(this.hightScoreText.text.length - 5);
            const newScore = Number(this.scoreText.text) > Number(newHighScore) ? this.scoreText.text: newHighScore;
            this.hightScoreText.setText('HI ' + newScore);
            this.hightScoreText.setAlpha(1);

            this.gameSpeedModifier = 1;
            this.gameOverContainer.setAlpha(1);
        });
    }

    private handleGameRestart() {
        this.restartText.on('pointerdown', ()=>{
            this.physics.resume();
            this.player.setVelocityY(0);
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.anims.resumeAll();
            this.isGameRunning = true;
            this.hightScoreText.setAlpha(0);
        });
    }

    private createAnimations() {
        this.anims.create({
            key: 'enemy-bird-fly',
            frames: this.anims.generateFrameNumbers('enemy-bird'),
            frameRate: 6,
            repeat: -1
        });
    }

    private createScore() {
        this.scoreText = this.add.text(this.gameWidth,0, '00000', {
            fontSize: 30,
            fontFamily: 'Arial',
            color: '#535353',
            resolution: 5
        }).setOrigin(1,0)
            .setAlpha(0);

        this.hightScoreText = this.add.text(this.gameWidth - this.scoreText.width - 20,0, '00000', {
            fontSize: 30,
            fontFamily: 'Arial',
            color: '#535353',
            resolution: 5
        }).setOrigin(1,0)
            .setAlpha(0);
    }
}

export default PlayScene;
