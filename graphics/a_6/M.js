
//////////////////////////////////////////////////////////////////////////////
// M is an object containing methods that let you manipulate 4x4 matrices.
//////////////////////////////////////////////////////////////////////////////

// anonymous closure
var M = (function() {

var _M = {};

//////////////////////////////////////////////////////////////////////////////
// Your task is to implement the following methods of object M:
//////////////////////////////////////////////////////////////////////////////

// _M.identity  = function(m)          {           } // Set m values to identity matrix.
// _M.restore   = function(m)          {           } // Pop from a stack to set the 16 values of m. //
// _M.rotateX   = function(m, radians) {           } // Modify m, rotating about the X axis.
// _M.rotateY   = function(m, radians) {           } // Modify m, rotating about the Y axis.
// _M.rotateZ   = function(m, radians) {           } // Modify m, rotating about the Z axis.
// _M.save      = function(m)          {           } // Push the 16 values of m onto a stack. //
// _M.scale     = function(m, v)       {           } // Modify m, scaling by v[0],v[1],v[2].
// _M.transform = function(m, v)       { return m; } // Return vec v transformed by matrix m.      //
// _M.translate = function(m, v)       {           } // Modify m, translating by v[0],v[1],v[2].   //

//////////////////////////////////////////////////////////////////////////////        
// I have given you a head start by implementing some of the methods for you.
//
// Notice how I use _M.matrixMultiply() to help implement other methods.
//////////////////////////////////////////////////////////////////////////////

_M.translate = function(m, v) {
   _M.matrixMultiply(m, translationMatrix(v), m);
}

var translationMatrix = function(v) {
   return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, v[0],v[1],v[2],1 ];
}

_M.matrixMultiply = function(a, b, dst) {
   var n, tmp = []; 

   // PUT THE RESULT OF a x b INTO TEMPORARY MATRIX tmp.

   for (n = 0 ; n < 16 ; n++)
      tmp.push( a[n&3     ] * b[    n&12] +
                a[n&3 |  4] * b[1 | n&12] +
                a[n&3 |  8] * b[2 | n&12] +
                a[n&3 | 12] * b[3 | n&12] );

   // COPY tmp VALUES INTO DESTINATION MATRIX dst.

   for (n = 0 ; n < 16 ; n++)
      dst[n] = tmp[n];
}

_M.transform = function(m, v)  {

    // IF v[3] IS UNDEFINED, SET IT TO 1 (THAT IS, ASSUME v IS A POINT).

    var x = v[0], y = v[1], z = v[2], w = v[3] === undefined ? 1 : v[3];

    // RETURN RESULT OF TRANSFORMING v BY MATRIX m.

    return [ x * m[0] + y * m[4] + z * m[ 8] + w * m[12],
             x * m[1] + y * m[5] + z * m[ 9] + w * m[13],
             x * m[2] + y * m[6] + z * m[10] + w * m[14],
             x * m[3] + y * m[7] + z * m[11] + w * m[15] ];
}

// SAVE / RESTORE

var _stack = [];

_M.save = function(m) {
    _stack.push.apply(_stack, m);
};

_M.restore = function(m) {
    for (var i = 15; i >= 0; --i) {
        m[i] = _stack.pop();
    }
};

// SCALE

var scaleMatrix = function(v) {
    var x, y, z = 0;
    if (v instanceof Array) {
       x = v[0];
       y = v[1];
       z = v[2];
    }
    else {
       x = y = z = v;
    }
    
    return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
}

_M.scale = function(m, v) {
    _M.matrixMultiply(m, scaleMatrix(v), m);
}

// IDENTITY

_M.identity = function(m) {
    for (var i = 1; i < 16; ++i) {
        m[i] = 0;
    }
    for (var k = 0; k < 16; k += 5) {
        m[k] = 1;
    }
}

// ROTATE X

var rotationXMatrix = function(radians) {
    var c = Math.cos(radians);
    var s = Math.sin(radians);
    return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1];
}

_M.rotateX = function(m, radians) {
    _M.matrixMultiply(m, rotationXMatrix(radians), m);
}

// ROTATE Y

var rotationYMatrix = function(radians) {
    var c = Math.cos(radians);
    var s = Math.sin(radians);
    return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1];
}

_M.rotateY = function(m, radians) {
    _M.matrixMultiply(m, rotationYMatrix(radians), m);
}

// ROTATE Z

var rotationZMatrix = function(radians) {
    var c = Math.cos(radians);
    var s = Math.sin(radians);
    return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1];
}

_M.rotateZ = function(m, radians) {
    _M.matrixMultiply(m, rotationZMatrix(radians), m);
}

// PERSPECTIVE - Why not?

var perspectiveMatrix = function(v) {
    var x, y, z = 0;
    if (v instanceof Array) {
       x = v[0];
       y = v[1];
       z = v[2];
    }
    else {
       x = y = z = v;
    }
    
    return [1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1];
}

_M.perspective = function(m, v) {
    _M.matrixMultiply(m, perspectiveMatrix(v), m);
}

return _M;

})();
