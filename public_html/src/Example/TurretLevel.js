/*
 * File: MyGame.js
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true, white: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  Renderable, TextureRenderable, FontRenderable, SpriteRenderable, LightRenderable, IllumRenderable,
  GameObject, TiledGameObject, ParallaxGameObject, Hero, Minion, Dye, Light */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function TurretLevel() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kMinionSpriteNormal = "assets/minion_sprite_normal.png";
    this.kBg = "assets/bg.png";
    this.kTurret = "assets/turret.png";
    
    this.mCamera = null;
    
    this.turret = null;
    this.wall = null;
    this.raycast = null;
    this.player = null;
    
    this.raycastBound = null;
    this.raycastHitting = false;
}

gEngine.Core.inheritPrototype(TurretLevel, Scene);

TurretLevel.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kBg);
    gEngine.Textures.loadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.loadTexture(this.kTurret);
};

TurretLevel.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
    gEngine.Textures.unloadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.unloadTexture(this.kTurret);
};

TurretLevel.prototype.initialize = function () {

    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 1280, 720]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray
    
    this.player = new Hero(this.kMinionSprite, this.kMinionSpriteNormal, 10, 20);
    this.wall = new Renderable();
    this.wall.getXform().setPosition(50, 30);
    this.wall.getXform().setSize(7.5, 7.5);
    this.wall.setColor([0, 0, 1, 1]);
    
    this.turret = new SpriteRenderable(this.kTurret);
    this.turret.getXform().setPosition(90, 20);
    this.turret.getXform().setSize(6, 6);
    
    this.raycast = new Raycast(this.turret.getXform().getPosition(), this.player.getXform().getPosition());
    this.raycastBound = new BoundingRaycastBox([50, 30], 3, 30);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
TurretLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    this.player.draw(this.mCamera);
    this.raycastBound.draw(this.mCamera);
    this.wall.draw(this.mCamera);
    this.turret.draw(this.mCamera);
    if (this.raycastHitting) {
        this.raycast.setRayColor([1, 0, 0, 1]);
    } else {
        this.raycast.setRayColor([0, 1, 0, 1]);
    }
    this.raycast.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
TurretLevel.prototype.update = function () {
    this.player.update();
    this.lookAt(this.player.getXform(), this.turret.getXform());
    this.turret.update();
    this.raycastBound.update();
    this.raycastHitting = this.raycastBound.checkIntersection(this.raycast);
    this.raycast.setEndPoint(this.player.getXform().getPosition());
    this.raycast.update();
};

TurretLevel.prototype.lookAt = function(target, looker) {
    var tarX = target.getXPos();
    var tarY = target.getYPos();
    var lookX = looker.getXPos();
    var lookY = looker.getYPos();
    var nCur = [0, 1];
    var nTarX = (tarX - lookX);
    var nTarY = (tarY - lookY);
    var magnitude = Math.sqrt((nTarX * nTarX) + (nTarY * nTarY));
    var nTar = [nTarX / magnitude, nTarY / magnitude];
    var dot = this.dotProduct(nCur, nTar);
    var angle = Math.acos(dot);
    looker.setRotationInRad(angle);
};

TurretLevel.prototype.dotProduct = function(vec1, vec2) {
    var dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
    return dot(vec1, vec2);
};