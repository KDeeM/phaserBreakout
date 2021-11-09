import * as CMP from "../components/components.js"

export class SettingsScene extends Phaser.Scene{
  constructor(){
    super("settingsScene");
    this._debouncers = {
      canCloseSettings : true
    }
    this._returnScene;
  }

  init(){
    this.handleSceneEvents();
    this.gameData = CMP.dataFetcher();
  }

  create(){
    // set light background overlay
    this.background = this.add.rectangle(0, 0, 360, 640, 0xc7ede2, 0.4).setOrigin(0);
    this.backdrop = this.add.rectangle(180, 320, 250, 200, 0xff6400, 1);
    // create ui
    this.createUi();
  }

  update(){
    if(this.ui.close.isDown && this._debouncers.canCloseSettings){
      this._debouncers.canCloseSettings = false;
      this.closeSettingsMenu();
    }
  }

  // update Events
  closeSettingsMenu(){
    this.updateGameData();
    let data = { from : this.scene.key }
    if(this._returnScene == "mainMenuScene"){
      this.scene.resume(this._returnScene, data);
    }if(this._returnScene == "pauseScene"){
      this.scene.run(this._returnScene, data);
    }
  }
  updateGameData(){
    this.gameData.settings.sound.volume = this.ui.soundSlider.getPercent();
    CMP.updateData(this.gameData);
  }

  // Create Ui
  createUi(){
    let _currentVolume = this.gameData.settings.sound.volume;
    this.ui = {
      close : new CMP.Button(this, 325, 35, "ui", 0, undefined, undefined, {up : 0xffffff}),
      soundSlider : new CMP.Slider(this, 180, 320, 200, 10, 0x96e38f, 1),
      soundTitle : this.add.text(180, 300, "Sound Volume", {fill : "#fff", fontSize : "24px"}).setOrigin(0.5)
    }
    // setup slider settings
    this.ui.soundSlider.setPercent(_currentVolume);
    this.ui.soundSlider.onChange = this.volumeChange;

    // add text that shows the volume percentage
    this.ui.soundText = this.add.text(180, 340, _currentVolume, {fill : "#fff", fontSize : "18px"}).setOrigin(0.5);
  }

  // Scene Event Handlers
  handleSceneEvents(){
    this.events.on("wake", this._wake, this);
  }
  _wake(sys, data){
    this.scene.bringToTop("settingsScene");
    this._returnScene = data.from;
    if(data.from == "pauseScene"){
      this.scene.sleep(data.from);
      
    } else if(data.from == "mainMenuScene"){
      this.scene.pause(data.from);
    }
    setTimeout(
      () => {
        this._debouncers.canCloseSettings = true;
      }, 300
    )
  }

  // slider change events
  volumeChange(percent){
    this.ui.soundText.setText(percent);
  }

}