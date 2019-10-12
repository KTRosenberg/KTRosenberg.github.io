"use strict"

const vec40   = new Float32Array([0.0, 0.0, 0.0, 0.0]);
const vec40W1 = new Float32Array([0.0, 0.0, 0.0, 1.0]);
const vec41   = new Float32Array([1.0, 1.0, 1.0, 1.0]);

const NO_REFLECT  = vec40;
const NO_REFRACT  = vec41;
const OPAQUE      = vec41;
const TRANSPARENT = vec40W1;

const IDX_REFRACT_WATER        = 1.33;
const IDX_REFRACT_ICE          = 1.31;
const IDX_REFRACT_DIAMOND      = 2.417;
const IDX_REFRACT_SAPPHIRE     = 1.77;
const IDX_REFRACT_FUSED_QUARTZ = 1.46;

const GLSL_TYPE_INT   = 0;
const GLSL_TYPE_FLOAT = 1;
const GLSL_TYPE_VEC2  = 2;
const GLSL_TYPE_VEC3  = 3;
const GLSL_TYPE_VEC4  = 4;
const GLSL_TYPE_IVEC2 = 5;
const GLSL_TYPE_IVEC3 = 6;
const GLSL_TYPE_IVEC4 = 7;
const GLSL_TYPE_MAT3  = 8;
const GLSL_TYPE_MAT4  = 9;
const GLSL_TYPE_BOOL  = 10;

const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;

const VERTEX_SIZE = 6; // EACH VERTEX CONSISTS OF: x,y,z, ny,ny,nz


 //////////////////////////////////////////////////////////////////
//                                                                //
//  FOR HOMEWORK, YOU CAN ALSO TRY DEFINING DIFFERENT SHAPES,     //
//  BY CREATING OTHER VERTEX ARRAYS IN ADDITION TO cubeVertices.  //
//                                                                //
 //////////////////////////////////////////////////////////////////
let H = null;

let Mat;
let matrixModule;
//let Matrix;
async function onReload(state) {
    return MR.dynamicImport(getPath("matrix.js")).then((myModule) => {
        matrixModule = myModule;
        Mat = matrixModule.Matrix;
        H = state.H;
    });
}


let createCubeVertices = () => {
   let v = [];
   let addVertex = a => {
      for (let i = 0 ; i < a.length ; i++)
         v.push(a[i]);
   }

   // EACH SQUARE CONSISTS OF TWO TRIANGLES.

   let addSquare = (a,b,c,d) => {
      addVertex(c);
      addVertex(b);
      addVertex(a);

      addVertex(b);
      addVertex(c);
      addVertex(d);
   }

   // VERTEX DATA FOR TWO OPPOSING SQUARE FACES. EACH VERTEX CONSISTS OF: x,y,z, nx,ny,nz

   let P = [[-1,-1,-1, 0,0,-1],[ 1,-1,-1, 0,0,-1],[-1, 1,-1, 0,0,-1],[ 1, 1,-1, 0,0,-1],
            [-1,-1, 1, 0,0, 1],[ 1,-1, 1, 0,0, 1],[-1, 1, 1, 0,0, 1],[ 1, 1, 1, 0,0, 1]];

   // LOOP THROUGH x,y,z. EACH TIME ADD TWO OPPOSING FACES, THEN PERMUTE COORDINATES.

   for (let n = 0 ; n < 3 ; n++) {
      addSquare(P[0],P[1],P[2],P[3]);
      addSquare(P[4],P[5],P[6],P[7]);
      for (let i = 0 ; i < P.length ; i++)
         P[i] = [P[i][1],P[i][2],P[i][0], P[i][4],P[i][5],P[i][3]];
   }

   return v;
}

let cubeVertices = createCubeVertices();

/*
// data for interleaved attribute cube
const cubeVertexCount = 24;
const cubeIndexCount  = 36;
// front, right, back, left, top, bottom
const cubeVertexData = new Float32Array([
    // pos             // normals      // uv coords                                  
    -1.0,  1.0,  1.0,  0.0, 0.0, 1.0,  0.0, 1.0, // Top Left
    -1.0, -1.0,  1.0,  0.0, 0.0, 1.0,  0.0, 0.0, // Bottom Left 
     1.0, -1.0,  1.0,  0.0, 0.0, 1.0,  1.0, 0.0, // Bottom Right
     1.0,  1.0,  1.0,  0.0, 0.0, 1.0,  1.0, 1.0, // Top Right
     
     1.0,  1.0,  1.0,  1.0, 0.0, 0.0,  0.0, 1.0, // Top Left
     1.0, -1.0,  1.0,  1.0, 0.0, 0.0,  0.0, 0.0, // Bottom Left 
     1.0, -1.0, -1.0,  1.0, 0.0, 0.0,  1.0, 0.0, // Bottom Right
     1.0,  1.0, -1.0,  1.0, 0.0, 0.0,  1.0, 1.0, // Top Right
     
     1.0,  1.0, -1.0,  0.0, 0.0,-1.0,  0.0, 1.0, // Top Left
     1.0, -1.0, -1.0,  0.0, 0.0,-1.0,  0.0, 0.0, // Bottom Left 
    -1.0, -1.0, -1.0,  0.0, 0.0,-1.0,  1.0, 0.0, // Bottom Right
    -1.0,  1.0, -1.0,  0.0, 0.0,-1.0,  1.0, 1.0, // Top Right
    
    -1.0,  1.0, -1.0, -1.0, 0.0, 0.0,  0.0, 1.0, // Top Left
    -1.0, -1.0, -1.0, -1.0, 0.0, 0.0,  0.0, 0.0, // Bottom Left 
    -1.0, -1.0,  1.0, -1.0, 0.0, 0.0,  1.0, 0.0, // Bottom Right
    -1.0,  1.0,  1.0, -1.0, 0.0, 0.0,  1.0, 1.0, // Top Right
    
    -1.0,  1.0, -1.0,  0.0, 1.0, 0.0,  0.0, 1.0, // Top Left
    -1.0,  1.0,  1.0,  0.0, 1.0, 0.0,  0.0, 0.0, // Bottom Left 
     1.0,  1.0,  1.0,  0.0, 1.0, 0.0,  1.0, 0.0, // Bottom Right
     1.0,  1.0, -1.0,  0.0, 1.0, 0.0,  1.0, 1.0, // Top Right
     
    -1.0, -1.0,  1.0,  0.0,-1.0, 0.0,  0.0, 1.0, // Top Left
    -1.0, -1.0, -1.0,  0.0,-1.0, 0.0,  0.0, 0.0, // Bottom Left 
     1.0, -1.0, -1.0,  0.0,-1.0, 0.0,  1.0, 0.0, // Bottom Right
     1.0, -1.0,  1.0,  0.0,-1.0, 0.0,  1.0, 1.0  // Top Right
]);
const cubeIndexData = new Uint16Array([
    0, 1, 2,
    2, 3, 0,
    
    4, 5, 6,
    6, 7, 4,
    
    8, 9, 10,
    10, 11, 8,
    
    12, 13, 14,
    14, 15, 12,
    
    16, 17, 18,
    18, 19, 16,
    
    20, 21, 22,
    22, 23, 20
]);
*/


async function setup(state) {
    hotReloadFile(getPath('week5.js'));

    matrixModule = await import(getPath("matrix.js"));
    Mat = matrixModule.Matrix;
    state.H      = new matrixModule.Dynamic_Matrix4x4_Stack();

    state.m = new Matrix();

    let libSources = await MREditor.loadAndRegisterShaderLibrariesForLiveEditing(gl, "libs", [
        { 
            key : "pnoise", path : "shaders/noise.glsl", foldDefault : true
        }   
    ]);

    if (!libSources) {
        throw new Error("Could not load shader library");
    }

    // load vertex and fragment shaders from the server, register with the editor
    let shaderSource = await MREditor.loadAndRegisterShaderForLiveEditing(
        gl,
        "mainShader",
        { 
            onNeedsCompilation : (args, libMap, userData) => {
                const stages = [args.vertex, args.fragment];
                const output = [args.vertex, args.fragment];

                const implicitNoiseInclude = true;
                if (implicitNoiseInclude) {
                    let libCode = MREditor.libMap.get("pnoise");

                    for (let i = 0; i < 2; i += 1) {
                        const stageCode = stages[i];
                        const hdrEndIdx = stageCode.indexOf(';');
                        
                        /*
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        output[i] = hdr + "\n#line 1 1\n" + 
                                    libCode + "\n#line " + (hdr.split('\n').length) + " 0\n" + 
                                    stageCode.substring(hdrEndIdx + 1);
                        console.log(output[i]);
                        */
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
                        output[i] = hdr + "\n#line 2 1\n" + 
                                    "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
                            stageCode.substring(hdrEndIdx + 1);

                        //console.log(output[i]);
                    }
                }

                MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
                    output[0],
                    output[1],
                    libMap
                );
            },
            onAfterCompilation : (program) => {
                state.program = program;

                gl.useProgram(program);

                state.uColorLoc        = gl.getUniformLocation(program, 'uColor');
                state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');
            } 
        },
        {
            paths : {
                vertex   : "shaders/vertex.vert.glsl",
                fragment : "shaders/fragment.frag.glsl"
            },
            // foldDefault : {
            //     vertex   : true,
            //     fragment : false
            // }
        }
    );

    state.cursor = ScreenCursor.trackCursor(MR.getCanvas());

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }

    // Create a square as a triangle strip consisting of two triangles
    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);

 ///////////////////////////////////////////////////////////
//                                                         //
//  HINT: IF YOU WANT TO IMPLEMENT MORE THAN ONE SHAPE,    //
//  YOU MIGHT WANT TO CALL gl.bufferData()                 //
//  MULTIPLE TIMES IN onDraw() INSTEAD OF HERE,            //
//  USING OTHER ARRAY VALUES IN ADDITION TO cubeVertices.  //
//                                                         //
 ///////////////////////////////////////////////////////////

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( cubeVertices ), gl.STATIC_DRAW);

    let bpe = Float32Array.BYTES_PER_ELEMENT;

    let vao = gl.createVertexArray();
    state.vao = vao;
    gl.bindVertexArray(state.vao);

    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 0);

    let aNor = gl.getAttribLocation(state.program, 'aNor');
    gl.enableVertexAttribArray(aNor);
    gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 3);
}


 /////////////////////////////////////////////////////////////////////
//                                                                   //
//  FOR HOMEWORK, YOU NEED TO IMPLEMENT THESE SIX MATRIX FUNCTIONS.  //
//  EACH FUNCTION SHOULD RETURN AN ARRAY WITH 16 VALUES.             //
//                                                                   //
//  SINCE YOU ALREADY DID THIS FOR THE PREVIOUS ASSIGNMENT,          //
//  YOU CAN JUST USE THE FUNCTION DEFINITIONS YOU ALREADY CREATED.   //
//                                                                   //
 /////////////////////////////////////////////////////////////////////

let identity = ()       => [];
let rotateX = t         => [];
let rotateY = t         => [];
let rotateZ = t         => [];
let scale = (x,y,z)     => [];
let translate = (x,y,z) => [];

let inverse = src => {
  let dst = [], det = 0, cofactor = (c, r) => {
     let s = (i, j) => src[c+i & 3 | (r+j & 3) << 2];
     return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                 - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                 + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
  }
  for (let n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (let n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (let n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}

let multiply = (a, b) => {
   let c = [];
   for (let n = 0 ; n < 16 ; n++)
      c.push( a[n&3     ] * b[    n&12] +
              a[n&3 |  4] * b[1 | n&12] +
              a[n&3 |  8] * b[2 | n&12] +
              a[n&3 | 12] * b[3 | n&12] );
   return c;
}

let Matrix = function() {
   let topIndex = 0,
       stack = [ identity() ],
       getVal = () => stack[topIndex],
       setVal = m => stack[topIndex] = m;

   this.identity  = ()      => setVal(identity());
   this.restore   = ()      => --topIndex;
   this.rotateX   = t       => setVal(multiply(getVal(), rotateX(t)));
   this.rotateY   = t       => setVal(multiply(getVal(), rotateY(t)));
   this.rotateZ   = t       => setVal(multiply(getVal(), rotateZ(t)));
   this.save      = ()      => stack[++topIndex] = stack[topIndex-1].slice();
   this.scale     = (x,y,z) => setVal(multiply(getVal(), scale(x,y,z)));
   this.translate = (x,y,z) => setVal(multiply(getVal(), translate(x,y,z)));
   this.value     = ()      => getVal();
}

function onStartFrame(t, state) {

    state.color0 = [1,.5,.2];


    // uTime IS TIME IN SECONDS SINCE START TIME.

    if (!state.tStart)
        state.tStart = t;
    state.time = (t - state.tStart) / 1000;

    gl.uniform1f (state.uTimeLoc  , state.time);


    // uCursor WILL GO FROM -1 TO +1 IN xy, WITH z = 0 FOR MOUSE UP, 1 FOR MOUSE DOWN.

    let cursorValue = () => {
       let p = state.cursor.position(), canvas = MR.getCanvas();
       return [ p[0] / canvas.clientWidth * 2 - 1, 1 - p[1] / canvas.clientHeight * 2, p[2] ];
    }

    gl.uniform3fv(state.uCursorLoc, cursorValue());


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {

    let m = state.H;

    gl.uniformMatrix4fv(state.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(state.uProjLoc, false, new Float32Array(projMat));

 //////////////////////////////////////////////////////////////////////
//                                                                    //
//  THIS IS THE EXAMPLE OF TWO WAVING ARMS THAT WE CREATED IN CLASS.  //
//  FOR HOMEWORK, YOU WILL WANT TO DO SOMETHING DIFFERENT.            //
//                                                                    //
 //////////////////////////////////////////////////////////////////////

    m.save();
    Mat.identity(m.matrix());
    Mat.translate(m.matrix(), 0,0,-6);

    for (let side = -1 ; side <= 1 ; side += 2) {
       let theta = sin(3 * state.time) * side;
       m.save();
          Mat.translate(m.matrix(), side * .3,0,0);
          Mat.rotateZ(m.matrix(), theta);               // SHOULDER
          Mat.rotateY(m.matrix(), -side + .5 * theta);
          Mat.translate(m.matrix(), side * .3,0,0);
          m.save();
             Mat.scale(m.matrix(), .3,.05,.05);
             gl.uniform3fv(state.uColorLoc, state.color0 );
             gl.uniformMatrix4fv(state.uModelLoc, false, m.matrix() );
             gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
          m.restore();

          Mat.translate(m.matrix(), side * .3,0,0);
          Mat.rotateZ(m.matrix(), theta);              // ELBOW
          Mat.translate(m.matrix(), side * .3,0,0);
          m.save();
             Mat.scale(m.matrix(), .3,.05,.05);
             gl.uniform3fv(state.uColorLoc, state.color0 );
             gl.uniformMatrix4fv(state.uModelLoc, false, m.matrix() );
             gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
          m.restore();
       m.restore();
    }

    m.restore();
}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week5',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
        onReload     : onReload
    };

    return def;
}
