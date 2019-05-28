class Entity extends Phaser.GameObjects.Sprite {     //Inherit Entity class to Phaser.GameObjects.Sprite
	constructor(scene, x, y, key) {					// constructor function to instantiate an sprite object
		super(scene, x, y, key);					 // call super class constructor
		this.scene.add.existing(this);				 //add Entity to this scene
		this.scene.physics.world.enableBody(this, 0);//enableBody on this scene in physics world
	}
}

class Background extends Entity {                    //Inherit Background class to Entity
	constructor(scene, x, y) {					     // constructor function to instantiate a background object
		super(scene, x, y, "backgroundstars");	     // call super class constructor
		this.setOrigin(0.5);					     //set origin of image to center of itself
		this.setScale(2);					        //set image scale
		this.setDepth(-5);					        //set image depth so underneath all other images
	}
}

class Player extends Phaser.Physics.Arcade.Sprite {  //Inherit Player class to Phaser.Physics.Arcade.Sprite
	constructor(scene, x, y) {					     // constructor function to instantiate a player object
		super(scene, x, y, "playerShip");		     // call super class constructor
		scene.add.existing(this);						 //add Player to this scene 
		scene.physics.add.existing(this);				 //add existing game objects to the physics world
		this.setCollideWorldBounds(true);				 //set collide world bounds to true
		this.setOrigin(0.5, 0.05);						//set origin position of player to top center
		this.setScale(0.45);
	}
}

class PlayerLaser extends Entity {                   //Inherit PlayerLaser class to Entity
	constructor(scene, x, y) {					     // constructor function to instantiate a player laser object
		super(scene, x, y, "sprLaserPlayer");		// call super class constructor
		this.setScale(1.5);							//set scale
	}
}

class Explosion extends Entity {                   //Inherit Explosion class to Entity
	constructor(scene, x, y) {					     // constructor function to instantiate an explosion object
		super(scene, x, y, "sprExplosion");				// call super class constructor
		this.play("sprExplosion");					//play explosion sound when created
		this.setOrigin(0.5);						//sets the origin of the explosion to center of event
		this.setScale(0.1);							//set scale of the explosion for a smaller image	
		this.on("animationcomplete", function () { //when animation complete
			if (this) {
				this.destroy();                    //destroy object
			}
		});
	}
}

class Enemy extends Entity {                   //Inherit Enemy class to Entity
	constructor(scene, x, y, key) {					     // constructor function to instantiate an enemy object
		super(scene, x, y, key);				// call super class constructor
		this.setOrigin(0.5);		           //set origin of enemy to center
	}
}

class ShieldTile extends Entity {                   //Inherit ShieldTile class to Entity
	constructor(scene, x, y) {					     // constructor function to instantiate a shieldtile object
		super(scene, x, y, "sprShieldTile");				// call super class constructor
		this.setOrigin(0); 	//set origin of sheildTile to center
		this.setScale(4);  //set scale of the sheild tile larger for greater size of sheild with more pixels
		this.setDepth(-4); //set the depth of the image allowing the explosion to affect finer pixelling fo sheildTiles
	}
}