var SHAPE = (function() {
   var my = {};

   function addMeshVertices(V, m, n, func) {
      function append(A) {
         for (let i = 0 ; i < A.length ; i++)
            V.push(A[i]);
      }
      for (let j = 0 ; j < n ; j++)
      for (let i = 0 ; i < m ; i++) {
         let A = func( i   /m,  j   /n),
	     B = func((i+1)/m,  j   /n),
             C = func( i   /m, (j+1)/n),
	     D = func((i+1)/m, (j+1)/n);
         append(A); append(B); append(D); // Lower right of square.
         append(D); append(C); append(A); // Upper left of square.
      }
      return V;
   }

   function addDiskVertices(V, n, zSign, z) {
      function f(i) {
         let theta = zSign * 2 * Math.PI * i / n;
	     V.push(Math.cos(theta),Math.sin(theta),z, 0,0,zSign, 0,0);
      }
      for (let i = 0 ; i < n ; i++) {
         f(i  );
         f(i+1);
         V.push(0,0,z, 0,0,zSign, 0,0);
      }
      return V;
   }

   function addTubeVertices(V, n) {
      return addMeshVertices(V, n, 1, function(u, v) {
         let theta = 2 * Math.PI * u;
         let z     = 2 * v - 1;
         let c     = Math.cos(theta);
         let s     = Math.sin(theta);
         return [c,s,z, c,s,0, u,v];
      });
   }

   my.cylinder = function(n) {
      var V = [];
      addDiskVertices(V, n, -1, -1);
      addTubeVertices(V, n);
      addDiskVertices(V, n,  1,  1);
      return V;
   }

  function addSphereVertices(V, n) {
      return addMeshVertices(V, n, n, function(u, v) {
         let theta = 2 * Math.PI * u;
         let phi   = Math.PI * (v - .5);
         let z     = Math.sin(phi);
         let c     = Math.cos(theta) * Math.cos(phi);
         let s     = Math.sin(theta) * Math.cos(phi);
         return [c,s,z, c,s,z, u,v];
      });
  }

   my.sphere = function (n) {
      var V = [];
      addSphereVertices(V, n);
      return V;
   }

   function addTorusVertices(V, n) {
      return addMeshVertices(V, n, n, function(u, v) {
         let theta = 2 * Math.PI * u;
         let phi = 2 * Math.PI * v;
         let r = 0.3;

         let z = r * Math.sin(phi);
         let c = Math.cos(theta) * (1 + r * Math.cos(phi));
         let s = Math.sin(theta) * (1 + r * Math.cos(phi));

         return [
            c,s,z, 
            r * Math.cos(phi) * Math.cos(theta), 
            r * Math.cos(phi) * Math.sin(theta), 
            r * Math.sin(phi), 
            u,
            v
         ];
      });
   }

   my.torus = function(n) {
      var V = [];
      addTorusVertices(V, n);
      return V;
   }

   my.cube = function(whichFaces) {
      var V = [];

      //     _
      //       |
      //     -
      //   |
      //      back face
      //      front face

      // vertex order, top left to bottom right
      var faces = [
         // 0
         [
            -1, 1, -1,   0,-1,0,  0,0,
            -1, 1,  1,   0,-1,0,  0,1,
             1, 1,  1,   0,-1,0,  1,1,

              1, 1,  1,   0,-1,0,  1,1,
              1, 1, -1,   0,-1,0,  1,0,
             -1, 1, -1,   0,-1,0,  0,0
         ],
         // 1
         [
             1,  1,  1,   1, 0,0,  0,0,
             1, -1, -1,   1, 0,0,  0,0,
             1,  1, -1,   1, 0,0,  0,0,

            1,  1,  1,   1, 0,0,  0,0,
            1, -1,  1,   1, 0,0,  0,0,
            1, -1, -1,   1, 0,0,  0,0          
         ],
         // 2
         [
            -1, -1,  1,   0,-1,0,  0,0,
            -1, -1, -1,   0,-1,0,  0,0,
             1, -1,  1,   0,-1,0,  0,0,

            1, -1,  1,   0,-1,0,  0,0,
           -1, -1, -1,   0,-1,0,  0,0,
            1, -1, -1,   0,-1,0,  0,0
         ],
         // 3
         [
             -1,  1,  1,   -1, 0,0,  0,0,
             -1,  1, -1,   -1, 0,0,  0,0,
             -1, -1, -1,   -1, 0,0,  0,0,

            -1, -1, -1,   -1, 0,0,  0,0,
            -1, -1,  1,   -1, 0,0,  0,0,
            -1,  1,  1,   -1, 0,0,  0,0
         ],
         // 4
         [
             -1,  1, -1,   0, 0,-1,  0,0,
              1, -1, -1,   0, 0,-1,  0,0,
             -1, -1, -1,   0, 0,-1,  0,0,

             -1, 1,  -1,   0, 0,-1,  0,0,
             1,  1,  -1,   0, 0,-1,  0,0,
             1,  -1, -1,   0, 0,-1,  0,0   
         ],
         // 5
         [
             -1,  1, 1,   0, 0,1,  0,0,
              1, -1, 1,   0, 0,1,  0,0,
             -1, -1, 1,   0, 0,1,  0,0,

             -1, 1,  1,   0, 0,1,  0,0,
             1,  1,  1,   0, 0,1,  0,0,
             1,  -1, 1,   0, 0,1,  0,0 
         ]
      ];

      var facesOpp = [
      ]

      if (whichFaces === undefined) {
         for (var f = 0; f < faces.length; f++) {
            Array.prototype.push.apply(V, faces[f]);
         }
      }
      else {
         for (var f = 0; f < faces.length; f++) {
            Array.prototype.push.apply(V, faces[whichFaces[f]]);
         }
      }

      return V;
   }

   my.printVertices = function(V) {
      for (var i = 0; i < V.length; i += 8) {
         console.log("--------------------------------");
         console.log("P: " + V[i] + "," + V[i+1] + "," + V[i+2]);
         console.log("N: " + V[i+3] + "," + V[i+4] + "," + V[i+5]);
         console.log("U: " + V[i+6] + " V: " + V[i+7]);
      }
      console.log("LEN: " + (V.length / 8));
   };

   return my;
})();

