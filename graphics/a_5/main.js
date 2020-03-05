"use strict";

	const worldDimensions = [1000, 1000];
	let currScale = [900, 1000];

	function scale(val, scale, scaleBase) {
		return val * (scale / scaleBase); 
	}

    let GameState = {
        pre     : 0,
        running : 1,
        end     : 2 
    }
    // user input //////////////////////////////////////////////////////////////
    // control states
    let up           = false; // w 87
    let down         = false; // s 83
    let left         = false; // a 65
    let right        = false; // d 68
    let upRight      = false; // e 69
    let downLeft     = false; // z 90
    let upLeft       = false; // q 81
    let downRight    = false; // x 88
    let currentState = null;

    // control options
    let Orientation = {
        up        : 87,                 
        down      : 83,
        left      : 65,
        right     : 68,  
        upRight   : 69,
        downLeft  : 90,
        upLeft    : 81,
        downRight : 88
    };
    
    let OtherControls = {
        leaveGame : 76 
    };
    
    let curControl = Orientation.up;
    let changeControl;
    
    function keyDownHandler(event) {
        if (event.defaultPrevented) {
            return;
        }
        changeControl = true;
        // up
        if (event.keyCode == Orientation.up) {
            up = true;
        }
        // down
        else if (event.keyCode == Orientation.down) {
            down = true;
        }
        // left
        else if (event.keyCode == Orientation.left) {
            left = true;
        }
        // right
        else if (event.keyCode == Orientation.right) {
            right = true;
        }
        // diagonal up right
        else if (event.keyCode == Orientation.upRight) {
            upRight = true;
        }
        // diagonal down left
        else if (event.keyCode == Orientation.downLeft) {
            upRight = true;
        }
        // diagonal up left
        else if (event.keyCode == Orientation.upLeft) {
            upLeft = true;
        }
        // diagonal down right
        else if (event.keyCode == Orientation.downRight) {
            downRight = true;
        }
        else {
            changeControl = false;
            if (currentState != GameState.pre
                && event.keyCode == OtherControls.leaveGame) {
                currentState = GameState.end;
            }
        }
        if (changeControl) {
            curControl = event.keyCode;
        }
    }

    function keyUpHandler(event) {
        if (event.defaultPrevented) {
            return;
        }

        // up
        if (event.keyCode == Orientation.up) {
            up = false;
        }
        // down
        else if (event.keyCode == Orientation.down) {
            down = false;
        }
        // left
        else if (event.keyCode == Orientation.left) {
            left = false;
        }
        // right
        else if (event.keyCode == Orientation.right) {
            right = false;
        }
        // diagonal up right
        else if (event.keyCode == Orientation.upRight) {
            upRight = false;
        }
        // diagonal down left
        else if (event.keyCode == Orientation.downLeft) {
            upRight = false;
        }
        // diagonal up left
        else if (event.keyCode == Orientation.upLeft) {
            upLeft = false;
        }
        // diagonal down right
        else if (event.keyCode == Orientation.downRight) {
            downRight = false;
        }
    }
    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);
    
    function getOrientName(orient) {
        switch (orient) {
        // up
        case Orientation.up: {
            return "O_UP";
        }
        // down
        case Orientation.down: {
            return "O_DOWN";
        }
        // left
        case Orientation.left: {
            return "O_LEFT";
        }
        // right
        case Orientation.right: {
            return "O_RIGHT";
        }
        // diagonal up right
        case Orientation.upRight: {
            return "O_DIAGONAL_UP_RIGHT";
        }
        // diagonal down left
        case Orientation.downLeft: {
            return "O_DIAGONAL_DOWN_LEFT";
        }
        // diagonal up left
        case Orientation.upLeft: {
            return "O_DIAGONAL_UP_LEFT";
        }
        // diagonal down right
        case Orientation.downRight: {
            return "O_DIAGONAL_DOWN_RIGHT";
        }
        }
    }

    // object types ////////////////////////////////////////////////////////////

    // laser projectile
    
    let count = 0;
    function drawProjectile(g, projectile, dt) {
        // outer shape

        g.fillStyle = "rgba(255, 0, 0, 0.9)";
        /*
        g.fillRect(projectile.x - (projectile.width / 2), 
                   projectile.y - (projectile.height / 2),  
                   projectile.width, projectile.height);
        */
        g.translate(projectile.x, projectile.y);
        let rotation = 0;

        switch (projectile.orient) {
        case Orientation.up:
            rotation = 0;
            break;
        case Orientation.down:
            rotation = Math.PI;
            break;
        case Orientation.left:
            rotation = (Math.PI * 3) / 2;
            break;
        case Orientation.right:
            rotation = Math.PI / 2;
            break;
        }
        

        g.rotate(rotation);
        g.save();
        g.scale(0.7, 0.7);
        g.fillRect(-(projectile.width / 2), -(projectile.height / 2),  
                   projectile.width, projectile.height);
        g.restore();

        // rotation = (count) * (Math.PI / 180);
        // if (count >= 360) {
        //     count = 0;
        // }

        // g.rotate(rotation);
        // g.fillRect(-(projectile.width / 2), -(projectile.height / 4),  
        //            projectile.width, projectile.height);
        // g.rotate(-rotation);

        // inner shape
        g.fillStyle = "yellow";
        g.translate(0, -projectile.height / 4);
        g.save();
        g.scale(0.7, 0.7);
        g.fillRect(-(projectile.width / 4), -(projectile.height / 16),  
           projectile.width / 2, projectile.height / 2);         
        g.restore();
        g.setTransform(1, 0, 0, 1, 0, 0);
        
        /*
        g.fillStyle = "rgba(255, 0, 0, 10)";
        switch (projectile.orient) {
        case Orientation.up:
            break;
        case Orientation.down:
            break;
        case Orientation.left:
            break;
        case Orientation.right:
            break;
        }
        g.fillRect(projectile.x - (projectile.width / 2),
            projectile.y - (projectile.height / 2), 
            projectile.width, projectile.height * 4);
        */
        
        count += 20 * 60 * dt;
    }
    
    // move a projectile
    function translateProjectileBy(x, y, doWrapScreen) {
        this.x += x;
        this.y += y;
        if (false) {
            if (this.x > worldDimensions[0]) {
                this.x = Projectile.defaultSpeed;
            }
            else if (this.x < 0) {
                this.x = 990;
            } 
            if (this.y > worldDimensions[1]) {
                this.y = 10;
            }
            else if (this.y < 0) {
                this.y = 990;
            }
        }
    }
    
    // create the laser projectile
    function Projectile(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.distPer = speed;
        this.orient = Orientation.up;
        this.translateProjectileBy = translateProjectileBy;
    }

    
    canvas1.resetLaserPosition = function(laser, dt) {
        laser.x = worldDimensions[0] / 2;
        laser.y = worldDimensions[1] - 20;
        laser.orient = Orientation.up;        
    }

    
    // laser projectile object
    let laser = null;
    
    // background graphic
    let bg = null;
    
    // mirrors
    
    let mirror_sprites = null;
    
    // maps orientation to sprite offset in image file
    let MirrorSpriteXOffsets = {
        87 : 0,                 
        83 : 0,
        65 : 200,
        68 : 200,  
        81 : 400,
        88 : 400,
        69 : 600,
        90 : 600
    };

    function Mirror(x, y) {
        this.x = x;
        this.y = y;
    }
    Mirror.orient = Orientation.up;
    
    let mirrors = [
        [null, null, null], 
        [null, null, null], 
        [null,       null]
    ];
    
    function drawMirrors(g, mirrors, orient) {                              
        for (let i = 0; i < mirrors.length; ++i) {
            for (let j = 0; j < mirrors[i].length; ++j) {
                const mirr = mirrors[i][j];

                g.drawImage(mirror_sprites,
                    MirrorSpriteXOffsets[Mirror.orient], 0, 
                    200, 
                    200,
                    mirr.x - 100, 
                    mirr.y - 100,
                    200, 
                    200
                );
            }
        }
    }
    
    /* given more time maybe 
    I would check collision by hashing x and y as a string key since
    I am doing pixel-perfect collision
    let mirrors_dict = {
    
    };
    */
    let projectileLive = false;
    function handleProjectileAndMirrorCollision(laser) {
        let nextLaserOrient = laser.orient;
        projectileLive = true;
        switch (laser.orient) {
        case Orientation.up:
            if (Mirror.orient == Orientation.up
                || Mirror.orient == Orientation.down) {
                nextLaserOrient = Orientation.down;
            }
            else if (Mirror.orient == Orientation.left
                     || Mirror.orient == Orientation.right) {
                nextLaserOrient = Orientation.up;
                // respawn at game starting point, laser has been absorbed
                canvas1.resetLaserPosition(laser);
                projectileLive = false;
            }
            else if (Mirror.orient == Orientation.upRight
                     || Mirror.orient == Orientation.downLeft) {
                nextLaserOrient = Orientation.left;
            }
            else if (Mirror.orient == Orientation.upLeft
                     || Mirror.orient == Orientation.downRight) {
                nextLaserOrient = Orientation.right;
            }
            break;
        case Orientation.down:
            if (Mirror.orient == Orientation.up
                || Mirror.orient == Orientation.down) {
                nextLaserOrient = Orientation.up;
            }
            else if (Mirror.orient == Orientation.left
                     || Mirror.orient == Orientation.right) {
                nextLaserOrient = Orientation.up;
                // respawn at game starting point, laser has been absorbed
                canvas1.resetLaserPosition(laser);
                projectileLive = false;
            }
            else if (Mirror.orient == Orientation.upRight
                     || Mirror.orient == Orientation.downLeft) {
                nextLaserOrient = Orientation.right;
            }
            else if (Mirror.orient == Orientation.upLeft
                     || Mirror.orient == Orientation.downRight) {
                nextLaserOrient = Orientation.left;
            }
            break;
        case Orientation.right:
            if (Mirror.orient == Orientation.up
                || Mirror.orient == Orientation.down) {
                    // respawn at game starting point, laser has been absorbed
                canvas1.resetLaserPosition(laser);
                projectileLive = false;
            }
            else if (Mirror.orient == Orientation.left
                     || Mirror.orient == Orientation.right) {
                nextLaserOrient = Orientation.left;
            }
            else if (Mirror.orient == Orientation.upRight
                     || Mirror.orient == Orientation.downLeft) {
                nextLaserOrient = Orientation.down;
            }
            else if (Mirror.orient == Orientation.upLeft
                     || Mirror.orient == Orientation.downRight) {
                nextLaserOrient = Orientation.up;
            }
            break;
        case Orientation.left:
            if (Mirror.orient == Orientation.up
                || Mirror.orient == Orientation.down) {
                    // respawn at game starting point, laser has been absorbed
                canvas1.resetLaserPosition(laser);
                projectileLive = false;
            }
            else if (Mirror.orient == Orientation.left
                     || Mirror.orient == Orientation.right) {
                nextLaserOrient = Orientation.right;
            }
            else if (Mirror.orient == Orientation.upRight
                     || Mirror.orient == Orientation.downLeft) {
                nextLaserOrient = Orientation.up;
            }
            else if (Mirror.orient == Orientation.upLeft
                     || Mirror.orient == Orientation.downRight) {
                nextLaserOrient = Orientation.down;
            }
            break;
        }
        return nextLaserOrient;        
    }
    
    // main update loop ////////////////////////////////////////////////////////

    const audio = {
    	music : {
    		theme : {on : false, data : false}
    	},
    	sfx : {
    		onLose : { data : null }
    	}
    };
    canvas1.Init = function() {
        laser = new Projectile(worldDimensions[0] / 2, worldDimensions[1] - 20, 20, 100, 14 * 60);
        currentState = GameState.pre;
        
        // initialize mirrors
        for (let i = 0, py = 100; py < 900; ++i, py += 400) { 
            for (let j = 0, px = 100; px < 1000; ++j, px += 400) {
                mirrors[i][j] = new Mirror(px, py);
            }
        }
        mirrors[2][0] = new Mirror(100, 900);
        mirrors[2][1] = new Mirror(900, 900);
        
        bg = document.getElementById("bg");
        
        // get mirror sprite sheet
        mirror_sprites = document.getElementById("mirror_sprites");

        audio.music.theme = new Audio("./theme.wav");
        audio.music.theme.loop = true;
        
    }
    
    canvas1.update = function(t, dt, g) {      
		if (!window.initResourcesReady) {
            return;
		}

        if (!audio.isInit) {
            audio.music.theme.on = true;
            audio.music.theme.play();
            audio.isInit = true;
        }

        let dx = 0;
        let dy = 0;
        switch (laser.orient) {
        case Orientation.up:
            dy = -laser.distPer * dt;
            break;
        case Orientation.down:
            dy = laser.distPer * dt;
            break;
        case Orientation.left:
            dx = -laser.distPer * dt;
            break;
        case Orientation.right:
            dx = laser.distPer * dt; 
            break;
        } 
        laser.translateProjectileBy(dx, dy, false);
        
        // check collision with mirrors 
        //(very simple collision possible
        // since the laser is guaranteed to hit at a certain pixel)
        let collisionOccurred = false;
        let mirr = null;
        for (let i = 0; i < mirrors.length && !collisionOccurred; ++i) {
            for (let j = 0; j < mirrors[i].length && !collisionOccurred; ++j) {
                mirr = mirrors[i][j];
                
                if ((
                        (laser.x - mirr.x) * (laser.x - mirr.x) + 
                        (laser.y - mirr.y) * (laser.y - mirr.y)
                    ) < 20) {
                    laser.x = mirr.x;
                    laser.y = mirr.y;
                    collisionOccurred = true;
                }                
            }
        }
                        
        Mirror.orient = curControl;
        
        let nextLaserOrient = laser.orient;      
        if (collisionOccurred) {
            const orient = handleProjectileAndMirrorCollision(laser);
            if (projectileLive) {
                laser.orient = orient;
            }
        }
        
        /*
        console.log("mirror " + getOrientName(Mirror.orient)
                    + " laser " + getOrientName(laser.orient));
        */

        if (currentState == GameState.end) {
            // g.fillStyle = "blue";
            // g.font = "50px Cambria";
            // let msg = "Thanks for playing the Javascript Test Version!";
            // let msgSizeOffset = g.measureText(msg).width / 2;
            // g.fillText(msg,
            //            this.width / 2  - msgSizeOffset,
            //            this.height / 4);
            return;
        }
        // out-of-bounds check
        if (!collisionOccurred
            && laser.x < -laser.width || laser.x > worldDimensions[0] + laser.width
            || laser.y < -laser.height || laser.y > worldDimensions[1] + laser.height) {
            // respawn at game starting point
            canvas1.resetLaserPosition(laser);
        }
       
    }

    function renderTransformBegin(g) {
        g.save();

        //g.translate(-currScale[0] / 2, -currScale[1] / 2)
        g.scale(currScale[0] / worldDimensions[0], currScale[1] / worldDimensions[1]);
        //g.translate(currScale[0] / 2, currScale[1] / 2)
    }
    function renderTransformEnd(g) {
    	g.restore();
    }

    canvas1.render = function(dt, g) {

    	currScale[0] = canvas1.width;
    	currScale[1] = canvas1.height;

    	renderTransformBegin(g);

        g.clearRect(0, 0, canvas1.width, canvas1.height);
		g.drawImage(bg, 0, 0);    	
        
        // draw rectangular grid backdrop
        const DRAW_GRID_LINES = true;
        if (DRAW_GRID_LINES) {
	        for (let row = 1; row < 5; ++row) {
	            let rowEndPoint = row * 200;
	            g.beginPath();
	            g.moveTo(0, rowEndPoint);
	            g.lineTo(worldDimensions[0], rowEndPoint);
	            g.stroke();
	        }
	        for (let col = 1; col < 5; ++col) {
	            let colEndPoint = col * 200;
	            g.beginPath();
	            g.moveTo(colEndPoint, 0);
	            g.lineTo(colEndPoint, worldDimensions[1]);
	            g.stroke();        
	        }
    	}	
        
        drawMirrors(g, mirrors, Mirror.orient);
        
        if (currentState == GameState.pre && this.cursor.z == 1) {
            currentState = GameState.running;
        }
        if (currentState != GameState.running) {
            g.fillStyle = "blue";
            g.font = "50px Calibri";
            let title = "Laser Mirrors";
            let titleSizeOffset = g.measureText(title).width / 2;
            g.fillText(title,
                       worldDimensions[0] / 2  - titleSizeOffset,
                       worldDimensions[1] / 4);
            
            g.font = "25px Calibri";       
            let msg = "Click to Start, Instructions Below";
            let msgSizeOffset = g.measureText(msg).width / 2;
            g.fillText(msg, 
                       worldDimensions[0] / 2  - msgSizeOffset,
                       worldDimensions[1] / 3);
            renderTransformEnd(g);
            return;
        }
                
        drawProjectile(g, laser, dt);

        renderTransformEnd(g);
	}

   draw2DCanvases([canvas1]);