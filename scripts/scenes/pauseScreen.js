import * as CMP from "../components/components.js"

export class PauseScene extends Phaser.Scene{
  constructor(){
    super("pauseScene");
    this._debouncers = {
      canResume : true,
      canOpenSettings : true,
      canQuitGame : true
    }
  }

  init(){
    this.handleSceneEvents();
  }

  create(){
    // set light background overlay
    this.background = this.add.rectangle(0, 0, 360, 640, 0xc7ede2, 0.4).setOrigin(0);
    this.createUi();
  }

  update(){
    // console.log("run");
    if(this.ui.resume.isDown && this._debouncers.canResume){
      this.resumeGame();
    }else if(this.ui.settings.isDown && this._debouncers.canOpenSettings){
      this.openSettingsMenu();
    }else if(this.ui.quit.isDown && this._debouncers.canQuitGame){
      this.quitGame();
    }
  }

  // update Events
  resumeGame(){
    this._debouncers.canResume = false;
    this.scene.resume("gameStage", { from : this.scene.key });
  }
  openSettingsMenu(){
    this._debouncers.canOpenSettings = false;
    this.scene.run("settingsScene", { from : this.scene.key });
  }
  quitGame(){
    this._debouncers.canQuitGame = false;
    this.scene.run("mainMenuScene", { from : this.scene.key })
  }

  // Scene Event Handlers
  handleSceneEvents(){
    this.events.on("wake", this._wake, this);
    this.events.on("resume", this._ready, this);
  }
  _wake(sys, data){
    if(data.from == "gameStage"){
      this.scene.pause(data.from);
      setTimeout(
        () => {
          this._debouncers.canResume = true;
        }, 300
      )
    }else if(data.from == "settingsScene"){
      this.scene.sleep(data.from);
      setTimeout(
        () => {
          this._debouncers.canOpenSettings = true;
        }, 300
      )
    }

  }
  _ready(sys, data){
    console.log("started pause menu");
  }

  // Create Ui
  createUi(){
    this.ui = {
      resume : new CMP.Button(this, 180, 250, "button", 0, "resume", undefined),
      settings : new CMP.Button(this, 180, 320, "button", 0, "settings", undefined),
      quit : new CMP.Button(this, 180, 390, "button", 0, "quit", undefined)
    }
  }

}