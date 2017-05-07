
function Material(vs, fs) {
   this.vs = vs;
   this.fs = fs;

   var bpe = Float32Array.BYTES_PER_ELEMENT;

   this.setTexture = function(file) {
      this.textureFile = file;
   }

   this.bindVertexAttribute = function(name, len, type, stride, offset) {
      var gl = this.gl,
          location = gl.getAttribLocation(this.program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, len, type, false, stride * bpe, offset * bpe);
   }

   this.init = function(gl) {
      if (! this.gl) {
         this.gl = gl;
         var program = gl.createProgram();                     // Create the WebGL program.

         var fsHeader = 'precision highp float;\n';

         function addshader(type, src) {                       // Create and attach a WebGL shader.
            var shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
               console.log('Cannot compile shader:\n\n' + gl.getShaderInfoLog(shader));
            gl.attachShader(program, shader);
         };

         /////////////////////////////////////////////
         gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
         gl.enable(gl.BLEND);

         addshader(gl.VERTEX_SHADER  , vs);                    // Add vertex and fragment shaders.
         addshader(gl.FRAGMENT_SHADER, fsHeader + fs);



         gl.linkProgram(program);                              // Link program, report any errors.
         if (! gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log('Could not link the shader program!');

         // -------------- IF A TEXTURE FILE HAS BEEN SPECIFIED, LOAD IN THE TEXTURE -------------

         if (this.textureFile && ! this.texture) {
	         var image = new Image(), texture = gl.createTexture(), that = this;
            image.onload = function() {
	         try {
                  gl.bindTexture   (gl.TEXTURE_2D, texture);
                  gl.pixelStorei   (gl.UNPACK_FLIP_Y_WEBGL, true);
                  gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                  gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                  gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                  gl.generateMipmap(gl.TEXTURE_2D);
                  that.texture = texture;
	         }
	         catch(e) { console.log(e); }
	      };
	      image.src = this.textureFile;
	   }
      this.program = program;
   }

      gl.useProgram(this.program);                             // Load this shader program into GPU.

      let location = gl.getUniformLocation(this.program, 'uSampler');
      if (location && this.texture) {                          // If there is a texture, then
         gl.uniform1i    (location, 0);
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture  (gl.TEXTURE_2D, this.texture);        //    bind it to the shader program.
      }

      /////////////////////////////////////////////////////////////

      uLights = [];
      for (var i = 0; i < NLIGHTS; i++) {
         let name = "uLights[" + i + "].";
         let lDir = gl.getUniformLocation(this.program, name + "direction");
         let cDir = gl.getUniformLocation(this.program, name + "color");
         uLights.push({
            direction : lDir,
            color : cDir
         });
      }

      function mix(a, b, t) { 
         return a + t * (b - a);
      }

      for (var i = 0 ; i < uLights.length; i++) {
         // var c = [0.3, 0.25 , 1.0];
         var c = [1.0, 0.25 , 0.39];
         if (i == 0) {
            var d = [0.0, Math.sin(time), .5];
            if (stopTestAnimation !== undefined && stopTestAnimation) {
               d = [0.0, -Math.sin(time), .5]; 
            }
            
            gl.uniform3f(uLights[i].direction, d[0], d[1], d[2]);
            gl.uniform3f(uLights[i].color, c[0], c[1], c[2]);
         }
         else if (i == 1) {
            // var d = [0.0 ,Math.sin(time),.5];
            // var c = [1.0, 1.0 / 2, 1.0 / 2];
            // gl.uniform3f(uLights[i].direction, d[0], d[1], d[2]);
            // gl.uniform3f(uLights[i].color, c[0], c[1], c[2]);
         
            var d = [0.0, -1, -1.0];
            if (stopTestAnimation !== undefined && stopTestAnimation) {
               d = [0.0, 1, -1.0]; 
            }

            //var c = [1.0 / 2, 1.0 / 2, 1.0 / 2];
            gl.uniform3f(uLights[i].direction, d[0], d[1], d[2]);
            gl.uniform3f(uLights[i].color, c[0], c[1], c[2]);          
         }
      }
      /////////////////////////////////////////////////////////////
   }
}

function SceneObject(vertices) {
   this.matrix = M.identityMatrix();

   this.setMatrix = function(src) {
      M.copy(this.matrix, src);
   }

   this.setVertices = function(vertices) {
      this.vertices = vertices;
   }

   this.setMaterial = function(material) {
      this.material = material;
   }

   this.init = function(gl) {
      if (! this.gl) {
         this.gl = gl;
         this.buffer = gl.createBuffer();
         this.vertexData = new Float32Array(this.vertices);
      }
      this.material.init(gl);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
      this.material.bindVertexAttribute('aPos', 3, gl.FLOAT, 8, 0);
      this.material.bindVertexAttribute('aNor', 3, gl.FLOAT, 8, 3);
      this.material.bindVertexAttribute('aUV' , 2, gl.FLOAT, 8, 6);
   },

   this.translateTexture = function(amountU, amountV, groupNums) {
      if (this.vertexData === undefined) {
         return;
      }
      if (groupNums === undefined) {
         let v_ = this.vertexData;
         let len = this.vertexData.length;
         let  ufloat = new Float32Array(1);
         let  vfloat = new Float32Array(1);
         for (var i = 0; i < len; i += 8) { 
            ufloat[0] = (1.0 + amountU) % 1.0;
            vfloat[0] = (1.0 + amountV) % 1.0;
            v_[i + 6] += ufloat[0];
            v_[i + 7] += vfloat[0];
         }
      }
      else {
         let v_ = this.vertexData;
         let len = this.vertexData.length;
         let  ufloat = new Float32Array(1);
         let  vfloat = new Float32Array(1);
         for (var group = 0; group < groupNums.length; groupNums++) {
            let i = groupNums[group] * 8;
            ufloat[0] = (1.0 + amountU) % 1.0;
            vfloat[0] = (1.0 + amountV) % 1.0;
            v_[i + 6] += ufloat[0];
            v_[i + 7] += vfloat[0];      
         }
      }

   }
}

function Scene() {
   this.objects = [];

   this.addObject = function(obj) {
      this.objects.push(obj);
   };

   this.removeObject = function(obj) {
      return this.objects.remove(obj);
   };
}

var time = 0;
var prevTime = 0;

var PROJECTION = (function() {
   var p = {
      near : 0.01,
      far : 10.0
   };
   return p;
}());

function gl_start(canvas, update) {           // START WEBGL RUNNING IN A CANVAS
   try { 
      canvas.gl = canvas.getContext('experimental-webgl');                 // Make sure WebGl is supported.
   } catch (e) { throw 'Sorry, your browser does not support WebGL.'; }

   var gl = canvas.gl;
   gl.enable(gl.DEPTH_TEST);
   gl.depthRange(0, 10);
   gl.depthFunc(gl.LEQUAL);

   setTimeout(function() {
      setInterval(function() {                                             // Start the animation loop.
         var scene = canvas.scene;
         if (! scene)
            return;

         if (gl.startTime === undefined)                                   // First time through,
            gl.startTime = Date.now();
                                              //    record the start time.
         prevTime = time;
         time = (Date.now() - gl.startTime)  / 1000;

         update(time, prevTime);

         for (let n = 0 ; n < scene.objects.length ; n++) {                // RENDER ALL THE OBJECTS.
            let obj = scene.objects[n];
	    if (! obj.material)                                            // Must have a material defined!
	       continue;

            obj.init(gl);                                                  // Initialize the object.

            // gl.uniform1f(gl.uTime, time);                                  // Set time for the shader.
            /////////////////////////////////////////////////////////////////////////////////////////////


            let program = obj.material.program;
            ///////////////////////////////////////////////////////////////////////////////////////////// TIME
            var timeAddress = gl.getUniformLocation(program,"uTime");
            gl.uniform1f(timeAddress, time);
            
            //-------------- SET THE FORWARD AND INVERSE TRANSFORM MATRICES IN THE GPU. --------------
            let matrixAddr = gl.getUniformLocation(program, 'matrix');

            let renderMatrix = M.identityMatrix();

            var n_ =  PROJECTION.near;
            var f_ = PROJECTION.far /*+ time*/;

            // PERSPECTIVE DONE HERE
            M.matrixMultiply([
               1,0,0,0, 
               0,1,0,0, 
               0,0, -2 / (f_ - n_), -(f_ + n_) / (f_ - n_), 
               0,0,0,1
            ]
            , obj.matrix, renderMatrix);
            gl.uniformMatrix4fv(matrixAddr, false, renderMatrix);

            let invMatrixAddr = gl.getUniformLocation(program, 'invMatrix');
            let invMatrix = M.inverseMatrix(obj.matrix);
            gl.uniformMatrix4fv(invMatrixAddr, false, invMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length / 8);       // Draw the triangles.
         }
      }, 30);

   }, 100); // Wait 100 milliseconds after page has loaded before starting WebGL.
}

