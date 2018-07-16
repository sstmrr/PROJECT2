var xhr = new XMLHttpRequest (); 
ххр . open ( «GET» , «https://api.example.com/data.json» , true ); 
ххр . onreadystatechange = function () { if ( xhr . readyState == 4 ) { 
    документ . getElementById ( "resp" ). innerText = xhr . responseText ;      
     
    
  } } 
xhr . отправить ();

window.onload = function () {
    let game = new Phaser.Game(1000, 600, Phaser.AUTO, 'game');
};


function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(1, 1);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.animations.add('stop',[0]);
     this.animations.add('run',[2,3,4,5,2],8,true);
     this.animations.add('jump',[6]);
     this.animations.add('fall',[7]);
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    const SPEED = 200;
    this.body.velocity.x = direction*SPEED;
    
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    this.body.velocity.y = -JUMP_SPEED;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

PlayState = {};

PlayState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });
    
    this.keys.up.onDown.add(function () {
        let canJump = this.hero.jump();
        if (canJump) {
            this.sfx.jump.play();
        }
    }, this);
    
    this.coinPickupCount = 0;
};


PlayState.preload = function () {
    this.game.load.image('background', 'images/back1.png');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.image('Ground','images/Ground.png');
    this.game.load.image('Platform1', 'images/Platform.png');
    this.game.load.image('Platform2', 'images/Platform2.png');
    this.game.load.image('Platform3', 'images/Platform3.png');
    
    this.game.load.spritesheet('hero', 'images/Spritesmall.png', 111, 130);
    
    this.game.load.spritesheet('coin', 'images/Coins.png', 35, 35);
    
   this.game.load.audio('sfx:jump', 'audio/jump.wav');    
   this.game.load.audio('sfx:coin', 'audio/coin.wav');
};

PlayState.create = function () {
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
    };
    
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
};


PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1.5);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1.5);
    }
    else {this.hero.move(0);}
};

PlayState._loadLevel = function (data){
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    
    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero});
    
    data.coins.forEach(this._spawnCoin, this);
    
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
};

PlayState._spawnCharacters = function (data) {
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};


PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.7);
//    sprite.animation.add('rotate',[0, 1, 2], 6, true);
//    sprite.animation.play('rotate');
     this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};


window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};
