var S = (function() {   
   var _S = {};

   _S._quad = function(f, u0, v0, u1, v1, optList) {
      return [
         f(u0, v0, optList),
         f(u1, v0, optList),
         f(u1, v1, optList),
         f(u0, v1, optList),
         f(u0, v0, optList)
      ];
   };

   _S.parametricMesh = function(f, nu, nv, optList) {
      var i, j, u, v, C = [];
      for (j = 0 ; j < nv ; j++) {
         v = j / nv;
         for (i = 0 ; i < nu ; i++) {
            u = i / nu;
	    C.push(S._quad(f, u, v, u + 1/nu, v + 1/nv, optList));
         }
      }
      return C;
   };

   _S.tube = function(u, v, optList) {
      var optArg = _getOptArg(0, optList);
      var fraction = (optArg.isValid && optArg.arg != 0) ? optArg.arg : 1;

      var theta = 2 * Math.PI * u / fraction;
      return [ Math.cos(theta),
               Math.sin(theta),
	            2 * v - 1 ];
   };

   _S.polygon = function(u, v, optList) {
      var optArg = _getOptArg(0, optList);
      var fraction = (optArg.isValid && optArg.arg != 0) ? optArg.arg : 1;

      var theta = 2 * Math.PI * u / fraction;
      return [ v * Math.cos(theta),
               v * Math.sin(theta),
               1];
   };

   _S.sphere = function(u, v, optList) {
      var optArg = _getOptArg(0, optList);
      var offset = (optArg.isValid) ? optArg.arg : 0.5;
      var theta = 2 * Math.PI * u;
      var phi = Math.PI * (v - offset);
      return [
         Math.cos(theta) * Math.cos(phi),
         Math.sin(theta) * Math.cos(phi),
         Math.sin(phi)
      ];
   };

   _S.torus = function(u, v, optList) {
      var optArg = _getOptArg(0, optList);
      var r = (optArg.isValid) ? optArg.arg : 0.5;

      var theta = 2 * Math.PI * u;
      var phi = 2 * Math.PI * v;
      return [
         Math.cos(theta) * (1 + (r * Math.cos(phi))),
         Math.sin(theta) * (1 + (r * Math.cos(phi))),
         r * Math.sin(phi)
      ];
   };

   _getOptArg = function(index, optList) {
      var arg = null;
      var isValid = false;
      if (optList !== undefined && optList.length > index) {
         arg = optList[0];
         isValid = true;
      }
      return {isValid: isValid, arg : arg};
   };
   
   return _S:
}());
