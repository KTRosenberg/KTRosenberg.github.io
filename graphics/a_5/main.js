"use strict";

	const worldDimensions = [1000, 1000];
    const worldXSlots = 5;
    const worldYSlots = 5;
    const worldGridSizeX = worldDimensions[0] / worldXSlots
    const worldGridSizeXHalf = worldGridSizeX / 2;
    const worldGridSizeY = worldDimensions[1] / worldYSlots; 
    const worldGridSizeYHalf = worldGridSizeY / 2;
	let currScale = [900, 900];

	function scale(val, scale, scaleBase) {
		return val * (scale / scaleBase); 
	}

    let GameState = {
        pre     : 0,
        running : 1,
        end     : 2,
        time 
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

    const Input = {
        buttonsState : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        buttonsToggle : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        axes : []
    };
    const ds4mapping = {
        0 : "x",
        1 : "circle",
        2 : "square",
        3 : "triangle",
        8 : "share",
        9 : "options",
        12: "dpadup",
        13: "dpaddown",
        14: "dpadleft",
        15: "dpadright",
        16: "home"
    }

    const ds4GameFunctionMapping = {
        "start"    : 9,
        "pause"    : 8,
        "dpadup"   : 12,
        "dpaddown" : 13,
        "dpadleft" : 14,
        "dpadright": 15,
        "home"     : 16
    }

    function isDownByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return (Input.buttonsState[code] & 0x1) == 0x1;
    }
    function justPressedByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return (Input.buttonsState[code] & 0x3) == 0x1;

    }
    function keyUpKUpdates(key, k) {
        const code = ds4GameFunctionMapping[key];
        const x = Input.buttonsState[code];
        return (x & ((1<<k)-1)) == 0;
    } 
    function toggle(key) {
        const code = ds4GameFunctionMapping[key];
        Input.buttonsToggle[code] ^= 1;
        return Input.buttonsToggle[code];
    }
    function toggleStateOnByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return Input.buttonsToggle[code];
    }
    function toggleStateOffByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return !Input.buttonsToggle[code];        
    }
    function justReleasedByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return (Input.buttonsState[code] & 0x3) == 0x2;
    }
    function isUpByKey(key) {
        const code = ds4GameFunctionMapping[key];
        return (Input.buttonsState[code] & 0x1) == 0x0;
    }

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
    
    function playOneShotSFX(key) {
        return;
        audio.sfx[key].data.currentTime = 0;
        const sfx = audio.sfx[key];
        if (sfx.isRoundRobin) {
            sfx.data.ringBuffer[sfx.data.idx].play();
            // assume power-of-2 ringbuffer length
            sfx.data.idx = (sfx.data.idx & (sfx.data.ringBuffer.length - 1));
            return;
        }
        sfx.data.play();        
    }

    const TAU = Math.PI * 2;

    const analogueToDirection = [
        Orientation.right, 
        Orientation.upRight,
        Orientation.up,
        Orientation.upLeft,
        Orientation.left,
        Orientation.downLeft,
        Orientation.down
    ];
    function handleAnalogueStick() {
        const axes = Input.axes;

        const lxraw = axes[0];
        const lyraw = axes[1];

        if (Math.abs(lxraw) < 0.44 && 
            Math.abs(lyraw) < 0.44) {
            return;
        }

        let angle = Math.atan2(-lyraw, lxraw);
        angle += TAU / 16;
        if (angle < 0) {
            angle += TAU;
        }
        angle /= (TAU / 8);

        const idx =  Math.min(TAU, Math.max(0, Math.floor(angle)));
        curControl = analogueToDirection[idx];
    }

    function handleDPad() {
        const justReleasedLeft  = justReleasedByKey("dpadleft");
        const justReleasedRight = justReleasedByKey("dpadright");
        const justReleasedUp    = justReleasedByKey("dpadup");
        const justReleasedDown  = justReleasedByKey("dpaddown");

        const _up    = isDownByKey("dpadup")
        const _down  = isDownByKey("dpaddown")
        const _left  = isDownByKey("dpadleft")
        const _right = isDownByKey("dpadright")
        const _upRight   = (_up   && _right);
        const _downRight = (_down && _right);
        const _upLeft    = (_up   && _left);
        const _downLeft  = (_down && _left);

        // k frames of induced lag
        const oldControl = curControl;
        const k = 10;
        if (_upRight) {
            upRight = true;
            curControl = Orientation.upRight;
        } else if (_downRight) {
            downRight = true;
            curControl = Orientation.downRight;
        } else if (_upLeft) {
            upLeft = true;
            curControl = Orientation.upLeft;
        } else if (_downLeft) {         
            downLeft = true;
            curControl = Orientation.downLeft;
        } else if (_up && 
            keyUpKUpdates("dpadleft",  k) && 
            keyUpKUpdates("dpadright", k)
        ) {
            up = true;
            curControl = Orientation.up;
        } else if (_down &&
            keyUpKUpdates("dpadleft",  k) && 
            keyUpKUpdates("dpadright", k)) {
            
            down = true;
            curControl = Orientation.down;
        } else if (_left &&
            keyUpKUpdates("dpadup",  k) && 
            keyUpKUpdates("dpaddown", k)
            ) {

            left = true;
            curControl = Orientation.left;
        } else if (_right &&
            keyUpKUpdates("dpadup",  k) && 
            keyUpKUpdates("dpaddown", k)

            ) {

            right = true;
            curControl = Orientation.right;
        }
        playOneShotSFX("mirrorMove");
    }
    function keyDownHandler(event) {
        if (event.defaultPrevented) {
            return;
        }
        changeControl = true;
        // up
        if (event.keyCode == Orientation.up) {
                    playOneShotSFX("mirrorMove");
            up = true;
        }
        // down
        else if (event.keyCode == Orientation.down) {
                    playOneShotSFX("mirrorMove");
            down = true;
        }
        // left
        else if (event.keyCode == Orientation.left) {
                    playOneShotSFX("mirrorMove");
            left = true;
        }
        // right
        else if (event.keyCode == Orientation.right) {
                    playOneShotSFX("mirrorMove");
            right = true;
        }
        // diagonal up right
        else if (event.keyCode == Orientation.upRight) {
                    playOneShotSFX("mirrorMove");
            upRight = true;
        }
        // diagonal down left
        else if (event.keyCode == Orientation.downLeft) {
                    playOneShotSFX("mirrorMove");
            downLeft = true;
        }
        // diagonal up left
        else if (event.keyCode == Orientation.upLeft) {
                    playOneShotSFX("mirrorMove");
            upLeft = true;
        }
        // diagonal down right
        else if (event.keyCode == Orientation.downRight) {
                    playOneShotSFX("mirrorMove");
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

////////
var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
let activeGamepad = null;

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  // hack!
  activeGamepad = gamepad;
  window.initResourcesReady = true;
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function pollControllerStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  var i = 0;
  var j;

  for (let i = 0; i < Input.buttonsState.length; i += 1) {
      Input.buttonsState[i] <<= 1;
  }
  for (j in controllers) {
    var controller = controllers[j];
    //var d = document.getElementById("controller" + j);
    //var buttons = d.getElementsByClassName("button");

    let count = 0;
    for (i = 0; i < controller.buttons.length; i++) {
      //var b = buttons[i];
      var val = controller.buttons[i];
      

      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      Input.buttonsState[i] |= (pressed) ? 1 : 0;

      //var pct = Math.round(val * 100) + "%";
      //b.style.backgroundSize = pct + " " + pct;

      // if (pressed) {
      //   count += 1;
      //   //b.className = "button pressed";
      // } else {
      //   //b.className = "button";
      // }
    }

    //var axes = d.getElementsByClassName("axis");
    Input.axes = controller.axes;
    Input.vibrationActuator = controller.vibrationActuator;
  }
  //requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}





///////

    // object types ////////////////////////////////////////////////////////////

    // laser Laser
    
    let count = 0;
    function drawLaser(g, Laser, t, dt) {
        // outer shape
        /*
        g.fillRect(Laser.x - (Laser.width / 2), 
                   Laser.y - (Laser.height / 2),  
                   Laser.width, Laser.height);
        */
        let rotation = 0;

        switch (Laser.orient) {
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
        g.save();
            g.translate(Laser.x, Laser.y)
            g.rotate(rotation);
            // inner shape


            const tx = Laser.tailPosition[0];
            const ty = Laser.tailPosition[1];
            const px = Laser.x;
            const py = Laser.y;
            const dist = Math.max(Math.abs(px - tx), Math.abs(py - ty));
            g.save();
                // g.translate(-tx, -ty);
                // g.fillStyle = "rgba(255, 0, 0, 0.7)";
                // g.fillRect(
                //     tx - (Laser.width / 2), ty - (Laser.width / 2),
                //     Laser.width, dist
                // );
                // g.translate(tx, ty);      

                g.translate(-px, -py);
                g.fillStyle = "rgba(255, 0, 0, 0.7)";
                g.fillRect(
                    px - (Laser.width / 2), py - (Laser.width / 2),  
                    Laser.width, dist
                );

                g.fillStyle = "yellow";
                g.fillRect(
                    px - (Laser.width / 2), py - (Laser.width / 2),
                    Laser.width, Laser.width
                );
                g.translate(px, py);

            g.restore();;

        g.restore();
        
        //g.fillRect(-Laser.width/2, -Laser.width/2, Laser.width, Laser.width)
        

        
        /*
        g.fillStyle = "rgba(255, 0, 0, 10)";
        switch (Laser.orient) {
        case Orientation.up:
            break;
        case Orientation.down:
            break;
        case Orientation.left:
            break;
        case Orientation.right:
            break;
        }
        g.fillRect(Laser.x - (Laser.width / 2),
            Laser.y - (Laser.height / 2), 
            Laser.width, Laser.height * 4);
        */
        
        count += 20 * 60 * dt;
    }
    
    // move a Laser
    function translateLaserBy(x, y, doWrapScreen) {
        this.x += x;
        this.y += y;
        if (false) {
            if (this.x > worldDimensions[0]) {
                this.x = Laser.defaultSpeed;
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
    
    // create the laser Laser
    class Laser {
        constructor(x, y, width, height, speed) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.distPer = speed;
            this.orient = Orientation.up;
            this.translateLaserBy = translateLaserBy;
            this.tailPosition = [
                worldDimensions[0] / 2,
                worldDimensions[1]
            ];
        }
    }
    Laser.defaultSpeed = 9 * 60;
    
    canvas1.resetLaserPosition = function(laser, dt) {
        laser.x = worldDimensions[0] / 2;
        laser.y = worldDimensions[1] + 10;
        laser.orient = Orientation.up;

        laser.tailPosition[0] = worldDimensions[0] / 2;
        laser.tailPosition[1] = worldDimensions[1]; 
    }

    
    // laser Laser object
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

    class Mirror {
        constructor (x, y) {
            this.x = x;
            this.y = y;
        }
    }
    Mirror.orient = Orientation.up;
    
    let mirrors = [
        [null, null, null], 
        [null, null, null], 
        [null,       null]
    ];

    const mapDims = [5, 5]
    let map = [];


    
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
    let LaserLive = false;
    function handleLaserAndMirrorCollision(laser) {
        let nextLaserOrient = laser.orient;
        LaserLive = true;
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
                LaserLive = false;
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
                LaserLive = false;
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
                LaserLive = false;
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
                LaserLive = false;
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
    		onLose        : {data : null},
            mirrorMove    : {data : null},
            mirrorReflect : {data : null},
    	}
    };
    const frameData = {
        mirrorCollisionOccurred : false
    };

    let respawnDelay = 0;
    let respawnDelayMax = .2;

    
    const Score = {
        multiplier : Laser.defaultSpeed / 60,
        count : 0 
    }

    function handleMapCollision() {
        const x = laser.x;// / worldGridSizeX; // (thing.coords[0] * worldGridSizeX) + worldGridSizeXHalf;
        const y = laser.y;// / worldGridSizeY; // (thing.coords[1] * worldGridSizeY) + worldGridSizeYHalf; 
        const gridJ = Math.floor(laser.x / worldGridSizeX);
        const gridI = Math.floor(laser.y / worldGridSizeY);

        if (gridJ < 0 || gridI < 0 || 
            gridI >= mapDims[1] || gridJ >= mapDims[0]) 
        {
            return;
        }

        const thing = map[gridI][gridJ][0];
        
        if (!thing.isActive) {
            return;
        }

        const thingY = (thing.coords[0] * worldGridSizeX) + worldGridSizeXHalf;
        const thingX = (thing.coords[1] * worldGridSizeY) + worldGridSizeYHalf;
        const dx = thingX - x;
        const dy = thingY - y;

        if ((dx * dx) + (dy * dy) > 30) {
            return;
        }
        ScorePointCollect(thing.data);
    }

    let activeScorePoints = 0;
    let maxActiveScorePoints = 3;
    function ScorePointMake(i, j) {
        map[i][j][0].isActive = true;
        map[i][j][0].data = new ScorePoint(map[i][j][0]);
        ScorePoint.prevCollectTime = GameState.time;
        activeScorePoints += 1;
    }

    function randomNumber(min, max) {  
        return Math.floor(Math.random() * (max - min) + min); 
    }  
  

    const validSlots = [
        [0, 1],
        [0, 3],

        [1, 0],
        [1, 2],
        [1, 4],

        [2, 1],
        [2, 3],

        [3, 0],
        [3, 4],

        [4, 1],
        [4, 2],
        [4, 3]
    ];

    function advanceRound(prevScorePoint) {
        const count = randomNumber(1, 3);

        for (let i = 0; i < count && activeScorePoints < maxActiveScorePoints; i += 1) {
            const slotIdx = randomNumber(0, validSlots.length);
            if (map[validSlots[slotIdx][0]][validSlots[slotIdx][1]][0].isActive) {
                continue;
            }

            ScorePointMake(validSlots[slotIdx][0], validSlots[slotIdx][1]);
        }
    }
    function ScorePointCollect(sp) {
        sp.base.isActive = false;
        ScorePoint.prevCollectTime = GameState.time;
        Score.count += sp.value * Math.max(0, (2 / (1 + (GameState.time - ScorePoint.prevCollectTime))));
        console.log(Score.multiplier);
        Score.multiplier = Math.min(12, Score.multiplier + 1);
        console.log(Score.multiplier);
        laser.distPer = Score.multiplier * 60;
        activeScorePoints -= 1;

        advanceRound(sp);
        
    }
    function ScorePointDraw(g, x, y, t, dt) {
        g.save();
        g.fillStyle = "violet";
        g.translate(x, y);
        const sin01 = (Math.sin(t) + 1.0) / 2.0;
        g.scale(1 + sin01, 1 + sin01);
        g.translate(-x, -y);
        g.beginPath();
        g.arc(x, y, 20, 0, TAU);
        g.fill();

        g.restore();

        g.fillStyle = "blue";

        const rotation = t;

        g.save();
        g.translate(x, y);
        g.rotate(rotation);
        g.scale(1.5, 1.5);
        g.translate(-x, -y);
        
        g.fillRect(x - 15, y - 15,  
                   30, 30);
        g.restore();
        

        g.save();
        // inner shape
        g.fillStyle = "yellow";
        g.translate(x, y);
        g.rotate(rotation * 2);
        g.scale(1.5, 1.5);
        g.translate(-x, -y);
        
        g.fillRect(x - 5, y - 5,  
                    10, 10);
          

        g.restore();
    }

    function renderThings(g, t, dt) {
        let scoreFound = false;
        for (let i = 0; i < mapDims[0]; i += 1) {
            for (let j = 0; j < mapDims[1]; j += 1) {
                const thingSlot = map[i][j];
                for (let sid = 0; sid < thingSlot.length; sid += 1) {
                    const thing = thingSlot[sid];
                    if (!thing.isActive) {
                        continue;
                    }

                    const y = (thing.coords[0] * worldGridSizeX) + worldGridSizeXHalf;
                    const x = (thing.coords[1] * worldGridSizeY) + worldGridSizeYHalf;

                    switch (thing.data.thingType) {
                    case THING_TYPE.SCORE_POINT: {
                        scoreFound = true;
                        //console.log(x, y)
                        //console.log(thing.coords)
                        ScorePointDraw(g, x, y, t, dt);

                        break;
                    }
                    }
                }

            }
        }
        if (!scoreFound) {
            console.log(map);
        }
    }

    canvas1.init = function() {
        laser = new Laser(
            worldDimensions[0] / 2, worldDimensions[1], 
            20, 100, 9 * 60
        );

        currentState = GameState.pre;

        for (let i = 0; i < mapDims[0]; i += 1) {
            const row = [];
            map.push(row);
            for (let j = 0; j < mapDims[1]; j += 1) {
                const col = [];
                row.push(col);
                for (let thing = 0; thing < 10; thing += 1) {
                    col.push(new Thing(i, j));
                }
            }
        }
        ScorePointMake(1, 2);
        
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

        audio.music.theme.data = new Audio("./audio/theme.wav");
        audio.music.theme.data.addEventListener("ended", function(){
            audio.music.theme.data.currentTime = 37.06;
            audio.music.theme.data.play();
        });

        audio.sfx.onLose.data = new Audio("./audio/on_lose.wav");

        audio.sfx.mirrorMove.data = {
            idx : 0,
            ringBuffer : [
                new Audio("./audio/mirror_adjust.mp3"), 
                new Audio("./audio/mirror_adjust.mp3"),
                new Audio("./audio/mirror_adjust.mp3"),
                new Audio("./audio/mirror_adjust.mp3")
            ]
        }
        audio.sfx.mirrorMove.isRoundRobin = true;
        audio.sfx.mirrorReflect.data = new Audio("./audio/reflect.m4a");
    }
    canvas1.startFrame = function(t, dt) {
        GameState.time = t;
        if (!window.initResourcesReady) {
            scangamepads();
            return;
        }

        if (!audio.isInit) {
            audio.music.theme.on = true;
            audio.music.theme.data.play();
            audio.isInit = true;
        }

        if (respawnDelay > 0) {
            respawnDelay = Math.max(0, respawnDelay - dt)
            if (respawnDelay > 0) {
                return;
            }
        }

        if (activeGamepad) {
            pollControllerStatus();
            handleDPad();
            handleAnalogueStick();
        }

        if (currentState == GameState.pre && ((this.cursor.z == 1) || justPressedByKey("start"))) {
            currentState = GameState.running;
            ScorePoint.prevCollectTime = GameState.time;
        }

        if (currentState != GameState.running) {
            return;
        }

        if (justPressedByKey("pause") && toggle("pause")) {
            //return;
        }
        const toggled = toggleStateOnByKey("pause");
        if (toggled) {
            //return;
        }
    };

    const THING_TYPE = {
        SCORE_POINT : 0,
    };
    class Thing {
        constructor(x, y) {
            this.coords   = [x, y];
            this.isActive = false;
            this.data     = null;
        }        
    }
    class ScorePoint {
        constructor(base) {
            this.base      = base;
            this.value     = 10;
            this.thingType = THING_TYPE.SCORE_POINT;
        }
    }

    function handleLoss() {
        vibrateController();
        respawnDelay = respawnDelayMax;
        Score.count      = Math.floor(Score.count * .5);
        Score.multiplier = Laser.defaultSpeed / 60;
        laser.distPer = Score.multiplier * 60;
    }

    function vibrateController() {
        return;
        Input.vibrationActuator.playEffect("dual-rumble", {
            duration        : 100,
            strongMagnitude : 0.25,
            weakMagnitude   : 0.25
        });
    }

    window.addEventListener("unload", () => {
        if (Input.vibrationActuator) { 
            Input.vibrationActuator.reset();      
        }
    }, 
    false);

    canvas1.update = function(t, dt, g) {
        if (!window.initResourcesReady || 
            currentState != GameState.running || 
            respawnDelay > 0) {
            return; 
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
        laser.translateLaserBy(dx, dy, false);
        
        // check collision with mirrors 
        //(very simple collision possible
        // since the laser is guaranteed to hit at a certain pixel)
        let mirrorCollisionOccurred = false;
        let mirr = null;
        for (let i = 0; i < mirrors.length && !mirrorCollisionOccurred; ++i) {
            for (let j = 0; j < mirrors[i].length && !mirrorCollisionOccurred; ++j) {
                mirr = mirrors[i][j];
                
                if ((
                    (laser.x - mirr.x) * (laser.x - mirr.x) + 
                    (laser.y - mirr.y) * (laser.y - mirr.y)) < 20) 
                {
                    laser.x = mirr.x;
                    laser.y = mirr.y;
                    mirrorCollisionOccurred = true;
                }                
            }
        }
        frameData.mirrorCollisionOccurred = mirrorCollisionOccurred;
                        
        Mirror.orient = curControl;
        
        let nextLaserOrient = laser.orient;      
        if (mirrorCollisionOccurred) {
            const orient = handleLaserAndMirrorCollision(laser);
            if (LaserLive) {
                laser.orient          = orient;
                laser.tailPosition[0] = laser.x;
                laser.tailPosition[1] = laser.y;
            }  else {
                handleLoss();
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
        if (!mirrorCollisionOccurred) { 
            if ( 
                laser.x < -laser.width || 
                laser.x > worldDimensions[0] + laser.width || 
                laser.y < -laser.height || 
                laser.y > worldDimensions[1] + laser.height
            ) {
                // respawn at game starting point
                canvas1.resetLaserPosition(laser);
                handleLoss();
            } else {
                handleMapCollision();
            }
        }
       
    }

    function renderTransformBegin(g) {
        g.save();

        //g.translate(-currScale[0] / 2, -currScale[1] / 2)
        g.scale(
            currScale[0] / worldDimensions[0],
            currScale[1] / worldDimensions[1]
        );
        //g.translate(currScale[0] / 2, currScale[1] / 2)
    }
    function renderTransformEnd(g) {
    	g.restore();
    }

    canvas1.render = function(t, dt, g) {

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
        
        if (currentState != GameState.running) {
            g.fillStyle = "blue";
            g.font = "50px Calibri";
            let title = "Laser Mirrors";
            let titleSizeOffset = g.measureText(title).width / 2;
            g.fillText(title,
                       worldDimensions[0] / 2  - titleSizeOffset,
                       worldDimensions[1] / 4
            );
            
            g.font = "25px Calibri";       
            let msg = "Click to Start, Instructions Below";
            let msgSizeOffset = g.measureText(msg).width / 2;
            g.fillText(msg, 
                       worldDimensions[0] / 2  - msgSizeOffset,
                       worldDimensions[1] / 3
            );

            renderTransformEnd(g);
            return;
        } else {
            g.fillStyle = (respawnDelay > 0) ? "red" : "blue";
            g.font = "30px Calibri";
            let msg = "Score: " + Score.count + ", Reward: x " + Math.max(2 / (1 + (GameState.time - ScorePoint.prevCollectTime))).toFixed(2) + ", Speed: " + laser.distPer;

            // let msgSizeOffset = g.measureText(msg).width / 2;
            g.fillText(msg,
               20,
                worldDimensions[1] - 20
            );
        }

        renderThings(g, t, dt);
                
        drawLaser(g, laser, t, dt);


        renderTransformEnd(g);
	}

   draw2DCanvases([canvas1]);