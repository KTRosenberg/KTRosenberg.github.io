var S = {};

   S._quad = function(f, u0, v0, u1, v1, optList) {
      return [
         f(u0, v0, optList),
         f(u1, v0, optList),
         f(u1, v1, optList),
         f(u0, v1, optList),
         f(u0, v0, optList)
      ];
   }

   S.parametricMesh = function(f, nu, nv, optList) {
      var i, j, u, v, C = [];
      for (j = 0 ; j < nv ; j++) {
         v = j / nv;
         for (i = 0 ; i < nu ; i++) {
            u = i / nu;
	    C.push(S._quad(f, u, v, u + 1/nu, v + 1/nv, optList));
         }
      }
      return C;
   }

   S.tube = function(u, v) {
      var theta = 2 * Math.PI * u;
      return [ Math.cos(theta),
               Math.sin(theta),
	       2 * v - 1 ];
   }

   S.sphere = function(u, v, optList) {
      var optArg = S._getOptArg(0, optList);
      var offset = (optArg.isValid) ? optArg.arg : 0.5; 
      var theta = 2 * Math.PI * u;
      var phi = Math.PI * (v - offset);
      return [
         Math.cos(theta) * Math.cos(phi),
         Math.sin(theta) * Math.cos(phi),
         Math.sin(phi)
      ];
   }

   S.torus = function(u, v, optList) {
      var optArg = S._getOptArg(0, opList);
      var r = (optArg.isValid) ? optArg.arg : 0.5;

      var theta = 2 * Math.PI * u;
      var phi = 2 * Math.PI * v;
      return [
         Math.cos(theta) * (1 + (r * Math.cos(phi))),
         Math.sin(theta) * (1 + (r * Math.cos(phi))),
         r * Math.sin(phi)
      ];
   }

   S._getOptArg = function(index, opList) {
      var arg = null;
      var isValid = false;
      if (opList !== undefined && opList.length > index) {
         offset = opList[0];
         isValid = true;
      }
      return {isValid: isValid, arg : arg};
   }

