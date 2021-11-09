import * as CMP from "../components/components.js"
import { GameStage } from "./gameStage.js";
import { SettingsScene } from "./settings.js";
import { PauseScene } from "./pauseScreen.js";

export class MainMenuScene extends Phaser.Scene{
  constructor(){
    super("mainMenuScene");
    this._existingScenes = {
      stage : false,
      settings : false,
      highScore : false
    }
    this._debouncers = {
      startGame : true,
      canOpenSettings : true
    }
  }

  init(data){
    if(data.fadeIn){
      this.fadeCameraIn()
    }
    this.scene.add("settingsScene", SettingsScene, true);
    this.scene.sleep("settingsScene");
    this.handleSceneEvents();
  }

  create(){
    // create the background
    this.background = this.add.image(0, 0, "bg").setOrigin(0);

    // add ui buttons
    this.createUi();
  }

  update(){
    //move background
    this.background.tilePositionX += 0.25;
    this.uiButtonPresses();
  }

  // general
  fadeCameraIn(){
    this.cameras.main.fadeFrom(1000, 18, 23, 23);
  }
  createGameScene(){
    this.scene.add("gameStage", GameStage, false);
    // this.scene.sleep("gameStage");
    this.scene.add("pauseScene", PauseScene, false);
    this.scene.bringToTop();
    this.scene.run("pauseScene");
    this.scene.sleep("pauseScene");
  }
  createUi(){
    this.ui = {
      settings : new CMP.Button(this, 325, 35, "ui", 1, undefined, undefined, {up : 0xffffff}),
      start : new CMP.Button(this, 180, 300, "button", null, "Start Game")
    }
  }

  // controlActions
  uiButtonPresses(){
    if(this.ui.start.isDown && this._debouncers.startGame){
      if (!this._existingScenes.stage){
        this._existingScenes.stage = true
        this.createGameScene();
      }
      this.switchToStageScene();
    }else if(this.ui.settings.isDown && this._debouncers.canOpenSettings){
      this.openSettingsMenu();
    }
  }

  // update Events
  switchToStageScene(){
    // add stage and pause main menu, send main menu to back of the queue
    this._debouncers.startGame = false;
    this.time.delayedCall(
      20,
      function(){ this.scene.run("gameStage", { from : this.scene.key }); },
      undefined,
      this
    )
    // this.scene.run("gameStage", { from : this.scene.key });
  }
  openSettingsMenu(){
    this._debouncers.canOpenSettings = false;
    this.scene.run("settingsScene", { from : this.scene.key });
  }

  // Scene Event Handlers
  handleSceneEvents(){
    this.events.on("resume", this._resume, this);
    this.events.on("wake", this._wake, this);
  }
  _resume(sys, data){
    console.log("main menu now resuming");
    if(data.from == "settingsScene"){
      this.scene.sleep(data.from);
      setTimeout(
        () => {
          this._debouncers.canOpenSettings = true;
        }, 300
      )
    }
  }
  _wake(sys, data){
    if(data.from == "pauseScene"){
      this.scene.remove("gameStage");
      this._existingScenes.stage = false;
      setTimeout(
        () => {
          this._debouncers.startGame = true;
        }, 300
      )
    }
    if(data.from == "gameOverScene"){
      this.scene.remove("pauseScene");
      this.scene.remove("gameStage");
      this._existingScenes.stage = false;
      setTimeout(
        () => {
          this._debouncers.startGame = true;
        }, 300
      )
    }
    this.scene.remove(data.from);
  }


}