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

const UNSIGNED_SHORT_MAX_VAL = 65535;

const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const acos = Math.acos;
const asin = Math.asin;
const atan = Math.atan;
const atan2 = Math.atan2;

function vec3_normalize(arr, out) {
    out = out || new Float32Array([0.0, 0.0, 0.0]);
    const x = arr[0];
    const y = arr[1];
    const z = arr[2];

    let len = (x * x) + (y * y) + (z * z);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = arr[0] * len;
    out[1] = arr[1] * len;
    out[2] = arr[2] * len;

    return out;
}

function vec4_normalize(arr, out) {
    out = out || new Float32Array([0.0, 0.0, 0.0, 0.0]);
    const x = arr[0];
    const y = arr[1];
    const z = arr[2];
    const w = arr[3];

    let len = (x * x) + (y * y) + (z * z) + (w * w);
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = arr[0] * len;
    out[1] = arr[1] * len;
    out[2] = arr[2] * len;
    out[3] = arr[3] * len;

    return out;
}

function vec3_dot(v0, v1) {
    return (v0[0] * v1[0]) +
           (v0[1] * v1[1]) +
           (v0[2] * v1[2]);
}

function vec4_dot(v0, v1) {
    return (v0[0] * v1[0]) +
           (v0[1] * v1[1]) +
           (v0[2] * v1[2]) +
           (v0[3] * v1[3]);
}

function vec3_scale(v, s, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;

    return out;
}

function vec4_scale(v, s, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    out[3] = v[3] * s;

    return out;
}

function vec3_project(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    return vec3_scale(v1, vec3_dot(v0, v1) / vec3_dot(v0, v0), out);
}

function vec4_project(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    return vec4_scale(v1, vec3_dot(v0, v1) / vec3_dot(v0, v0), out);
}

function vec3_add(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] + v1[0];
    out[1] = v0[1] + v1[1];
    out[2] = v0[2] + v1[2];

    return out;
}

function vec4_add(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] + v1[0];
    out[1] = v0[1] + v1[1];
    out[2] = v0[2] + v1[2];
    out[3] = v0[3] + v1[3];

    return out;
}

function vec3_subtract(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] - v1[0];
    out[1] = v0[1] - v1[1];
    out[2] = v0[2] - v1[2];

    return out;
}

function vec4_subtract(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] - v1[0];
    out[1] = v0[1] - v1[1];
    out[2] = v0[2] - v1[2];
    out[3] = v0[3] - v1[3];

    return out;
}

function vec3_multiply(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] * v1[0];
    out[1] = v0[1] * v1[1];
    out[2] = v0[2] * v1[2];

    return out;    
}

function vec4_multiply(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] * v1[0];
    out[1] = v0[1] * v1[1];
    out[2] = v0[2] * v1[2];
    out[3] = v0[3] * v1[3];

    return out;    
}

function vec3_divide(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0]);
    out[0] = v0[0] / v1[0];
    out[1] = v0[1] / v1[1];
    out[2] = v0[2] / v1[2];

    return out;    
}

function vec4_divide(v0, v1, out) {
    out = out || new Float32Array([0, 0, 0, 0]);
    out[0] = v0[0] / v1[0];
    out[1] = v0[1] / v1[1];
    out[2] = v0[2] / v1[2];
    out[3] = v0[3] / v1[3];

    return out;    
}


function sin01(val) {
    return (1.0 + sin(val)) / 2.0;
}

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

function generateCylinder(accuracy) {
    let V = [];
    let I = [];
    let pts = [];

    let circlePoints = [];

    const r = 0.5;
    const h = 0.5;

    let theta = 0;
    const IIdx = 0;
    for (let i = 0; i < accuracy; i += 1) {
        
        theta = i * ((Math.PI) / accuracy) * 2.0;

        const x = cos(theta);
        const y = sin(theta);

        pts.push([x, y]);
    }

    // center = 0, +-h, 0
    let idx = 0;
    for (let i = 1; i < pts.length + 1; i += 1) {
        const p0 = pts[i - 1];
        const p1 = pts[i % pts.length];

        // add bottom triangle
        V.push(r * p0[0], -h, -r * p0[1], 0, -1, 0, 0.0, 0.0);
        V.push(r * p1[0], -h, -r * p1[1], 0, -1, 0, 0.0, 0.0);
        V.push(0, -h, 0, 0, -1, 0, 0, 0);
        I.push(idx, idx + 1, idx + 2);
        idx += 3;
        // add top triangle
        V.push(r * p0[0], h, -r * p0[1], 0, 1, 0, 0.0, 0.0);
        V.push(r * p1[0], h, -r * p1[1], 0, 1, 0, 0.0, 0.0);
        V.push(0, h, 0, 0, 1, 0, 0, 0);
        I.push(idx, idx + 1, idx + 2);
        idx += 3;
        // add bridge triangles
        // tl, bl, br
        V.push(r * p0[0],  h, -r * p0[1], p0[0], 0, -p0[1], 0.0, 0.0);
        V.push(r * p0[0], -h, -r * p0[1], p0[0], 0, -p0[1], 0.0, 0.0);
        V.push(r * p1[0], -h, -r * p1[1], p1[0], 0, -p1[1], 0.0, 0.0);
        I.push(idx, idx + 1, idx + 2);
        idx += 3;
        // br, tr, tl
        V.push(r * p1[0], -h, -r * p1[1], p1[0], 0, -p1[1], 0.0, 0.0);
        V.push(r * p1[0],  h, -r * p1[1], p1[0], 0, -p1[1], 0.0, 0.0);
        V.push(r * p0[0],  h, -r * p0[1], p0[0], 0, -p0[1], 0.0, 0.0);
        I.push(idx, idx + 1, idx + 2);
        idx += 3;
    }
    const out = {
        V : V,
        I : I
    }

    console.log(out);
    return out;


}

async function setup(state) {
    hotReloadFile(getPath('week5.js'));


    matrixModule = await import(getPath("matrix.js"));
    Mat = matrixModule.Matrix;
    state.H      = new matrixModule.Dynamic_Matrix4x4_Stack();

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

                state.shader0Info = {
                    lights    : [],
                    materials : []
                };

                state.uColorLoc        = gl.getUniformLocation(program, 'uColor');
                state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');

                const lightCount = 1;

                state.lights = [
                    new Float32Array([
                        .57 + sin(state.time),.57,.57, 0.0, 
                        1.0, 1.0, 1.0, 1.0
                    ]),
                ]


                state.uLightCountLoc  = gl.getUniformLocation(program, 'u_light_count');
                gl.uniform1i(state.uLightCountLoc, lightCount);
                for (let i = 0; i < lightCount; i += 1) {
                    state.shader0Info.lights.push({
                        directionLoc : gl.getUniformLocation(program, 'u_lights[' + i + '].direction'),
                        colorLoc     : gl.getUniformLocation(program, 'u_lights[' + i + '].color')
                    });
                }
                state.shader0Info.uAmbientLoc = gl.getUniformLocation(program, 'u_ambient');
                gl.uniform4fv(state.shader0Info.uAmbientLoc, [0.25, 0.01, 0.2, 1.0]);

                state.uLightsLoc = gl.getUniformLocation(program, 'u_lights[0].direction');

                for (let i = 0; i < state.lights.length; i += 1) {
                    const dirArr = state.lights[i].subarray(0, 4);
                    const colorArr = state.lights[i].subarray(4, 8);

                    vec4_normalize(dirArr, dirArr);

                    gl.uniform4fv(state.shader0Info.lights[i].directionLoc, dirArr);
                    gl.uniform4fv(state.shader0Info.lights[i].colorLoc, colorArr)
                }

                state.uDistortLoc = gl.getUniformLocation(program, "uDistort");
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


    // attribute state
    state.vao = gl.createVertexArray();
    gl.bindVertexArray(state.vao);


    
    // create buffer for attributes
    {
        // Step 1: create GPU buffers

        // create buffer for vertex attribute data
        state.vertexBuf = gl.createBuffer();
        // set this to be the buffer we're currently looking at
        gl.bindBuffer(gl.ARRAY_BUFFER, state.vertexBuf);
        // upload data to buffer
        gl.bufferData(gl.ARRAY_BUFFER, cubeVertexData, gl.STATIC_DRAW, 0);

        // create buffer for indexing into vertex buffer
        state.elementBuf = gl.createBuffer();
        // set this to be the buffer we're currently looking at
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.elementBuf);
        // upload data to buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndexData, gl.STATIC_DRAW, 0);



        // Step 2: specify the attributes

        // position
        {   
            state.aPosLoc = gl.getAttribLocation(state.program, "aPos");
            gl.vertexAttribPointer( 
                state.aPosLoc,                     // attributeLocation: the layout location of the attribute
                3,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 0  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aPosLoc); // enable the attribute
        }
        // normals
        {
            state.aNorLoc = gl.getAttribLocation(state.program, "aNor");
            // set how the data is accessed in the buffer
            gl.vertexAttribPointer( 
                state.aNorLoc,                     // attributeLocation: the layout location of the attribute
                3,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 3  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aNorLoc); // enable the attribute
        }
        // uv coords
        {
            state.aUVLoc = gl.getAttribLocation(state.program, "aUV");
            // set how the data is accessed in the buffer
            gl.vertexAttribPointer( 
                state.aUVLoc,                      // attributeLocation: the layout location of the attribute
                2,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 6  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aUVLoc); // enable the attribute
        }
    }
    // create buffer for attributes
    {
        state.vaoCyl = gl.createVertexArray();
        gl.bindVertexArray(state.vaoCyl);

        let cyl = generateCylinder(24);
        state.cylV = new Float32Array(cyl.V);
        state.cylI = new Uint16Array(cyl.I);

        // Step 1: create GPU buffers
        state.vertexBufCylinder = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, state.vertexBufCylinder);
        gl.bufferData(gl.ARRAY_BUFFER, state.cylV, gl.STATIC_DRAW, 0);
        state.elementBufCylinder = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.elementBufCylinder);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, state.cylI, gl.STATIC_DRAW, 0);

        // Step 2: specify the attributes

        // position
        {   
            state.aPosLoc2 = gl.getAttribLocation(state.program, "aPos");
            gl.vertexAttribPointer( 
                state.aPosLoc,                     // attributeLocation: the layout location of the attribute
                3,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 0  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aPosLoc); // enable the attribute
        }
        // normals
        {
            state.aNorLoc2 = gl.getAttribLocation(state.program, "aNor");
            // set how the data is accessed in the buffer
            gl.vertexAttribPointer( 
                state.aNorLoc,                     // attributeLocation: the layout location of the attribute
                3,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 3  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aNorLoc); // enable the attribute
        }
        // uv coords
        {
            state.aUVLoc2 = gl.getAttribLocation(state.program, "aUV");
            // set how the data is accessed in the buffer
            gl.vertexAttribPointer( 
                state.aUVLoc,                      // attributeLocation: the layout location of the attribute
                2,                                  // size: 3 components per iteration
                gl.FLOAT,                           // type: the data is 32-bit floats
                false,                              // normalize: don't normalize data
                Float32Array.BYTES_PER_ELEMENT * 8, // stride: move forward (size * sizeof(type)) ... using 3 for ps, 3 for normal, 2 for uv (8)
                Float32Array.BYTES_PER_ELEMENT * 6  // offset: set how the data is accessed in the buffer
            );
            gl.enableVertexAttribArray(state.aUVLoc); // enable the attribute
        }
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}



function onStartFrame(t, state) {

    state.color0 = [1., 0., 0.];


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
    gl.clearColor(0.59, 0.0, 0.79, 0.0);
    gl.enable(gl.DEPTH_TEST);

    state.lights = [
        new Float32Array([
            sin(state.time),-.57,.57, 0.0, 
            1.0, 1.0, 1.0, 1.0
        ]),
    ]



    for (let i = 0; i < state.lights.length; i += 1) {
        const dirArr = state.lights[i].subarray(0, 4);
        const colorArr = state.lights[i].subarray(4, 8);

        vec4_normalize(dirArr, dirArr);

        gl.uniform4fv(state.shader0Info.lights[i].directionLoc, dirArr);
        gl.uniform4fv(state.shader0Info.lights[i].colorLoc, colorArr)
    }
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {
    let m = state.H;

    gl.uniformMatrix4fv(state.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(state.uProjLoc, false, new Float32Array(projMat));

        gl.bindVertexArray(state.vao);

            m.save();
            Mat.identity(m.matrix());
            Mat.translate(m.matrix(), 0,0,-2);


            Mat.rotateX(m.matrix(), Math.PI / 16);
            Mat.rotateY(m.matrix(), 0.2 * state.time + Math.PI / 8);
            Mat.scaleXYZ(m.matrix(), 0.2);

            {
                m.save();
                    Mat.scale(m.matrix(), 100, .1, .2);
                

                    gl.uniform3fv(state.uColorLoc, state.color0 );
                    gl.uniformMatrix4fv(state.uModelLoc, false, m.matrix() );

                    gl.uniform1f(state.uDistortLoc, 1.0);
                    gl.drawElements(gl.TRIANGLES, cubeIndexCount, gl.UNSIGNED_SHORT, 0);
                m.restore();
            }
            m.save();


            //Mat.translate(m.matrix(), 10.0 * sin(state.time),.5,0);
            {
                gl.bindVertexArray(state.vaoCyl);
                gl.uniform1f(state.uDistortLoc, 1.0);

                //Mat.translate(m.matrix(), 1,0,0);
                //Mat.rotateY(m.matrix(), state.time);
                //Mat.translate(m.matrix(), 1,0,0);
                
                Mat.scaleXYZ(m.matrix(), 1);
                for (let i = 0; i < 15; i += 1) {
                    m.save();
                        Mat.translate(m.matrix(), 10 * sin01(state.time + (i + 2.5)), 0, i * 0.01);
                        if ((i % 2 == 1)) {
                            Mat.skewXRelY(m.matrix(), 0.5);
                        }

                        m.save();
                        Mat.rotateX(m.matrix(), ((i & 0 == 0) ? -1 : 1) * i * state.time * 0.8);
                        Mat.scaleY(m.matrix(), (1/i) * 16.0 * sin(.5 * state.time + i));
                        Mat.scale(m.matrix(), 0.2, 2, 0.2)


                        gl.uniform3fv(state.uColorLoc, state.color0 );
                        gl.uniformMatrix4fv(state.uModelLoc, false, m.matrix() );
                        gl.drawElements(gl.TRIANGLES, state.cylI.length, gl.UNSIGNED_SHORT, 0);
                        m.restore();
                    
                    m.save();
                        Mat.identity(m.matrix());
                        Mat.translate(m.matrix(), 0, 0, 1);


                        gl.uniform3fv(state.uColorLoc, state.color0 );
                        gl.uniformMatrix4fv(state.uModelLoc, false, m.matrix() );
                        gl.drawElements(gl.TRIANGLES, state.cylI.length, gl.UNSIGNED_SHORT, 0);
                    m.restore();
                    m.restore();
                }
            }
            m.restore(); 

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
