import {GameScene} from "../scenes/gameScene";

export class Player extends Phaser.Physics.Arcade.Sprite {

    scene: GameScene;
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'dino-run');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.init();

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    init(){
        this
            .setOrigin(0,1)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setBodySize(44, 92);

        this.registerAnimations();
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
    }

    update(){
        const { space } = this.cursorKeys;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);

        const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();

        if (isSpaceJustDown && onFloor){
            this.setVelocityY(-1600);
        }

        if (!this.scene.isGameRunning){
            return;
        }

        if (this.y < Number(this.scene.game.config.height)){
            this.anims.stop();
            this.setTexture('dino-run', 0);
        } else {
            this.playRunAnimations();
        }
    }

    playRunAnimations(){
        this.play('dino-run', true);
    }
    registerAnimations(){
        this.anims.create({
            key: 'dino-run',
            frames: this.anims.generateFrameNumbers('dino-run', {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1
        })
    }

    die(){
        this.anims.pause();
        this.setTexture('dino-hurt');
    }

}
