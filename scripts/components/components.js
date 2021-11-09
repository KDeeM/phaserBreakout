export class Button extends Phaser.GameObjects.Image{
  constructor(scene, x, y, texture, frame, text = "", textOptions = { fill : "18px", fill : "#000"}, tint = { up : 0x96e38f, down : 0x467d41, hover : 0xcaedc7}){
    super(scene, x, y, texture, frame, text, textOptions);
    scene.add.existing(this);
    if ( text != ""){
      this.addText(text, textOptions);
    }
    this.tints = tint;
    this.setTint(this.tints.up);

    this.setInteractive()
      .on("pointerdown", this.pointerDown, this)
      .on("pointerover", this.hover, this)
    this.isDown = false;
    this.canClick = true;
  }

  // click events
  pointerDown(){
    if(this.canClick){
      this.isDown = true;
      this.setTint(this.tints.down);
      // if player moves off button or lets go of button isDown becomes false
      // lifts button
      this.on("pointerup", this.pointerUp, this);

      // moves away from button
      this.on("pointerout", this.pointerOut, this)
    }
  }
  pointerUp(){
    this.isDown = false;
    this.setTint(this.tints.up);
    this.buttonPressCooldown();
    this.off("pointerup", this.pointerUp, this);
    this.off("pointerout", this.pointerOut, this)
  }
  pointerOut(){
    this.isDown = false;
    this.setTint(this.tints.up);
    this.buttonPressCooldown();
    this.off("pointerout", this.pointerOut, this)
    this.off("pointerup", this.pointerUp, this);
  }

  // button hover effect
  hover(){
    this.setScale(1.05);
    this.setTint(this.tints.hover);
    // if the mouse moves away from the button;
    this.on("pointerout", this.hoverOff, this);
  }
  hoverOff(){
    this.setScale(1);
    this.setTint(this.tints.up);
    this.off("pointerout", this.hoverOff, this);
  }

  // button press delay
  buttonPressCooldown(){
    this.canClick = false;
    this.scene.time.delayedCall(
      100,
      function(){
        this.canClick = true;
      },
      undefined,
      this
    )
  }

  // button text
  addText(text, textOptions = {}){
    this.btnText = this.scene.add.text(this.x, this.y, text, textOptions).setOrigin(0.5);
    return;
  }
  setText(text){
    this.btnText.setText(text);
    return;
  }
}

export class Tile extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame = 0, type = 0){
    super(scene, x, y, texture, frame, type);
    this._classData = {
      tileFormats : ["soft", "medium", "hard"]
    }
    this._data = {}
    this.setTo(type);
    this.init(scene);
    // console.log(this.getData("typeIndex"));
  }
  
  init(scene){
    scene.physics.world.enableBody(this, Phaser.Physics.Arcade.STATIC_BODY);
    scene.add.existing(this);
  }

  setTo(type){
    this.setFrame(0);
    this._data.health = type + 1;
    this.setData({
      typeIndex : type,
      type : this._classData.tileFormats[type],
      value : (type + 1) * 2
    })
    this.setColor();
  }

  place(x, y){
    this.setPosition(x, y)
  }

  getValue(){
    return this.getData("value");
  }

  takeDamage(damage = 1){
    this._data.health -= damage;
    switch(this.getData("type")){
      case(this._classData.tileFormats[1]) :
        switch (this._data.health){
          case (1):
            this.setFrame(1);
            break;
        }
        break;
      case(this._classData.tileFormats[2]) :
        switch (this._data.health){
          case (1):
            this.setFrame(2);
            break;
          case (2):
            this.setFrame(1);
            break;
        }
        break;
      default :
    }

    if(this._data.health <= 0){
      this.die();
      return false;
    }

    return true;
  }

  // changes the type of tile
  resetTile(x, y, type){
    this.setTo(type);
    this.enableBody(true, x, y, true, true);
  }

  setColor(){
    switch(this.getData("typeIndex")){
      case (1) :
        this.setTint(0xe8f55d);
        break
      case (2) :
        this.setTint(0xfaad5a);
        break;
      default :
        this.setTint(0x75e6af);
    }
  }

  die(){
    this.disableBody(true, true);
    return true;
  }
}

export class TileManager extends Phaser.Physics.Arcade.StaticGroup{
  constructor(world, scene, children, config, levelData){
    super(world, scene, children, config, levelData);
    this.init(scene);
    this.initiateLevels(levelData);
    this.buildLevel(this.data.currentLevelIndex);
  }

  init(scene){
    scene.add.existing(this);
    this.data = {};
  }

  createTile(x, y, type){
    this.add(new Tile(this.scene, x, y, "brick", undefined, type));
  }

  buildLevel(level){
    // iterate through level data
    this.data.currentLevelBallSpeed = this.data.levelData[this.data.levelKeys[level]].maxVelocity;
    let newLevel = this.data.levelData[this.data.levelKeys[level]].tiles;
    for(let i = 0; i < newLevel.length; i++){
      // check for any existing dead members
      let tile = this.getFirstDead();
      if(tile == null){
        this.createTile(newLevel[i][0], newLevel[i][1], newLevel[i][2]);
      }else{
        tile.resetTile(newLevel[i][0], newLevel[i][1], newLevel[i][2]);
      }
    }
  }

  getLevel(){
    return this.data.currentLevelIndex;
  }

  initiateLevels(data){
    this.data.levelData = data;
    this.data.levelKeys = Object.keys(data)
    this.data.numberOfLevels = this.data.levelKeys.length;
    this.data.currentLevelIndex = 0
  }

  moveToNextLevel(){
    if ((this.data.currentLevelIndex + 1) == this.data.numberOfLevels){
      return true;
    }

    if(this.data.currentLevelIndex < 0 || this.data.currentLevelIndex >= this.data.numberOfLevels){
      this.data.currentLevelIndex = 0;
    }else if(this.data.currentLevelIndex >= 0 && this.data.currentLevelIndex < this.data.numberOfLevels - 1){
      this.data.currentLevelIndex += 1;
    }

    this.buildLevel(this.data.currentLevelIndex);
    console.log(this.data.currentLevelIndex);
    return false;
  }

  maxBallSpeed(){
    return this.data.currentLevelBallSpeed;
  }
}

export class HealthBar extends Phaser.GameObjects.Group{
  constructor(scene, children, config, texture, life  = 3, startposition = {x : 35, y : 35}){
    super(scene, children, config, texture, life, startposition);
    this.init(scene);
    this.data = {}
    this.data.texture = texture;
    this.data.fullHealth = this.data.myLife = life;
    // this.add(this.createHealthBar());
    this.data.startPosition = startposition;
    this.data.heartState = ["ALIVE", "DEAD"];
    this.generateHealthbar();
  }

  init(scene){
    scene.add.existing(this);
  }

  createHealthPoint(x = 35, y = 35){
    let life = new Phaser.GameObjects.Image(this.scene, x, y, this.data.texture).setTint(0xee2211);
    life.setState(this.data.heartState[0]);
    this.scene.add.existing(life);
    return life;
  }

  generateHealthbar(){
    let count = 0
    let heart = this.createHealthPoint(this.data.startPosition.x, this.data.startPosition.y);
    this.data.healthPointWidth = heart.width;
    this.data.healthPointSpacing = 2
    let pointX = heart.x
    let increment = this.data.healthPointWidth + this.data.healthPointSpacing;
    this.add(heart);
    count++;
    while(count < this.data.fullHealth){
      pointX += increment;
      let heart = this.createHealthPoint(pointX, this.data.startPosition.y);
      this.add(heart);
      count++;
    }
  }

  takeDamage(){
    this.myLife--;
    let activeLives = this.getMatching("state", this.data.heartState[0])
    if(activeLives.length > 0){
      let lastHealthPoint = activeLives.pop();
      lastHealthPoint.clearTint().setState(this.data.heartState[1]);
    }
  }

}

export class Slider extends Phaser.GameObjects.Rectangle{
  constructor(scene, x, y, width, height, fillColor, fillAlpha, DialOptions = {fillColor : 0x467d41}, highlightColor = 0x1a2e28){
    super(scene, x, y, width, height, fillColor, fillAlpha, DialOptions, highlightColor);
    this.setOrigin(0.5);
    this.dialSettings = DialOptions;
    this.highlight = highlightColor;

    this.init(scene);
    this.addHighlight(scene);
    this.createDial(scene);
    this.setDialPosition();
    this.updateHighlight();
  }

  init(scene){
    scene.add.existing(this);
    this.setFillStyle(this.fillColor, 1);
  }

  addHighlight(){
    this.sliderHighlight = this.scene.add.rectangle(this.x - this.width / 2, this.y, 10, this.height, this.highlight, 1).setOrigin(0, 0.5);
    return;
  }

  updateHighlight(){
    let newWidth = this.dial.x - this.dial._vars.bounds.startX;
    this.sliderHighlight.setDisplaySize(newWidth, this.height);
    return;
  }

  createDial(scene){
    this.dial = scene.add.ellipse(this.x, this.y , this.height * 2, this.height * 2, this.dialSettings.fillColor);
    this.dial._vars = {
      bounds : {
        startX : this.x - this.width / 2,
        endX : this.x + this.width / 2
      },
      limiters : {
        canMove : true
      },
      percent : 25
    }
    this.dial.movePointer = () => {
      // console.log(this);
      let movePointer = true;
      let moveSlider = (pointer) => {
        if(this.dial._vars.limiters.canMove){
          if(pointer.x >= this.dial._vars.bounds.startX && pointer.x <= this.dial._vars.bounds.endX){
            this.dial.setPosition(pointer.x, this.dial.y);
            this.dial._vars.percent = this._getPercent();
          }else if(pointer.x < this.dial._vars.bounds.startX){
            this.dial.setPosition(this.dial._vars.bounds.startX, this.dial.y);
            this.dial._vars.percent = 0
          }else if(pointer.x > this.dial._vars.bounds.endX){
            this.dial.setPosition(this.dial._vars.bounds.endX, this.dial.y);
            this.dial._vars.percent = 100
          }
          this.updateHighlight();
          // this.onChange(this.dial._vars.percent);
          this.onChange.call(this.scene, this.dial._vars.percent);
          this.dial._vars.limiters.canMove = false;
          setTimeout(
            () => {this.dial._vars.limiters.canMove = true;},
            100
          )
        }                          
      }
      this.scene.input.on("pointermove", moveSlider)
      let cancelMotion = () => {
        movePointer = false;
        this.scene.input.off("pointermove", moveSlider);
        this.scene.input.off("pointerup", cancelMotion);
      }    
      this.scene.input.on("pointerup", cancelMotion)
    }

    this.dial.setInteractive()
      .on("pointerdown", this.dial.movePointer)
  }

  tester(){
    console.log(this.dialSettings);
  }

  setPercent(val){
    this.dial._vars.percent = val;
    this.setDialPosition();
    this.updateHighlight();
  }
  _getPercent(){
    let percent = Math.round(
      ((this.dial.x - this.dial._vars.bounds.startX)
      / (this.dial._vars.bounds.endX - this.dial._vars.bounds.startX))
      * 100
    );
    return percent;
  }
  getPercent(){
    return this.dial._vars.percent;
  }

  setDialPosition(){
    let distance = this.dial._vars.bounds.endX - this.dial._vars.bounds.startX;
    let displacement = (this.dial._vars.percent / 100) * distance;
    let dialX = this.dial._vars.bounds.startX + displacement;
    this.dial.setPosition(dialX, this.dial.y);
  }

  onChange(percent){
    console.log(percent);
  }
  
}

export function dataFetcher(){
  if(window.localStorage.getItem("gameData") === null){
    // create object to save default game settings
    let gameData = {
      settings : {
        sound : {
          volume : 50
        }
      }
    }
    window.localStorage.setItem("gameData", JSON.stringify(gameData));
    return JSON.stringify(gameData);
  }
  return JSON.parse(window.localStorage.getItem("gameData"));
}

export function updateData(obj){
  return window.localStorage.setItem("gameData", JSON.stringify(obj));
}

export class Ball extends Phaser.Physics.Arcade.Image{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    this.init(scene);
    this.setState("idle");
    this._data = {
      limits : {
        minVelocityX : 80,
        minVelocityY : 80,
      },
      debouncers : {
        canAdjustSpeed : true
      },
      vel : { x : 100, y : 100},
      attackDamage : 1
    }
  }

  attackDamage(){
    return this._data.attackDamage;
  }

  init(scene){
    scene.physics.world.enableBody(this);
    scene.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(1)
    this.body.setCircle(12);
  }

  shoot(x = this._data.vel.x, y = this._data.vel.y){
    this.setState("running");
    this.body.setVelocity(x, y);
  }

  setTargetDock(obj){
    this._data.dock = {
      target : obj,
      canFollow : true
    }
  }

  setMaxSpeed(speed){
    this.setMaxVelocity(speed, speed);
  }

  placeOn(obj){
    let x = obj.x;
    let y = obj.y - obj.height / 2 - this.height / 2;
    this.setPosition(x, y);
  }

  reset(){
    this.body.stop();
    this.setState("idle");
  }

  update(){
    if(this.state == "idle"){
      if(this._data.dock.canFollow){
        this._data.dock.canFollow = false;
        this.placeOn(this._data.dock.target);
        this.scene.time.delayedCall(
          25,
          function(){
            this._data.dock.canFollow = true;
          },
          undefined,
          this
        )
      }
    }

    if(this.state == "running" && (this.body.onWall() || this.body.onCeiling() || this.body.onFloor())){
      this.adjustSpeed();
    }
  }

  pause(){
    this._data.vel = {
      x : this.body.velocity.x,
      y : this.body.velocity.y
    }
    this.setState("paused");
    this.body.stop();
  }

  resume(){
    this.setState("running");
    this.body.setVelocity(this._data.vel.x, this._data.vel.y);
  }

  adjustSpeed(){
    // adjust X velocity
    if(this._data.debouncers.canAdjustSpeed){
      let vel = {
        x : this.body.velocity.x,
        y : this.body.velocity.y
      }
      if(vel.y > -this._data.limits.minVelocityY && vel.y < this._data.limits.minVelocityY){
        // add to the speed
        if(vel.y == 0){
          vel.y += 2
        }else if(vel.y < 50){
          vel.y = vel.y + (vel.y * 0.8)
        }else{
          vel.y = vel.y + (vel.y * 0.15)
        }
        this.body.setVelocityY(vel.y);
      }
      if(vel.x > -this._data.limits.minVelocityX && vel.x < this._data.limits.minVelocityX){
        // add to the speed
        if(vel.x == 0){
          vel.x += 2
        }else if(vel.x < 50){
          vel.x = vel.x + (vel.x * 0.8)
        }else{
          vel.x = vel.x + (vel.x * 0.15)
        }
        this.body.setVelocityX(vel.x);
      }

      this._data.debouncers.canAdjustSpeed = false;
      this.scene.time.delayedCall(
        2500,
        function(){
          this._data.debouncers.canAdjustSpeed = true;
        },
        undefined,
        this
      )
    }
  }
}