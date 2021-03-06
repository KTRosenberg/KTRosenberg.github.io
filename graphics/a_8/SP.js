var SPLINE = (function(){
   _SPLINE = {};

   var Hermite = [ 2,-3,0,1,  -2,3,0,0,  1,-2,1,0,  1,-1,0,0 ];
   _SPLINE.Hermite = Hermite;

   var Bezier = [ -1,3,-3,1, 3,-6,3,0, -3,3,0,0, 1,0,0,0];
   _SPLINE.Bezier = Bezier;

   function cubic(A, t) { return A[0] * t*t*t + A[1] * t*t + A[2] * t + A[3]; }
   _SPLINE.cubic = cubic;


   function getCurvesHermite(multiSpline, granularity) {
      if (granularity === undefined) {
         granularity = 1 / 20;
      }
      var curves = [];

      var P = multiSpline.P;
      var R = multiSpline.R;

      for (var n = 0 ; n < P.length-1 ; n++) {
         var X = M.transform(Hermite, [ P[n][0], P[n+1][0], R[n][0], R[n+1][0] ]);
         var Y = M.transform(Hermite, [ P[n][1], P[n+1][1], R[n][1], R[n+1][1] ]);
         var Z = M.transform(Hermite, [ P[n][2], P[n+1][2], R[n][2], R[n+1][2] ]);

         var curve = [];
         for (var t = 0 ; t < 1.0001 ; t += granularity) {
            curve.push( [ cubic(X, t), cubic(Y, t), cubic(Z, t) ] );
         }
         curves.push(curve);
      }

      return curves;
   }
   _SPLINE.getCurvesHermite = getCurvesHermite;


   function getCurvesBezier(multiSpline, granularity) {
      if (granularity === undefined) {
         granularity = 1 / 20;
      }
      var curves = [];

      var C = multiSpline.curveData;

      for (var n = 0, j = 3; n < C.length - 1; n += 3, j += 3) {
         if (j >= C.length) {
            break;
         }
         var X = M.transform(Bezier, [ C[n][0], C[n + 1][0], C[n + 2][0], C[n + 3][0] ]);
         var Y = M.transform(Bezier, [ C[n][1], C[n + 1][1], C[n + 2][1], C[n + 3][1] ]);
         var Z = M.transform(Bezier, [ C[n][2], C[n + 1][2], C[n + 2][2], C[n + 3][2] ]);

         var curve = [];
         for (var t = 0 ; t < 1.0001 ; t += granularity) {
            curve.push( [ cubic(X, t), cubic(Y, t), cubic(Z, t) ] );
         }
         curves.push(curve);
      }
      return curves;
   }
   _SPLINE.getCurvesBezier = getCurvesBezier;


   function MultiSplineHermite(curveData, getCurvesProcedure) {
      var orderedPoints = curveData[0];
      var orderedDerivatives = curveData[1];
      this.P = [];
      var numPoints = orderedPoints.length;
      this.numPoints = numPoints;
      for (var p = 0; p < numPoints; p++) {
         this.P.push(orderedPoints[p]);
      }
      this.R = [];
      for (var r = 0; r < numPoints; r++) {
         this.R.push(orderedDerivatives[r]);
      }

      this.getCurves = getCurvesProcedure;
   }
   _SPLINE.MultiSplineHermite = MultiSplineHermite;

   function MultiSplineBezier(curveData, getCurvesProcedure) {
      this.curveData = curveData;
      this.getCurves = getCurvesProcedure;
   }
   _SPLINE.MultiSplineBezier = MultiSplineBezier;

   return _SPLINE;

}());

function initInClassExample() {
   var P = [];
   var R = [];
   P.push([ -.5, -.5,  0]);
   P.push([  .5,  .5, .5]);
   P.push([  .5, -.5,  0]);

   R.push([   1,   0,  0]);
   R.push([   0,   1,  Math.sin(time)]);
   R.push([   1,   0,  Math.cos(time)]);

   return [
      [P, R]
   ];
}

function initRandomHermiteCurves(numCurves) {
   var splines = [];

   var canvas = document.getElementById("canvas1");
   var width = canvas.width;
   var height = canvas.height;

   for (var i = 0; i < numCurves; i++) {
      var numPoints = getRandomNumber(1, 15);
      var P = [];
      var R = [];
      for (var j = 0; j < numPoints + 1; j++) {
         P.push([getRandomNumber(-width, width) / 250, getRandomNumber(-height, height) / 250, getRandomNumber(-width, width) / 250]);
         R.push([getRandomNumber(-15, 15), getRandomNumber(-15, 15), getRandomNumber(-15, 15)]);
      }
      splines.push([P, R]);
   }

   return splines;
}

function dynamizeRandomTest(curves) {
   for (var i = 0; i < curves.length; i++) {
      var R = curves[i][1];
      for (var j = 0; j < R.length; j++) {
         var m = R[j];
         for (var c = 0; c < 3; c++) {
            var val = m[c];
            m[c] = (Math.cos(time) + 1) + (Math.cos(time + val) + 1);
         }
      }
   }
}

function getRandomNumber(min, max) {
   return Math.floor(Math.random() * (max - min)) + min;
}
