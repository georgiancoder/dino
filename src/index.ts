
import Phaser from "phaser";
import PreloadScene from "./scenes/preloadScene";
import PlayScene from "./scenes/playScene";

export const PRELOAD_CONFIG = {
  cactusesCount: 6
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 340,
  pixelArt: true,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },
  scene: [PreloadScene, PlayScene]
};

new Phaser.Game(config);