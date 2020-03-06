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

    const Input = {
        buttonsState : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        buttonsToggle : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
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
    function dpadHandler() {
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
        if (curControl != oldControl) {
            playOneShotSFX("mirrorMove");
        }
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

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  window.initResourcesReady = true;
  console.log(gamepad)
  //var d = document.createElement("div");
  //d.setAttribute("id", "controller" + gamepad.index);

  //var t = document.createElement("h1");
  //t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
  //d.appendChild(t);

  //var b = document.createElement("div");
  //b.className = "buttons";
  //for (var i = 0; i < gamepad.buttons.length; i++) {
    //var e = document.createElement("span");
    //e.className = "button";
    //e.id = "b" + i;
    //e.innerHTML = i;
    //b.appendChild(e);
  //}

  //d.appendChild(b);

  //var a = document.createElement("div");
  //a.className = "axes";

  //for (var i = 0; i < gamepad.axes.length; i++) {
    //var p = document.createElement("progress");
    //p.className = "axis";
    //p.id = "a" + i;
    //p.setAttribute("max", "2");
    //p.setAttribute("value", "1");
    //p.innerHTML = i;
    //a.appendChild(p);
  //}

  //d.appendChild(a);

  // See https://github.com/luser/gamepadtest/blob/master/index.html
  //var start = document.getElementById("start");
  //if (start) {
  //  start.style.display = "none";
  //}

  //document.body.appendChild(d);
  //requestAnimationFrame(updateStatus);
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
    for (i = 0; i < controller.axes.length; i++) {
      //var a = axes[i];
      //a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      //a.setAttribute("value", controller.axes[i] + 1);
    }
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
    function drawLaser(g, Laser, dt) {
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
    
    canvas1.resetLaserPosition = function(laser, dt) {
        laser.x = worldDimensions[0] / 2;
        laser.y = worldDimensions[1];
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
        collisionOccurred : false
    };
    canvas1.Init = function() {
        laser = new Laser(
            worldDimensions[0] / 2, worldDimensions[1], 
            20, 100, 11 * 60
        );

        currentState = GameState.pre;
        
        // initialize mirrors
        for (let i = 0, py = 100; py < 900; ++i, py += 400) { 
            for (let j = 0, px = 100; px < 1000; ++j, px += 400) {
                mirrors[i][j] = new Mirror(px, py);
            }
        }
        mirrors[2][0] = new Mirror(100, 900);
        mirrors[2][1] = new Mirror(900, 900);

        for (let i = 0; i < mapDims[0]; i += 1) {
            const row = [];
            map.push(row)
            for (let j = 0; j < mapDims[1]; j += 1) {
                row.push({
                    point : null
                });
            }
        }
        
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
    canvas1.startFrame = function() {
        if (!window.initResourcesReady) {
            scangamepads();
            return;
        }

        if (!audio.isInit) {
            audio.music.theme.on = true;
            audio.music.theme.data.play();
            audio.isInit = true;
        }

        pollControllerStatus();
        dpadHandler();


        if (currentState == GameState.pre && (this.cursor.z == 1) || justPressedByKey("start")) {
            currentState = GameState.running;
        }

        if (justPressedByKey("pause") && toggle("pause")) {
            //return;
        }
        const toggled = toggleStateOnByKey("pause");
        if (toggled) {
            //return;
        }
    };

    canvas1.update = function(t, dt, g) {
        if (!window.initResourcesReady) {
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
        frameData.collisionOccurred = collisionOccurred;
                        
        Mirror.orient = curControl;
        
        let nextLaserOrient = laser.orient;      
        if (collisionOccurred) {
            const orient = handleLaserAndMirrorCollision(laser);
            if (LaserLive) {
                laser.orient = orient;
                laser.tailPosition[0] = laser.x;
                laser.tailPosition[1] = laser.y;
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
                
        drawLaser(g, laser, dt);

        renderTransformEnd(g);
	}

   draw2DCanvases([canvas1]);