import { PreloaderScene } from "./scenes/preloader.js";

class Game extends Phaser.Game{
  constructor(config){
    super(config);
    this.scene.add("preloaderScene", PreloaderScene);
    this.scene.start("preloaderScene");
  }
}

function init(){
  let gameConfig = {
    width : 360,
    height : 640,
    type : Phaser.AUTO,
    physics : {
      default : "arcade",
      arcade : {
//         debug : true
      }
    },
    scale : {
      mode : Phaser.Scale.FIT,
      autoCenter : Phaser.Scale.CENTER_BOTH
    },
    backgroundColor : 0x121717
  }
  let breakout = new Game(gameConfig);
}

window.addEventListener(
  "load", init
)
