class Level1 extends Phaser.Scene { //creates a scene in the Phaser Object called Level1, to be referenced in game.js
    constructor() { //call constructor method on the game object to create an instance of scene 
        super({ key: "Level1" }); //on the game object create a property of scene and set key to Level1, used in config parameters for game
    }

    //preload function to load all assets
    preload() {
        this.load.image("backgroundstars", "assets/images/darkstars.jpg") //preload background stars image
        this.load.image("playerShip", "assets/images/starship.png"); //preload player image to the game, assign key name and src
        this.load.spritesheet("enemyShip", "assets/images/Alien-Destroyer-withexhaust-3frame.png", { //preload enemyShip spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 121, //set the full width of each frame (image width / frameWidth as we have multiple on x axis) to be used
            frameHeight: 318 //set the full height of each frame to be used
        });
        this.load.image("sprShieldTile", "assets/images/sprShieldTile.png"); //preload sheild image to the game, assign key name and src
        this.load.image("sprLaserEnemy", "assets/images/sprLaserEnemy.png"); //preload enemyLaser image to the game, assign key name and src
        this.load.image("sprLaserPlayer", "assets/images/sprLaserPlayer.png"); //preload playerLaser image to the game, assign key name and src
        this.load.image('star', 'assets/images/star.png'); //preload playerNuke image to the game, assign key name and src
        this.load.image('yellow', 'assets/images/yellow.png'); //preload particles image to the game, assign key name and src
        this.load.spritesheet("sprExplosion", "assets/images/sprExplosion.png", { //preload explosion spritesheet to the game, assign key name and src, object frameWidth and frameheight
            frameWidth: 512, //set full width of explosion sprite frame to be used
            frameHeight: 512 //set full height of explosion sprite frame to be used
        });
        this.load.image('alien', "assets/images/alien.png"); //preload alien image
        this.load.image('gameOver', "assets/images/explosion.png"); //preload gameover explosion image
        this.load.image('hero', "assets/images/spacesuit.png"); //preload heroin image
        this.load.image('fireworks', "assets/images/fireworks.png"); //preload fireworks image
        this.load.image("asteroid", "assets/images/asteroid.png"); //perload the asteroid image
        this.load.audio("sndExplode", "assets/audio/sndExplode.wav"); //preload audio files, assign key name and src
        this.load.audio("sndLaserPlayer", "assets/audio/sndLaserPlayer.wav"); //preload audio files, assign key name and src
        this.load.audio("sndLaserEnemy", "assets/audio/sndLaserEnemy.wav"); //preload audio files, assign key name and src
    }
    //end preload function

    //create function 
    create() {
        //set world boundaries
        var body = this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height); //set world boundaries up with originX, originY, Game Width, Game Height
        //END world bounds

        //add background
        this.background = new Background(this, this.game.config.width * 0.5, this.game.config.height * 0.5, "backgroundstars"); // add background image first
        //END background image

        //create sfx
        this.sfx = { //add properties to call back sfx
            explode: this.sound.add("sndExplode"), //create the soudn fx properties
            laserPlayer: this.sound.add("sndLaserPlayer"), //create the soudn fx properties
            laserEnemy: this.sound.add("sndLaserEnemy") //create the soudn fx properties
        };
        //END sfx

        //create animations
        this.anims.create({ //animation object create
            key: "enemyShip", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("enemyShip"), //set image to be used to generate frames
            frameRate: 5, //set frame rate speed
            repeat: -1 //set to -1, continuous
        });

        this.anims.create({ //animation object create
            key: "sprExplosion", //set the image key name to be used
            frames: this.anims.generateFrameNumbers("sprExplosion"), //set image to be used to generate frames
            frameRate: 15, //set frame rate speed
            repeat: 5 //turns on then off higher equals longer on
        });
        //END animations

        //particles and emitter creation
        particles = this.add.particles('yellow'); //load yellow image into particles 

        emitter = particles.createEmitter({ // create emitter to be called and createEmitter object on particles
            on: false, //set on method to be property false, not showing on screen //on test with set to true as standard positioned in top left corner before action call
            speed: 100, //set property to the speed the particles emit higher number = faster
            scale: { start: 0.5, end: 0 }, //set the scale of your particles from starting size to finishing size
            blendMode: "ADD", //set BlendMode method of ADD so as to keep richer colours
        });
        //END particles and emitter creation

        //SCORED POINTS  AND LIVES REMAINING METHODS 
        textScore = this.add.text(10, 10, 'Score: ' + score, { font: '42px Arcade', fill: '#ffffff' }); //create score text, position x and y, set text with score variable and add font styling
        textLives = this.add.text(10, this.game.config.height - 40, 'Lives: ' + currentLives, { font: '42px Arcade', fill: '#ffffff' }); //create lives text, position x and y, set text with currentLives variable and add font styling
        textNukes = this.add.text(this.game.config.width - 180, this.game.config.height - 40, 'Nukes: ' + currentNukes, { font: '42px Arcade', fill: '#ffffff' }); //create Nukes Left text, position x and y, set text with currentNukes variable and add font styling
        //END score and lives

        //Keyboard methods created for use in update function
        cursors = this.input.keyboard.createCursorKeys(); //sets cursor keys up for operation
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); //sets SPACE as FIRE key
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N); //sets key N as NUKE key
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); //sets key R as Restart Key on GAME OVER
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER); //sets key ENTER as continue button on level win

        this.input.keyboard.on('keydown-P', function() { //on pressing Key P
            isPaused = this.scene; //set isPasued to this.scene to get key
            this.scene.pause(); //pause this scene
            this.scene.launch('Paused'); //launch paused scene
        }, this);
        //END Keyboard methods created for use in update function

        //set scene variables for shooting delays
        this.playerShootDelay = 25; //sets the Delay value for the player laser, lower the value the faster it shoots
        this.playerShootTick = 0; //sets the playerShootTick to 0, for using in the updatePlayerShooting function
        this.playerNukeDelay = 50; //sets the Delay value for the player Nuke, lower the value the faster it shoots
        this.playerNukeTick = 0; //sets the playerNukeTick to 0, for using in the updatePlayerShooting function
        //END set scene variables for shooting delays

        //create classes on the this.Object to assign the grouping method to 
        this.asteroids = this.add.group(); //create asteroids group
        this.playerLasers = this.add.group(); //create playerLaser group
        this.starNukes = this.add.group(); //create starNukes group 
        this.enemyLasers = this.add.group(); //create enemyLaser group
        this.explosions = this.add.group(); //create explosions group
        this.nukeExplosions = this.add.group(); //create nukeExplosions group
        this.enemies = this.add.group(); //create enemies group
        this.shieldTiles = this.add.group(); //create sheildTiles group
        this.shieldHoles = this.add.group(); //create sheildHoles group     
        //END classes grouping

        // Create callback methods
        this.createAsteroids(); //create callback method for asteroids
        this.createPlayer(); //create callback method for creating player
        this.updatePlayerMovement(); //create callback method for updating player movementadd cursors 
        this.updateEnemiesMovement(); //create callback method for updating enemy moves 
        this.updatePlayerShooting(); //create callback method for updating player shots
        this.updateNukes(); //create callback method for updating Nukes
        this.updateEnemiesShooting(); //create callback method for updating enemy shots 
        this.updateLasers(); //create callback method for updating shots
        this.updateContinue(); //create callback method for continue game
        this.updateRestart(); //create callback method for restarting the game on GameOver
        //END callback methods

        //Create enemies and set positions movement directions
        this.lastEnemyMoveDir = "RIGHT"; //create a variable to hold last enemy movement
        this.enemyMoveDir = "LEFT"; //create a variable to hold this enemy movement
        this.enemyRect = new Phaser.Geom.Rectangle( //for moving the enemy rectangle around
            Math.round((this.game.config.width / 24) * 0.5) * 6, //set the x position of rectangle
            Math.round((this.game.config.height / 40) * 0.25), //set the y position of rectangle
            Math.round(this.game.config.width / 24) * 19.5, //sets the width of rectangle
            Math.round((this.game.config.height / 40) * 0.25) * 20 //sets the height of rectangle
        );

        for (var x = 6; x < Math.round((this.game.config.width / 24) * 0.5); x++) { //create an inset row of enemy ships by setting to 0.95, skipping the first 14 iterations of the loop by setting x to 2, we can center the enemyShips by offsetting from the edge
            for (var y = 0; y < Math.round((this.game.config.height / 40) * 0.1); y++) { //create 3 additional rows by iterating through x
                var enemy = new Enemy(this, x * 44, (this.game.config.height * 0.15) + (y * 88), "enemyShip"); //set coordinates for image with spacing on x and y and assign a key from preloaded images to add the enemyship image sprite
                enemy.play("enemyShip"); //start animation of the enemyShip
                enemy.setScale(0.25); //set the scale of the enemy sprite
                enemyShips++; //add a ship to total enemy ships created
                this.enemies.add(enemy); //draw an enemy ship on the screen at x and y

            }
            totalEnemyShips = enemyShips; //set totalEnemy ships to equal enemyShips created for use in Victory function
        }
        //END Create enemies

        //COLLISION DETECTION
        this.physics.add.overlap(this.asteroids, this.player, function(asteroid, player) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (asteroid) { //if asteroid
                asteroid.destroy(); //destroy asteroid
            }
            //ALSO
            if (player) { //if player  
                this.createExplosion(player.x, player.y); //call createExplosion method
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start onLifeDown Method
            }
        }, null, this);

        this.physics.add.overlap(this.playerLasers, this.asteroids, function(laser, asteroid) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (laser) { //if player laser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            if (asteroid) { //if asteroid  
                this.createExplosion(asteroid.x, asteroid.y); //call createExplosion method
                asteroid.destroy(); //destroy asteroid object
            }
        }, null, this);

        this.physics.add.overlap(this.starNukes, this.asteroids, function(nuke, asteroid) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (nuke) { //if player nuke
                nuke.destroy(); //destroy nuke object
                emitter.stop(); //stop particles emitting
            }
            //ALSO
            if (asteroid) { //if asteroid  
                this.createNukeExplosion(asteroid.x, asteroid.y); //call createNukeExplosion method
                asteroid.destroy(); //destroy asteroid object
            }
        }, null, this);

        this.physics.add.overlap(this.playerLasers, this.enemyLasers, function(playerLaser, enemyLaser) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (playerLaser) { //if playerLaser
                playerLaser.destroy(); //destroy enemy object
            }
            //ALSO
            if (enemyLaser) { //if enemyLaser 
                enemyLaser.destroy(); //destroy enemyLaser object
            }

        }, null, this);

        this.physics.add.overlap(this.starNukes, this.enemies, function(nuke, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (nuke) { //if player nuke
                nuke.destroy(); //destroy nuke object 
                emitter.stop(); //stop particles emitting
            }
            //ALSO
            if (enemy) { //if enemy  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createNukeExplosion(enemy.x, enemy.y); //call createNukeExplosion method
                this.addScore(nukeScore); //call add score function with nukeScore variable                 
                enemy.destroy(); //destroy enemy object
            }
        }, null, this);

        this.physics.add.overlap(this.nukeExplosions, this.enemies, function(explosion, enemies) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (enemies) { //if enemies (plural hit)  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createExplosion(enemies.x, enemies.y); //call creatExplosion method on each object
                this.addScore(enemyValue); //add score of enemyValue per enemy hit
                enemies.destroy(); //destroy enemies that are hit
            }
        }, null, this);

        this.physics.add.overlap(this.playerLasers, this.enemies, function(laser, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function

            if (laser) { //if player laser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            if (enemy) { //if enemy  
                enemyShips--; //decrement enemyShips by 1 (used for testing)
                enemyDeaths++; //increment enemyDeaths by 1 for game win logic
                this.createExplosion(enemy.x, enemy.y); //call creatExplosion method
                this.addScore(enemyValue); //add score of enemyValue per enemy hit
                enemy.destroy(); //destroy enemy object
            }
        }, null, this); //processCallback set to null and context set to this


        this.physics.add.overlap(this.playerLasers, this.shieldTiles, function(laser, tile) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (laser) { //if playerLaser
                laser.destroy(); //destroy laser object
            }
            //ALSO
            this.destroyShieldTile(tile); //start destroy sheild function with parameter of this tile
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.player, this.enemies, function(player, enemy) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (player) { //if player collides with enemy
                this.createExplosion(player.x, player.y); //create explosion at player.x, player.y coordinates
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start lifeDown function to lose life and check if GAME OVER
            }
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (player) { //if player hit by enemyLaser
                this.createExplosion(player.x, player.y); //create explosion at player.x, player.y coordinates
                player.body.reset(this.game.config.width * 0.5, this.game.config.height - 50); //reset player to opening position
                this.onLifeDown(); //start lifeDown function to lose life and check if GAME OVER
            }

            if (laser) { //if an enemyLaser
                laser.destroy(); //destroy laser
            }
        }, null, this);

        this.physics.add.overlap(this.shieldTiles, this.enemies, function(tile) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (enemy) { //if enemy
                tile.destroy(); //start destroy sheild function with parameter of this tile
            }
        }, null, this); //processCallback set to null and context set to this

        this.physics.add.overlap(this.enemyLasers, this.shieldTiles, function(laser, tile) { //create a physics overlap event between object1 and object2, followed by collideCallback function
            if (laser) { //if enemyLaser 
                laser.destroy(); //destroy laser object
            }
            //ALSO
            this.destroyShieldTile(tile); //start destroy sheild function with parameter of this tile
        }, null, this); //processCallback set to null and context set to this

        //END COLLISION DETECTION

        //create sheilds
        this.shieldPattern = [ //property of sheildPattern a nested array, 
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0], //gives structure to sheild, 1 = image 0 = blank
            [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0], //This gives sheild shape of ML
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
        ];

        var sheildWidth = 120;
        for (var i = 0; i < level1Shields; i++) { //for loop to create an inset row of sheilds based on this levels sheild count 
            this.addShield( //add shield on each iteration
                (Math.round((this.game.config.width / 2) - ((level1Shields / 2) * sheildWidth))) + (i * sheildWidth), //set the x coordinates by dividing game width by 2 minus level sheilds divided by 2 and multiplying i by sheildWidth, we can center the sheilds by offsetting from the edge then add offset to each sheild
                this.game.config.height - 150 //set the y position of the sheilds
            );
        }
        //END create sheilds
    }
    //end create function 

    ////////////////////////////////////////////////////////////
    // NOW CREATE OWN FUNCTIONS OUTSIDE OF THE CREATE FUNCTION//

    //create addScore function
    addScore(amount) { //addScore method passed with parameter amount
        score += amount; //raise score by amount                     
        textScore.setText('Score: ' + score); //sets score 
    }
    //END addScore function

    //create loseLives function
    loseLives(amount) { //loseLives method passed with parameter amount
        currentLives -= amount; // currentLives drop by amount
        textLives.setText('Lives: ' + currentLives); //sets lives remaining
    }
    //END loseLives function

    //create asteroids function
    createAsteroids() {
        this.time.addEvent({ //add a time event on asteroid
            delay: 2000, //set delay to 2000
            callback: function() { //create call back function for time event
                if (leftAsteroid) { //if asteroid switch is true
                    var asteroid = new Asteroid( //create new asteroid instance
                        this, //in this scene
                        0, //set x position to to left
                        Phaser.Math.RND.integerInRange(0, this.game.config.height) //set y position to random y height
                    );
                    this.asteroids.add(asteroid); //add asteroid to group
                    leftAsteroid = false; //set leftAsteroid switch to false
                };
                if (!leftAsteroid) { //if asteroid switch is false
                    var asteroid = new Asteroid( //create new asteroid instance
                        this, //in this scene
                        this.game.config.width, //set x position to right
                        Phaser.Math.RND.integerInRange(0, this.game.config.height) //set y position to random y height
                    );
                    this.asteroids.add(asteroid); //add asteroid to group
                    leftAsteroid = true; //set leftAsteroid switch to true
                };
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END create asteroids function

    //create createPlayer function
    createPlayer() {
        if (this.player) this.player.destroy();
        this.player = new Player( //create new player instance
            this, //in this scene
            this.game.config.width * 0.5, //set playerShip to center of screen on x axis
            this.game.config.height - 50, //set playerShip to position 50 pixels up from bottom on y axis
            "playerShip"
        );
    }
    //END createPlayer function

    //create updatePlayerMovement function
    updatePlayerMovement() { //update player movement
        this.time.addEvent({ //add time event
            delay: 60, //set delay to 60
            callback: function() { //create call back function for time event

                if (cursors.left.isDown) { //if key A pressed down
                    this.player.x -= 8; //Move left
                }
                if (cursors.right.isDown) { //if key D pressed down
                    this.player.x += 8; //Move right
                }
                if (cursors.up.isDown) { //if key W pressed down
                    this.player.y -= 8; //Move up   
                }
                if (cursors.down.isDown) { //if key S pressed down
                    this.player.y += 8; //Move down
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updatePlayerMovement function

    //create updatePlayerShooting function
    updatePlayerShooting() {
        this.time.addEvent({ //add a time event on player shooting
            delay: 15, //set delay to 15
            callback: function() { //create a callback function 
                if (this.keySpace.isDown && this.player.active) { //if SPACE is down && player is active still
                    if (this.playerShootTick < this.playerShootDelay) { //if playerShootTick is less than the playerShootDelay
                        this.playerShootTick++; //add 1 to Tick count, which will repeat until it hits 30
                    }
                    else {
                        var laser = new PlayerLaser(this, this.player.x, this.player.y); //create new laser object and start this object at player.x and player.y
                        this.playerLasers.add(laser); //add this laser to playerLaser group
                        this.sfx.laserPlayer.play(); //add laserPlayer sound
                        this.playerShootTick = 0; //set shootTick back to 0
                    }
                }
                if (this.keyN.isDown && this.player.active && currentNukes > 0) { //if SPACE is down && player is active still
                    if (this.playerNukeTick < this.playerNukeDelay) { //if playerShootTick is less than the playerShootDelay
                        this.playerNukeTick++; //add 1 to Tick count, which will repeat until it hits 30
                    }
                    else {
                        var nuke = new Nuke(this, this.player.x, this.player.y); //create new laser object and start this object at player.x and player.y
                        this.starNukes.add(nuke); //add this laser to playerLaser group
                        this.sfx.laserPlayer.play(); //add laserPlayer sound
                        this.playerNukeTick = 0; //set shootTick back to 0
                        currentNukes--; //decrement current nukes by 1
                        textNukes.setText('Nukes: ' + currentNukes); //set nuke left text to current value
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }

    //create updateLaser function
    updateLasers() { //update laser movement
        this.time.addEvent({ //add a time event on player laser
            delay: 30, //set delay to 30
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.playerLasers.getChildren().length; i++) { //for each enemy in the enemies array
                    var laser = this.playerLasers.getChildren()[i]; //this laser = playerLaser[i]

                    laser.y -= 16; //set movement down on y axis as 16 (higher the number the faster it goes)

                    if (laser.y < 10) { //if laser is less than 10 away from screen edge
                        this.createExplosion(laser.x, laser.y); //create an explosion at this laser.x and laser.y

                        if (laser) { //if laser         
                            laser.destroy(); //destroy this laser
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
        this.time.addEvent({ //add a time event on enemy laser
            delay: 128, //set delay to 128
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.enemyLasers.getChildren().length; i++) { //for each enemyLaser in the enemyLaser group
                    var laser = this.enemyLasers.getChildren()[i]; //set

                    laser.y += 10; //set movement down on y axis as 10 (higher the number the faster it goes)

                    if (laser.y > this.game.config.height - 10) { //if laser is less than 10 away from screen edge
                        this.createExplosion(laser.x, laser.y); //create an explosion at this laser.x and laser.y

                        if (laser) { //if laser         
                            laser.destroy(); //destroy this laser
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateLaser function

    //create updateNukes function
    updateNukes() {
        this.time.addEvent({ //add a time event on player laser
            delay: 30, //set delay to 30
            callback: function() { //create call back function for time event
                for (var i = 0; i < this.starNukes.getChildren().length; i++) { //for each enemy in the enemies array
                    var nuke = this.starNukes.getChildren()[i]; //this nuke = starNukes[i]
                    if (nuke.y < 10) { //if laser is less than 5 away from screen edge
                        this.createExplosion(nuke.x, nuke.y); //create an explosion at this nuke.x and nuke.y
                        emitter.stop(); //stope emitting particles
                        if (nuke) { //if nuke         
                            nuke.destroy(); //destroy this nuke
                        }
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateNukes function

    //create Explosion function
    createExplosion(x, y) {
        this.sfx.explode.play(); //play sound fx
        var explosion = new Explosion(this, x, y); //create a new instance of explosion
        this.explosions.add(explosion); //add it to the explosions group
        if (totalEnemyShips == enemyDeaths) { //if totalEnemyShips is same as totalDeaths
            this.win(); //start win method
            levelWon = true;
        }
    }
    //end explosion function

    //create nuke explosion function 
    createNukeExplosion(x, y) {
        this.sfx.explode.play(); //play sound fx
        var nukeExplosion = new NukeExplosion(this, x, y); //create a new instance of nukeExplosion
        this.nukeExplosions.add(nukeExplosion); //add it to the nukeExplosions group
        if (totalEnemyShips == enemyDeaths) { // if totalEnemyShips is same as totalDeaths
            this.win(); //start win method
            levelWon = true;
        }
    }
    //END nuke explosion function

    //create setEnemyDirection function
    setEnemyDirection(direction) { //set enemy movement direction with direction parameter
        this.lastEnemyMoveDir = this.enemyMoveDir; //sets enemyMoveDir as lastEnemyMoveDir
        this.enemyMoveDir = direction; //enemyMoveDir is equal to direction parameter
    }
    //END setEnemyDirection function

    //create setEnemyDirection function
    setEnemyDirection(direction) { //set enemy movement direction with direction parameter
        this.lastEnemyMoveDir = this.enemyMoveDir; //sets enemyMoveDir as lastEnemyMoveDir
        this.enemyMoveDir = direction; //enemyMoveDir is equal to direction parameter
    }
    //END setEnemyDirection function

    //create updateEnemiesMovement function
    updateEnemiesMovement() { //update Enemy Movement
        this.enemyMoveTimer = this.time.addEvent({ //adds time event to enemy movement
            delay: 1500, //set the delay to enemy movement
            callback: function() { //delay callback function

                if (this.enemyMoveDir == "RIGHT") { //if enemyMoveDir is RIGHT
                    this.enemyRect.x += 25; //Move enemy right by 16

                    if (this.enemyRect.x + this.enemyRect.width > this.game.config.width - 10) { //if enemy is past this point on x axis 
                        this.setEnemyDirection("DOWN"); //setEnemyDirection to DOWN
                    }
                }
                else if (this.enemyMoveDir == "LEFT") { //enemyMoveDir is LEFT
                    this.enemyRect.x -= 25; //Move enemy left by 16

                    if (this.enemyRect.x < (this.game.config.width - this.game.config.width) + 10) { //if enemy is past this point on x axis 
                        this.setEnemyDirection("DOWN"); //setEnemyDirection to DOWN
                    }
                }
                else if (this.enemyMoveDir == "DOWN") { //enemyMoveDir is DOWN
                    this.enemyMoveTimer.delay -= 100; //reduce enemy timer delay by 100 (speeding up the loop)
                    this.moveEnemiesDown(); //call function moveEnemiesDown
                }

                for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) { //for each enemy in the enemies array
                    var enemy = this.enemies.getChildren()[i]; //select this enemy with index[i]

                    if (this.enemyMoveDir == "RIGHT") { //if enemyMoveDir is RIGHT
                        enemy.x += 25; //Move enemy RIGHT 16
                    }
                    else if (this.enemyMoveDir == "LEFT") { //if enemyMoveDir is LEFT
                        enemy.x -= 25; //Move enemy LEFT 16
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateEnemiesMovement function

    //create moveEnemiesDown function
    moveEnemiesDown() {
        for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) { //for each enemy in the enemies array
            var enemy = this.enemies.getChildren()[i]; //select this enemy with this index

            enemy.y += 10; //Move enemy DOWN by 10

            if (this.lastEnemyMoveDir == "LEFT") { //if lastEnemyMoveDir is LEFT
                this.setEnemyDirection("RIGHT"); //setEnemyDirection to RIGHT
            }
            else if (this.lastEnemyMoveDir == "RIGHT") { //if lastEnemyMoveDir is RIGHT
                this.setEnemyDirection("LEFT"); //setEnemyDirection to LEFT
            }
        }
    }
    //END moveEnemiesDown function

    //create updateEnemiesShooting function
    updateEnemiesShooting() { //enemy Shooting function
        this.time.addEvent({ // add time delay event
            delay: 150, //set delay to 150
            callback: function() { //create callback function on time event
                for (var i = 0; i < this.enemies.getChildren().length; i++) { //for each enemy in the enemies array
                    var enemy = this.enemies.getChildren()[i]; //select this enemy with index[i]

                    if (Phaser.Math.Between(0, 1000) > 995) { //for each enemy, if number generated is greater than 995 FIRE (lower the number the higher the fire rate)
                        var laser = new EnemyLaser(this, enemy.x, enemy.y); //add a new EnemyLaser object
                        this.enemyLasers.add(laser); //draw a new enemyLaser

                        this.sfx.laserEnemy.play(); //play the sound laserEnemy
                    }
                }
            },
            callbackScope: this, //set call back scope to this function
            loop: true //set loop to true
        });
    }
    //END updateEnemiesShooting function

    //create addSheild function
    addShield(posX, posY) { //create an addSheild function with posX, posY as paramaters
        for (var y = 0; y < this.shieldPattern.length; y++) { //iterate through sheildPattern nested array to obtain the number of rows to create on y axis
            for (var x = 0; x < this.shieldPattern[y].length; x++) { //for each row iterate through the array and add a sheildTile to the position on x axis
                if (this.shieldPattern[y][x] == 1) { //if the array.value is == 1
                    var tile = new ShieldTile( //then add a new tile object
                        this, //this game object
                        posX + (x * 8), //set new position of tile object on x axis with padding
                        posY + (y * 8) //set new position of tile object on y axis with padding
                    );
                    this.shieldTiles.add(tile); //draw tile image in location 
                }
            }
        }
    }
    //END addSheild function

    //create destroySheildTile function
    destroyShieldTile(tile) {
        if (tile) { //if(tile)
            this.createExplosion(tile.x, tile.y); //create explosion at x and y of tile

            for (var i = 0; i < Phaser.Math.Between(10, 20); i++) { //for loop to iterate through sheildtile array randomly
                var shieldHole = this.add.graphics({ //create sheildhole var and add graphics
                    fillStyle: { //create style
                        color: 0x000000 //set colour of sheildHole
                    }
                });
                shieldHole.setDepth(-1); //set depth of sheildHole

                var size = Phaser.Math.Between(2, 4); //create a random size variable on each iteration

                if (Phaser.Math.Between(0, 100) > 25) { //if number generated is over 25
                    var rect = new Phaser.Geom.Rectangle( //create rectangle over tile
                        tile.x + (Phaser.Math.Between(-2, tile.displayWidth + 2)), //using tile.x coordinates +or- 2
                        tile.y + (Phaser.Math.Between(-2, tile.displayHeight + 2)), //using tile.y coordinates +or- 2
                        size, //width is size 
                        size //height is size 
                    );
                }
                else {
                    var rect = new Phaser.Geom.Rectangle( //create rectangle over tile 
                        tile.x + (Phaser.Math.Between(-4, tile.displayWidth + 4)), //using tile.x coordinates +or- 4
                        tile.y + (Phaser.Math.Between(-4, tile.displayHeight + 4)), //using tile.y coordinates +or- 4
                        size, //width is size 
                        size //height is size 
                    );
                }

                shieldHole.fillRectShape(rect); //fill random rect shape created with sheildholes at random

                this.shieldHoles.add(shieldHole); //add sheildhole to the group
            }
            tile.destroy(); //destroy tile
        }
    }
    //END destroySheildTile function

    //create win function
    win() {
        this.player.destroy(); //destroy player if victory to stop losing any lives 
        this.fireworksVictory = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'fireworks'); //set fireworks image position x,y and initiate first so image behind the hero
        this.fireworksVictory.setScale(1.4); //set scale of fireworks image
        this.textVictory = this.add.text( //create Victory text
            this.game.config.width * 0.5, //set x axis position
            this.game.config.height * 0.05, //set y axis position
            "Level 1 Complete!", //set text   
            {
                fontFamily: "Arcadepix", //set font type
                fontSize: 100, //set font size
                align: "center" //set text alignment
            }
        );
        this.textVictory.setOrigin(0.5); //set text origin to center 
        this.textVictory.setTint(0x00ff00); //set victory text to green
        this.textContinue = this.add.text( //create Victory text
            this.game.config.width * 0.5, //set x axis position
            this.game.config.height * 0.95, //set y axis position
            "Press Enter to Continue", //set text   
            {
                fontFamily: "Arcadepix", //set font type
                fontSize: 100, //set font size
                align: "center" //set text alignment
            }
        );
        this.textContinue.setOrigin(0.5); //set text origin to center 
        this.textContinue.setTint(0x00ff00); //set victory text to green
        this.heroWin = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'hero'); //insert hero image setting x and y position
        this.heroWin.setScale(1); //set scale of hero image to half original size
        enemyShips = 0; //set enemyShips to 0
        enemyDeaths = 0; //set enemyDeaths to 0
        currentNukes++; //Add a nuke 
        LevelRestart++; //Add a level restart ability as reward for completing level
    }
    //END win function

    //continue function
    updateContinue() { //update method to restart game in event of GAME OVER
        this.time.addEvent({ //add timed event
            delay: 10, //set delay to 10
            callback: function() { //create a callback function
                if (this.keyEnter.isDown && levelWon) { //if the Space key is pressed and levelWon is true
                    levelWon = false;
                    this.scene.start("Level2"); //set scene start for level 2
                }
            },
            callbackScope: this, //set call back scope to this
            loop: true //set loop to true checking parameters
        });
    }
    // end continue function

    //create life down function
    onLifeDown() {
        if (currentLives == 0) { //if lives = 0
            this.gameOver(); //start gameover method
        }
        else if (currentLives > 0) { //else if lives greater than 0
            this.loseLives(enemyHitStrength); //lose a life by value of enemyHitStrength
        }
    }
    //end life down function

    //create gameover function
    gameOver() {
        RIP = true; //set RIP to true
        textScore.setText('Final Score: ' + score); //set score text to final score
        textLives.setText('Lives: GAME OVER'); //set lives text to GAME OVER 
        this.player.destroy(); //destroy player
        this.gameOverExplosion = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'gameOver'); //insert explosion image first to put behind alien and setting x and y position
        this.gameOverExplosion.setScale(2); //set gameover explosion to twice its size
        this.textGameOver = this.add.text( //create game over text
            this.game.config.width * 0.5, //set x axis position
            this.game.config.height * 0.05, //set y axis position
            GameOver, //set text to variable GameOver
            {
                fontFamily: "Arcadepix", //set font type
                fontSize: 100, //set font size
                align: "center" //set text alignment
            }
        );
        this.textGameOver.setOrigin(0.5); //Set origin of gameover text to its center
        this.textGameOver.setTint(0x008000); //set text color

        this.textRestart = this.add.text( //create restart text
            this.game.config.width * 0.5, //set x axis position
            this.game.config.height * 0.15, //set y axis position
            Restart, //set text to variable Restart
            {
                fontFamily: "Arcadepix", //set font type
                fontSize: 70, //set font size
                align: "center" //set text alignment
            }
        );
        this.textRestart.setTint(0x008000); //Set text colour
        this.textRestart.setOrigin(0.5); //Set origin of restart text to its center
        this.alienWin = this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.6, 'alien'); //insert alien image last to for rendering in front setting x and y position
        this.alienWin.setScale(1.2) //set scale to 1.2
    }
    //END gameover function

    //restart function
    updateRestart() { //update method to restart game in event of GAME OVER
        this.time.addEvent({ //add timed event
            delay: 10, //set delay to 10
            callback: function() { //create a callback function
                if (this.keyR.isDown && RIP) { //if the R key is pressed and RIP is true
                    enemyShips = 0; //set enemyShips to 0
                    enemyDeaths = 0; //set enemyDeaths to 0
                    currentLives = LevelRestartLives; //reset lives to LevelRestartLives
                    RIP = false; //set RIP to false so restart cant happen in game
                    score = 0; //set the score back to 0
                    this.scene.start("MainMenu"); //Restart Game
                }
            },
            callbackScope: this, //set call back scope to this
            loop: true //set loop to true checking parameters
        });
    }
    // end restart function
}
// END scene