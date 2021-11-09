import * as CMP from "../components/components.js"

export class GameOverScene extends Phaser.Scene{
  constructor(){
    super("gameOverScene");
    this._debouncers = {
      canRestart : true,
      canQuitGame : true
    }
  }

  init(data){
    this.roundData = data;
    console.log(this.roundData);
  }

  create(){
    // set light background overlay
    this.background = this.add.rectangle(0, 0, 360, 640, 0xc7ede2, 0.4).setOrigin(0);
    this.createUi();
    this.scene.pause("gameStage");
  }

  update(){
    // console.log("run");
    if(this.ui.restart.isDown && this._debouncers.canRestart){
      this.restartGame();
    }else if(this.ui.quit.isDown && this._debouncers.canQuitGame){
      this.quitGame();
    }
  }

  // update Events
  restartGame(){
    this._debouncers.canRestart = false;
    this.scene.resume("gameStage", {from : this.scene.key});
    console.log("restart");
  }
  quitGame(){
    this._debouncers.canQuitGame = false;
    this.scene.run("mainMenuScene", { from : this.scene.key })
  }

  // Scene Event Handlers

  // Create Ui
  createUi(){
    let msg = "You Lost";
    if(this.roundData.gameWon){
      msg = "You Win";
    }
    this.ui = {
      playerMessage : this.add.text(180, 150, msg).setOrigin(0.5),
      playerScoreText : this.add.text(180, 200, this.roundData.playerScore, { fontSize : "72px" }).setOrigin(0.5),
      restart : new CMP.Button(this, 180, 260, "button", 0, "Try Again", undefined),
      quit : new CMP.Button(this, 180, 320, "button", 0, "Quit To Menu", undefined),
    }
  }

}