import { MainMenuScene } from "./mainMenu.js";
import { dataFetcher } from "../components/components.js";

export class PreloaderScene extends Phaser.Scene{
  constructor(){
    super("preloaderScene");
  }

  preload(){
    let rel = "/"
    this.createLoadingScreen();
    this.load.image("bg", rel + "images/stageBackground.jpg");
    this.load.image("logo", rel + "images/logo.png");
    this.load.image("button", rel + "images/ui/button.png");
    this.load.image("ball", rel + "images/ball.png");
    this.load.image("heart", rel + "images/heart.png");

    this.load.spritesheet("paddle", rel + "images/paddle.png", {frameWidth : 72, frameHeight : 19});
    this.load.spritesheet("directions", rel + "images/ui/directions.png", {frameWidth : 60, frameHeight : 60});
    this.load.spritesheet("ui", rel + "images/ui/ui.png", {frameWidth : 48, frameHeight : 48});
    this.load.spritesheet("brick", rel + "images/tile_6.png", {frameWidth : 53, frameHeight : 18});

    this.load.json("levelData", rel + "data/levelData.json");
  
    this.load.audio("collision", [rel + "audio/boop.mp3", rel + "audio/boop.ogg"])
    this.load.audio("bgMusic", [rel + "audio/bg_music.mp3", rel + "audio/bg_music.ogg"]);

    // this.load.on("complete", this.goToNextScene, this);
    this.load.on("complete", this.loadCompleted, this);
  }

  create(){
    // if(window.localStorage.getItem("gameData") === null){
    //   this.createGameSettings();
    // }

    dataFetcher();
  }

  // create loading animation
  createLoadingScreen(){
    this._loading = {
      text : this.add.text(180, 320, "Loading", { fill : "#ffffff", fontSize : "18px" }).setOrigin(0.5),
      ball : this.add.ellipse(180, 300, 20, 20, 0xffffff, 1).setOrigin(0.5, 1),
      ballTl : this.tweens.createTimeline({
        yoyo : true
      })
    }

    this._loading.ballTl.add({
      targets : this._loading.ball,
      scaleY : 0.75,
      scaleX : 1.25,
      yoyo : true,
      duration : 250
    })

    this._loading.ballTl.add({
      targets : this._loading.ball,
      y : this._loading.ball.y - 50,
      scaleY : 1.25,
      scaleX : 0.75,
      ease : "Quad.easeOut",
      duration : 350,
      hold : 100,
      yoyo : true,
    })

    this._loading.ballTl.loop = -1;
    this._loading.ballTl.play();
  }

  // load assets


  // complete asset loading
  loadCompleted(){
    // add next scene
    this.scene.add("mainMenuScene", MainMenuScene);

    // add the logo image
    this._loading.logo = this.add.image(180, 320, "logo").setAlpha(0);
    this._loading.logoFade = this.tweens.add({
      targets : this._loading.logo,
      alpha : 1,
      duration : 1500,
      yoyo : true,
      hold : 500,
      paused : true,
      onComplete : this.goToNextScene,
      onCompleteScope : this
    })

    // fade out the loading animation
    let fadeOut = this.tweens.add({
      targets : [this._loading.text, this._loading.ball],
      alpha : 0,
      delay : 1000,
      onComplete : function (){
        this._loading.ballTl.stop();
        this._loading.logoFade.play();
      },
      onCompleteScope : this,
      onCompleteDelay : 500
    })
  }

  // go to next scene
  goToNextScene(){
    this.time.delayedCall(
      500,
      function(){
        this.scene.start("mainMenuScene", {fadeIn : true});
        this.scene.remove("preloaderScene");
      },
      null,
      this
    )

    // *********** ORIGINAL CODE ************
    // this.scene.start("mainMenuScene", {fadeIn : true});
    // this.scene.remove("preloaderScene");
  }

}
