   var gameIsSet = false;
   


   var startTime = Date.now() / 1000, time = startTime;
      
   let accumulate = 0;
   let interval = 1000/120;
   let dt = 1/120;
   let timePrev = 0;
   let timeStart = 0;


   function draw2DCanvases(canvases) {
      if (!gameIsSet) {
          canvas1.Init(dt);
          gameIsSet = true;
      }
      for (var i = 0 ; i < canvases.length ; i++)
         trackCursor(canvases[i]);


      function frame(t) {
        if (timeStart == 0) {
          timeStart = t;
          window.timeStart = timeStart;
        }
        requestAnimationFrame(frame);

         var i, canvas, context;
         time = t / 1000.0;

         for (i = 0; i < canvases.length; i++)
            if ((canvas = canvases[i]).update) {
               context = canvas.getContext('2d');

               canvas.startFrame(t, dt);

               accumulate += (t - timePrev);
               timePrev = t;
               while (accumulate >= interval) {
                   accumulate -= interval;
                   canvas.update(t, dt, context);
               }

               canvas.render(dt, context);
            }
       }
       requestAnimationFrame(frame);
   }
   function trackCursor(canvas) {
      canvas.cursor = {x:0, y:0, z:0};
      canvas.setCursor = function(x, y, z) {
         var r = this.getBoundingClientRect();
	       this.cursor.x = x - r.left;
	       this.cursor.y = y - r.top;
  	    if (z !== undefined)
  	       this.cursor.z = z;
        }
      canvas.onmousedown = function(e) { 
        window.initResourcesReady = true;
        this.setCursor(e.clientX, e.clientY, 1); 
      }
      canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
      canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
   }
