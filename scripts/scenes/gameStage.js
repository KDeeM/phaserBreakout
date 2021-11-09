import * as CMP from "../components/components.js"
import { GameOverScene } from "./gameOver.js";

export class GameStage extends Phaser.Scene{
  constructor(){
    super("gameStage");
    this._debouncers = {
      canPause : true
    }
    this._settings = {
      scrollBg : true,
      playerSpeed : 150,
      playerLife : 1
    }
    this.obj = this.text = this.vars = {};
  }

  init(data){
    if(data.fadeIn){
      this.fadeCameraIn()
    }
    this.handleSceneEvents();
    this.scene.sleep(data.from);

    this.gameData = CMP.dataFetcher();
  }

  create(){
    // create the background and sounds
    this.background = this.add.tileSprite(0, 0, 360, 640, "bg").setOrigin(0);
    this.sound = {
      collision : this.sound.add("collision").setVolume(this.gameData.settings.sound.volume / 100),
      bgMusic : this.sound.add("bgMusic").setVolume(0.1).setLoop(true)
    }

    // create paddle
    this.createPlayerPaddle();

    // create walls
    this.wallCreator();

    // create ball
    this.obj.ball = this.ballCreator();
    this.activeBallSettings();
    this.obj.ball.reset()

    // create ui and controls
    this.createUi();
    this.createControls();
    this.createScoreBoard();
    this.obj.healthbar = new CMP.HealthBar(this, undefined, undefined, "heart", this._settings.playerLife, {x : 150, y : 35});

    // tiles creation
    this.obj.levelManager = new CMP.TileManager(this.physics.world ,this, undefined, undefined, this.cache.json.get("levelData"));
    this.physics.add.collider(this.obj.ball, this.obj.levelManager, this.tileCollision, undefined, this);
    // from level data set new ball speed
    let maxSpeed = this.obj.levelManager.maxBallSpeed();
    this.obj.ball.setMaxSpeed(maxSpeed, maxSpeed);

    // final initialization
    this.sound.bgMusic.play()

    // tests and temporary
  }

  update(){
    this.motionControls();
    this.obj.ball.update();
    if(this._settings.scrollBg){
      this.backgroundScroll();
    }
    if(this.ui.pause.isDown && this._debouncers.canPause){
      this._debouncers.canPause = false;
      this.pauseGame();
    }
    this.obj.ball.update();
  }

  // general
  fadeCameraIn(){
    this.cameras.main.fadeFrom(1000, 18, 23, 23);
  }
  createPauseMenu(){
  }

  // update Events
  backgroundScroll(){
    this.background.tilePositionX += 0.2;
  }
  pauseGame(){
    this.sound.bgMusic.pause()
    this.scene.run("pauseScene", { from : this.scene.key });
    return;
  }
  settingsUpdates(){
    this.gameData = JSON.parse(window.localStorage.getItem("gameData"));
    // update any settings that might be influenced by the
  }
  motionControls(){
    // holds direction object for left and right state
    let dir = {
      r : false,
      l : false
    }

    if (this.ctrls.A.isDown || this.ctrls.LEFT.isDown || this.ui.left.isDown){
      dir.l = true;
    }
    if (this.ctrls.D.isDown || this.ctrls.RIGHT.isDown || this.ui.right.isDown){
      dir.r = true;
    }

    // motion logic for paddle
    if((dir.l && dir.r) || (!dir.l && !dir.r)){
      this.obj.paddle.setVelocityX(0);
    }else if(dir.l){
      this.obj.paddle.setVelocityX(-this._settings.playerSpeed);
    }else if(dir.r){
      this.obj.paddle.setVelocityX(this._settings.playerSpeed);
    }

    if(this.ui.launch.isDown || this.ctrls.SPACE.isDown){
      if(this.obj.ball.state == "idle"){
        this.obj.ball.setState("running");
        let x_direction = Phaser.Math.Between(-200, 200);
        this.obj.ball.shoot(x_direction, 200);
      }
    }
  }

  // creation functions
  createUi(){
    this.ui = {
      pause : new CMP.Button(this, 325, 35, "ui", 2, undefined, undefined, {up : 0xffffff}),
      left : new CMP.Button(this, 50, 590, "directions", 0, undefined, undefined, {up : 0xffffff}),
      right : new CMP.Button(this, 310, 590, "directions", 1, undefined, undefined, {up : 0xffffff}),
      launch : new CMP.Button(this, 180, 590, "button", 0, "Launch", undefined, {up : 0xffffff}),
    }
  }
  ballCreator(){
    return new CMP.Ball(this, 180, 480, "ball", undefined);
  }
  wallCreator(){
    let wallColor = 0x9bd1c5
    this.obj.walls = {
      upper : this.add.rectangle(0, 0, 360, 70, wallColor, .8).setOrigin(0),
      lower : this.add.rectangle(0, 640, 360, 100, wallColor, .8).setOrigin(0, 1),
    }
    this.physics.world.enableBody(this.obj.walls.upper, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.world.enableBody(this.obj.walls.lower, Phaser.Physics.Arcade.STATIC_BODY);
  }
  activeBallSettings(){
    this.obj.ball.setTargetDock(this.obj.paddle);
    this.obj.ball.shoot(0, -200);
    this.obj.ball.setMaxSpeed(200);
    this.physics.add.collider(this.obj.ball, this.obj.walls.upper);
    this.physics.add.collider(this.obj.ball, this.obj.walls.lower, this.playerTakeDamage, null, this);
    this.physics.add.collider(this.obj.ball, this.obj.paddle);
  }
  createPlayerPaddle(){
    this.obj.paddle = this.physics.add.sprite(180, 520, "paddle", 0).setCollideWorldBounds(true).setImmovable();
    // add padle animation and play it
    this.anims.create({
      key : "paddle_buzz",
      frames : "paddle",
      frameRate : 10,
      repeat : -1,
    })
    this.obj.paddle.anims.play("paddle_buzz");
    this.obj.paddle.setData("lives", this._settings.playerLife);
  }
  createControls(){
    this.ctrls = this.input.keyboard.addKeys('A,D,RIGHT,LEFT,SPACE,BACKSPACE')
  }
  createScoreBoard(){
    this.vars.playerScore = 0;
    this.text.score = this.add.text(10, 35, "Score : 0", {fill : "#000"}).setOrigin(0, 0.5);
  }
  createGameOverScene(playerWon = false){
    let data = {
      playerScore : this.vars.playerScore,
      gameWon : playerWon
    }
    this.scene.add("gameOverScene", GameOverScene, false);
    this.scene.run("gameOverScene", data);
  }

  // collision handlers
  tileCollision(ball, tile){
    this.sound.collision.play();
    if(!tile.takeDamage(ball.attackDamage())){
      // if it returns false / dead add point
      this.vars.playerScore += tile.getValue();
      this.text.score.setText(`Score : ${this.vars.playerScore}`);
    }
    if(this.obj.levelManager.countActive() == 0){
      console.log("level complete");
      ball.reset();
      if(this.obj.levelManager.moveToNextLevel()){
        this.createGameOverScene(true);
      }else{
        let maxSpeed = this.obj.levelManager.maxBallSpeed();
        this.obj.ball.setMaxSpeed(maxSpeed, maxSpeed);
      }
    }
  }
  playerTakeDamage(ball, wall){
    this.obj.healthbar.takeDamage();
    if((this.obj.paddle.data.values.lives -= 1) <= 0){
      console.log("you lose");
      this.physics.pause();
      this.createGameOverScene();
    }else{
      ball.reset();
    }   
  }

  // Scene Event Handlers
  handleSceneEvents(){
    this.events.on("resume", this._resume, this);
    this.events.on("destroy", this._destroy, this);
    this.events.on("wake", this._wake, this);
    this.events.on("restart", this._restart, this);
  }
  _resume(sys, data){
    this.settingsUpdates();
    this.scene.sleep("pauseScene");
    setTimeout(
      () => {
        this._debouncers.canPause = true;
      }, 300
    )
    if(data.from == "pauseScene"){
      this.sound.bgMusic.resume();
      this.gameData = CMP.dataFetcher();
      this.sound.collision.setVolume(this.gameData.settings.sound.volume / 100);
    }

    if(data.from == "gameOverScene"){
      this.sound.bgMusic.play();
      this.scene.remove("gameOverScene");
      this.scene.restart();
    }
  }
  _destroy(){
    console.log("add destroy code here");
  }
  _wake(sys, data){
    if(data.from == "mainMenuScene"){
      this.scene.sleep(data.from);
    }
  }
  _restart(sys, data){
    console.log("restarted");
    console.log(data);
  }
}